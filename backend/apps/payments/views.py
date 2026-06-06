import json
import base64
import requests
import stripe
from datetime import datetime
from decimal import Decimal

from django.conf import settings
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny

from apps.common.audit import log_action
from apps.common.models import AuditLog
from apps.common.throttles import PaymentRateThrottle
from apps.customers.models import CustomerProfile
from apps.orders.models import Order
from apps.payments.models import Payment
from apps.payments.serializers import PaymentSerializer


class PaymentListAPIView(generics.ListAPIView):
    """List customer payment history."""
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Payment.objects.all()
        try:
            customer = CustomerProfile.objects.get(user=user)
            return Payment.objects.filter(customer=customer)
        except CustomerProfile.DoesNotExist:
            return Payment.objects.none()


class StripeCreateCheckoutSessionView(views.APIView):
    """Create Stripe session link for credit/debit card checkout."""
    permission_classes = [IsAuthenticated]
    throttle_classes = [PaymentRateThrottle]

    def post(self, request):
        order_id = request.data.get('order_id')
        if not order_id:
            return Response({"detail": "order_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            customer = CustomerProfile.objects.get(user=request.user)
            order = Order.objects.get(id=order_id, customer=customer)
        except (CustomerProfile.DoesNotExist, Order.DoesNotExist):
            return Response({"detail": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        stripe.api_key = getattr(settings, 'STRIPE_SECRET_KEY', '')
        if not stripe.api_key:
            return Response(
                {
                    "detail": "Stripe secret key is not configured. Please set STRIPE_SECRET_KEY in environment."
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        try:
            frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:8000')
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': 'kes',
                        'product_data': {
                            'name': f"Water Delivery {order.tracking_number}",
                        },
                        'unit_amount': int(order.total_amount * 100),  # Stripe uses cents
                    },
                    'quantity': 1,
                }],
                mode='payment',
                success_url=frontend_url + '/payment-success?session_id={CHECKOUT_SESSION_ID}',
                cancel_url=frontend_url + '/payment-cancelled',
                metadata={'order_id': str(order.id), 'customer_id': str(customer.id)},
            )

            # Log pending payment
            Payment.objects.create(
                customer=customer,
                order=order,
                amount=order.total_amount,
                provider=Payment.Provider.STRIPE,
                transaction_reference=session.id,
                status=Payment.Status.PENDING,
                response_payload={"session_created": str(timezone.now())}
            )

            return Response({"checkout_url": session.url, "session_id": session.id}, status=status.HTTP_200_OK)
        except Exception as e:
            log_action(request.user, AuditLog.Action.PAYMENT, 'Payment', '', f'Stripe session error: {str(e)}', request)
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@method_decorator(csrf_exempt, name='dispatch')
class StripeWebhookView(views.APIView):
    """Callback receiver to confirm Stripe checkout sessions."""
    permission_classes = [AllowAny]

    def post(self, request):
        payload = request.body
        sig_header = request.headers.get('STRIPE_SIGNATURE')
        endpoint_secret = getattr(settings, 'STRIPE_WEBHOOK_SECRET', '')

        stripe.api_key = getattr(settings, 'STRIPE_SECRET_KEY', '')

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, endpoint_secret
            ) if sig_header and endpoint_secret else json.loads(payload)
        except Exception as e:
            return Response({"detail": f"Webhook verification failed: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        # Handle session completion
        event_type = event.get('type') if isinstance(event, dict) else event.type
        event_data = event.get('data', {}).get('object', {}) if isinstance(event, dict) else event.data.object

        if event_type == 'checkout.session.completed':
            session_id = event_data.get('id')
            metadata = event_data.get('metadata', {})
            order_id = metadata.get('order_id')

            try:
                payment = Payment.objects.get(transaction_reference=session_id)
                payment.status = Payment.Status.SUCCESSFUL
                payment.response_payload = event_data
                payment.save(update_fields=['status', 'response_payload', 'updated_at'])

                order = payment.order
                if order:
                    order.payment_status = Order.PaymentStatus.PAID
                    order.save(update_fields=['payment_status', 'updated_at'])
            except Payment.DoesNotExist:
                # If we didn't log it initially, log it now
                if order_id:
                    try:
                        order = Order.objects.get(id=order_id)
                        Payment.objects.create(
                            customer=order.customer,
                            order=order,
                            amount=order.total_amount,
                            provider=Payment.Provider.STRIPE,
                            transaction_reference=session_id,
                            status=Payment.Status.SUCCESSFUL,
                            response_payload=event_data
                        )
                        order.payment_status = Order.PaymentStatus.PAID
                        order.save(update_fields=['payment_status', 'updated_at'])
                    except Order.DoesNotExist:
                        pass

        return Response({"status": "success"}, status=status.HTTP_200_OK)


class MpesaStkPushView(views.APIView):
    """Initiates M-Pesa STK Push payment request."""
    permission_classes = [IsAuthenticated]
    throttle_classes = [PaymentRateThrottle]

    def post(self, request):
        order_id = request.data.get('order_id')
        if not order_id:
            return Response({"detail": "order_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            customer = CustomerProfile.objects.get(user=request.user)
            order = Order.objects.get(id=order_id, customer=customer)
        except (CustomerProfile.DoesNotExist, Order.DoesNotExist):
            return Response({"detail": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        # Check Safaricom Daraja configurations
        consumer_key = getattr(settings, 'MPESA_CONSUMER_KEY', '')
        consumer_secret = getattr(settings, 'MPESA_CONSUMER_SECRET', '')
        shortcode = getattr(settings, 'MPESA_BUSINESS_SHORTCODE', '')
        passkey = getattr(settings, 'MPESA_PASSKEY', '')
        env = getattr(settings, 'MPESA_ENVIRONMENT', 'sandbox')

        # Format user phone for M-Pesa (must start with 254...)
        phone = request.user.phone_number
        if phone.startswith('+'):
            phone = phone[1:]
        if phone.startswith('0'):
            phone = '254' + phone[1:]
        if not phone.startswith('254'):
            phone = '254' + phone

        if not (consumer_key and consumer_secret and shortcode and passkey):
            return Response(
                {
                    "detail": "M-Pesa Daraja keys are not configured. Please set MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_BUSINESS_SHORTCODE, and MPESA_PASSKEY in environment."
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        # Initiate STK push
        try:
            # 1. Get OAuth Access Token
            api_url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
            if env == 'production':
                api_url = "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"

            keys = f"{consumer_key}:{consumer_secret}"
            encoded_keys = base64.b64encode(keys.encode('utf-8')).decode('utf-8')
            headers = {"Authorization": f"Basic {encoded_keys}"}
            token_res = requests.get(api_url, headers=headers)
            access_token = token_res.json().get('access_token')

            if not access_token:
                return Response({"detail": "Failed to authenticate with Safaricom Daraja."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # 2. Trigger STK Push Request
            stk_url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
            if env == 'production':
                stk_url = "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest"

            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            password_str = f"{shortcode}{passkey}{timestamp}"
            password = base64.b64encode(password_str.encode('utf-8')).decode('utf-8')

            callback_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:8000') + '/api/v1/payments/mpesa-callback/'
            
            headers = {"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"}
            payload = {
                "BusinessShortCode": shortcode,
                "Password": password,
                "Timestamp": timestamp,
                "TransactionType": "CustomerPayBillOnline",
                "Amount": int(order.total_amount),
                "PartyA": phone,
                "PartyB": shortcode,
                "PhoneNumber": phone,
                "CallBackURL": callback_url,
                "AccountReference": order.tracking_number,
                "TransactionDesc": f"Payment for water order {order.tracking_number}"
            }

            stk_res = requests.post(stk_url, json=payload, headers=headers)
            stk_data = stk_res.json()

            if stk_data.get('ResponseCode') == '0':
                checkout_id = stk_data.get('CheckoutRequestID')
                Payment.objects.create(
                    customer=customer,
                    order=order,
                    amount=order.total_amount,
                    provider=Payment.Provider.MPESA,
                    transaction_reference=checkout_id,
                    status=Payment.Status.PENDING,
                    response_payload=stk_data
                )
                log_action(request.user, AuditLog.Action.PAYMENT, 'Payment', checkout_id, f'M-Pesa STK push initiated for order {order.tracking_number}', request)
                return Response(stk_data, status=status.HTTP_200_OK)
            else:
                return Response(stk_data, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@method_decorator(csrf_exempt, name='dispatch')
class MpesaCallbackView(views.APIView):
    """Callback receiver where Safaricom Daraja posts STK Push completion result."""
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            callback_data = request.data
            stk_callback = callback_data.get('Body', {}).get('stkCallback', {})
            result_code = stk_callback.get('ResultCode')
            checkout_id = stk_callback.get('CheckoutRequestID')

            try:
                payment = Payment.objects.get(transaction_reference=checkout_id)
            except Payment.DoesNotExist:
                return Response({"status": "payment_record_not_found"}, status=status.HTTP_404_NOT_FOUND)

            payment.response_payload = callback_data
            
            if result_code == 0:
                payment.status = Payment.Status.SUCCESSFUL
                # Extract receipt number
                items = stk_callback.get('CallbackMetadata', {}).get('Item', [])
                receipt_number = None
                for item in items:
                    if item.get('Name') == 'MpesaReceiptNumber':
                        receipt_number = item.get('Value')
                        break
                
                if receipt_number:
                    payment.transaction_reference = receipt_number

                payment.save(update_fields=['status', 'transaction_reference', 'response_payload', 'updated_at'])

                order = payment.order
                if order:
                    order.payment_status = Order.PaymentStatus.PAID
                    order.save(update_fields=['payment_status', 'updated_at'])
            else:
                payment.status = Payment.Status.FAILED
                payment.save(update_fields=['status', 'response_payload', 'updated_at'])

            return Response({"status": "accepted"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


