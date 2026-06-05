from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from apps.users.views import (
    AuthenticationRootView,
    CurrentUserView,
    EmailVerificationView,
    LoginView,
    LogoutView,
    PasswordResetConfirmView,
    PasswordResetView,
    RegisterView,
    SocialLoginView,
)

app_name = 'auth'

urlpatterns = [
    path('', AuthenticationRootView.as_view(), name='auth-root'),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('me/', CurrentUserView.as_view(), name='current-user'),
    path('password-reset/', PasswordResetView.as_view(), name='password-reset'),
    path(
        'password-reset-confirm/',
        PasswordResetConfirmView.as_view(),
        name='password-reset-confirm',
    ),
    path('verify-email/', EmailVerificationView.as_view(), name='verify-email'),
    path('refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('social-login/', SocialLoginView.as_view(), name='social-login'),
]
