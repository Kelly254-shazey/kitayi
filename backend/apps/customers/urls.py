from django.urls import path

from apps.customers.views import (
    AddressDetailView,
    AddressListCreateView,
    CustomerProfileView,
    SetDefaultAddressView,
)

app_name = 'customers'

urlpatterns = [
    path('me/', CustomerProfileView.as_view(), name='customer-profile'),
    path('me/addresses/', AddressListCreateView.as_view(), name='address-list'),
    path('me/addresses/<uuid:pk>/', AddressDetailView.as_view(), name='address-detail'),
    path(
        'me/addresses/<uuid:pk>/set-default/',
        SetDefaultAddressView.as_view(),
        name='set-default-address',
    ),
]
