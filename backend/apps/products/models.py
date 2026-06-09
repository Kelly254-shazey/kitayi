from django.db import models
from django.conf import settings
from decimal import Decimal
from apps.common.models import TimeStampedModel


class CustomerTier(TimeStampedModel):
    """
    Customer loyalty tiers with volume discounts.
    Enables volume-based & loyalty-based dynamic pricing.
    """
    class TierName(models.TextChoices):
        STANDARD = 'Standard', 'Standard'
        SILVER = 'Silver', 'Silver (5-10% discount)'
        GOLD = 'Gold', 'Gold (10-15% discount)'
        PLATINUM = 'Platinum', 'Platinum (15-20% discount)'
        ENTERPRISE = 'Enterprise', 'Enterprise (20%+ discount)'

    name = models.CharField(
        max_length=50,
        choices=TierName.choices,
        unique=True,
    )
    discount_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Percentage discount (0-100)"
    )
    min_monthly_spend = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Minimum monthly spend required for this tier"
    )
    benefits = models.TextField(
        blank=True,
        help_text="JSON or plain text describing tier benefits"
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'customer tier'
        verbose_name_plural = 'customer tiers'
        ordering = ('min_monthly_spend',)

    def __str__(self):
        return f"{self.name} ({self.discount_percentage}% off)"


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
    
    # Product metadata for discovery
    description = models.TextField(blank=True)
    min_order_quantity = models.IntegerField(default=1)
    max_order_quantity = models.IntegerField(null=True, blank=True)

    class Meta:
        ordering = ('name',)
        verbose_name = 'product'
        verbose_name_plural = 'products'

    def __str__(self):
        return f"{self.name} ({self.sku})"
    
    def get_price_for_tier(self, tier: 'CustomerTier') -> Decimal:
        """Calculate price with tier discount applied."""
        if not tier or tier.discount_percentage <= 0:
            return self.price
        discount = self.price * (tier.discount_percentage / Decimal('100'))
        return max(self.price - discount, Decimal('0.01'))
    
    def get_price_for_customer(self, customer) -> Decimal:
        """Get price for specific customer (resolves tier automatically)."""
        from apps.customers.models import CustomerProfile
        try:
            profile = customer.customerprofile if hasattr(customer, 'customerprofile') else customer
            tier = self._get_customer_tier(profile)
            return self.get_price_for_tier(tier)
        except:
            return self.price
    
    @staticmethod
    def _get_customer_tier(customer_profile: 'CustomerProfile') -> 'CustomerTier':
        """Determine customer's effective tier based on spending."""
        from apps.subscriptions.models import Subscription
        from django.db.models import Sum
        from datetime import datetime, timedelta
        
        # Calculate 30-day spend
        thirty_days_ago = datetime.now() - timedelta(days=30)
        monthly_spend = customer_profile.orders.filter(
            created_at__gte=thirty_days_ago
        ).aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')
        
        # Find highest applicable tier
        tiers = CustomerTier.objects.filter(
            is_active=True,
            min_monthly_spend__lte=monthly_spend
        ).order_by('-min_monthly_spend')
        
        return tiers.first() or CustomerTier.objects.filter(
            name=CustomerTier.TierName.STANDARD
        ).first()


class ProductVariant(TimeStampedModel):
    """
    Product variants for different options (e.g., water bottle sizes, colors).
    Supports volume-based bundle pricing.
    """
    class PricingType(models.TextChoices):
        FIXED = 'Fixed', 'Fixed Price'
        VOLUME = 'Volume', 'Volume-Based Pricing'

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='variants',
    )
    name = models.CharField(max_length=255, help_text="e.g., '20L Bulk', '500mL Case'")
    sku_suffix = models.CharField(max_length=50)
    pricing_type = models.CharField(
        max_length=20,
        choices=PricingType.choices,
        default=PricingType.FIXED,
    )
    base_price = models.DecimalField(max_digits=12, decimal_places=2)
    volume_threshold = models.IntegerField(
        null=True,
        blank=True,
        help_text="Units required for discount tier"
    )
    stock_qty = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('product', 'sku_suffix')
        verbose_name = 'product variant'
        verbose_name_plural = 'product variants'

    def __str__(self):
        return f"{self.product.name} - {self.name}"


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
