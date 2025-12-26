from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'users', views.AdminUserViewSet, basename='admin-user')

urlpatterns = [
    path('register/', views.register, name='register'),
    path('create-test-users/', views.create_test_users, name='create_test_users'),
    path('populate-patients/', views.populate_patients, name='populate_patients'),
    path('profile/', views.profile, name='profile'),
    path('profile/update/', views.UserProfileUpdateView.as_view(), name='profile-update'),
    path('admin-check/', views.admin_check, name='admin_check'),
    path('password-reset/request/', views.request_password_reset, name='request_password_reset'),
    path('password-reset/confirm/', views.reset_password, name='reset_password'),
    path('test-email/', views.test_email_config, name='test_email_config'),
    path('', include(router.urls)),
]

