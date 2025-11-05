from django.contrib import admin
from django.utils.html import format_html
from .models import UserInsight


@admin.register(UserInsight)
class UserInsightAdmin(admin.ModelAdmin):
    list_display = ('user', 'insight_type_badge', 'severity_badge', 'insight_preview', 'is_read', 'generated_at')
    list_filter = ('insight_type', 'severity', 'is_read', 'generated_at')
    search_fields = ('user__email', 'user__username', 'insight_text')
    readonly_fields = ('generated_at',)
    date_hierarchy = 'generated_at'
    ordering = ('-generated_at',)
    
    fieldsets = (
        ('Patient Information', {
            'fields': ('user',)
        }),
        ('Insight Details', {
            'fields': ('insight_type', 'severity', 'insight_text', 'is_read')
        }),
        ('Timestamps', {
            'fields': ('generated_at',),
            'classes': ('collapse',)
        }),
    )
    
    def insight_type_badge(self, obj):
        """Display insight type with color coding"""
        colors = {
            'trend': '#2196f3',
            'anomaly': '#ff9800',
            'correlation': '#9c27b0',
            'alert': '#f44336',
        }
        color = colors.get(obj.insight_type, '#757575')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px; font-size: 11px; text-transform: uppercase;">{}</span>',
            color, obj.insight_type
        )
    insight_type_badge.short_description = 'Type'
    
    def severity_badge(self, obj):
        """Display severity with color coding"""
        colors = {
            'low': '#4caf50',
            'medium': '#ff9800',
            'high': '#f44336',
        }
        color = colors.get(obj.severity, '#757575')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px; font-size: 11px;">{}</span>',
            color, obj.severity.title()
        )
    severity_badge.short_description = 'Severity'
    
    def insight_preview(self, obj):
        """Display preview of insight text"""
        preview = obj.insight_text[:100] + '...' if len(obj.insight_text) > 100 else obj.insight_text
        return preview
    insight_preview.short_description = 'Insight'
