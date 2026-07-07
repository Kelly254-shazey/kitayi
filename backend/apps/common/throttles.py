"""Custom rate limiting/throttling classes for security."""

from rest_framework.throttling import SimpleRateThrottle, AnonRateThrottle, UserRateThrottle


class AuthRateThrottle(AnonRateThrottle):
    """
    Strict throttle for login/register endpoints to prevent brute-force.
    
    Scope: 'auth'
    Limit: 10/minute (should be overridden by more specific throttles)
    """
    scope = 'auth'


class LoginThrottle(SimpleRateThrottle):
    """
    Very strict rate limiting for login attempts.
    
    Limits: 5 attempts per hour per IP
    Purpose: Prevent brute force password attacks
    """
    scope = 'login'
    
    def get_cache_key(self, request, view):
        if request.method != 'POST':
            return None
        
        # Rate limit by IP address
        return self.cache_format % {
            'scope': self.scope,
            'ident': self.get_ident(request)
        }


class RegisterThrottle(SimpleRateThrottle):
    """
    Rate limiting for registration.
    
    Limits: 10 per hour per IP
    Purpose: Prevent spam/bot registration
    """
    scope = 'register'
    
    def get_cache_key(self, request, view):
        if request.method != 'POST':
            return None
        
        return self.cache_format % {
            'scope': self.scope,
            'ident': self.get_ident(request)
        }


class PasswordResetThrottle(SimpleRateThrottle):
    """
    Rate limiting for password reset requests.
    
    Limits: 3 per hour per email
    Purpose: Prevent email bombing and account lockout attacks
    """
    scope = 'password_reset'
    
    def get_cache_key(self, request, view):
        if request.method != 'POST':
            return None
        
        # Rate limit by email address
        email = request.data.get('email', '')
        if not email:
            return None
        
        return self.cache_format % {
            'scope': self.scope,
            'ident': email
        }


class PaymentRateThrottle(UserRateThrottle):
    """
    Throttle for payment initiation endpoints.
    
    Limits: 10 per hour per user
    Purpose: Prevent accidental duplicate charges
    """
    scope = 'payment'
