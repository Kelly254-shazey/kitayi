from django.db import models
from django.conf import settings
from apps.common.models import TimeStampedModel


class Product(TimeStampedModel):
    """Holds catalog items like bottles, dispenser refills, and tanker deliveries."""

    class Category(models.TextChoices):
        BOTTLED = 'Bottled', 'Bottled'
        DISPENSER = 'Dispenser', 'Dispenser'
        TANKER = 'Tanker', 'Tanker'

    name = models.CharField(max_length=255)
    sku = models.CharField(max_length=100, unique=True)
    category = models.CharField(
        max_length=20,
        choices=Category.choices,
        default=Category.BOTTLED,
    )
    volume_liters = models.DecimalField(max_digits=10, decimal_places=2)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    stock_qty = models.IntegerField(default=0)
    safety_level = models.IntegerField(default=10)
    reorder_threshold = models.IntegerField(default=20)
    is_active = models.BooleanField(default=True)
    image_url = models.URLField(blank=True, null=True)

    class Meta:
        ordering = ('name',)
        verbose_name = 'product'
        verbose_name_plural = 'products'

    def __str__(self):
        return f"{self.name} ({self.sku})"


class InventoryTransaction(models.Model):
    """Audit log for warehouse/stock adjustments."""

    class TransactionType(models.TextChoices):
        REFILL = 'Refill', 'Refill'
        DISPATCH = 'Dispatch', 'Dispatch'
        ADJUSTMENT = 'Adjustment', 'Adjustment'
        RETURN = 'Return', 'Return'

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='transactions',
    )
    transaction_type = models.CharField(
        max_length=20,
        choices=TransactionType.choices,
    )
    quantity = models.IntegerField()
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('-created_at',)
        verbose_name = 'inventory transaction'
        verbose_name_plural = 'inventory transactions'

    def __str__(self):
        return f"{self.transaction_type} of {self.quantity} for {self.product.name}"
