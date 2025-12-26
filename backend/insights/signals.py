"""
Signals for automatically generating insights
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from celery import shared_task
from readings.models import BloodPressureReading
from .ai_service import generate_insights_with_ai, generate_and_cache_insight_summary
from .models import UserInsight


@shared_task
def generate_insights_for_user_async(user_id, force=False):
    """
    Async task to generate insights for a user
    
    Args:
        user_id: The user ID to generate insights for
        force: If True, bypass the 24-hour cooldown check
    """
    from django.contrib.auth import get_user_model
    from django.utils import timezone
    from datetime import timedelta
    
    User = get_user_model()
    
    try:
        user = User.objects.get(pk=user_id)
        
        # Check if user has enough readings (at least 1 for manual generation, 3 for auto)
        reading_count = BloodPressureReading.objects.filter(user=user).count()
        min_readings = 1 if force else 3
        
        if reading_count < min_readings:
            print(f"Not enough readings for user {user_id}: {reading_count} < {min_readings}")
            return 0  # Return 0 instead of None
        
        # Check when last insight was generated (avoid generating too frequently)
        # Skip this check if force=True (manual generation)
        if not force:
            last_insight = UserInsight.objects.filter(user=user).order_by('-generated_at').first()
            if last_insight:
                time_since_last = timezone.now() - last_insight.generated_at
                # Don't generate if insights were created in the last 24 hours
                if time_since_last < timedelta(hours=24):
                    hours_remaining = (timedelta(hours=24) - time_since_last).total_seconds() / 3600
                    print(f"Insights generated recently for user {user_id}. Wait {hours_remaining:.1f} more hours.")
                    return 0  # Return 0 instead of None
        
        # Generate insights
        print(f"Generating insights for user {user_id}...")
        created_insights = generate_insights_with_ai(user)
        
        if created_insights:
            print(f"Successfully generated {len(created_insights)} insights for user {user_id}")
            # Regenerate summary after creating new insights
            try:
                generate_and_cache_insight_summary(user, force_regenerate=True)
                print(f"Updated summary for user {user_id}")
            except Exception as summary_err:
                print(f"Error generating summary for user {user_id}: {summary_err}")
        else:
            print(f"No insights generated for user {user_id}")
        
        return len(created_insights)
    except Exception as e:
        print(f"Error generating insights for user {user_id}: {e}")
        import traceback
        traceback.print_exc()
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

