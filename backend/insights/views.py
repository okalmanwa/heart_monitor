from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import UserInsight
from .serializers import UserInsightSerializer
from .ai_service import generate_insights_with_ai, generate_insight_summary
from .signals import generate_insights_for_user_async
from notifications.tasks import send_insight_notification_email

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
            try:
                generate_insights_for_user_async.delay(target_user.id)
                return Response({
                    'message': 'Insights generation started. Please refresh in a few moments.',
                    'insights_created': 0,
                    'status': 'processing'
                }, status=status.HTTP_202_ACCEPTED)
            except Exception:
                # Fall back to synchronous generation if async fails
                # This is slower but works without Redis
                created_insights = generate_insights_with_ai(target_user)
                
                if not created_insights:
                    return Response({
                        'message': 'No insights generated. User needs at least one blood pressure reading.',
                        'insights_created': 0
                    }, status=status.HTTP_200_OK)
                
                # Send notification email for each new insight
                for insight in created_insights:
                    try:
                        send_insight_notification_email.delay(
                            target_user.id,
                            insight.insight_text
                        )
                    except Exception:
                        try:
                            send_insight_notification_email(
                                target_user.id,
                                insight.insight_text
                            )
                        except Exception:
                            pass
                
                # Serialize the created insights
                serializer = self.get_serializer(created_insights, many=True)
                
                return Response({
                    'message': f'Successfully generated {len(created_insights)} insights',
                    'insights_created': len(created_insights),
                    'insights': serializer.data
                }, status=status.HTTP_201_CREATED)
            
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
        Get an AI-generated summary of all insights for the current user
        Only generates summary if insights exist
        """
        try:
            # Check if user has any insights first
            insights_count = UserInsight.objects.filter(user=request.user).count()
            if insights_count == 0:
                return Response({
                    'summary': None,
                    'has_insights': False,
                    'message': 'No insights available to summarize.'
                }, status=status.HTTP_200_OK)
            
            # Generate summary (this may take a moment but is faster than full generation)
            summary = generate_insight_summary(request.user)
            
            if not summary:
                return Response({
                    'summary': None,
                    'has_insights': True,
                    'message': 'Summary generation is temporarily unavailable.'
                }, status=status.HTTP_200_OK)
            
            return Response({
                'summary': summary,
                'has_insights': True
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            # Don't fail completely - just return that summary isn't available
            return Response({
                'summary': None,
                'has_insights': UserInsight.objects.filter(user=request.user).exists(),
                'message': 'Summary generation is temporarily unavailable.'
            }, status=status.HTTP_200_OK)

