from django.conf import settings
from rest_framework import generics, serializers, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.reverse import reverse
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from apps.common.audit import log_action
from apps.common.models import AuditLog
from apps.common.throttles import LoginThrottle, RegisterThrottle, PasswordResetThrottle  # ✅ SECURITY
from apps.users.serializers import (
    EmailVerificationSerializer,
    LoginSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetSerializer,
    UserDetailSerializer,
    UserRegistrationSerializer,
)
from apps.users.tokens import (
    generate_email_verification_token,
    generate_password_reset_token,
    get_user_from_token,
)
from services.email_service import send_password_reset_email, send_verification_email


class RegisterView(generics.CreateAPIView):
    permission_classes = (AllowAny,)
    throttle_classes = (AuthRateThrottle,)
    serializer_class = UserRegistrationSerializer

    def get(self, request, *args, **kwargs):
        serializer = self.get_serializer()
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except serializers.ValidationError as exc:
            detail = exc.detail
            duplicate_email = (
                'email' in detail
                and any('already exists' in str(item) for item in detail['email'])
            )
            duplicate_phone = (
                'phone_number' in detail
                and any('already exists' in str(item) for item in detail['phone_number'])
            )
            if duplicate_email or duplicate_phone:
                return Response(detail, status=status.HTTP_409_CONFLICT)
            raise
        user = serializer.save()

        refresh = RefreshToken.for_user(user)
        verification_token = generate_email_verification_token(user)
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:8000')
        verification_link = f'{frontend_url}/verify-email?token={verification_token}'
        send_verification_email(user, verification_link)

        log_action(user, AuditLog.Action.CREATE, 'User', user.id, 'New user registered', request)
        return Response(
            {
                'user_id': str(user.id),
                'email': user.email,
                'phone_number': user.phone_number,
                'access_token': str(refresh.access_token),
                'refresh_token': str(refresh),
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = (AllowAny,)
    throttle_classes = (LoginThrottle,)  # ✅ SECURITY: Very strict

    def get(self, request):
        serializer = LoginSerializer()
        return Response(serializer.data)

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']

        refresh = RefreshToken.for_user(user)
        response_data = {
            'user_id': str(user.id),
            'email': user.email,
            'user_type': user.user_type,
            'access_token': str(refresh.access_token),
            'refresh_token': str(refresh),
        }
        if not user.is_email_verified or not user.is_phone_verified:
            response_data['warning'] = (
                'Your email or phone is not verified. Please verify to access all features.'
            )
        log_action(user, AuditLog.Action.LOGIN, 'User', user.id, 'User logged in', request)
        return Response(response_data)


class CurrentUserView(generics.RetrieveAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = UserDetailSerializer

    def get_object(self):
        return self.request.user


class PasswordResetView(APIView):
    permission_classes = (AllowAny,)
    throttle_classes = (PasswordResetThrottle,)  # ✅ SECURITY: Prevent email bombing

    def get(self, request):
        serializer = PasswordResetSerializer()
        return Response(serializer.data)

    def post(self, request):
        serializer = PasswordResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        from django.contrib.auth import get_user_model

        User = get_user_model()
        user = User.objects.get(email__iexact=serializer.validated_data['email'])
        token = generate_password_reset_token(user)
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:8000')
        reset_link = f'{frontend_url}/reset-password?token={token}'
        send_password_reset_email(user, reset_link)
        return Response({'message': 'Password reset link sent to email.'})


class PasswordResetConfirmView(APIView):
    permission_classes = (AllowAny,)

    def get(self, request):
        serializer = PasswordResetConfirmSerializer()
        return Response(serializer.data)

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            user = get_user_from_token(
                serializer.validated_data['token'],
                expected_type='password_reset',
            )
        except ValueError as exc:
            return Response({'token': [str(exc)]}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(serializer.validated_data['password'])
        user.save()
        return Response({'message': 'Password reset successful.'})


class EmailVerificationView(APIView):
    permission_classes = (AllowAny,)

    def get(self, request):
        serializer = EmailVerificationSerializer()
        return Response(serializer.data)

    def post(self, request):
        serializer = EmailVerificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            user = get_user_from_token(
                serializer.validated_data['token'],
                expected_type='email_verification',
            )
        except ValueError as exc:
            return Response({'token': [str(exc)]}, status=status.HTTP_400_BAD_REQUEST)

        if not user.is_email_verified:
            user.is_email_verified = True
            user.save(update_fields=['is_email_verified', 'updated_at'])

        return Response({'message': 'Email successfully verified.'})


class LogoutView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        refresh_token = request.data.get('refresh_token')
        if not refresh_token:
            return Response(
                {'refresh_token': ['This field is required.']},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception:
            return Response({'detail': 'Invalid refresh token.'}, status=status.HTTP_400_BAD_REQUEST)
        log_action(request.user, AuditLog.Action.LOGOUT, 'User', request.user.id, 'User logged out', request)
        return Response({'message': 'Logged out successfully.'})


class SocialLoginView(APIView):
    """Placeholder for future social login integration."""

    permission_classes = (AllowAny,)

    def get(self, request):
        return Response(
            {
                'detail': 'Social login is not yet implemented.',
                'post': 'Send provider and token to authenticate.',
            }
        )

    def post(self, request):
        return Response(
            {'detail': 'Social login is not yet implemented.'},
            status=status.HTTP_501_NOT_IMPLEMENTED,
        )


class AuthenticationRootView(APIView):
    permission_classes = (AllowAny,)

    def get(self, request):
        return Response(
            {
                'register': reverse('auth:register', request=request),
                'login': reverse('auth:login', request=request),
                'password_reset': reverse('auth:password-reset', request=request),
                'password_reset_confirm': reverse('auth:password-reset-confirm', request=request),
                'verify_email': reverse('auth:verify-email', request=request),
                'refresh': reverse('auth:token-refresh', request=request),
                'logout': reverse('auth:logout', request=request),
                'social_login': reverse('auth:social-login', request=request),
            }
        )
