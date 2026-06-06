from django.urls import path

from apps.communications.views import ContactInquiryCreateAPIView, NewsletterSubscriberCreateAPIView

app_name = 'communications'

urlpatterns = [
    path('contact-inquiries/', ContactInquiryCreateAPIView.as_view(), name='contact-inquiry-create'),
    path('newsletter/', NewsletterSubscriberCreateAPIView.as_view(), name='newsletter-create'),
]
