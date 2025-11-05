from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('create-test-users/', views.create_test_users, name='create_test_users'),
    path('populate-patients/', views.populate_patients, name='populate_patients'),
    path('profile/', views.profile, name='profile'),
    path('profile/update/', views.UserProfileUpdateView.as_view(), name='profile-update'),
    path('admin/users/', views.list_all_users, name='list_all_users'),
    path('admin/users/<int:user_id>/delete/', views.delete_user, name='delete_user'),
]

