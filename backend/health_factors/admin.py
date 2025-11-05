from django.contrib import admin
from django.utils.html import format_html
from .models import HealthFactor


@admin.register(HealthFactor)
class HealthFactorAdmin(admin.ModelAdmin):
    list_display = ('user', 'date', 'sleep_quality_stars', 'stress_level_stars', 'exercise_duration', 'has_notes', 'created_at')
    list_filter = ('date', 'created_at', 'sleep_quality', 'stress_level')
    search_fields = ('user__email', 'user__username', 'notes')
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'date'
    ordering = ('-date',)
    
    fieldsets = (
        ('Patient Information', {
            'fields': ('user', 'date')
        }),
        ('Health Factors', {
            'fields': ('sleep_quality', 'stress_level', 'exercise_duration')
        }),
        ('Additional Information', {
            'fields': ('notes',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def sleep_quality_stars(self, obj):
        """Display sleep quality as stars"""
        if obj.sleep_quality:
            stars = '★' * obj.sleep_quality + '☆' * (5 - obj.sleep_quality)
            return format_html('<span style="color: #ff9800;">{}</span>', stars)
        return "-"
    sleep_quality_stars.short_description = 'Sleep'
    
    def stress_level_stars(self, obj):
        """Display stress level as stars"""
        if obj.stress_level:
            stars = '★' * obj.stress_level + '☆' * (5 - obj.stress_level)
            color = '#f44336' if obj.stress_level >= 4 else '#ff9800' if obj.stress_level >= 3 else '#4caf50'
            return format_html('<span style="color: {};">{}</span>', color, stars)
        return "-"
    stress_level_stars.short_description = 'Stress'
    
    def has_notes(self, obj):
        """Check if entry has notes"""
        return bool(obj.notes)
    has_notes.boolean = True
    has_notes.short_description = 'Has Notes'
