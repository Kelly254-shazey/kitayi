from django.urls import path
from apps.deliveries.views import (
    DeliveryListCreateAPIView,
    DeliveryRetrieveUpdateAPIView,
    DeliveryStatusUpdateView,
    DeliveryVerifyView,
    DeliveryRouteCreateView,
    FleetVehicleListCreateAPIView,
    FleetVehicleRetrieveUpdateDestroyAPIView,
)

app_name = 'deliveries'

urlpatterns = [
    path('', DeliveryListCreateAPIView.as_view(), name='delivery-list'),
    path('<uuid:pk>/', DeliveryRetrieveUpdateAPIView.as_view(), name='delivery-detail'),
    path('<uuid:pk>/status/', DeliveryStatusUpdateView.as_view(), name='delivery-status-update'),
    path('<uuid:pk>/verify/', DeliveryVerifyView.as_view(), name='delivery-verify'),
    path('routes/', DeliveryRouteCreateView.as_view(), name='delivery-route-create'),
    path('vehicles/', FleetVehicleListCreateAPIView.as_view(), name='vehicle-list'),
    path('vehicles/<uuid:pk>/', FleetVehicleRetrieveUpdateDestroyAPIView.as_view(), name='vehicle-detail'),
]
