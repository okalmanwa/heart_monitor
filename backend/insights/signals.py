"""
Signals for automatically generating insights
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from celery import shared_task
from readings.models import BloodPressureReading
from .ai_service import generate_insights_with_ai
from .models import UserInsight
from notifications.tasks import send_insight_notification_email


@shared_task
def generate_insights_for_user_async(user_id):
    """Async task to generate insights for a user"""
    from django.contrib.auth import get_user_model
    from django.utils import timezone
    from datetime import timedelta
    
    User = get_user_model()
    
    try:
        user = User.objects.get(pk=user_id)
        
        # Check if user has enough readings (at least 3)
        reading_count = BloodPressureReading.objects.filter(user=user).count()
        if reading_count < 3:
            return  # Not enough data yet
        
        # Check when last insight was generated (avoid generating too frequently)
        last_insight = UserInsight.objects.filter(user=user).order_by('-generated_at').first()
        if last_insight:
            # Don't generate if insights were created in the last 24 hours
            if timezone.now() - last_insight.generated_at < timedelta(hours=24):
                return
        
        # Generate insights
        created_insights = generate_insights_with_ai(user)
        
        # Send notification emails (async if Redis available, sync otherwise)
        for insight in created_insights:
            try:
                send_insight_notification_email.delay(user_id, insight.insight_text)
            except Exception:
                # If Redis/Celery is not available, run synchronously
                try:
                    send_insight_notification_email(user_id, insight.insight_text)
                except Exception:
                    # Silently fail if email sending fails (non-critical)
                    pass
        
        return len(created_insights)
    except Exception as e:
        print(f"Error generating insights for user {user_id}: {e}")
        return 0


@receiver(post_save, sender=BloodPressureReading)
def on_reading_created(sender, instance, created, **kwargs):
    """
    Signal handler: Generate insights when a new reading is created
    Only triggers if user has accumulated enough readings
    """
    if not created:
        return  # Only process new readings, not updates
    
    # Check if user has enough readings to generate meaningful insights
    reading_count = BloodPressureReading.objects.filter(user=instance.user).count()
    
    # Generate insights if:
    # 1. User has at least 5 readings (enough data)
    # 2. This is the 5th, 10th, 20th, etc. reading (periodic generation)
    # 3. Or if user has exactly 5 readings (first time generation)
    should_generate = (
        reading_count >= 5 and 
        (reading_count == 5 or reading_count % 10 == 0)
    )
    
    if should_generate:
        # Generate insights asynchronously to avoid blocking the request
        # Fall back to sync if Redis/Celery is not available
        try:
            generate_insights_for_user_async.delay(instance.user.id)
        except Exception:
            # If Redis/Celery is not available, run synchronously
            # This allows development without Redis
            try:
                generate_insights_for_user_async(instance.user.id)
            except Exception as e:
                # Log error but don't fail the request
                print(f"Error generating insights synchronously: {e}")

