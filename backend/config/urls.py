from django.contrib import admin
from django.urls import path, include
from django.views.generic.base import RedirectView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

urlpatterns = [
    path('', RedirectView.as_view(url='/api/docs/')),
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('apps.users.urls', namespace='auth')),
    path('api/v1/customers/', include('apps.customers.urls', namespace='customers')),
    path('api/v1/products/', include('apps.products.urls', namespace='products')),
    path('api/v1/orders/', include('apps.orders.urls', namespace='orders')),
    path('api/v1/payments/', include('apps.payments.urls', namespace='payments')),
    path('api/v1/deliveries/', include('apps.deliveries.urls', namespace='deliveries')),
    path('api/v1/subscriptions/', include('apps.subscriptions.urls', namespace='subscriptions')),
    path('auth/', include('apps.users.public_urls', namespace='auth_pages')),
    # API Docs
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]

from django.conf import settings
if settings.DEBUG:
    try:
        import debug_toolbar
        urlpatterns = [path('__debug__/', include(debug_toolbar.urls))] + urlpatterns
    except ImportError:
        pass
