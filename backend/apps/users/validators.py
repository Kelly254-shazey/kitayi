import re

import phonenumbers
from django.core.exceptions import ValidationError


def validate_e164_phone(value):
    """Validate phone number is E.164 format (Kenya +254 preferred)."""
    if not value:
        raise ValidationError('Phone number is required.')

    try:
        parsed = phonenumbers.parse(value, None)
    except phonenumbers.NumberParseException as exc:
        raise ValidationError('Enter a valid phone number in E.164 format (e.g. +254712345678).') from exc

    if not phonenumbers.is_valid_number(parsed):
        raise ValidationError('Enter a valid phone number.')

    formatted = phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.E164)
    if parsed.country_code != 254:
        raise ValidationError('Phone number must be a valid Kenyan number (+254).')
    return formatted


def validate_password_complexity(password):
    """Min 12 chars, uppercase, digit, and special character."""
    if len(password) < 12:
        raise ValidationError('Password must be at least 12 characters long.')
    if not re.search(r'[A-Z]', password):
        raise ValidationError('Password must contain at least one uppercase letter.')
    if not re.search(r'\d', password):
        raise ValidationError('Password must contain at least one number.')
    if not re.search(r'[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\;/]', password):
        raise ValidationError('Password must contain at least one special character.')
    return password
