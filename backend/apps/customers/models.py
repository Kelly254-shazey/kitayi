import random
from decimal import Decimal

from django.apps import apps
from django.core.exceptions import ValidationError
from django.db import models

from apps.common.models import TimeStampedModel


def generate_account_number():
    """Generate unique Kitayi account number: KS-XXXX-XXXX."""
    CustomerProfile = apps.get_model('customers', 'CustomerProfile')

    for _ in range(50):
        part1 = ''.join(random.choices('0123456789', k=4))
        part2 = ''.join(random.choices('0123456789', k=4))
        candidate = f'KS-{part1}-{part2}'
        if not CustomerProfile.objects.filter(account_number=candidate).exists():
            return candidate
    raise RuntimeError('Unable to generate unique account number.')


class CustomerProfile(TimeStampedModel):
    """Extended customer profile linked one-to-one with User."""

    class VerificationStatus(models.TextChoices):
        PENDING = 'Pending', 'Pending'
        VERIFIED = 'Verified', 'Verified'
        REJECTED = 'Rejected', 'Rejected'

    user = models.OneToOneField(
        'users.User',
        on_delete=models.CASCADE,
        related_name='customerprofile',
    )
    account_number = models.CharField(max_length=20, unique=True, editable=False)
    business_registration_id = models.CharField(max_length=100, blank=True, null=True)
    business_name = models.CharField(max_length=255, blank=True, null=True)
    identification_document_url = models.URLField(blank=True, null=True)
    default_delivery_address = models.ForeignKey(
        'customers.Address',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='+',
    )
    account_balance = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
    )
    credit_limit = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
    )
    verification_status = models.CharField(
        max_length=20,
        choices=VerificationStatus.choices,
        default=VerificationStatus.PENDING,
    )
    verified_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ('-created_at',)
        verbose_name = 'customer profile'
        verbose_name_plural = 'customer profiles'

    def __str__(self):
        return f'{self.user.email} ({self.account_number})'

    def save(self, *args, **kwargs):
        if not self.account_number:
            self.account_number = generate_account_number()
        super().save(*args, **kwargs)

    @property
    def user_type(self):
        return self.user.user_type


class Address(TimeStampedModel):
    """Customer delivery and billing addresses."""

    class AddressType(models.TextChoices):
        HOME = 'Home', 'Home'
        OFFICE = 'Office', 'Office'
        WAREHOUSE = 'Warehouse', 'Warehouse'

    KENYA_LAT_MIN = Decimal('-4.70')
    KENYA_LAT_MAX = Decimal('5.10')
    KENYA_LON_MIN = Decimal('33.90')
    KENYA_LON_MAX = Decimal('41.95')

    customer = models.ForeignKey(
        CustomerProfile,
        on_delete=models.CASCADE,
        related_name='addresses',
    )
    address_type = models.CharField(max_length=20, choices=AddressType.choices)
    street_address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100, default='Kenya')
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    is_default = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ('-is_default', '-created_at')
        constraints = [
            models.UniqueConstraint(
                fields=['customer'],
                condition=models.Q(is_default=True),
                name='unique_default_address_per_customer',
            ),
        ]

    def __str__(self):
        owner = self.customer.user.full_name or self.customer.user.email
        return f"{owner}'s {self.address_type} - {self.city}"

    def clean(self):
        super().clean()
        if self.latitude is not None and self.longitude is not None:
            lat, lon = self.latitude, self.longitude
            if not (self.KENYA_LAT_MIN <= lat <= self.KENYA_LAT_MAX):
                raise ValidationError({'latitude': 'Latitude must be within Kenya.'})
            if not (self.KENYA_LON_MIN <= lon <= self.KENYA_LON_MAX):
                raise ValidationError({'longitude': 'Longitude must be within Kenya.'})

    def save(self, *args, **kwargs):
        if self.is_default:
            Address.objects.filter(customer=self.customer, is_default=True).exclude(
                pk=self.pk
            ).update(is_default=False)
        self.full_clean()
        super().save(*args, **kwargs)
