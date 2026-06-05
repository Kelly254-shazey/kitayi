import pytest
from django.urls import reverse


@pytest.mark.django_db
class TestRegister:
    def test_register_success(self, api_client):
        res = api_client.post(reverse('auth:register'), {
            'email': 'new@kitayi.com',
            'phone_number': '+254711000001',
            'full_name': 'New User',
            'user_type': 'Residential',
            'password': 'StrongPass1!',
            'password_confirm': 'StrongPass1!',
        })
        # 201 Created with tokens returned
        assert res.status_code == 201
        assert 'access_token' in res.data
        assert 'email' in res.data

    def test_register_duplicate_email(self, api_client, user):
        res = api_client.post(reverse('auth:register'), {
            'email': user.email,
            'phone_number': '+254711000002',
            'full_name': 'Dupe',
            'user_type': 'Residential',
            'password': 'StrongPass1!',
            'password_confirm': 'StrongPass1!',
        })
        assert res.status_code == 409

    def test_register_password_mismatch(self, api_client):
        res = api_client.post(reverse('auth:register'), {
            'email': 'other@kitayi.com',
            'phone_number': '+254711000003',
            'full_name': 'User',
            'user_type': 'Residential',
            'password': 'StrongPass1!',
            'password_confirm': 'WrongPass1!',
        })
        assert res.status_code == 400


@pytest.mark.django_db
class TestLogin:
    def test_login_success(self, api_client, user):
        res = api_client.post(reverse('auth:login'), {
            'email': user.email,
            'password': 'TestPass123!',
        })
        assert res.status_code == 200
        assert 'access_token' in res.data
        assert 'refresh_token' in res.data

    def test_login_wrong_password(self, api_client, user):
        res = api_client.post(reverse('auth:login'), {
            'email': user.email,
            'password': 'WrongPassword!',
        })
        assert res.status_code == 401

    def test_login_unknown_user(self, api_client):
        res = api_client.post(reverse('auth:login'), {
            'email': 'nobody@kitayi.com',
            'password': 'Whatever1!',
        })
        assert res.status_code == 401


@pytest.mark.django_db
class TestLogout:
    def test_logout_success(self, auth_client, user):
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = str(RefreshToken.for_user(user))
        res = auth_client.post(reverse('auth:logout'), {'refresh_token': refresh})
        assert res.status_code == 200

    def test_logout_missing_token(self, auth_client):
        res = auth_client.post(reverse('auth:logout'), {})
        assert res.status_code == 400


@pytest.mark.django_db
class TestCurrentUser:
    def test_me_authenticated(self, auth_client, user):
        res = auth_client.get(reverse('auth:current-user'))
        assert res.status_code == 200
        assert res.data['email'] == user.email

    def test_me_unauthenticated(self, api_client):
        res = api_client.get(reverse('auth:current-user'))
        assert res.status_code == 401
