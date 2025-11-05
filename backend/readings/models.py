from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class BloodPressureReading(models.Model):
    """Blood pressure reading model"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='readings')
    systolic = models.IntegerField(help_text="Systolic pressure (top number)")
    diastolic = models.IntegerField(help_text="Diastolic pressure (bottom number)")
    heart_rate = models.IntegerField(null=True, blank=True, help_text="Heart rate in BPM")
    recorded_at = models.DateTimeField(help_text="When the reading was taken")
    notes = models.TextField(blank=True, help_text="Optional notes or context")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-recorded_at']
        indexes = [
            models.Index(fields=['user', '-recorded_at']),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.systolic}/{self.diastolic} @ {self.recorded_at}"

    def get_category(self):
        """Returns BP category based on AHA guidelines"""
        if self.systolic < 120 and self.diastolic < 80:
            return 'normal'
        elif self.systolic < 130 and self.diastolic < 80:
            return 'elevated'
        elif self.systolic < 140 or self.diastolic < 90:
            return 'high_stage1'
        else:
            return 'high_stage2'

