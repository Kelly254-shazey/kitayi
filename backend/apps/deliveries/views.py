from django.utils import timezone
from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.common.permissions import IsAdminUser
from apps.customers.models import CustomerProfile
from apps.orders.models import Order
from apps.deliveries.models import FleetVehicle, Delivery, DeliveryRoute
from apps.deliveries.serializers import (
    FleetVehicleSerializer,
    DeliverySerializer,
    DeliveryRouteSerializer,
)


class FleetVehicleListCreateAPIView(generics.ListCreateAPIView):
    """List and manage vehicle records (Admin only)."""
    queryset = FleetVehicle.objects.all()
    serializer_class = FleetVehicleSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]


class FleetVehicleRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, modify, or remove vehicles (Admin only)."""
    queryset = FleetVehicle.objects.all()
    serializer_class = FleetVehicleSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]


class DeliveryListCreateAPIView(generics.ListCreateAPIView):
    """List assignments or book delivery schedule."""
    serializer_class = DeliverySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Delivery.objects.all()
        # Drivers see their own assignments
        # Check if user is associated with driver role or checks
        # For simplicity, if they have assigned deliveries, they are drivers.
        # But specifically:
        driver_deliveries = Delivery.objects.filter(driver=user)
        if driver_deliveries.exists():
            return driver_deliveries
        # Customers see deliveries linked to their orders
        try:
            customer = CustomerProfile.objects.get(user=user)
            return Delivery.objects.filter(order__customer=customer)
        except CustomerProfile.DoesNotExist:
            return Delivery.objects.none()

    def perform_create(self, serializer):
        # Allow Admin to schedule deliveries
        serializer.save()


class DeliveryRetrieveUpdateAPIView(generics.RetrieveUpdateAPIView):
    """View detailed delivery card."""
    queryset = Delivery.objects.all()
    serializer_class = DeliverySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Delivery.objects.all()
        
        driver_deliveries = Delivery.objects.filter(driver=user)
        if driver_deliveries.exists():
            return driver_deliveries

        try:
            customer = CustomerProfile.objects.get(user=user)
            return Delivery.objects.filter(order__customer=customer)
        except CustomerProfile.DoesNotExist:
            return Delivery.objects.none()


class DeliveryStatusUpdateView(views.APIView):
    """Transition delivery state (e.g. Dispatched, In Transit, Failed) (Driver/Admin only)."""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            delivery = Delivery.objects.get(pk=pk)
        except Delivery.DoesNotExist:
            return Response({"detail": "Delivery not found."}, status=status.HTTP_404_NOT_FOUND)

        # Ensure only the assigned driver or admin can update status
        if not (request.user.is_staff or delivery.driver == request.user):
            return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

        new_status = request.data.get('status')
        if new_status not in Delivery.Status.values:
            return Response({"detail": "Invalid status transition."}, status=status.HTTP_400_BAD_REQUEST)

        delivery.status = new_status
        if new_status == Delivery.Status.DISPATCHED:
            delivery.dispatched_at = timezone.now()
            # Update order status to DISPATCHED
            delivery.order.status = Order.OrderStatus.DISPATCHED
            delivery.order.save(update_fields=['status', 'updated_at'])
        elif new_status == Delivery.Status.IN_TRANSIT:
            delivery.order.status = Order.OrderStatus.IN_TRANSIT
            delivery.order.save(update_fields=['status', 'updated_at'])
        elif new_status == Delivery.Status.FAILED:
            delivery.order.status = Order.OrderStatus.FAILED
            delivery.order.save(update_fields=['status', 'updated_at'])
        elif new_status == Delivery.Status.CANCELLED:
            delivery.order.status = Order.OrderStatus.CANCELLED
            delivery.order.save(update_fields=['status', 'updated_at'])

        delivery.save(update_fields=['status', 'dispatched_at', 'updated_at'])
        return Response(DeliverySerializer(delivery, context={'request': request}).data, status=status.HTTP_200_OK)


class DeliveryVerifyView(views.APIView):
    """Verify delivery completion using a customer-provided 6-digit OTP (Driver only)."""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            delivery = Delivery.objects.get(pk=pk)
        except Delivery.DoesNotExist:
            return Response({"detail": "Delivery not found."}, status=status.HTTP_404_NOT_FOUND)

        if not (request.user.is_staff or delivery.driver == request.user):
            return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

        code = request.data.get('code')
        signature_url = request.data.get('signature_url')

        if delivery.verification_code != code:
            return Response({"detail": "Invalid verification code."}, status=status.HTTP_400_BAD_REQUEST)

        # Successful verification
        delivery.status = Delivery.Status.DELIVERED
        delivery.delivered_at = timezone.now()
        if signature_url:
            delivery.signature_url = signature_url
        delivery.save(update_fields=['status', 'delivered_at', 'signature_url', 'updated_at'])

        # Update order status
        order = delivery.order
        order.status = Order.OrderStatus.DELIVERED
        order.save(update_fields=['status', 'updated_at'])

        return Response({"message": "Delivery successfully verified and completed."}, status=status.HTTP_200_OK)


class DeliveryRouteCreateView(generics.CreateAPIView):
    """Log latitude/longitude route breadcrumb coordinates for a delivery transit (Driver only)."""
    serializer_class = DeliveryRouteSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        delivery = serializer.validated_data['delivery']
        if not (self.request.user.is_staff or delivery.driver == self.request.user):
            raise PermissionError("You are not authorized to update this delivery route.")
        serializer.save()
