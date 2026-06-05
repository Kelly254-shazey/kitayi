from django.contrib import admin
from apps.deliveries.models import Delivery, DeliveryRoute, FleetVehicle


@admin.register(FleetVehicle)
class FleetVehicleAdmin(admin.ModelAdmin):
    list_display = ('plate_number', 'model', 'capacity_liters', 'status', 'maintenance_due_date')
    list_filter = ('status',)
    search_fields = ('plate_number', 'model')
    readonly_fields = ('created_at', 'updated_at')


class DeliveryRouteInline(admin.TabularInline):
    model = DeliveryRoute
    extra = 0
    readonly_fields = ('timestamp',)


@admin.register(Delivery)
class DeliveryAdmin(admin.ModelAdmin):
    list_display = ('order', 'driver', 'vehicle', 'status', 'dispatched_at', 'delivered_at')
    list_filter = ('status',)
    search_fields = ('order__tracking_number', 'driver__email')
    readonly_fields = ('verification_code', 'dispatched_at', 'delivered_at', 'created_at', 'updated_at')
    inlines = [DeliveryRouteInline]
