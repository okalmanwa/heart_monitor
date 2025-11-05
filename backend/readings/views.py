from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import BloodPressureReading
from .serializers import BloodPressureReadingSerializer
from .utils import generate_pdf_report


class BloodPressureReadingViewSet(viewsets.ModelViewSet):
    """ViewSet for managing blood pressure readings"""
    serializer_class = BloodPressureReadingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return BloodPressureReading.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
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

