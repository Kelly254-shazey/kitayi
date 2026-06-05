from rest_framework import serializers
from apps.products.models import Product, InventoryTransaction


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'sku', 'category', 'volume_liters',
            'price', 'stock_qty', 'safety_level', 'reorder_threshold',
            'is_active', 'image_url', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class InventoryTransactionSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')
    created_by_name = serializers.ReadOnlyField(source='created_by.full_name')

    class Meta:
        model = InventoryTransaction
        fields = [
            'id', 'product', 'product_name', 'transaction_type',
            'quantity', 'notes', 'created_by', 'created_by_name', 'created_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        transaction = super().create(validated_data)
        
        # Automatically update the product inventory stock quantity
        product = transaction.product
        if transaction.transaction_type == InventoryTransaction.TransactionType.REFILL:
            product.stock_qty += transaction.quantity
        elif transaction.transaction_type in [InventoryTransaction.TransactionType.DISPATCH, InventoryTransaction.TransactionType.ADJUSTMENT]:
            product.stock_qty += transaction.quantity  # quantity can be negative for reductions
        elif transaction.transaction_type == InventoryTransaction.TransactionType.RETURN:
            product.stock_qty += transaction.quantity
            
        product.save(update_fields=['stock_qty', 'updated_at'])
        return transaction
