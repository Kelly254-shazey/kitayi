from rest_framework import serializers

from apps.customers.models import Address, CustomerProfile
from apps.users.serializers import AddressSerializer


class CustomerProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerProfile
        fields = (
            'business_registration_id',
            'business_name',
            'identification_document_url',
        )


class CustomerProfileDetailSerializer(serializers.ModelSerializer):
    default_delivery_address = AddressSerializer(read_only=True)
    user_type = serializers.CharField(source='user.user_type', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    full_name = serializers.CharField(source='user.full_name', read_only=True)

    class Meta:
        model = CustomerProfile
        fields = (
            'id',
            'account_number',
            'email',
            'full_name',
            'business_registration_id',
            'business_name',
            'identification_document_url',
            'default_delivery_address',
            'account_balance',
            'credit_limit',
            'verification_status',
            'verified_at',
            'user_type',
            'created_at',
            'updated_at',
        )
        read_only_fields = (
            'id',
            'account_number',
            'account_balance',
            'verified_at',
            'created_at',
            'updated_at',
        )
