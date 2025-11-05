from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class NotificationPreferences(models.Model):
    """User preferences for email notifications"""
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='notification_preferences'
    )
    bp_reminder_enabled = models.BooleanField(
        default=True,
        help_text="Receive reminders to take BP readings"
    )
    bp_reminder_frequency = models.CharField(
        max_length=20,
        choices=[
            ('daily', 'Daily'),
            ('twice_weekly', 'Twice Weekly'),
            ('weekly', 'Weekly'),
            ('biweekly', 'Bi-Weekly'),
        ],
        default='daily',
        help_text="Frequency of BP reminders"
    )
    bp_reminder_time = models.TimeField(
        default='09:00',
        help_text="Preferred time for BP reminders (24-hour format)"
    )
    medication_reminder_enabled = models.BooleanField(
        default=True,
        help_text="Receive reminders for medications"
    )
    insight_notifications_enabled = models.BooleanField(
        default=True,
        help_text="Receive notifications for new insights"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Notification Preferences"
        verbose_name_plural = "Notification Preferences"

    def __str__(self):
        return f"{self.user.email} - Notification Preferences"


class NotificationLog(models.Model):
    """Log of sent notifications"""
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notification_logs'
    )
    notification_type = models.CharField(
        max_length=50,
        choices=[
            ('bp_reminder', 'BP Reading Reminder'),
            ('medication_reminder', 'Medication Reminder'),
            ('insight', 'New Insight'),
            ('system', 'System Notification'),
        ]
    )
    subject = models.CharField(max_length=200)
    message = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)
    sent_successfully = models.BooleanField(default=True)
    error_message = models.TextField(blank=True)

    class Meta:
        ordering = ['-sent_at']
        indexes = [
            models.Index(fields=['user', '-sent_at']),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.notification_type} - {self.sent_at}"
