from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed

from apps.customers.models import Address, CustomerProfile
from apps.users.validators import validate_e164_phone, validate_password_complexity

User = get_user_model()


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = (
            'id',
            'address_type',
            'street_address',
            'city',
            'postal_code',
            'country',
            'latitude',
            'longitude',
            'is_default',
            'is_active',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def validate(self, attrs):
        lat = attrs.get('latitude', getattr(self.instance, 'latitude', None))
        lon = attrs.get('longitude', getattr(self.instance, 'longitude', None))
        if (lat is None) ^ (lon is None):
            raise serializers.ValidationError(
                'Both latitude and longitude must be provided together.'
            )
        return attrs

    def create(self, validated_data):
        validated_data['customer'] = self.context['request'].user.customerprofile
        return super().create(validated_data)


class CustomerProfileSerializer(serializers.ModelSerializer):
    default_delivery_address = AddressSerializer(read_only=True)
    user_type = serializers.CharField(source='user.user_type', read_only=True)

    class Meta:
        model = CustomerProfile
        fields = (
            'id',
            'account_number',
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


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=12)
    password_confirm = serializers.CharField(write_only=True, min_length=12)

    class Meta:
        model = User
        fields = (
            'email',
            'phone_number',
            'password',
            'password_confirm',
            'full_name',
            'user_type',
        )

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return value.lower()

    def validate_phone_number(self, value):
        formatted = validate_e164_phone(value)
        if User.objects.filter(phone_number=formatted).exists():
            raise serializers.ValidationError('A user with this phone number already exists.')
        return formatted

    def validate_password(self, value):
        validate_password_complexity(value)
        validate_password(value)
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password_confirm': 'Passwords do not match.'})
        attrs.pop('password_confirm')
        return attrs

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(password=password, **validated_data)
        return user


class UserDetailSerializer(serializers.ModelSerializer):
    customerprofile = CustomerProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = (
            'id',
            'email',
            'phone_number',
            'full_name',
            'user_type',
            'social_login_provider',
            'is_email_verified',
            'is_phone_verified',
            'is_active',
            'date_joined',
            'last_login',
            'created_at',
            'updated_at',
            'customerprofile',
        )
        read_only_fields = (
            'id',
            'is_email_verified',
            'is_phone_verified',
            'date_joined',
            'last_login',
            'created_at',
            'updated_at',
        )


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=False)
    phone_number = serializers.CharField(required=False)
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        phone_number = attrs.get('phone_number')
        password = attrs.get('password')

        if not email and not phone_number:
            raise serializers.ValidationError('Provide either email or phone_number.')
        if email and phone_number:
            raise serializers.ValidationError('Provide only email or phone_number, not both.')

        user = None
        if email:
            try:
                user = User.objects.get(email__iexact=email)
            except User.DoesNotExist:
                pass
        elif phone_number:
            formatted = validate_e164_phone(phone_number)
            try:
                user = User.objects.get(phone_number=formatted)
            except User.DoesNotExist:
                pass

        if user is None:
            raise AuthenticationFailed('Invalid credentials.')

        authenticated = authenticate(
            request=self.context.get('request'),
            email=user.email,
            password=password,
        )
        if authenticated is None:
            raise AuthenticationFailed('Invalid credentials.')

        attrs['user'] = authenticated
        return attrs


class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('No account found with this email.')
        return value.lower()


class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField()
    password = serializers.CharField(write_only=True, min_length=12)
    password_confirm = serializers.CharField(write_only=True, min_length=12)

    def validate_password(self, value):
        validate_password_complexity(value)
        validate_password(value)
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password_confirm': 'Passwords do not match.'})
        return attrs


class EmailVerificationSerializer(serializers.Serializer):
    token = serializers.CharField()
