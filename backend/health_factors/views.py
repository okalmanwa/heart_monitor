from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db import IntegrityError
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

    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except IntegrityError as e:
            # Handle unique constraint violation (duplicate user+date)
            if 'unique constraint' in str(e).lower() or 'duplicate key' in str(e).lower():
                return Response(
                    {
                        'non_field_errors': ['You already have a health factor entry for this date. Please select a different date or update the existing entry.']
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            # Re-raise other integrity errors
            raise

    def perform_create(self, serializer):
        # Allow admin to specify user, otherwise use request user
        user_id = self.request.data.get('user')
        if (self.request.user.is_staff or self.request.user.is_superuser) and user_id:
            try:
                user = User.objects.get(pk=user_id)
                serializer.save(user=user)
            except (User.DoesNotExist, ValueError, TypeError):
                serializer.save(user=self.request.user)
        else:
            serializer.save(user=self.request.user)

