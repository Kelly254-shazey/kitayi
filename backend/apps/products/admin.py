from django.contrib import admin
from apps.products.models import Product, InventoryTransaction


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'sku', 'category', 'price', 'stock_qty', 'safety_level', 'is_active')
    list_filter = ('category', 'is_active')
    search_fields = ('name', 'sku')
    ordering = ('name',)
    readonly_fields = ('created_at', 'updated_at')


@admin.register(InventoryTransaction)
class InventoryTransactionAdmin(admin.ModelAdmin):
    list_display = ('product', 'transaction_type', 'quantity', 'created_by', 'created_at')
    list_filter = ('transaction_type',)
    search_fields = ('product__name', 'product__sku')
    readonly_fields = ('created_at',)
