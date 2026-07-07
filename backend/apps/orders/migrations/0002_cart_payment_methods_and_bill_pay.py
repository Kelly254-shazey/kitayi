from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('customers', '0002_initial'),
        ('products', '0002_customer_tier_variants_and_metadata'),
        ('orders', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='ShoppingCart',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('is_active', models.BooleanField(default=True)),
                ('last_accessed', models.DateTimeField(auto_now=True)),
                ('notes', models.TextField(blank=True, help_text='Customer notes for this cart')),
                (
                    'customer',
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='shopping_cart',
                        to='customers.customerprofile',
                    ),
                ),
            ],
            options={
                'verbose_name': 'shopping cart',
                'verbose_name_plural': 'shopping carts',
                'ordering': ('-last_accessed',),
            },
        ),
        migrations.CreateModel(
            name='BillPaymentRecord',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('kitayi_account_number', models.CharField(help_text='Kitayi Customer Account Number (KS-XXXX-XXXX)', max_length=20)),
                ('bill_amount', models.DecimalField(decimal_places=2, max_digits=12)),
                ('amount_paid', models.DecimalField(decimal_places=2, max_digits=12)),
                (
                    'payment_status',
                    models.CharField(
                        choices=[
                            ('Unpaid', 'Unpaid'),
                            ('Pending', 'Pending Payment'),
                            ('Paid', 'Paid'),
                            ('Partial', 'Partially Paid'),
                            ('Overdue', 'Overdue'),
                        ],
                        default='Pending',
                        max_length=20,
                    ),
                ),
                ('payment_method', models.CharField(max_length=50)),
                ('transaction_reference', models.CharField(help_text='Unique reference for reconciliation', max_length=255, unique=True)),
                ('email_provided', models.EmailField(blank=True, max_length=254)),
                ('phone_provided', models.CharField(blank=True, max_length=20)),
                ('otp_verified', models.BooleanField(default=False)),
                (
                    'customer',
                    models.ForeignKey(
                        blank=True,
                        help_text='Linked after payment verification',
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name='bill_payments',
                        to='customers.customerprofile',
                    ),
                ),
            ],
            options={
                'verbose_name': 'bill payment record',
                'verbose_name_plural': 'bill payment records',
                'ordering': ('-created_at',),
            },
        ),
        migrations.CreateModel(
            name='SavedPaymentMethod',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                (
                    'payment_type',
                    models.CharField(
                        choices=[
                            ('Card', 'Debit/Credit Card'),
                            ('Mobile Money', 'Mobile Money (M-Pesa, etc.)'),
                            ('Bank Transfer', 'Bank Account'),
                            ('Wallet', 'Digital Wallet (Apple Pay, Google Pay)'),
                            ('PayPal', 'PayPal Account'),
                        ],
                        max_length=20,
                    ),
                ),
                (
                    'provider',
                    models.CharField(
                        choices=[
                            ('Stripe', 'Stripe'),
                            ('PayPal', 'PayPal'),
                            ('M-Pesa', 'M-Pesa'),
                            ('Flutterwave', 'Flutterwave'),
                            ('Apple Pay', 'Apple Pay'),
                            ('Google Pay', 'Google Pay'),
                        ],
                        max_length=20,
                    ),
                ),
                ('token', models.CharField(help_text='Tokenized reference from payment provider (NEVER raw card data)', max_length=500)),
                ('is_default', models.BooleanField(default=False, help_text='Use for auto-pay & one-click checkout')),
                ('display_name', models.CharField(help_text="e.g., 'Visa ending in 4242', 'M-Pesa +254...'", max_length=100)),
                ('last_four', models.CharField(blank=True, help_text='Last 4 digits for card display', max_length=4)),
                ('expiry_month', models.IntegerField(blank=True, null=True)),
                ('expiry_year', models.IntegerField(blank=True, null=True)),
                ('is_active', models.BooleanField(default=True)),
                ('failed_attempts', models.IntegerField(default=0, help_text='Consecutive failures')),
                ('last_used', models.DateTimeField(blank=True, null=True)),
                (
                    'customer',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='saved_payment_methods',
                        to='customers.customerprofile',
                    ),
                ),
            ],
            options={
                'verbose_name': 'saved payment method',
                'verbose_name_plural': 'saved payment methods',
                'ordering': ('-is_default', '-last_used'),
                'unique_together': {('customer', 'token')},
            },
        ),
        migrations.CreateModel(
            name='CartItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('quantity', models.IntegerField(default=1, help_text='Must be >= 1')),
                ('added_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                (
                    'cart',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='items',
                        to='orders.shoppingcart',
                    ),
                ),
                ('product', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='products.product')),
            ],
            options={
                'verbose_name': 'cart item',
                'verbose_name_plural': 'cart items',
                'unique_together': {('cart', 'product')},
            },
        ),
        migrations.AddIndex(
            model_name='billpaymentrecord',
            index=models.Index(fields=['kitayi_account_number'], name='orders_bill_kitayi__baf8c2_idx'),
        ),
        migrations.AddIndex(
            model_name='billpaymentrecord',
            index=models.Index(fields=['transaction_reference'], name='orders_bill_transac_015b85_idx'),
        ),
    ]
