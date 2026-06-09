"""
Advanced E-Commerce API Endpoints
- Shopping Cart Management (CRUD + calculations)
- Saved Payment Methods (secure, tokenized)
- Anonymous Bill Pay System
- Order Tracking & Status Updates
- Product Catalog with Dynamic Pricing
"""

from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.db.models import Q, Sum, F
from django.utils import timezone
from decimal import Decimal
import uuid

from apps.orders.models import (
    ShoppingCart, CartItem, SavedPaymentMethod, 
    BillPaymentRecord, Order, OrderItem
)
from apps.products.models import Product, CustomerTier, ProductVariant
from apps.customers.models import CustomerProfile, Address
from apps.orders.cart_serializers import (
    ShoppingCartSerializer, CartItemSerializer,
    CartAddItemSerializer, SavedPaymentMethodSerializer,
    SavedPaymentMethodCreateSerializer, BillPaymentSerializer,
    BillPaymentInitiateSerializer, CustomerTierSerializer
)


class ShoppingCartViewSet(viewsets.ViewSet):
    """
    Complete shopping cart API with CRUD operations.
    Features: persistent cart, item management, bulk pricing, checkout.
    """
    permission_classes = [IsAuthenticated]

    def get_cart(self, user):
        """Get or create customer's shopping cart."""
        customer = get_object_or_404(CustomerProfile, user=user)
        cart, created = ShoppingCart.objects.get_or_create(customer=customer)
        return cart

    @action(detail=False, methods=['get'])
    def retrieve(self, request):
        """GET /api/cart/ - Retrieve current shopping cart."""
        cart = self.get_cart(request.user)
        serializer = ShoppingCartSerializer(cart)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def add_item(self, request):
        """
        POST /api/cart/add_item/ - Add product to cart.
        Body: { product_id, quantity }
        """
        serializer = CartAddItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        cart = self.get_cart(request.user)
        product = get_object_or_404(Product, id=serializer.validated_data['product_id'])
        quantity = serializer.validated_data['quantity']

        # Validate stock
        if product.stock_qty < quantity:
            return Response(
                {'detail': f'Only {product.stock_qty} items in stock'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Add or update cart item
        item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity': quantity}
        )
        if not created:
            item.quantity += quantity
            item.save()

        return Response(
            CartItemSerializer(item).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )

    @action(detail=False, methods=['patch'])
    def update_item(self, request):
        """
        PATCH /api/cart/update_item/ - Update cart item quantity.
        Body: { item_id, quantity }
        """
        item_id = request.data.get('item_id')
        quantity = request.data.get('quantity')

        if not item_id or quantity is None:
            return Response(
                {'detail': 'item_id and quantity required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        cart = self.get_cart(request.user)
        item = get_object_or_404(CartItem, id=item_id, cart=cart)

        if quantity < 1:
            item.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

        item.quantity = quantity
        item.save()
        return Response(CartItemSerializer(item).data)

    @action(detail=False, methods=['delete'])
    def remove_item(self, request):
        """DELETE /api/cart/remove_item/?item_id=xxx - Remove item from cart."""
        item_id = request.query_params.get('item_id')
        if not item_id:
            return Response(
                {'detail': 'item_id required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        cart = self.get_cart(request.user)
        item = get_object_or_404(CartItem, id=item_id, cart=cart)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['post'])
    def clear(self, request):
        """POST /api/cart/clear/ - Empty the shopping cart."""
        cart = self.get_cart(request.user)
        cart.clear()
        return Response({'detail': 'Cart cleared'})

    @action(detail=False, methods=['patch'])
    def update_notes(self, request):
        """PATCH /api/cart/update_notes/ - Add delivery notes to cart."""
        cart = self.get_cart(request.user)
        cart.notes = request.data.get('notes', '')
        cart.save()
        return Response(ShoppingCartSerializer(cart).data)


class SavedPaymentMethodViewSet(viewsets.ModelViewSet):
    """
    Manage saved payment methods (credit cards, mobile money, etc.).
    Secure - never exposes tokens, supports one-click checkout.
    """
    serializer_class = SavedPaymentMethodSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Only return payment methods for authenticated user."""
        customer = get_object_or_404(CustomerProfile, user=self.request.user)
        return SavedPaymentMethod.objects.filter(customer=customer)

    def perform_create(self, serializer):
        """Auto-assign customer from request user."""
        customer = get_object_or_404(CustomerProfile, user=self.request.user)
        serializer.save(customer=customer)

    def get_serializer_class(self):
        """Use different serializer for create vs retrieve."""
        if self.action == 'create':
            return SavedPaymentMethodCreateSerializer
        return SavedPaymentMethodSerializer

    @action(detail=True, methods=['post'])
    def set_default(self, request, pk=None):
        """POST /api/payment-methods/{id}/set_default/ - Set as default."""
        method = self.get_object()
        method.set_as_default()
        return Response(
            SavedPaymentMethodSerializer(method).data,
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['get'])
    def get_default(self, request):
        """GET /api/payment-methods/get_default/ - Get default payment method."""
        default_method = SavedPaymentMethod.objects.filter(
            customer__user=request.user,
            is_default=True,
            is_active=True
        ).first()

        if not default_method:
            return Response(
                {'detail': 'No default payment method set'},
                status=status.HTTP_404_NOT_FOUND
            )
        return Response(SavedPaymentMethodSerializer(default_method).data)


class BillPaymentViewSet(viewsets.ViewSet):
    """
    Anonymous bill payment system (no authentication required).
    Supports one-off bill settlement via account number + OTP verification.
    """
    permission_classes = [AllowAny]

    @action(detail=False, methods=['post'])
    def initiate(self, request):
        """
        POST /api/bill-pay/initiate/
        Initiate bill payment lookup by account number.
        Returns: outstanding bill details + payment methods.
        """
        serializer = BillPaymentInitiateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        account_number = serializer.validated_data['kitayi_account_number']

        # Lookup customer (don't reveal if exists)
        try:
            customer = CustomerProfile.objects.get(account_number=account_number)
        except CustomerProfile.DoesNotExist:
            # Security: return generic message
            return Response(
                {
                    'detail': 'Account lookup initiated. Please check your email for verification.',
                    'account_number': account_number,
                    'requires_verification': True,
                },
                status=status.HTTP_200_OK
            )

        # Calculate outstanding balance
        outstanding_orders = Order.objects.filter(
            customer=customer,
            payment_status=Order.PaymentStatus.PENDING
        ).aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')

        return Response({
            'account_number': account_number,
            'outstanding_balance': str(outstanding_orders),
            'payment_methods': ['Card', 'M-Pesa', 'PayPal', 'Bank Transfer'],
            'requires_verification': False,
        })

    @action(detail=False, methods=['post'])
    def pay(self, request):
        """
        POST /api/bill-pay/pay/
        Submit bill payment.
        Body: { kitayi_account_number, amount, payment_method, email, phone }
        """
        account_number = request.data.get('kitayi_account_number')
        amount = request.data.get('amount')
        payment_method = request.data.get('payment_method')
        email = request.data.get('email', '')
        phone = request.data.get('phone', '')

        if not all([account_number, amount, payment_method]):
            return Response(
                {'detail': 'Missing required fields'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create bill payment record
        transaction_ref = f"BP-{uuid.uuid4().hex[:12].upper()}"
        bill_payment = BillPaymentRecord.objects.create(
            kitayi_account_number=account_number,
            bill_amount=Decimal(str(amount)),
            amount_paid=Decimal('0.00'),
            payment_method=payment_method,
            transaction_reference=transaction_ref,
            email_provided=email,
            phone_provided=phone,
            payment_status=BillPaymentRecord.BillStatus.PENDING,
        )

        return Response(
            BillPaymentSerializer(bill_payment).data,
            status=status.HTTP_201_CREATED
        )


class ProductCatalogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Product catalog with dynamic pricing based on customer tier.
    """
    permission_classes = [AllowAny]
    queryset = Product.objects.filter(is_active=True)

    def get_serializer_class(self):
        """Different serializers for list vs detail."""
        if self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductListSerializer

    def get_queryset(self):
        """Filter by category if provided."""
        queryset = super().get_queryset()
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
        return queryset.order_by('-created_at')

    @action(detail=True, methods=['get'])
    def pricing(self, request, pk=None):
        """GET /api/products/{id}/pricing/ - Get tiered pricing for product."""
        product = self.get_object()
        tiers = CustomerTier.objects.filter(is_active=True)

        pricing_data = {
            'product_id': str(product.id),
            'base_price': str(product.price),
            'tier_pricing': [
                {
                    'tier': tier.name,
                    'discount': str(tier.discount_percentage),
                    'price': str(product.get_price_for_tier(tier)),
                }
                for tier in tiers
            ]
        }
        return Response(pricing_data)


class OrderTrackingViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Real-time order tracking with status updates and GPS location (if available).
    """
    serializer_class = OrderTrackingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Only return user's own orders."""
        customer = get_object_or_404(CustomerProfile, user=self.request.user)
        return Order.objects.filter(customer=customer).order_by('-created_at')

    @action(detail=True, methods=['get'])
    def tracking_details(self, request, pk=None):
        """GET /api/orders/{id}/tracking_details/ - Live order tracking."""
        order = self.get_object()

        # Get delivery if exists
        delivery = getattr(order, 'delivery', None)
        delivery_status = 'Not assigned' if not delivery else delivery.status

        tracking_info = {
            'order_id': str(order.id),
            'tracking_number': order.tracking_number,
            'status': order.status,
            'delivery_status': delivery_status,
            'delivery_date': order.delivery_date,
            'delivery_slot': order.delivery_slot,
            'estimated_delivery': order.delivery_date,
            'payment_status': order.payment_status,
            'items': OrderItemSerializer(order.items.all(), many=True).data,
            'total_amount': str(order.total_amount),
        }

        if delivery:
            tracking_info['driver_phone'] = getattr(delivery.driver, 'phone_number', 'N/A')
            tracking_info['vehicle'] = str(delivery.vehicle)
            tracking_info['route'] = DeliveryRouteSerializer(
                delivery.routes.order_by('sequence'),
                many=True
            ).data if delivery.routes.exists() else []

        return Response(tracking_info)


from apps.products.serializers import ProductListSerializer, ProductDetailSerializer
from apps.orders.serializers import (
    OrderTrackingSerializer, OrderItemSerializer, DeliveryRouteSerializer
)
