from rest_framework.throttling import AnonRateThrottle, UserRateThrottle


class AuthRateThrottle(AnonRateThrottle):
    """Strict throttle for login/register endpoints to prevent brute-force."""
    scope = 'auth'


class PaymentRateThrottle(UserRateThrottle):
    """Throttle for payment initiation endpoints."""
    scope = 'payment'
