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

    def test_register_industrial_customer_creates_profile(self, api_client):
        res = api_client.post(reverse('auth:register'), {
            'email': 'industrial@kitayi.com',
            'phone_number': '+254711000004',
            'full_name': 'Industrial Buyer',
            'user_type': 'Industrial',
            'password': 'StrongPass1!',
            'password_confirm': 'StrongPass1!',
        })
        assert res.status_code == 201

        from django.contrib.auth import get_user_model

        user = get_user_model().objects.get(email='industrial@kitayi.com')
        assert user.is_customer is True
        assert user.customerprofile.account_number.startswith('KS-')

    def test_public_register_rejects_employee_role(self, api_client):
        res = api_client.post(reverse('auth:register'), {
            'email': 'cashier@kitayi.com',
            'phone_number': '+254711000005',
            'full_name': 'Cashier User',
            'user_type': 'Cashier',
            'password': 'StrongPass1!',
            'password_confirm': 'StrongPass1!',
        })
        assert res.status_code == 400
        assert 'user_type' in res.data


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


@pytest.mark.django_db
class TestUserRoles:
    def test_employee_user_does_not_create_customer_profile(self):
        from django.contrib.auth import get_user_model
        from apps.customers.models import CustomerProfile

        user = get_user_model().objects.create_user(
            email='employee@kitayi.com',
            phone_number='+254711000006',
            full_name='Employee User',
            password='StrongPass1!',
            user_type='Cashier',
        )

        assert user.is_employee is True
        assert CustomerProfile.objects.filter(user=user).exists() is False
