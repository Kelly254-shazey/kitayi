import pytest
from django.urls import reverse
from apps.products.models import Product


@pytest.fixture
def product(db):
    return Product.objects.create(
        name='Dispenser Bottle 20L',
        sku='KY-DSP-20L',
        category='Dispenser',
        volume_liters=20,
        price=350.00,
        stock_qty=100,
        safety_level=15,
        reorder_threshold=30,
    )


@pytest.mark.django_db
class TestProductList:
    def test_list_public(self, api_client, product):
        res = api_client.get(reverse('products:product-list'))
        assert res.status_code == 200
        assert res.data['count'] >= 1

    def test_create_requires_admin(self, auth_client):
        res = auth_client.post(reverse('products:product-list'), {
            'name': 'New Product',
            'sku': 'KY-NEW-001',
            'category': 'Bottled',
            'volume_liters': '0.5',
            'price': '35.00',
            'stock_qty': 100,
        })
        assert res.status_code == 403

    def test_create_as_admin(self, admin_client):
        res = admin_client.post(reverse('products:product-list'), {
            'name': 'Admin Product',
            'sku': 'KY-ADM-001',
            'category': 'Bottled',
            'volume_liters': '1.0',
            'price': '60.00',
            'stock_qty': 200,
        })
        assert res.status_code == 201
        assert res.data['sku'] == 'KY-ADM-001'


@pytest.mark.django_db
class TestProductDetail:
    def test_retrieve_public(self, api_client, product):
        res = api_client.get(reverse('products:product-detail', kwargs={'pk': product.pk}))
        assert res.status_code == 200
        assert res.data['name'] == product.name

    def test_update_requires_admin(self, auth_client, product):
        res = auth_client.patch(
            reverse('products:product-detail', kwargs={'pk': product.pk}),
            {'price': '400.00'},
        )
        assert res.status_code == 403

    def test_update_as_admin(self, admin_client, product):
        res = admin_client.patch(
            reverse('products:product-detail', kwargs={'pk': product.pk}),
            {'price': '400.00'},
        )
        assert res.status_code == 200
        assert res.data['price'] == '400.00'
