from rest_framework import serializers
from apps.payments.models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    customer_email = serializers.ReadOnlyField(source='customer.user.email')
    order_tracking = serializers.ReadOnlyField(source='order.tracking_number')

    class Meta:
        model = Payment
        fields = [
            'id', 'customer', 'customer_email', 'order', 'order_tracking',
            'subscription', 'amount', 'provider', 'transaction_reference',
            'status', 'payment_date', 'response_payload'
        ]
        read_only_fields = ['id', 'payment_date', 'response_payload']
