from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import BloodPressureReading
from .serializers import BloodPressureReadingSerializer


class AdminBloodPressureReadingViewSet(viewsets.ModelViewSet):
    """Admin ViewSet for managing all blood pressure readings"""
    serializer_class = BloodPressureReadingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Check if user is admin/staff
        if self.request.user.is_staff or self.request.user.is_superuser:
            return BloodPressureReading.objects.all().order_by('-recorded_at')
        return BloodPressureReading.objects.none()

    def perform_create(self, serializer):
        # Admin can create readings for any user
        user_id = self.request.data.get('user_id')
        if user_id and (self.request.user.is_staff or self.request.user.is_superuser):
            from django.contrib.auth import get_user_model
            from rest_framework import serializers as drf_serializers
            User = get_user_model()
            try:
                user = User.objects.get(id=user_id)
                serializer.save(user=user)
            except User.DoesNotExist:
                raise drf_serializers.ValidationError({'user_id': 'User not found'})
        else:
            serializer.save(user=self.request.user)

