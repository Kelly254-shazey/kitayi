from django.urls import path

from apps.users.public_views import (
    AuthLandingView,
    LoginPageView,
    PasswordResetConfirmPageView,
    PasswordResetPageView,
    RegisterPageView,
    VerifyEmailPageView,
)

app_name = 'auth_pages'

urlpatterns = [
    path('', AuthLandingView.as_view(), name='landing'),
    path('register/', RegisterPageView.as_view(), name='register'),
    path('login/', LoginPageView.as_view(), name='login'),
    path('password-reset/', PasswordResetPageView.as_view(), name='password-reset'),
    path('password-reset-confirm/', PasswordResetConfirmPageView.as_view(), name='password-reset-confirm'),
    path('verify-email/', VerifyEmailPageView.as_view(), name='verify-email'),
]
