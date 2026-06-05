from rest_framework import serializers
from apps.deliveries.models import FleetVehicle, Delivery, DeliveryRoute


class FleetVehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = FleetVehicle
        fields = [
            'id', 'plate_number', 'model', 'capacity_liters',
            'status', 'maintenance_due_date', 'fuel_usage',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class DeliveryRouteSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryRoute
        fields = ['id', 'delivery', 'sequence', 'latitude', 'longitude', 'timestamp']
        read_only_fields = ['id', 'timestamp']


class DeliverySerializer(serializers.ModelSerializer):
    order_tracking = serializers.ReadOnlyField(source='order.tracking_number')
    driver_name = serializers.ReadOnlyField(source='driver.full_name')
    vehicle_plate = serializers.ReadOnlyField(source='vehicle.plate_number')
    routes = DeliveryRouteSerializer(many=True, read_only=True)

    class Meta:
        model = Delivery
        fields = [
            'id', 'order', 'order_tracking', 'driver', 'driver_name',
            'vehicle', 'vehicle_plate', 'status', 'dispatched_at',
            'delivered_at', 'delivery_notes', 'verification_code',
            'signature_url', 'routes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'dispatched_at', 'delivered_at', 'created_at', 'updated_at']

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        # Security: only the driver or staff should see the OTP verification code
        request = self.context.get('request')
        if request and request.user:
            is_driver = instance.driver == request.user
            is_staff = request.user.is_staff
            if not (is_driver or is_staff):
                ret.pop('verification_code', None)
        else:
            ret.pop('verification_code', None)
        return ret
