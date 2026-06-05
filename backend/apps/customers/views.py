from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.common.permissions import IsOwnerOrReadOnly
from apps.customers.models import Address
from apps.customers.serializers import (
    CustomerProfileDetailSerializer,
    CustomerProfileUpdateSerializer,
)
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
