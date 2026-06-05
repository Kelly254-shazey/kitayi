from django.shortcuts import render
from django.urls import reverse
from django.views import View
from rest_framework_simplejwt.tokens import RefreshToken

from apps.users.serializers import (
    EmailVerificationSerializer,
    LoginSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetSerializer,
    UserRegistrationSerializer,
)
from apps.users.tokens import (
    generate_email_verification_token,
    generate_password_reset_token,
    get_user_from_token,
)
from services.email_service import send_password_reset_email, send_verification_email


class BaseAuthPageView(View):
    template_name = ''
    page_title = ''
    action_url = ''
    intro = ''
    serializer_class = None
    success_message = ''
    info_message = ''

    def get_context(self, request, initial=None, errors=None, success=None, info=None):
        return {
            'page_title': self.page_title,
            'action_url': self.action_url,
            'intro': self.intro,
            'initial': initial or {},
            'errors': errors or {},
            'success': success,
            'info': info or self.info_message,
        }

    def get(self, request):
        initial = {}
        if request.GET.get('token'):
            initial['token'] = request.GET.get('token')
        return render(request, self.template_name, self.get_context(request, initial=initial))

    def post(self, request):
        serializer = self.serializer_class(data=request.POST)
        if serializer.is_valid():
            return self.handle_valid(request, serializer)

        return render(
            request,
            self.template_name,
            self.get_context(request, initial=request.POST, errors=serializer.errors),
        )

    def handle_valid(self, request, serializer):
        raise NotImplementedError('Implement handle_valid in subclasses.')


class AuthLandingView(BaseAuthPageView):
    template_name = 'users/auth_landing.html'
    page_title = 'Welcome to Kitayi'
    intro = 'Sign in or create an account to start managing water delivery and payments.'


class RegisterPageView(BaseAuthPageView):
    template_name = 'users/register.html'
    page_title = 'Create a Kitayi Account'
    action_url = '/auth/register/'
    serializer_class = UserRegistrationSerializer
    intro = 'Sign up for clean, reliable water delivery with a single account.'

    def handle_valid(self, request, serializer):
        user = serializer.save()
        token = generate_email_verification_token(user)
        verification_url = request.build_absolute_uri(
            reverse('auth_pages:verify-email') + f'?token={token}'
        )
        send_verification_email(user, verification_url)
        return render(
            request,
            self.template_name,
            self.get_context(
                request,
                initial={},
                success='Your account was created successfully. Check your email to verify your address.',
            ),
        )


class LoginPageView(BaseAuthPageView):
    template_name = 'users/login.html'
    page_title = 'Sign in to Kitayi'
    action_url = '/auth/login/'
    serializer_class = LoginSerializer
    intro = 'Securely access your Kitayi dashboard with email or phone.'

    def handle_valid(self, request, serializer):
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        return render(
            request,
            self.template_name,
            self.get_context(
                request,
                initial={},
                success='Login successful. Save your access token for API access.',
                info=(
                    f'Access token: {str(refresh.access_token)}\n'
                    f'Refresh token: {str(refresh)}'
                ),
            ),
        )


class PasswordResetPageView(BaseAuthPageView):
    template_name = 'users/password_reset.html'
    page_title = 'Reset Your Password'
    action_url = '/auth/password-reset/'
    serializer_class = PasswordResetSerializer
    intro = 'Enter your account email and we will send a reset link.'

    def handle_valid(self, request, serializer):
        User = serializer.Meta.model
        user = User.objects.get(email__iexact=serializer.validated_data['email'])
        token = generate_password_reset_token(user)
        reset_url = request.build_absolute_uri(
            reverse('auth_pages:password-reset-confirm') + f'?token={token}'
        )
        send_password_reset_email(user, reset_url)
        return render(
            request,
            self.template_name,
            self.get_context(
                request,
                initial={},
                success='Password reset link sent. Check your email for instructions.',
            ),
        )


class PasswordResetConfirmPageView(BaseAuthPageView):
    template_name = 'users/password_reset_confirm.html'
    page_title = 'Confirm Password Reset'
    action_url = '/auth/password-reset-confirm/'
    serializer_class = PasswordResetConfirmSerializer
    intro = 'Enter the token from your email and choose a new password.'

    def handle_valid(self, request, serializer):
        try:
            user = get_user_from_token(
                serializer.validated_data['token'],
                expected_type='password_reset',
            )
        except ValueError as exc:
            return render(
                request,
                self.template_name,
                self.get_context(request, initial=request.POST, errors={'token': [str(exc)]}),
            )

        user.set_password(serializer.validated_data['password'])
        user.save()
        return render(
            request,
            self.template_name,
            self.get_context(
                request,
                initial={},
                success='Your password has been reset successfully.',
            ),
        )


class VerifyEmailPageView(BaseAuthPageView):
    template_name = 'users/verify_email.html'
    page_title = 'Verify Your Email'
    action_url = '/auth/verify-email/'
    serializer_class = EmailVerificationSerializer
    intro = 'Paste the token from your email to confirm your address.'

    def handle_valid(self, request, serializer):
        try:
            user = get_user_from_token(
                serializer.validated_data['token'],
                expected_type='email_verification',
            )
        except ValueError as exc:
            return render(
                request,
                self.template_name,
                self.get_context(request, initial=request.POST, errors={'token': [str(exc)]}),
            )

        if not user.is_email_verified:
            user.is_email_verified = True
            user.save(update_fields=['is_email_verified', 'updated_at'])

        return render(
            request,
            self.template_name,
            self.get_context(
                request,
                initial={},
                success='Your email has been verified. You can now sign in.',
            ),
        )
