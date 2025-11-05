from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Enhanced User admin with patient filtering"""
    list_display = ('email', 'username', 'full_name', 'is_patient', 'readings_count', 'created_at')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'created_at')
    search_fields = ('email', 'username', 'first_name', 'last_name')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'date_joined', 'last_login')
    
    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined', 'created_at')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2'),
        }),
    )
    
    def full_name(self, obj):
        """Display full name"""
        if obj.first_name or obj.last_name:
            return f"{obj.first_name} {obj.last_name}".strip()
        return "-"
    full_name.short_description = 'Full Name'
    
    def is_patient(self, obj):
        """Check if user is a patient (has @patient.example.com email)"""
        return '@patient.example.com' in obj.email
    is_patient.boolean = True
    is_patient.short_description = 'Patient'
    
    def readings_count(self, obj):
        """Display count of readings"""
        count = obj.readings.count()
        if count > 0:
            return format_html(
                '<a href="/admin/readings/bloodpressurereading/?user__id__exact={}">{}</a>',
                obj.id, count
            )
        return 0
    readings_count.short_description = 'Readings'
