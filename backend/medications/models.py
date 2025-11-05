from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Medication(models.Model):
    """Model for tracking medications that might affect blood pressure"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='medications')
    name = models.CharField(max_length=200, help_text="Name of the medication")
    dosage = models.CharField(max_length=100, help_text="Dosage (e.g., '10mg', '1 tablet')")
    frequency = models.CharField(
        max_length=50,
        help_text="Frequency (e.g., 'Once daily', 'Twice daily', 'As needed')",
        choices=[
            ('once_daily', 'Once Daily'),
            ('twice_daily', 'Twice Daily'),
            ('three_times_daily', 'Three Times Daily'),
            ('four_times_daily', 'Four Times Daily'),
            ('as_needed', 'As Needed'),
            ('weekly', 'Weekly'),
            ('other', 'Other'),
        ],
        default='once_daily'
    )
    start_date = models.DateField(help_text="Date when medication was started")
    end_date = models.DateField(
        null=True,
        blank=True,
        help_text="Date when medication was stopped (if applicable)"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Whether this medication is currently active"
    )
    notes = models.TextField(blank=True, help_text="Additional notes about the medication")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-is_active', '-start_date']
        indexes = [
            models.Index(fields=['user', '-is_active']),
            models.Index(fields=['user', '-start_date']),
        ]

    def __str__(self):
        status = "Active" if self.is_active else "Inactive"
        return f"{self.user.email} - {self.name} ({status})"


class MedicationLog(models.Model):
    """Model for logging individual medication doses"""
    medication = models.ForeignKey(
        Medication,
        on_delete=models.CASCADE,
        related_name='logs'
    )
    taken_at = models.DateTimeField(help_text="When the medication was taken")
    notes = models.TextField(blank=True, help_text="Additional notes")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-taken_at']
        indexes = [
            models.Index(fields=['medication', '-taken_at']),
        ]

    def __str__(self):
        return f"{self.medication.name} - {self.taken_at}"
