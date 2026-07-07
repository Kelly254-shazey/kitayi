from decimal import Decimal
import uuid

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='product',
            name='description',
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name='product',
            name='max_order_quantity',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='product',
            name='min_order_quantity',
            field=models.IntegerField(default=1),
        ),
        migrations.CreateModel(
            name='CustomerTier',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                (
                    'name',
                    models.CharField(
                        choices=[
                            ('Standard', 'Standard'),
                            ('Silver', 'Silver (5-10% discount)'),
                            ('Gold', 'Gold (10-15% discount)'),
                            ('Platinum', 'Platinum (15-20% discount)'),
                            ('Enterprise', 'Enterprise (20%+ discount)'),
                        ],
                        max_length=50,
                        unique=True,
                    ),
                ),
                (
                    'discount_percentage',
                    models.DecimalField(
                        decimal_places=2,
                        default=Decimal('0.00'),
                        help_text='Percentage discount (0-100)',
                        max_digits=5,
                    ),
                ),
                (
                    'min_monthly_spend',
                    models.DecimalField(
                        decimal_places=2,
                        default=Decimal('0.00'),
                        help_text='Minimum monthly spend required for this tier',
                        max_digits=12,
                    ),
                ),
                (
                    'benefits',
                    models.TextField(blank=True, help_text='JSON or plain text describing tier benefits'),
                ),
                ('is_active', models.BooleanField(default=True)),
            ],
            options={
                'verbose_name': 'customer tier',
                'verbose_name_plural': 'customer tiers',
                'ordering': ('min_monthly_spend',),
            },
        ),
        migrations.CreateModel(
            name='ProductVariant',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('name', models.CharField(help_text="e.g., '20L Bulk', '500mL Case'", max_length=255)),
                ('sku_suffix', models.CharField(max_length=50)),
                (
                    'pricing_type',
                    models.CharField(
                        choices=[('Fixed', 'Fixed Price'), ('Volume', 'Volume-Based Pricing')],
                        default='Fixed',
                        max_length=20,
                    ),
                ),
                ('base_price', models.DecimalField(decimal_places=2, max_digits=12)),
                (
                    'volume_threshold',
                    models.IntegerField(blank=True, help_text='Units required for discount tier', null=True),
                ),
                ('stock_qty', models.IntegerField(default=0)),
                ('is_active', models.BooleanField(default=True)),
                (
                    'product',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='variants',
                        to='products.product',
                    ),
                ),
            ],
            options={
                'verbose_name': 'product variant',
                'verbose_name_plural': 'product variants',
                'unique_together': {('product', 'sku_suffix')},
            },
        ),
    ]
