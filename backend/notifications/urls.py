from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NotificationPreferencesViewSet, NotificationLogViewSet

router = DefaultRouter()
router.register(r'preferences', NotificationPreferencesViewSet, basename='notification-preferences')
router.register(r'logs', NotificationLogViewSet, basename='notification-log')

urlpatterns = [
    path('', include(router.urls)),
]

