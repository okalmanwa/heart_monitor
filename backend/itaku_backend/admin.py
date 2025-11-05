"""
Custom admin site configuration for Moyo
"""
from django.contrib import admin
from django.contrib.admin import AdminSite
from django.utils.translation import gettext_lazy as _


class MoyoAdminSite(AdminSite):
    """Custom admin site for Moyo"""
    site_header = "Moyo Admin ❤️"
    site_title = "Moyo Admin"
    index_title = "Cardiac Health Monitoring Administration"


# Use default admin site (can be customized later)
# admin_site = MoyoAdminSite(name='moyo_admin')

