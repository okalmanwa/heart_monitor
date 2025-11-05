from django.contrib import admin
from .models import HealthFactor


@admin.register(HealthFactor)
class HealthFactorAdmin(admin.ModelAdmin):
    list_display = ('user', 'date', 'sleep_quality', 'stress_level', 'exercise_duration', 'created_at')
    list_filter = ('date', 'created_at')
    search_fields = ('user__email', 'notes')

