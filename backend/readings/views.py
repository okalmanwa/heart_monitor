from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.contrib.auth import get_user_model
from .models import BloodPressureReading
from .serializers import BloodPressureReadingSerializer
from .utils import generate_pdf_report

User = get_user_model()


class BloodPressureReadingViewSet(viewsets.ModelViewSet):
    """ViewSet for managing blood pressure readings"""
    serializer_class = BloodPressureReadingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Admin users can see all readings, regular users see only their own
        if self.request.user.is_staff or self.request.user.is_superuser:
            return BloodPressureReading.objects.all().select_related('user')
        return BloodPressureReading.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Allow admin to specify user, otherwise use request user
        user_id = self.request.data.get('user')
        if (self.request.user.is_staff or self.request.user.is_superuser) and user_id:
            user = User.objects.get(pk=user_id)
            serializer.save(user=user)
        else:
            serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'], url_path='export-pdf')
    def export_pdf(self, request):
        """Export all readings as PDF"""
        readings = self.get_queryset()
        pdf_file = generate_pdf_report(readings, request.user)
        
        from django.http import FileResponse
        import os
        
        response = FileResponse(
            open(pdf_file, 'rb'),
            content_type='application/pdf',
            filename='moyo_blood_pressure_report.pdf'
        )
        # Clean up the temp file after sending
        response['Content-Disposition'] = 'attachment; filename="moyo_blood_pressure_report.pdf"'
        return response

