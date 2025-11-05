from django.contrib import admin
from django.utils.html import format_html
from .models import BloodPressureReading


@admin.register(BloodPressureReading)
class BloodPressureReadingAdmin(admin.ModelAdmin):
    list_display = ('user', 'bp_display', 'category_badge', 'heart_rate', 'recorded_at', 'has_notes')
    list_filter = ('recorded_at', 'created_at', 'user')
    search_fields = ('user__email', 'user__username', 'notes')
    readonly_fields = ('created_at', 'updated_at', 'category_display')
    date_hierarchy = 'recorded_at'
    ordering = ('-recorded_at',)
    
    fieldsets = (
        ('Patient Information', {
            'fields': ('user',)
        }),
        ('Reading Details', {
            'fields': ('systolic', 'diastolic', 'heart_rate', 'recorded_at')
        }),
        ('Category', {
            'fields': ('category_display',),
            'classes': ('collapse',)
        }),
        ('Additional Information', {
            'fields': ('notes',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def bp_display(self, obj):
        """Display BP in format: 120/80"""
        return f"{obj.systolic}/{obj.diastolic}"
    bp_display.short_description = 'Blood Pressure'
    
    def category_badge(self, obj):
        """Display BP category with color coding"""
        category = obj.get_category()
        colors = {
            'normal': '#4caf50',      # Green
            'elevated': '#ff9800',     # Orange
            'high_stage1': '#f44336',  # Red
            'high_stage2': '#d32f2f',  # Dark Red
        }
        labels = {
            'normal': 'Normal',
            'elevated': 'Elevated',
            'high_stage1': 'High Stage 1',
            'high_stage2': 'High Stage 2',
        }
        color = colors.get(category, '#757575')
        label = labels.get(category, 'Unknown')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px; font-size: 11px;">{}</span>',
            color, label
        )
    category_badge.short_description = 'Category'
    
    def category_display(self, obj):
        """Display category in readonly field"""
        category = obj.get_category()
        return category.replace('_', ' ').title()
    category_display.short_description = 'Category'
    
    def has_notes(self, obj):
        """Check if reading has notes"""
        return bool(obj.notes)
    has_notes.boolean = True
    has_notes.short_description = 'Has Notes'
