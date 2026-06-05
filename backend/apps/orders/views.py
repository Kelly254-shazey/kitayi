from django.utils import timezone
from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.common.permissions import IsAdminUser
from apps.customers.models import CustomerProfile
from apps.orders.models import Order, Coupon
from apps.orders.serializers import OrderSerializer, CouponSerializer


class OrderListCreateAPIView(generics.ListCreateAPIView):
    """List customer orders or create a new water delivery order."""
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Staff/Admins can see all orders
        if user.is_staff:
            return Order.objects.all()
        # Customers only see their own orders
        try:
            customer = CustomerProfile.objects.get(user=user)
            return Order.objects.filter(customer=customer)
        except CustomerProfile.DoesNotExist:
            return Order.objects.none()


class OrderRetrieveAPIView(generics.RetrieveAPIView):
    """View details of a specific water order."""
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Order.objects.all()
        try:
            customer = CustomerProfile.objects.get(user=user)
            return Order.objects.filter(customer=customer)
        except CustomerProfile.DoesNotExist:
            return Order.objects.none()


class OrderCancelAPIView(views.APIView):
    """Cancel a pending water order and restore the product stocks."""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            if request.user.is_staff:
                order = Order.objects.get(pk=pk)
            else:
                customer = CustomerProfile.objects.get(user=request.user)
                order = Order.objects.get(pk=pk, customer=customer)
        except (Order.DoesNotExist, CustomerProfile.DoesNotExist):
            return Response({"detail": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        if order.status != Order.OrderStatus.PENDING:
            return Response(
                {"detail": "Only pending orders can be cancelled."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Restore product stock
        for item in order.items.all():
            product = item.product
            product.stock_qty += item.quantity
            product.save(update_fields=['stock_qty', 'updated_at'])

        order.status = Order.OrderStatus.CANCELLED
        order.save(update_fields=['status', 'updated_at'])

        # Refund or adjust coupon use count if applicable
        if order.coupon:
            coupon = order.coupon
            if coupon.uses > 0:
                coupon.uses -= 1
                coupon.save(update_fields=['uses'])

        return Response({"message": "Order successfully cancelled and stock restored."}, status=status.HTTP_200_OK)


class CouponListCreateAPIView(generics.ListCreateAPIView):
    """Create and list promotional coupons (Admin only)."""
    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]


class CouponValidateAPIView(views.APIView):
    """Validate a coupon code and return its rate/discount type."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        code = request.query_params.get('code')
        if not code:
            return Response({"detail": "Code parameter is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            coupon = Coupon.objects.get(code__iexact=code, active=True, expiry_date__gt=timezone.now())
            if coupon.uses >= coupon.max_uses:
                return Response({"valid": False, "detail": "Coupon usage limit reached."}, status=status.HTTP_400_BAD_REQUEST)
            
            return Response({
                "valid": True,
                "code": coupon.code,
                "discount_type": coupon.discount_type,
                "value": str(coupon.value)
            }, status=status.HTTP_200_OK)
        except Coupon.DoesNotExist:
            return Response({"valid": False, "detail": "Invalid or expired coupon code."}, status=status.HTTP_404_NOT_FOUND)

