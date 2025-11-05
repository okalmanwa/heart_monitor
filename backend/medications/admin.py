from django.contrib import admin
from .models import Medication, MedicationLog


@admin.register(Medication)
class MedicationAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'dosage', 'frequency', 'start_date', 'is_active', 'created_at')
    list_filter = ('is_active', 'frequency', 'start_date', 'created_at')
    search_fields = ('name', 'user__email', 'user__username', 'notes')
    ordering = ('-is_active', '-start_date')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Medication Information', {
            'fields': ('user', 'name', 'dosage', 'frequency')
        }),
        ('Dates', {
            'fields': ('start_date', 'end_date', 'is_active')
        }),
        ('Notes', {
            'fields': ('notes',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(MedicationLog)
class MedicationLogAdmin(admin.ModelAdmin):
    list_display = ('medication', 'taken_at', 'created_at')
    list_filter = ('taken_at', 'created_at')
    search_fields = ('medication__name', 'medication__user__email', 'notes')
    ordering = ('-taken_at',)
    readonly_fields = ('created_at',)
    
    fieldsets = (
        ('Log Information', {
            'fields': ('medication', 'taken_at', 'notes')
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
