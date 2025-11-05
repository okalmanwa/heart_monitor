from rest_framework import viewsets, serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import Medication, MedicationLog
from .serializers import (
    MedicationSerializer,
    MedicationLogSerializer,
    MedicationWithLogsSerializer,
)

User = get_user_model()


class MedicationViewSet(viewsets.ModelViewSet):
    """ViewSet for managing medications"""
    serializer_class = MedicationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Admin users can see all medications, regular users see only their own
        if self.request.user.is_staff or self.request.user.is_superuser:
            return Medication.objects.all().select_related('user')
        return Medication.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return MedicationWithLogsSerializer
        return MedicationSerializer

    def perform_create(self, serializer):
        # Allow admin to specify user, otherwise use request user
        user_id = self.request.data.get('user')
        if (self.request.user.is_staff or self.request.user.is_superuser) and user_id:
            user = User.objects.get(pk=user_id)
            serializer.save(user=user)
        else:
            serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def log_dose(self, request, pk=None):
        """Log that a medication dose was taken"""
        medication = self.get_object()
        serializer = MedicationLogSerializer(data={
            'medication': medication.id,
            'taken_at': request.data.get('taken_at'),
            'notes': request.data.get('notes', ''),
        })
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get all active medications for the current user"""
        medications = self.get_queryset().filter(is_active=True)
        serializer = self.get_serializer(medications, many=True)
        return Response(serializer.data)


class MedicationLogViewSet(viewsets.ModelViewSet):
    """ViewSet for managing medication logs"""
    serializer_class = MedicationLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        medication_id = self.request.query_params.get('medication')
        queryset = MedicationLog.objects.select_related('medication', 'medication__user')
        
        # Filter by medication if provided
        if medication_id:
            queryset = queryset.filter(medication_id=medication_id)
        
        # Admin users can see all logs, regular users see only their own
        if self.request.user.is_staff or self.request.user.is_superuser:
            return queryset
        return queryset.filter(medication__user=self.request.user)

    def perform_create(self, serializer):
        # Ensure user has permission to log for this medication
        medication_id = self.request.data.get('medication')
        if medication_id:
            medication = Medication.objects.get(pk=medication_id)
            if (medication.user != self.request.user and 
                not self.request.user.is_staff and 
                not self.request.user.is_superuser):
                raise serializers.ValidationError("You don't have permission to log this medication.")
        serializer.save()
