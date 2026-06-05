from datetime import datetime, timedelta, timezone

import jwt
from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()


def generate_password_reset_token(user):
    payload = {
        'user_id': str(user.id),
        'type': 'password_reset',
        'exp': datetime.now(timezone.utc) + timedelta(minutes=15),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')


def generate_email_verification_token(user):
    payload = {
        'user_id': str(user.id),
        'type': 'email_verification',
        'exp': datetime.now(timezone.utc) + timedelta(hours=24),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')


def decode_token(token, expected_type):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
    except jwt.ExpiredSignatureError as exc:
        raise ValueError('Token has expired.') from exc
    except jwt.InvalidTokenError as exc:
        raise ValueError('Invalid token.') from exc

    if payload.get('type') != expected_type:
        raise ValueError('Invalid token type.')

    return payload


def get_user_from_token(token, expected_type):
    payload = decode_token(token, expected_type)
    try:
        return User.objects.get(pk=payload['user_id'])
    except User.DoesNotExist as exc:
        raise ValueError('User not found.') from exc
