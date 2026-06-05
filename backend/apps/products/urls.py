from django.urls import path
from apps.products.views import (
    ProductListCreateAPIView,
    ProductRetrieveUpdateDestroyAPIView,
    InventoryTransactionListCreateAPIView,
)

app_name = 'products'

urlpatterns = [
    path('', ProductListCreateAPIView.as_view(), name='product-list'),
    path('<uuid:pk>/', ProductRetrieveUpdateDestroyAPIView.as_view(), name='product-detail'),
    path('inventory/transactions/', InventoryTransactionListCreateAPIView.as_view(), name='inventory-transactions'),
]
