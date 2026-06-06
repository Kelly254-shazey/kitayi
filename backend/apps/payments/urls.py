from django.urls import path
from apps.payments.views import (
    PaymentListAPIView,
    StripeCreateCheckoutSessionView,
    StripeWebhookView,
    MpesaStkPushView,
    MpesaCallbackView,
)

app_name = 'payments'

urlpatterns = [
    path('', PaymentListAPIView.as_view(), name='payment-list'),
    path('pay-stripe/', StripeCreateCheckoutSessionView.as_view(), name='pay-stripe'),
    path('stripe-webhook/', StripeWebhookView.as_view(), name='stripe-webhook'),
    path('pay-mpesa/', MpesaStkPushView.as_view(), name='pay-mpesa'),
    path('mpesa-callback/', MpesaCallbackView.as_view(), name='mpesa-callback'),
]
