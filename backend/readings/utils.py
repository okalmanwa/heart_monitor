import os
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch
from django.conf import settings


def generate_pdf_report(readings, user):
    """Generate a PDF report of blood pressure readings"""
    # Create a temporary file path
    filename = f'moyo_report_{user.id}.pdf'
    filepath = os.path.join(settings.BASE_DIR, 'temp', filename)
    
    # Ensure temp directory exists
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    
    # Create the PDF document
    doc = SimpleDocTemplate(filepath, pagesize=letter)
    elements = []
    styles = getSampleStyleSheet()
    
    # Title
    title = Paragraph(f"<b>Moyo - Blood Pressure Report for {user.get_full_name() or user.email}</b>", 
                     styles['Heading1'])
    elements.append(title)
    elements.append(Spacer(1, 0.2*inch))
    
    # Table data
    data = [['Date', 'Systolic', 'Diastolic', 'Heart Rate', 'Notes']]
    
    for reading in readings:
        data.append([
            reading.recorded_at.strftime('%Y-%m-%d %H:%M'),
            str(reading.systolic),
            str(reading.diastolic),
            str(reading.heart_rate) if reading.heart_rate else 'N/A',
            reading.notes[:50] if reading.notes else ''
        ])
    
    # Create table
    table = Table(data)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    elements.append(table)
    
    # Medical disclaimer
    elements.append(Spacer(1, 0.3*inch))
    disclaimer = Paragraph(
        "<i><b>Medical Disclaimer:</b> This report is for informational purposes only and is not "
        "a substitute for professional medical advice. Please consult with a healthcare provider "
        "for any concerns about your blood pressure.</i>",
        styles['Normal']
    )
    elements.append(disclaimer)
    
    # Build PDF
    doc.build(elements)
    
    return filepath

