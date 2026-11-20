from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView

app_name = 'accounts'

urlpatterns = [
    # API endpoints matching api.js
    path('users/', views.UserRegistrationView.as_view(), name='users-register'),
    path('users/me/', views.current_user_view, name='users-me'),
    path('users/update_profile/', views.UserProfileView.as_view(), name='users-update-profile'),
    path(
        'password-reset/request/',
        views.PasswordResetRequestView.as_view(),
        name='password-reset-request',
    ),
    path(
        'password-reset/confirm/',
        views.PasswordResetConfirmView.as_view(),
        name='password-reset-confirm',
    ),
    
    # JWT Auth
    path('token/', views.EmailTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Legacy endpoints (keeping them just in case)
    path('register/', views.UserRegistrationView.as_view(), name='register'),
    path('login/', views.UserLoginView.as_view(), name='login'),
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    path('logout/', views.logout_view, name='logout'),
    path('current-user/', views.current_user_view, name='current-user'),
]
