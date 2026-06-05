from django.urls import path
from apps.orders.views import (
    OrderListCreateAPIView,
    OrderRetrieveAPIView,
    OrderCancelAPIView,
    CouponListCreateAPIView,
    CouponValidateAPIView,
)

app_name = 'orders'

urlpatterns = [
    path('', OrderListCreateAPIView.as_view(), name='order-list'),
    path('<uuid:pk>/', OrderRetrieveAPIView.as_view(), name='order-detail'),
    path('<uuid:pk>/cancel/', OrderCancelAPIView.as_view(), name='order-cancel'),
    path('coupons/', CouponListCreateAPIView.as_view(), name='coupon-list'),
    path('coupons/validate/', CouponValidateAPIView.as_view(), name='coupon-validate'),
]
