from rest_framework import serializers

from apps.communications.models import ContactInquiry, NewsletterSubscriber


class ContactInquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactInquiry
        fields = ['id', 'name', 'email', 'subject', 'message', 'status', 'created_at']
        read_only_fields = ['id', 'status', 'created_at']


class NewsletterSubscriberSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsletterSubscriber
        fields = ['id', 'email', 'is_active', 'created_at']
        read_only_fields = ['id', 'is_active', 'created_at']

    def create(self, validated_data):
        subscriber, _ = NewsletterSubscriber.objects.update_or_create(
            email=validated_data['email'],
            defaults={'is_active': True},
        )
        return subscriber
