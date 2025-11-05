from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import HealthFactor
from .serializers import HealthFactorSerializer


class HealthFactorViewSet(viewsets.ModelViewSet):
    """ViewSet for managing health factors"""
    serializer_class = HealthFactorSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return HealthFactor.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

