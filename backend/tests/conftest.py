import pytest
from unittest.mock import patch
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


@pytest.fixture(autouse=True)
def mock_send_emails():
    """Prevent all email sending during tests (avoids template rendering issues)."""
    with patch('services.email_service.send_verification_email'), \
         patch('services.email_service.send_password_reset_email'):
        yield


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user(db):
    return User.objects.create_user(
        email='test@kitayi.com',
        phone_number='+254700000001',
        full_name='Test User',
        password='TestPass123!',
        user_type='Residential',
    )


@pytest.fixture
def auth_client(api_client, user):
    refresh = RefreshToken.for_user(user)
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return api_client


@pytest.fixture
def admin_user(db):
    return User.objects.create_user(
        email='admin@kitayi.com',
        phone_number='+254700000002',
        full_name='Admin User',
        password='AdminPass123!',
        is_staff=True,
        is_superuser=True,
    )


@pytest.fixture
def admin_client(api_client, admin_user):
    refresh = RefreshToken.for_user(admin_user)
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return api_client
