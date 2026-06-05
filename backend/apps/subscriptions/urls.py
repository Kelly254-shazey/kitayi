from django.urls import path
from apps.subscriptions.views import (
    SubscriptionListCreateAPIView,
    SubscriptionRetrieveUpdateAPIView,
)

app_name = 'subscriptions'

urlpatterns = [
    path('', SubscriptionListCreateAPIView.as_view(), name='subscription-list'),
    path('<uuid:pk>/', SubscriptionRetrieveUpdateAPIView.as_view(), name='subscription-detail'),
]
