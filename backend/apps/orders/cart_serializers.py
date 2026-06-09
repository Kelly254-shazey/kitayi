"""
Enhanced Serializers for Shopping Cart, Payment Methods, and Bill Payments.
Supports complete e-commerce workflow with one-click checkout.
"""

from rest_framework import serializers
from apps.orders.models import (
    ShoppingCart, CartItem, SavedPaymentMethod, BillPaymentRecord
)
from apps.products.models import Product, CustomerTier
from decimal import Decimal


class CartItemSerializer(serializers.ModelSerializer):
    """Serializer for individual shopping cart items."""
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    product_category = serializers.CharField(source='product.category', read_only=True)
    product_image = serializers.URLField(source='product.image_url', read_only=True)
    unit_price = serializers.SerializerMethodField()
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = (
            'id',
            'product',
            'product_name',
            'product_sku',
            'product_category',
            'product_image',
            'quantity',
            'unit_price',
            'total_price',
            'added_at',
            'updated_at',
        )
        read_only_fields = ('id', 'added_at', 'updated_at')

    def get_unit_price(self, obj):
        return str(obj.unit_price)

    def get_total_price(self, obj):
        return str(obj.total_price)


class ShoppingCartSerializer(serializers.ModelSerializer):
    """
    Complete shopping cart with items, subtotal, and priced checkout.
    Supports cart persistence, notes, and one-click ordering.
    """
    items = CartItemSerializer(many=True, read_only=True)
    total_items = serializers.IntegerField(read_only=True)
    subtotal = serializers.SerializerMethodField()
    estimated_tax = serializers.SerializerMethodField()
    estimated_total = serializers.SerializerMethodField()

    class Meta:
        model = ShoppingCart
        fields = (
            'id',
            'is_active',
            'items',
            'total_items',
            'subtotal',
            'estimated_tax',
            'estimated_total',
            'notes',
            'last_accessed',
            'created_at',
        )
        read_only_fields = ('id', 'last_accessed', 'created_at')

    def get_subtotal(self, obj):
        return str(obj.subtotal)

    def get_estimated_tax(self, obj):
        """Calculate estimated tax (assumes 16% VAT in Kenya, configurable)."""
        tax_rate = Decimal('0.16')
        return str(obj.subtotal * tax_rate)

    def get_estimated_total(self, obj):
        """Subtotal + estimated tax."""
        tax_rate = Decimal('0.16')
        tax = obj.subtotal * tax_rate
        return str(obj.subtotal + tax)


class CartAddItemSerializer(serializers.Serializer):
    """Serializer for adding items to cart (request data)."""
    product_id = serializers.CharField()
    quantity = serializers.IntegerField(min_value=1, default=1)

    def validate_product_id(self, value):
        """Ensure product exists and is available."""
        try:
            product = Product.objects.get(id=value, is_active=True)
        except Product.DoesNotExist:
            raise serializers.ValidationError("Product not found or inactive.")
        return value


class SavedPaymentMethodSerializer(serializers.ModelSerializer):
    """
    Serializer for saved payment methods.
    NEVER exposes token to frontend; only safe display fields.
    """
    provider_display = serializers.CharField(
        source='get_provider_display',
        read_only=True
    )
    payment_type_display = serializers.CharField(
        source='get_payment_type_display',
        read_only=True
    )

    class Meta:
        model = SavedPaymentMethod
        fields = (
            'id',
            'payment_type',
            'payment_type_display',
            'provider',
            'provider_display',
            'display_name',
            'last_four',
            'expiry_month',
            'expiry_year',
            'is_default',
            'is_active',
            'last_used',
            'created_at',
        )
        read_only_fields = (
            'id',
            'token',
            'last_used',
            'created_at',
        )

    def to_representation(self, instance):
        """Mask sensitive data in response."""
        data = super().to_representation(instance)
        # Never expose the actual token
        if 'token' in data:
            del data['token']
        return data


class SavedPaymentMethodCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new saved payment method."""
    class Meta:
        model = SavedPaymentMethod
        fields = (
            'payment_type',
            'provider',
            'token',
            'display_name',
            'last_four',
            'expiry_month',
            'expiry_year',
            'is_default',
        )

    def validate_token(self, value):
        """Ensure token format is valid."""
        if not value or len(value) < 10:
            raise serializers.ValidationError(
                "Invalid payment token format."
            )
        return value


class BillPaymentSerializer(serializers.ModelSerializer):
    """Serializer for bill payment records (anonymous user)."""
    balance_remaining = serializers.SerializerMethodField()
    is_fully_paid = serializers.BooleanField(read_only=True)

    class Meta:
        model = BillPaymentRecord
        fields = (
            'id',
            'kitayi_account_number',
            'bill_amount',
            'amount_paid',
            'balance_remaining',
            'payment_status',
            'payment_method',
            'transaction_reference',
            'email_provided',
            'phone_provided',
            'otp_verified',
            'is_fully_paid',
            'created_at',
        )
        read_only_fields = (
            'id',
            'transaction_reference',
            'created_at',
        )

    def get_balance_remaining(self, obj):
        return str(obj.remaining_balance)


class BillPaymentInitiateSerializer(serializers.Serializer):
    """
    Request serializer for initiating anonymous bill payment.
    Validates account and returns outstanding bill details.
    """
    kitayi_account_number = serializers.CharField(max_length=20)
    email = serializers.EmailField(required=False)
    phone = serializers.CharField(max_length=20, required=False)

    def validate_kitayi_account_number(self, value):
        """Verify account format and existence."""
        from apps.customers.models import CustomerProfile
        if not value.startswith('KS-'):
            raise serializers.ValidationError(
                "Invalid Kitayi account number format. Expected: KS-XXXX-XXXX"
            )
        # Note: Don't reveal if account exists or not for security
        return value


class CustomerTierSerializer(serializers.ModelSerializer):
    """Serializer for customer tiers with discount info."""
    class Meta:
        model = CustomerTier
        fields = (
            'id',
            'name',
            'discount_percentage',
            'min_monthly_spend',
            'benefits',
        )
        read_only_fields = ('id',)
