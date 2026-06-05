from django.db import models
from apps.common.models import TimeStampedModel
from apps.customers.models import CustomerProfile
from apps.products.models import Product


class Subscription(TimeStampedModel):
    """Recurring water deliveries scheduled for residential or corporate clients."""

    class Frequency(models.TextChoices):
        WEEKLY = 'Weekly', 'Weekly'
        BI_WEEKLY = 'Bi-Weekly', 'Bi-Weekly'
        MONTHLY = 'Monthly', 'Monthly'
        CUSTOM = 'Custom', 'Custom'

    class Status(models.TextChoices):
        ACTIVE = 'Active', 'Active'
        PAUSED = 'Paused', 'Paused'
        CANCELLED = 'Cancelled', 'Cancelled'

    class BillingCycle(models.TextChoices):
        PREPAID = 'Prepaid', 'Prepaid'
        POSTPAID = 'Postpaid', 'Postpaid'

    customer = models.ForeignKey(
        CustomerProfile,
        on_delete=models.CASCADE,
        related_name='subscriptions',
    )
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.IntegerField(default=1)
    frequency = models.CharField(
        max_length=20,
        choices=Frequency.choices,
        default=Frequency.WEEKLY,
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE,
    )
    next_delivery_date = models.DateField()
    billing_cycle = models.CharField(
        max_length=20,
        choices=BillingCycle.choices,
        default=BillingCycle.PREPAID,
    )
    last_billed_date = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ('-created_at',)
        verbose_name = 'subscription'
        verbose_name_plural = 'subscriptions'

    def __str__(self):
        return f"{self.customer.user.email} - {self.product.name} ({self.frequency})"
