from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import UserInsight
from .serializers import UserInsightSerializer

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

