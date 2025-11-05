from django.contrib import admin
from .models import BloodPressureReading


@admin.register(BloodPressureReading)
class BloodPressureReadingAdmin(admin.ModelAdmin):
    list_display = ('user', 'systolic', 'diastolic', 'heart_rate', 'recorded_at', 'created_at')
    list_filter = ('recorded_at', 'created_at')
    search_fields = ('user__email', 'notes')
    readonly_fields = ('created_at', 'updated_at')

