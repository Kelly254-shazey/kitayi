from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.users.models import User
from apps.customers.models import CustomerProfile


class UserAuthCustomerProfileTests(APITestCase):
    def setUp(self):
        self.register_url = reverse('auth:register')
        self.login_url = reverse('auth:login')
        self.verify_email_url = reverse('auth:verify-email')
        self.password_reset_url = reverse('auth:password-reset')
        self.password_reset_confirm_url = reverse('auth:password-reset-confirm')
        self.current_user_url = reverse('auth:current-user')

    def test_user_registration_creates_customer_profile(self):
        payload = {
            'email': 'tester@example.com',
            'phone_number': '+254712345678',
            'password': 'StrongPass!234',
            'password_confirm': 'StrongPass!234',
            'full_name': 'Test User',
            'user_type': 'Residential',
        }
        response = self.client.post(self.register_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(email='tester@example.com')
        self.assertTrue(CustomerProfile.objects.filter(user=user).exists())
        self.assertFalse(user.is_email_verified)
        self.assertFalse(user.is_phone_verified)

    def test_email_verification_endpoint_marks_user_verified(self):
        user = User.objects.create_user(
            email='verify@example.com',
            password='StrongPass!234',
            phone_number='+254712345679',
            full_name='Verify User',
        )
        from apps.users.tokens import generate_email_verification_token

        token = generate_email_verification_token(user)
        response = self.client.post(self.verify_email_url, {'token': token}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertTrue(user.is_email_verified)

    def test_login_returns_warning_for_unverified_user(self):
        user = User.objects.create_user(
            email='login@example.com',
            password='StrongPass!234',
            phone_number='+254712345680',
            full_name='Login User',
        )
        payload = {'email': user.email, 'password': 'StrongPass!234'}
        response = self.client.post(self.login_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('warning', response.data)

    def test_current_user_endpoint_requires_authentication(self):
        response = self.client.get(self.current_user_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_password_reset_flow(self):
        user = User.objects.create_user(
            email='reset@example.com',
            password='StrongPass!234',
            phone_number='+254712345681',
            full_name='Reset User',
        )
        response = self.client.post(self.password_reset_url, {'email': user.email}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)

        from apps.users.tokens import generate_password_reset_token, get_user_from_token

        token = generate_password_reset_token(user)
        reset_response = self.client.post(
            self.password_reset_confirm_url,
            {
                'token': token,
                'password': 'NewStrongPass!234',
                'password_confirm': 'NewStrongPass!234',
            },
            format='json',
        )
        self.assertEqual(reset_response.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertTrue(user.check_password('NewStrongPass!234'))
