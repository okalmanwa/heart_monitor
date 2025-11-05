from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from .models import HealthFactor
from .serializers import HealthFactorSerializer

User = get_user_model()


class HealthFactorViewSet(viewsets.ModelViewSet):
    """ViewSet for managing health factors"""
    serializer_class = HealthFactorSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Admin users can see all health factors, regular users see only their own
        if self.request.user.is_staff or self.request.user.is_superuser:
            return HealthFactor.objects.all().select_related('user')
        return HealthFactor.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Allow admin to specify user, otherwise use request user
        user_id = self.request.data.get('user')
        if (self.request.user.is_staff or self.request.user.is_superuser) and user_id:
            user = User.objects.get(pk=user_id)
            serializer.save(user=user)
        else:
            serializer.save(user=self.request.user)

