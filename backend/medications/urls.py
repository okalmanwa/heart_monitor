from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MedicationViewSet, MedicationLogViewSet

router = DefaultRouter()
router.register(r'medications', MedicationViewSet, basename='medication')
router.register(r'medication-logs', MedicationLogViewSet, basename='medication-log')

urlpatterns = [
    path('', include(router.urls)),
]

