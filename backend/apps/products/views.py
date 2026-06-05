from rest_framework import generics, filters
from rest_framework.permissions import AllowAny, IsAuthenticated
from apps.common.permissions import IsAdminUser
from apps.products.models import Product, InventoryTransaction
from apps.products.serializers import ProductSerializer, InventoryTransactionSerializer


class ProductListCreateAPIView(generics.ListCreateAPIView):
    """List all active products, or create a new product catalog item (Admin only)."""
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'sku', 'category']
    ordering_fields = ['price', 'name', 'created_at']

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated(), IsAdminUser()]

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.method == 'GET':
            # Customers only see active products
            queryset = queryset.filter(is_active=True)
        return queryset


class ProductRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or remove a product catalog item (Admin only for modifications)."""
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated(), IsAdminUser()]


class InventoryTransactionListCreateAPIView(generics.ListCreateAPIView):
    """Audit logs for stock replenishment or modifications (Admin only)."""
    queryset = InventoryTransaction.objects.all()
    serializer_class = InventoryTransactionSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at']

    def perform_create(self, serializer):
        serializer.save()
