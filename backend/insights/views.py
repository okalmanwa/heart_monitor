from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import UserInsight, UserInsightSummary
from .serializers import UserInsightSerializer
from .ai_service import generate_insights_with_ai, generate_and_cache_insight_summary
from .signals import generate_insights_for_user_async

User = get_user_model()


class UserInsightViewSet(viewsets.ModelViewSet):
    """ViewSet for viewing and managing AI-generated insights"""
    serializer_class = UserInsightSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Admin users can see all insights, regular users see only their own
        if self.request.user.is_staff or self.request.user.is_superuser:
            return UserInsight.objects.all().select_related('user')
        return UserInsight.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Allow admin to specify user, otherwise use request user
        user_id = self.request.data.get('user')
        if (self.request.user.is_staff or self.request.user.is_superuser) and user_id:
            user = User.objects.get(pk=user_id)
            serializer.save(user=user)
        else:
            serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark an insight as read"""
        insight = self.get_object()
        insight.is_read = True
        insight.save()
        return Response({'status': 'marked as read'})

    @action(detail=False, methods=['post'], url_path='generate')
    def generate_insights(self, request):
        """
        Generate AI-powered insights for the current user or specified user (admin only)
        Returns immediately and processes asynchronously
        """
        # Determine target user
        user_id = request.data.get('user_id')
        if user_id and (request.user.is_staff or request.user.is_superuser):
            # Admin can generate insights for any user
            try:
                target_user = User.objects.get(pk=user_id)
            except User.DoesNotExist:
                return Response(
                    {'error': 'User not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
        else:
            # Regular users can only generate insights for themselves
            target_user = request.user
        
        # Check if user has readings
        from readings.models import BloodPressureReading
        reading_count = BloodPressureReading.objects.filter(user=target_user).count()
        if reading_count < 1:
            return Response({
                'message': 'No insights generated. User needs at least one blood pressure reading.',
                'insights_created': 0
            }, status=status.HTTP_200_OK)
        
        try:
            # Try to run asynchronously first (if Celery/Redis available)
            # Use force=True to bypass 24-hour cooldown for manual generation
            try:
                generate_insights_for_user_async.delay(target_user.id, force=True)
                return Response({
                    'message': 'Insights generation started. Please refresh in a few moments.',
                    'insights_created': 0,
                    'status': 'processing'
                }, status=status.HTTP_202_ACCEPTED)
            except Exception as async_err:
                # If async fails, still return 202 and process in background thread
                # This prevents blocking the HTTP request
                import threading
                
                def generate_in_background():
                    try:
                        created_insights = generate_insights_with_ai(target_user)
                    except Exception as bg_err:
                        print(f"Background insight generation failed: {bg_err}")
                
                # Start background thread
                thread = threading.Thread(target=generate_in_background)
                thread.daemon = True
                thread.start()
                
                # Return immediately with 202 status
                return Response({
                    'message': 'Insights generation started in background. Please refresh in a few moments.',
                    'insights_created': 0,
                    'status': 'processing'
                }, status=status.HTTP_202_ACCEPTED)
            
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': f'Failed to generate insights: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'], url_path='summary')
    def get_summary(self, request):
        """
        Get or generate a cached summary of insights for the current user
        """
        user = request.user
        
        # Check if user has insights
        has_insights = UserInsight.objects.filter(user=user).exists()
        if not has_insights:
            return Response({
                'summary': None,
                'has_insights': False,
                'message': 'No insights available. Generate insights first.'
            }, status=status.HTTP_200_OK)
        
        # Try to get cached summary or generate new one
        try:
            summary_obj = UserInsightSummary.objects.get(user=user)
            current_insight_count = UserInsight.objects.filter(user=user).count()
            
            # If insight count matches, return cached summary
            if summary_obj.insight_count == current_insight_count:
                return Response({
                    'summary': summary_obj.summary_text,
                    'has_insights': True,
                    'generated_at': summary_obj.generated_at,
                    'updated_at': summary_obj.updated_at
                }, status=status.HTTP_200_OK)
        except UserInsightSummary.DoesNotExist:
            pass
        except Exception as e:
            # Handle database errors gracefully (e.g., table doesn't exist yet)
            print(f"Error accessing summary cache: {e}")
            # Continue to generate summary
        
        # Generate new summary (or regenerate if count changed)
        try:
            summary_text = generate_and_cache_insight_summary(user, force_regenerate=True)
            
            if summary_text:
                summary_obj = UserInsightSummary.objects.get(user=user)
                return Response({
                    'summary': summary_text,
                    'has_insights': True,
                    'generated_at': summary_obj.generated_at,
                    'updated_at': summary_obj.updated_at
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'summary': None,
                    'has_insights': True,
                    'message': 'Failed to generate summary. Please try again.'
                }, status=status.HTTP_200_OK)
        except Exception as e:
            # Handle errors gracefully (e.g., OpenAI API issues, database issues)
            print(f"Error generating summary: {e}")
            return Response({
                'summary': None,
                'has_insights': True,
                'message': 'Summary generation temporarily unavailable. Please try again later.'
            }, status=status.HTTP_200_OK)

