from decouple import config

from .base import *  # noqa: F401, F403

DEBUG = True
ALLOWED_HOSTS = ['localhost', '127.0.0.1', '*.localhost']

# Local dev without Docker/PostgreSQL: set USE_SQLITE=True in .env
if config('USE_SQLITE', default=True, cast=bool):
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

try:
    import debug_toolbar  # noqa: F401

    INSTALLED_APPS += [
        'debug_toolbar',
        'django_extensions',
    ]
    MIDDLEWARE.insert(0, 'debug_toolbar.middleware.DebugToolbarMiddleware')
except ImportError:
    pass

INTERNAL_IPS = ['127.0.0.1']

# Keep dev logs readable: INFO for Django, silence autoreload file-scan spam
LOGGING['loggers']['django']['level'] = 'INFO'
LOGGING['loggers']['django.utils.autoreload'] = {
    'handlers': ['console'],
    'level': 'WARNING',
    'propagate': False,
}
# Use console email backend in development
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Allow all CORS in development
CORS_ALLOW_ALL_ORIGINS = True

REST_FRAMEWORK['DEFAULT_RENDERER_CLASSES'] = (
    'rest_framework.renderers.JSONRenderer',
    'rest_framework.renderers.BrowsableAPIRenderer',
)
