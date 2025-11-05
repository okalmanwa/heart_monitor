from django.contrib import admin
from .models import UserInsight


@admin.register(UserInsight)
class UserInsightAdmin(admin.ModelAdmin):
    list_display = ('user', 'insight_type', 'severity', 'is_read', 'generated_at')
    list_filter = ('insight_type', 'severity', 'is_read', 'generated_at')
    search_fields = ('user__email', 'insight_text')
    readonly_fields = ('generated_at',)

