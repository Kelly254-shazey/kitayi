"""Security and logging middleware."""

import time
import logging
import json
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger('api_requests')


class RequestResponseLoggingMiddleware(MiddlewareMixin):
    """
    Log all API requests and responses for debugging and monitoring.
    
    Logs:
    - HTTP method and path
    - Response status code
    - Request duration
    - Client IP address
    """
    
    def process_request(self, request):
        request._start_time = time.time()
        return request
    
    def process_response(self, request, response):
        # Only log API requests
        if not request.path.startswith('/api/'):
            return response
        
        duration = time.time() - request._start_time
        
        log_data = {
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
            'method': request.method,
            'path': request.path,
            'status': response.status_code,
            'duration_ms': int(duration * 1000),
            'ip': self.get_client_ip(request),
            'user': str(request.user) if request.user.is_authenticated else 'anonymous',
        }
        
        # Log all requests but use appropriate level
        if response.status_code >= 500:
            logger.error(json.dumps(log_data))
        elif response.status_code >= 400:
            logger.warning(json.dumps(log_data))
        else:
            logger.info(json.dumps(log_data))
        
        return response
    
    def get_client_ip(self, request):
        """Extract client IP from request."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR', 'unknown')


class SecurityHeadersMiddleware(MiddlewareMixin):
    """
    Add additional security headers to all responses.
    """
    
    def process_response(self, request, response):
        # Prevent MIME type sniffing
        response['X-Content-Type-Options'] = 'nosniff'
        
        # Prevent clickjacking
        response['X-Frame-Options'] = 'DENY'
        
        # Enable XSS protection in older browsers
        response['X-XSS-Protection'] = '1; mode=block'
        
        # Referrer policy
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        
        return response
