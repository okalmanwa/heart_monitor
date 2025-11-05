from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('create-test-users/', views.create_test_users, name='create_test_users'),
    path('populate-patients/', views.populate_patients, name='populate_patients'),
    path('profile/', views.profile, name='profile'),
    path('profile/update/', views.UserProfileUpdateView.as_view(), name='profile-update'),
]

