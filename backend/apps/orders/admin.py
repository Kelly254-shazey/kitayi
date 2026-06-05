from django.contrib import admin
from apps.orders.models import Coupon, Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('unit_price', 'total_price')


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('tracking_number', 'customer', 'status', 'payment_status', 'total_amount', 'delivery_date')
    list_filter = ('status', 'payment_status', 'delivery_slot')
    search_fields = ('tracking_number', 'customer__user__email')
    readonly_fields = ('tracking_number', 'created_at', 'updated_at')
    inlines = [OrderItemInline]


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ('code', 'discount_type', 'value', 'uses', 'max_uses', 'active', 'expiry_date')
    list_filter = ('discount_type', 'active')
    search_fields = ('code',)
