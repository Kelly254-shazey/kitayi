from rest_framework import generics, permissions

from apps.communications.models import ContactInquiry, NewsletterSubscriber
from apps.communications.serializers import ContactInquirySerializer, NewsletterSubscriberSerializer


class ContactInquiryCreateAPIView(generics.CreateAPIView):
    queryset = ContactInquiry.objects.all()
    serializer_class = ContactInquirySerializer
    permission_classes = [permissions.AllowAny]


class NewsletterSubscriberCreateAPIView(generics.CreateAPIView):
    queryset = NewsletterSubscriber.objects.all()
    serializer_class = NewsletterSubscriberSerializer
    permission_classes = [permissions.AllowAny]
