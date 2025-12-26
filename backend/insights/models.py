from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class UserInsight(models.Model):
    """Model for storing AI-generated insights"""
    INSIGHT_TYPES = [
        ('trend', 'Trend Analysis'),
        ('anomaly', 'Anomaly Detection'),
        ('correlation', 'Correlation Analysis'),
        ('alert', 'Alert'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='insights')
    insight_text = models.TextField(help_text="The generated insight message")
    insight_type = models.CharField(max_length=50, choices=INSIGHT_TYPES)
    generated_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    severity = models.CharField(
        max_length=20,
        choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High')],
        default='low'
    )

    class Meta:
        ordering = ['-generated_at']
        indexes = [
            models.Index(fields=['user', '-generated_at']),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.insight_type} - {self.generated_at}"


class UserInsightSummary(models.Model):
    """Model for caching AI-generated insight summaries"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='insight_summary')
    summary_text = models.TextField(help_text="The AI-generated summary of insights")
    generated_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    insight_count = models.IntegerField(default=0, help_text="Number of insights used to generate this summary")

    class Meta:
        ordering = ['-updated_at']
        verbose_name_plural = 'User Insight Summaries'

    def __str__(self):
        return f"{self.user.email} - Summary ({self.insight_count} insights)"

