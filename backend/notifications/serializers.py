from rest_framework import serializers
from .models import NotificationPreferences, NotificationLog


class NotificationPreferencesSerializer(serializers.ModelSerializer):
    """Serializer for NotificationPreferences"""
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = NotificationPreferences
        fields = [
            'id',
            'user',
            'user_email',
            'bp_reminder_enabled',
            'bp_reminder_frequency',
            'bp_reminder_time',
            'medication_reminder_enabled',
            'insight_notifications_enabled',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']


class NotificationLogSerializer(serializers.ModelSerializer):
    """Serializer for NotificationLog"""
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = NotificationLog
        fields = [
            'id',
            'user',
            'user_email',
            'notification_type',
            'subject',
            'message',
            'sent_at',
            'sent_successfully',
            'error_message',
        ]
        read_only_fields = ['user', 'sent_at']

