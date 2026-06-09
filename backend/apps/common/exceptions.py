"""Custom exception handlers for API errors."""

import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom exception handler with logging and security.
    
    - Logs server errors for debugging
    - Hides internal details from client in production
    - Returns structured error responses
    """
    response = exception_handler(exc, context)
    
    # Handle unhandled exceptions
    if response is None:
        logger.error(
            f"Unhandled exception: {exc}",
            exc_info=True,
            extra={
                'request': context.get('request'),
                'view': context.get('view'),
            }
        )
        return Response(
            {'detail': 'Internal server error. Please try again later.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    # Log server errors for monitoring
    if response.status_code >= 500:
        logger.error(
            f"Server error: {exc}",
            exc_info=True,
            extra={
                'request': context.get('request'),
                'status_code': response.status_code,
            }
        )
    
    # Add error code to response for client-side error handling
    if isinstance(response.data, dict):
        # Get exception class name as error code
        error_code = exc.__class__.__name__
        response.data = {
            'error_code': error_code,
            'detail': response.data.get('detail') or str(exc),
            **{k: v for k, v in response.data.items() if k != 'detail'}
        }
    
    return response
