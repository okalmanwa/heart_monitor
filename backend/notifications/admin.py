from django.contrib import admin
from .models import NotificationPreferences, NotificationLog


@admin.register(NotificationPreferences)
class NotificationPreferencesAdmin(admin.ModelAdmin):
    list_display = ('user', 'bp_reminder_enabled', 'medication_reminder_enabled', 'insight_notifications_enabled', 'updated_at')
    list_filter = ('bp_reminder_enabled', 'medication_reminder_enabled', 'insight_notifications_enabled', 'bp_reminder_frequency')
    search_fields = ('user__email', 'user__username')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(NotificationLog)
class NotificationLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'notification_type', 'subject', 'sent_at', 'sent_successfully')
    list_filter = ('notification_type', 'sent_successfully', 'sent_at')
    search_fields = ('user__email', 'subject', 'message')
    readonly_fields = ('sent_at',)
    ordering = ('-sent_at',)
