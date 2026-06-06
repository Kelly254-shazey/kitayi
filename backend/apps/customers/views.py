from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.common.permissions import IsOwnerOrReadOnly
from apps.customers.models import Address, CustomerProfile
from apps.customers.serializers import (
    CustomerProfileDetailSerializer,
    CustomerProfileUpdateSerializer,
)
from apps.orders.models import Order
from apps.users.serializers import AddressSerializer


class CustomerProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = (IsAuthenticated,)

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return CustomerProfileUpdateSerializer
        return CustomerProfileDetailSerializer

    def get_object(self):
        return self.request.user.customerprofile

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = CustomerProfileUpdateSerializer(
            instance, data=request.data, partial=partial
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(CustomerProfileDetailSerializer(instance).data)


class AddressListCreateView(generics.ListCreateAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = AddressSerializer

    def get_queryset(self):
        return Address.objects.filter(
            customer=self.request.user.customerprofile,
            is_active=True,
        )


class AddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = (IsAuthenticated, IsOwnerOrReadOnly)
    serializer_class = AddressSerializer

    def get_queryset(self):
        return Address.objects.filter(customer=self.request.user.customerprofile)

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.is_default = False
        instance.save()


class SetDefaultAddressView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, pk):
        try:
            address = Address.objects.get(
                pk=pk,
                customer=request.user.customerprofile,
                is_active=True,
            )
        except Address.DoesNotExist:
            return Response({'detail': 'Address not found.'}, status=status.HTTP_404_NOT_FOUND)

        address.is_default = True
        address.save()

        profile = request.user.customerprofile
        profile.default_delivery_address = address
        profile.save(update_fields=['default_delivery_address', 'updated_at'])

        return Response(AddressSerializer(address).data)


class BillLookupAPIView(APIView):
    """Lookup a customer account by Kitayi account number and return pending bills."""

    permission_classes = (AllowAny,)

    def get(self, request):
        account_number = request.query_params.get('account_number')
        if not account_number:
            return Response(
                {'detail': 'account_number query parameter is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            profile = CustomerProfile.objects.get(account_number__iexact=account_number.strip())
        except CustomerProfile.DoesNotExist:
            return Response(
                {'detail': 'Account number not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        pending_orders = Order.objects.filter(
            customer=profile,
            payment_status__in=[Order.PaymentStatus.PENDING],
        ).order_by('delivery_date')

        bill_summary = [
            {
                'id': str(order.id),
                'tracking_number': order.tracking_number,
                'delivery_date': order.delivery_date,
                'delivery_slot': order.delivery_slot,
                'total_amount': str(order.total_amount),
                'payment_status': order.payment_status,
                'status': order.status,
            }
            for order in pending_orders
        ]

        outstanding_balance = sum(order.total_amount for order in pending_orders)

        data = {
            'account_number': profile.account_number,
            'name': profile.user.full_name or profile.user.email,
            'address': profile.default_delivery_address.street_address if profile.default_delivery_address else '',
            'outstanding_balance': str(outstanding_balance),
            'pending_orders': bill_summary,
        }

        return Response(data)
