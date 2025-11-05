from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import NotificationPreferences, NotificationLog
from .serializers import NotificationPreferencesSerializer, NotificationLogSerializer

User = get_user_model()


class NotificationPreferencesViewSet(viewsets.ModelViewSet):
    """ViewSet for managing notification preferences"""
    serializer_class = NotificationPreferencesSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Users can only see their own preferences
        if self.request.user.is_staff or self.request.user.is_superuser:
            return NotificationPreferences.objects.all().select_related('user')
        return NotificationPreferences.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get', 'put'])
    def my_preferences(self, request):
        """Get or update current user's notification preferences"""
        preferences, created = NotificationPreferences.objects.get_or_create(
            user=request.user
        )
        
        if request.method == 'PUT':
            serializer = self.get_serializer(preferences, data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
        
        serializer = self.get_serializer(preferences)
        return Response(serializer.data)


class NotificationLogViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing notification logs (read-only)"""
    serializer_class = NotificationLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Admin users can see all logs, regular users see only their own
        if self.request.user.is_staff or self.request.user.is_superuser:
            return NotificationLog.objects.all().select_related('user')
        return NotificationLog.objects.filter(user=self.request.user)
