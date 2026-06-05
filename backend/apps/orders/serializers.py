from decimal import Decimal
from django.utils import timezone
from rest_framework import serializers
from apps.customers.models import CustomerProfile
from apps.products.models import Product
from apps.orders.models import Order, OrderItem, Coupon


class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = ['id', 'code', 'discount_type', 'value', 'max_uses', 'uses', 'active', 'expiry_date']
        read_only_fields = ['id', 'uses']


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')
    product_sku = serializers.ReadOnlyField(source='product.sku')

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'product_sku', 'quantity', 'unit_price', 'total_price']
        read_only_fields = ['id', 'unit_price', 'total_price']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    coupon_code = serializers.CharField(write_only=True, required=False, allow_blank=True)
    customer_email = serializers.ReadOnlyField(source='customer.user.email')

    class Meta:
        model = Order
        fields = [
            'id', 'customer', 'customer_email', 'status', 'total_amount', 'tax_amount',
            'discount_amount', 'delivery_address', 'delivery_date', 'delivery_slot',
            'payment_status', 'coupon', 'coupon_code', 'tracking_number', 'items',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'customer', 'status', 'total_amount', 'tax_amount',
            'discount_amount', 'payment_status', 'coupon', 'tracking_number',
            'created_at', 'updated_at'
        ]

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("An order must contain at least one item.")
        return value

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        coupon_code = validated_data.pop('coupon_code', None)
        
        # Resolve customer profile from request user
        request = self.context.get('request')
        user = request.user
        try:
            customer = CustomerProfile.objects.get(user=user)
        except CustomerProfile.DoesNotExist:
            raise serializers.ValidationError("User does not have a customer profile associated.")
        
        validated_data['customer'] = customer

        # 1. Validate and apply Coupon if provided
        coupon = None
        discount = Decimal('0.00')
        if coupon_code:
            try:
                coupon = Coupon.objects.get(code__iexact=coupon_code, active=True, expiry_date__gt=timezone.now())
                if coupon.uses >= coupon.max_uses:
                    raise serializers.ValidationError({"coupon_code": "Coupon usage limit reached."})
            except Coupon.DoesNotExist:
                raise serializers.ValidationError({"coupon_code": "Invalid or expired coupon code."})

        # 2. Verify stock availability and compute prices
        subtotal = Decimal('0.00')
        order_items_to_create = []

        for item_data in items_data:
            product = item_data['product']
            qty = item_data['quantity']
            
            if qty <= 0:
                raise serializers.ValidationError(f"Quantity for {product.name} must be positive.")
            if product.stock_qty < qty:
                raise serializers.ValidationError(f"Insufficient stock for {product.name}. Available: {product.stock_qty}.")
            
            # Subtotal calculation
            unit_price = product.price
            total_price = unit_price * qty
            subtotal += total_price

            order_items_to_create.append((product, qty, unit_price, total_price))

        # Apply discount
        if coupon:
            if coupon.discount_type == Coupon.DiscountType.PERCENTAGE:
                discount = (subtotal * coupon.value) / Decimal('100.00')
            else:
                discount = coupon.value
            
            # Make sure discount doesn't exceed subtotal
            discount = min(discount, subtotal)
            coupon.uses += 1
            coupon.save(update_fields=['uses'])
            validated_data['coupon'] = coupon

        # Calculate VAT (16% in Kenya)
        taxable_amount = subtotal - discount
        tax_amount = taxable_amount * Decimal('0.16')
        total_amount = taxable_amount + tax_amount

        # Save order
        validated_data['total_amount'] = total_amount
        validated_data['tax_amount'] = tax_amount
        validated_data['discount_amount'] = discount
        order = Order.objects.create(**validated_data)

        # Create items and deduct stock
        for product, qty, unit_price, total_price in order_items_to_create:
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=qty,
                unit_price=unit_price,
                total_price=total_price
            )
            # Deduct stock
            product.stock_qty -= qty
            product.save(update_fields=['stock_qty', 'updated_at'])

        return order
