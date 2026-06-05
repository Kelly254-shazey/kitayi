import random
from django.db import models
from django.conf import settings
from apps.common.models import TimeStampedModel
from apps.orders.models import Order


class FleetVehicle(TimeStampedModel):
    """Holds information about the water utility distribution vehicle fleet."""

    class Status(models.TextChoices):
        AVAILABLE = 'Available', 'Available'
        IN_USE = 'In Use', 'In Use'
        MAINTENANCE = 'Maintenance', 'Maintenance'

    plate_number = models.CharField(max_length=50, unique=True)
    model = models.CharField(max_length=100)
    capacity_liters = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.AVAILABLE,
    )
    maintenance_due_date = models.DateField()
    fuel_usage = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    class Meta:
        ordering = ('plate_number',)
        verbose_name = 'fleet vehicle'
        verbose_name_plural = 'fleet vehicles'

    def __str__(self):
        return f"{self.model} ({self.plate_number})"


class Delivery(TimeStampedModel):
    """Schedules dispatching, routing, and delivery verification of water orders."""

    class Status(models.TextChoices):
        PENDING = 'Pending', 'Pending'
        ASSIGNED = 'Assigned', 'Assigned'
        DISPATCHED = 'Dispatched', 'Dispatched'
        IN_TRANSIT = 'In Transit', 'In Transit'
        DELIVERED = 'Delivered', 'Delivered'
        CANCELLED = 'Cancelled', 'Cancelled'
        FAILED = 'Failed', 'Failed'

    order = models.OneToOneField(
        Order,
        on_delete=models.CASCADE,
        related_name='delivery',
    )
    driver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='driver_deliveries',
    )
    vehicle = models.ForeignKey(
        FleetVehicle,
        on_delete=models.PROTECT,
        related_name='deliveries',
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    dispatched_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    delivery_notes = models.TextField(blank=True)
    verification_code = models.CharField(max_length=6, editable=False)
    signature_url = models.URLField(blank=True, null=True)

    class Meta:
        ordering = ('-created_at',)
        verbose_name = 'delivery'
        verbose_name_plural = 'deliveries'

    def __str__(self):
        return f"Delivery for Order {self.order.tracking_number} - Status: {self.status}"

    def save(self, *args, **kwargs):
        if not self.verification_code:
            self.verification_code = str(random.randint(100000, 999999))
        super().save(*args, **kwargs)


class DeliveryRoute(models.Model):
    """Tracks path breadcrumbs coordinates for delivery route calculations."""

    delivery = models.ForeignKey(
        Delivery,
        on_delete=models.CASCADE,
        related_name='routes',
    )
    sequence = models.IntegerField()
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('delivery', 'sequence')
        verbose_name = 'delivery route'
        verbose_name_plural = 'delivery routes'

    def __str__(self):
        return f"Route for Delivery {self.delivery.id} - Point {self.sequence}"
