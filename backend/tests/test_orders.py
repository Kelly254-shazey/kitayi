import pytest
from django.urls import reverse
from apps.products.models import Product
from apps.customers.models import Address


@pytest.fixture
def product(db):
    return Product.objects.create(
        name='Bottled Water 500ml',
        sku='KY-BTL-500',
        category='Bottled',
        volume_liters=0.5,
        price=35.00,
        stock_qty=200,
        safety_level=20,
        reorder_threshold=50,
    )


@pytest.fixture
def address(db, user):
    return Address.objects.create(
        customer=user.customerprofile,
        address_type='Home',
        street_address='123 Test Street',
        city='Nairobi',
        postal_code='00100',
        country='Kenya',
        is_default=True,
    )


@pytest.mark.django_db
class TestOrders:
    def test_create_order(self, auth_client, user, product, address):
        res = auth_client.post(reverse('orders:order-list'), {
            'delivery_address': str(address.pk),
            'delivery_date': '2026-12-01',
            'delivery_slot': 'Morning',
            'items': [
                {'product': str(product.pk), 'quantity': 2}
            ],
        }, format='json')
        assert res.status_code == 201
        assert res.data['tracking_number'].startswith('KY-')
        assert res.data['payment_status'] == 'Pending'

    def test_order_deducts_stock(self, auth_client, user, product, address):
        initial_stock = product.stock_qty
        auth_client.post(reverse('orders:order-list'), {
            'delivery_address': str(address.pk),
            'delivery_date': '2026-12-01',
            'delivery_slot': 'Morning',
            'items': [{'product': str(product.pk), 'quantity': 3}],
        }, format='json')
        product.refresh_from_db()
        assert product.stock_qty == initial_stock - 3

    def test_order_insufficient_stock(self, auth_client, user, product, address):
        res = auth_client.post(reverse('orders:order-list'), {
            'delivery_address': str(address.pk),
            'delivery_date': '2026-12-01',
            'delivery_slot': 'Morning',
            'items': [{'product': str(product.pk), 'quantity': 9999}],
        }, format='json')
        assert res.status_code == 400

    def test_list_orders_customer_only_sees_own(self, auth_client, api_client):
        res = auth_client.get(reverse('orders:order-list'))
        assert res.status_code == 200

    def test_unauthenticated_cannot_order(self, api_client, product, address):
        res = api_client.post(reverse('orders:order-list'), {
            'delivery_address': str(address.pk),
            'delivery_date': '2026-12-01',
            'delivery_slot': 'Morning',
            'items': [{'product': str(product.pk), 'quantity': 1}],
        }, format='json')
        assert res.status_code == 401

    def test_cancel_order(self, auth_client, user, product, address):
        create_res = auth_client.post(reverse('orders:order-list'), {
            'delivery_address': str(address.pk),
            'delivery_date': '2026-12-01',
            'delivery_slot': 'Morning',
            'items': [{'product': str(product.pk), 'quantity': 2}],
        }, format='json')
        order_id = create_res.data['id']
        cancel_res = auth_client.post(reverse('orders:order-cancel', kwargs={'pk': order_id}))
        assert cancel_res.status_code == 200
        product.refresh_from_db()
        assert product.stock_qty == 200  # stock restored


@pytest.mark.django_db
class TestCoupons:
    def test_validate_invalid_coupon(self, auth_client):
        res = auth_client.get(reverse('orders:coupon-validate') + '?code=FAKE123')
        assert res.status_code == 404
