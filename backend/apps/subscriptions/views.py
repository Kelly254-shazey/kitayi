from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from apps.customers.models import CustomerProfile
from apps.subscriptions.models import Subscription
from apps.subscriptions.serializers import SubscriptionSerializer


class SubscriptionListCreateAPIView(generics.ListCreateAPIView):
    """List customer subscriptions or create a new recurring water delivery schedule."""
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Subscription.objects.all()
        try:
            customer = CustomerProfile.objects.get(user=user)
            return Subscription.objects.filter(customer=customer)
        except CustomerProfile.DoesNotExist:
            return Subscription.objects.none()


class SubscriptionRetrieveUpdateAPIView(generics.RetrieveUpdateAPIView):
    """Retrieve or update subscription status (e.g. Pause, Active, Cancelled)."""
    queryset = Subscription.objects.all()
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Subscription.objects.all()
        try:
            customer = CustomerProfile.objects.get(user=user)
            return Subscription.objects.filter(customer=customer)
        except CustomerProfile.DoesNotExist:
            return Subscription.objects.none()
