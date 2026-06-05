from django.db import models
from apps.common.models import TimeStampedModel
from apps.customers.models import CustomerProfile
from apps.orders.models import Order
from apps.subscriptions.models import Subscription


class Payment(TimeStampedModel):
    """Logs transaction histories for Stripe, M-Pesa, or PayPal."""

    class Provider(models.TextChoices):
        MPESA = 'M-Pesa', 'M-Pesa'
        STRIPE = 'Stripe', 'Stripe'
        PAYPAL = 'PayPal', 'PayPal'

    class Status(models.TextChoices):
        PENDING = 'Pending', 'Pending'
        SUCCESSFUL = 'Successful', 'Successful'
        FAILED = 'Failed', 'Failed'
        REFUNDED = 'Refunded', 'Refunded'

    customer = models.ForeignKey(
        CustomerProfile,
        on_delete=models.CASCADE,
        related_name='payments',
    )
    order = models.ForeignKey(
        Order,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='payments',
    )
    subscription = models.ForeignKey(
        Subscription,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='payments',
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    provider = models.CharField(
        max_length=20,
        choices=Provider.choices,
    )
    transaction_reference = models.CharField(max_length=255, unique=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    payment_date = models.DateTimeField(auto_now_add=True)
    response_payload = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ('-payment_date',)
        verbose_name = 'payment'
        verbose_name_plural = 'payments'

    def __str__(self):
        return f"{self.provider} {self.status} - {self.amount} ({self.transaction_reference})"
