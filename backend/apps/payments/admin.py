from django.contrib import admin
from apps.payments.models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('transaction_reference', 'customer', 'provider', 'amount', 'status', 'payment_date')
    list_filter = ('provider', 'status')
    search_fields = ('transaction_reference', 'customer__user__email')
    readonly_fields = ('payment_date', 'response_payload', 'created_at', 'updated_at')
