from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import HealthFactor
from .serializers import HealthFactorSerializer


class AdminHealthFactorViewSet(viewsets.ModelViewSet):
    """Admin ViewSet for managing all health factors"""
    serializer_class = HealthFactorSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Check if user is admin/staff
        if self.request.user.is_staff or self.request.user.is_superuser:
            return HealthFactor.objects.all().order_by('-date')
        return HealthFactor.objects.none()

    def perform_create(self, serializer):
        # Admin can create health factors for any user
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

