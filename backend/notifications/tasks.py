from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from .models import NotificationPreferences, NotificationLog

User = get_user_model()


@shared_task
def send_bp_reminder_email(user_id):
    """Send BP reading reminder email to a user"""
    try:
        user = User.objects.get(pk=user_id)
        preferences = NotificationPreferences.objects.filter(user=user).first()
        
        if not preferences or not preferences.bp_reminder_enabled:
            return
        
        subject = "Reminder: Take Your Blood Pressure Reading ❤️"
        message = f"""
Hello {user.first_name or user.username},

This is a friendly reminder to take your daily blood pressure reading.

Tracking your BP regularly helps you:
- Monitor your cardiovascular health
- Identify patterns and trends
- Share accurate data with your healthcare provider

Log in to Moyo to record your reading: {getattr(settings, 'FRONTEND_URL', 'https://moyo.app')}

Stay healthy!
The Moyo Team ❤️
        """
        
        send_mail(
            subject,
            message.strip(),
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )
        
        # Log the notification
        NotificationLog.objects.create(
            user=user,
            notification_type='bp_reminder',
            subject=subject,
            message=message,
            sent_successfully=True,
        )
        
    except Exception as e:
        # Log the error
        try:
            user = User.objects.get(pk=user_id)
            NotificationLog.objects.create(
                user=user,
                notification_type='bp_reminder',
                subject="BP Reminder",
                message="",
                sent_successfully=False,
                error_message=str(e),
            )
        except:
            pass


@shared_task
def send_medication_reminder_email(user_id, medication_name):
    """Send medication reminder email to a user"""
    try:
        user = User.objects.get(pk=user_id)
        preferences = NotificationPreferences.objects.filter(user=user).first()
        
        if not preferences or not preferences.medication_reminder_enabled:
            return
        
        subject = f"Reminder: Take Your Medication - {medication_name}"
        message = f"""
Hello {user.first_name or user.username},

This is a reminder to take your medication: {medication_name}

Log in to Moyo to log your dose: {getattr(settings, 'FRONTEND_URL', 'https://moyo.app')}

Stay healthy!
The Moyo Team ❤️
        """
        
        send_mail(
            subject,
            message.strip(),
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )
        
        # Log the notification
        NotificationLog.objects.create(
            user=user,
            notification_type='medication_reminder',
            subject=subject,
            message=message,
            sent_successfully=True,
        )
        
    except Exception as e:
        # Log the error
        try:
            user = User.objects.get(pk=user_id)
            NotificationLog.objects.create(
                user=user,
                notification_type='medication_reminder',
                subject=f"Medication Reminder - {medication_name}",
                message="",
                sent_successfully=False,
                error_message=str(e),
            )
        except:
            pass


@shared_task
def send_insight_notification_email(user_id, insight_text):
    """Send new insight notification email to a user"""
    try:
        user = User.objects.get(pk=user_id)
        preferences = NotificationPreferences.objects.filter(user=user).first()
        
        if not preferences or not preferences.insight_notifications_enabled:
            return
        
        subject = "New Health Insight Available ❤️"
        message = f"""
Hello {user.first_name or user.username},

You have a new health insight:

{insight_text}

Log in to Moyo to view all your insights: {getattr(settings, 'FRONTEND_URL', 'https://moyo.app')}

Stay healthy!
The Moyo Team ❤️
        """
        
        send_mail(
            subject,
            message.strip(),
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )
        
        # Log the notification
        NotificationLog.objects.create(
            user=user,
            notification_type='insight',
            subject=subject,
            message=message,
            sent_successfully=True,
        )
        
    except Exception as e:
        # Log the error
        try:
            user = User.objects.get(pk=user_id)
            NotificationLog.objects.create(
                user=user,
                notification_type='insight',
                subject="New Insight",
                message="",
                sent_successfully=False,
                error_message=str(e),
            )
        except:
            pass

