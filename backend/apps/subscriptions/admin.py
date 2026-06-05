from django.contrib import admin
from apps.subscriptions.models import Subscription


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ('customer', 'product', 'quantity', 'frequency', 'status', 'next_delivery_date', 'billing_cycle')
    list_filter = ('status', 'frequency', 'billing_cycle')
    search_fields = ('customer__user__email', 'product__name')
    readonly_fields = ('created_at', 'updated_at')
