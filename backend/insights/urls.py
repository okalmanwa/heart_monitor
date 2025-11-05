from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserInsightViewSet

router = DefaultRouter()
router.register(r'', UserInsightViewSet, basename='insight')

urlpatterns = [
    path('', include(router.urls)),
]

