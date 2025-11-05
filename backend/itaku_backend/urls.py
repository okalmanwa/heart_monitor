"""
URL configuration for itaku_backend project.
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from accounts.serializers import CustomTokenObtainPairSerializer

# Import admin viewsets
from readings.admin_views import AdminBloodPressureReadingViewSet
from health_factors.admin_views import AdminHealthFactorViewSet
from insights.admin_views import AdminUserInsightViewSet

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

# Create router for admin endpoints
admin_router = DefaultRouter()
admin_router.register(r'readings', AdminBloodPressureReadingViewSet, basename='admin-reading')
admin_router.register(r'health-factors', AdminHealthFactorViewSet, basename='admin-health-factor')
admin_router.register(r'insights', AdminUserInsightViewSet, basename='admin-insight')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/', include('accounts.urls')),
    path('api/readings/', include('readings.urls')),
    path('api/health-factors/', include('health_factors.urls')),
    path('api/insights/', include('insights.urls')),
    path('api/admin/', include(admin_router.urls)),
]

