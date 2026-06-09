"""
Shopping Cart & Payment Method Models - Complete E-Commerce Support
Provides persistent cart storage and secure payment method management.
"""

from django.db import models
from django.utils import timezone
from decimal import Decimal
from apps.common.models import TimeStampedModel
from apps.customers.models import CustomerProfile
from apps.products.models import Product


class ShoppingCart(TimeStampedModel):
    """
    Persistent shopping cart for customers.
    Auto-created on first cart addition, allows pause/resume of shopping.
    """
    customer = models.OneToOneField(
        CustomerProfile,
        on_delete=models.CASCADE,
        related_name='shopping_cart',
    )
    is_active = models.BooleanField(default=True)
    last_accessed = models.DateTimeField(auto_now=True)
    notes = models.TextField(blank=True, help_text="Customer notes for this cart")

    class Meta:
        verbose_name = 'shopping cart'
        verbose_name_plural = 'shopping carts'
        ordering = ('-last_accessed',)

    def __str__(self):
        return f"Cart for {self.customer.user.email}"

    @property
    def total_items(self) -> int:
        """Total quantity of items in cart."""
        return sum(item.quantity for item in self.items.all())

    @property
    def subtotal(self) -> Decimal:
        """Sum of all item totals before tax/discounts."""
        return sum(item.total_price for item in self.items.all()) or Decimal('0.00')

    def clear(self):
        """Empty the cart while keeping the record."""
        self.items.all().delete()


class CartItem(models.Model):
    """
    Individual items in a shopping cart.
    Stores quantity + product reference, enabling dynamic pricing recalc.
    """
    cart = models.ForeignKey(
        ShoppingCart,
        on_delete=models.CASCADE,
        related_name='items',
    )
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1, help_text="Must be >= 1")
    added_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('cart', 'product')
        verbose_name = 'cart item'
        verbose_name_plural = 'cart items'

    def __str__(self):
        return f"{self.quantity}x {self.product.name} in {self.cart.customer.user.email}'s cart"

    @property
    def unit_price(self) -> Decimal:
        """Current product price (reflects dynamic pricing)."""
        return self.product.price

    @property
    def total_price(self) -> Decimal:
        """Quantity × unit price."""
        return Decimal(str(self.quantity)) * self.unit_price


class SavedPaymentMethod(TimeStampedModel):
    """
    Stores tokenized payment method references (Stripe, PayPal tokens).
    NEVER stores raw credit card data — tokens only.
    Supports one-click checkout and recurring subscriptions.
    """
    class PaymentType(models.TextChoices):
        CARD = 'Card', 'Debit/Credit Card'
        MOBILE_MONEY = 'Mobile Money', 'Mobile Money (M-Pesa, etc.)'
        BANK_TRANSFER = 'Bank Transfer', 'Bank Account'
        WALLET = 'Wallet', 'Digital Wallet (Apple Pay, Google Pay)'
        PAYPAL = 'PayPal', 'PayPal Account'

    class Provider(models.TextChoices):
        STRIPE = 'Stripe', 'Stripe'
        PAYPAL = 'PayPal', 'PayPal'
        MPESA = 'M-Pesa', 'M-Pesa'
        FLUTTERWAVE = 'Flutterwave', 'Flutterwave'
        APPLE_PAY = 'Apple Pay', 'Apple Pay'
        GOOGLE_PAY = 'Google Pay', 'Google Pay'

    customer = models.ForeignKey(
        CustomerProfile,
        on_delete=models.CASCADE,
        related_name='saved_payment_methods',
    )
    payment_type = models.CharField(
        max_length=20,
        choices=PaymentType.choices,
    )
    provider = models.CharField(
        max_length=20,
        choices=Provider.choices,
    )
    token = models.CharField(
        max_length=500,
        help_text="Tokenized reference from payment provider (NEVER raw card data)"
    )
    is_default = models.BooleanField(
        default=False,
        help_text="Use for auto-pay & one-click checkout"
    )
    
    # Display fields (safe to show customer)
    display_name = models.CharField(
        max_length=100,
        help_text="e.g., 'Visa ending in 4242', 'M-Pesa +254..."
    )
    last_four = models.CharField(
        max_length=4,
        blank=True,
        help_text="Last 4 digits for card display"
    )
    expiry_month = models.IntegerField(null=True, blank=True)
    expiry_year = models.IntegerField(null=True, blank=True)
    
    # Lifecycle
    is_active = models.BooleanField(default=True)
    failed_attempts = models.IntegerField(default=0, help_text="Consecutive failures")
    last_used = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = 'saved payment method'
        verbose_name_plural = 'saved payment methods'
        ordering = ('-is_default', '-last_used')
        unique_together = ('customer', 'token')

    def __str__(self):
        return f"{self.display_name} ({self.provider}) - {self.customer.user.email}"

    def mark_failed(self):
        """Increment failure count; deactivate after 3 consecutive fails."""
        self.failed_attempts += 1
        if self.failed_attempts >= 3:
            self.is_active = False
        self.save()

    def mark_success(self):
        """Reset failures and update last_used timestamp."""
        self.failed_attempts = 0
        self.last_used = timezone.now()
        self.save()

    def set_as_default(self):
        """Set this as default and unset others for the customer."""
        SavedPaymentMethod.objects.filter(
            customer=self.customer,
            is_default=True
        ).update(is_default=False)
        self.is_default = True
        self.save()


class BillPaymentRecord(TimeStampedModel):
    """
    Anonymous bill payments (user provides account number, not logged in).
    Supports one-off bill settlement without authentication.
    Links payment to customer account via account_number for reconciliation.
    """
    class BillStatus(models.TextChoices):
        UNPAID = 'Unpaid', 'Unpaid'
        PENDING = 'Pending', 'Pending Payment'
        PAID = 'Paid', 'Paid'
        PARTIAL = 'Partial', 'Partially Paid'
        OVERDUE = 'Overdue', 'Overdue'

    # Account identification
    kitayi_account_number = models.CharField(
        max_length=20,
        help_text="Kitayi Customer Account Number (KS-XXXX-XXXX)"
    )
    customer = models.ForeignKey(
        CustomerProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='bill_payments',
        help_text="Linked after payment verification"
    )

    # Bill details
    bill_amount = models.DecimalField(max_digits=12, decimal_places=2)
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2)
    payment_status = models.CharField(
        max_length=20,
        choices=BillStatus.choices,
        default=BillStatus.PENDING,
    )

    # Payment info
    payment_method = models.CharField(max_length=50)  # e.g., "M-Pesa", "Stripe"
    transaction_reference = models.CharField(
        max_length=255,
        unique=True,
        help_text="Unique reference for reconciliation"
    )
    
    # Verification
    email_provided = models.EmailField(blank=True)
    phone_provided = models.CharField(max_length=20, blank=True)
    otp_verified = models.BooleanField(default=False)

    class Meta:
        verbose_name = 'bill payment record'
        verbose_name_plural = 'bill payment records'
        ordering = ('-created_at',)
        indexes = [
            models.Index(fields=['kitayi_account_number']),
            models.Index(fields=['transaction_reference']),
        ]

    def __str__(self):
        return f"Bill Payment {self.transaction_reference} - {self.kitayi_account_number}"

    @property
    def is_fully_paid(self) -> bool:
        """Check if bill is completely settled."""
        return self.amount_paid >= self.bill_amount

    @property
    def remaining_balance(self) -> Decimal:
        """Calculate outstanding balance."""
        return max(self.bill_amount - self.amount_paid, Decimal('0.00'))
