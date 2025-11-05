from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BloodPressureReadingViewSet

router = DefaultRouter()
router.register(r'', BloodPressureReadingViewSet, basename='reading')

urlpatterns = [
    path('', include(router.urls)),
]

