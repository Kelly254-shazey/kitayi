from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags


def _send_html_email(subject, template_name, context, recipient):
    html_message = render_to_string(template_name, context)
    text_message = strip_tags(html_message)
    email = EmailMultiAlternatives(
        subject=subject,
        body=text_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[recipient],
    )
    email.attach_alternative(html_message, 'text/html')
    email.send()


def send_verification_email(user, verification_link):
    _send_html_email(
        subject='Verify your Kitayi Solutions email',
        template_name='emails/verify_email.html',
        context={'user': user, 'verification_link': verification_link},
        recipient=user.email,
    )


def send_password_reset_email(user, reset_link):
    _send_html_email(
        subject='Reset your Kitayi Solutions password',
        template_name='emails/password_reset.html',
        context={'user': user, 'reset_link': reset_link},
        recipient=user.email,
    )
