import random
from django.db import models
from apps.common.models import TimeStampedModel
from apps.customers.models import CustomerProfile, Address
from apps.products.models import Product


def generate_tracking_number():
    """Generate unique order tracking number: KY-YYYYMMDD-XXXX."""
    import datetime
    date_str = datetime.date.today().strftime('%Y%m%d')
    part2 = ''.join(random.choices('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', k=4))
    return f"KY-{date_str}-{part2}"


class Coupon(TimeStampedModel):
    """SaaS promotional coupons with flat/percentage options."""

    class DiscountType(models.TextChoices):
        PERCENTAGE = 'Percentage', 'Percentage'
        FIXED = 'Fixed', 'Fixed'

    code = models.CharField(max_length=50, unique=True)
    discount_type = models.CharField(
        max_length=20,
        choices=DiscountType.choices,
        default=DiscountType.PERCENTAGE,
    )
    value = models.DecimalField(max_digits=12, decimal_places=2)
    max_uses = models.IntegerField(default=100)
    uses = models.IntegerField(default=0)
    active = models.BooleanField(default=True)
    expiry_date = models.DateTimeField()

    class Meta:
        ordering = ('-created_at',)
        verbose_name = 'coupon'
        verbose_name_plural = 'coupons'

    def __str__(self):
        return f"{self.code} ({self.discount_type}: {self.value})"


class Order(TimeStampedModel):
    """Tracks purchase transactions and delivery schedules."""

    class OrderStatus(models.TextChoices):
        PENDING = 'Pending', 'Pending'
        ASSIGNED = 'Assigned', 'Assigned'
        DISPATCHED = 'Dispatched', 'Dispatched'
        IN_TRANSIT = 'In Transit', 'In Transit'
        DELIVERED = 'Delivered', 'Delivered'
        CANCELLED = 'Cancelled', 'Cancelled'
        FAILED = 'Failed', 'Failed'

    class DeliverySlot(models.TextChoices):
        MORNING = 'Morning', 'Morning'
        AFTERNOON = 'Afternoon', 'Afternoon'
        EVENING = 'Evening', 'Evening'

    class PaymentStatus(models.TextChoices):
        PENDING = 'Pending', 'Pending'
        PAID = 'Paid', 'Paid'
        REFUNDED = 'Refunded', 'Refunded'

    customer = models.ForeignKey(
        CustomerProfile,
        on_delete=models.CASCADE,
        related_name='orders',
    )
    status = models.CharField(
        max_length=20,
        choices=OrderStatus.choices,
        default=OrderStatus.PENDING,
    )
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    delivery_address = models.ForeignKey(
        Address,
        on_delete=models.SET_NULL,
        null=True,
        related_name='orders',
    )
    delivery_date = models.DateField()
    delivery_slot = models.CharField(
        max_length=20,
        choices=DeliverySlot.choices,
        default=DeliverySlot.MORNING,
    )
    payment_status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING,
    )
    coupon = models.ForeignKey(
        Coupon,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='orders',
    )
    tracking_number = models.CharField(max_length=50, unique=True, editable=False)

    class Meta:
        ordering = ('-created_at',)
        verbose_name = 'order'
        verbose_name_plural = 'orders'

    def __str__(self):
        return f"Order {self.tracking_number} - {self.customer.user.email}"

    def save(self, *args, **kwargs):
        if not self.tracking_number:
            for _ in range(50):
                candidate = generate_tracking_number()
                if not Order.objects.filter(tracking_number=candidate).exists():
                    self.tracking_number = candidate
                    break
        super().save(*args, **kwargs)


class OrderItem(models.Model):
    """Specific line-items under a purchase order."""

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items',
    )
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.IntegerField()
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    total_price = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        verbose_name = 'order item'
        verbose_name_plural = 'order items'

    def __str__(self):
        return f"{self.quantity} x {self.product.name} (Order {self.order.tracking_number})"
