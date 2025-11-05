from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class HealthFactor(models.Model):
    """Model for tracking factors that might influence blood pressure"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='health_factors')
    date = models.DateField(help_text="Date of the health factor entry")
    sleep_quality = models.IntegerField(
        null=True, 
        blank=True, 
        help_text="Sleep quality on scale of 1-5",
        choices=[(i, i) for i in range(1, 6)]
    )
    stress_level = models.IntegerField(
        null=True,
        blank=True,
        help_text="Stress level on scale of 1-5",
        choices=[(i, i) for i in range(1, 6)]
    )
    exercise_duration = models.IntegerField(
        null=True,
        blank=True,
        help_text="Exercise duration in minutes"
    )
    notes = models.TextField(blank=True, help_text="Additional notes")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date']
        unique_together = ['user', 'date']
        indexes = [
            models.Index(fields=['user', '-date']),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.date}"

