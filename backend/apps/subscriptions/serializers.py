from rest_framework import serializers
from apps.customers.models import CustomerProfile
from apps.subscriptions.models import Subscription
from apps.products.serializers import ProductSerializer


class SubscriptionSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')
    customer_email = serializers.ReadOnlyField(source='customer.user.email')

    class Meta:
        model = Subscription
        fields = [
            'id', 'customer', 'customer_email', 'product', 'product_name',
            'quantity', 'frequency', 'status', 'next_delivery_date',
            'billing_cycle', 'last_billed_date', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'customer', 'last_billed_date', 'created_at', 'updated_at']

    def create(self, validated_data):
        request = self.context.get('request')
        user = request.user
        try:
            customer = CustomerProfile.objects.get(user=user)
        except CustomerProfile.DoesNotExist:
            raise serializers.ValidationError("User does not have a customer profile associated.")
        
        validated_data['customer'] = customer
        return super().create(validated_data)
