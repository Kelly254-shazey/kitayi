from django.db import models

from apps.common.models import TimeStampedModel


class ContactInquiry(TimeStampedModel):
    class Status(models.TextChoices):
        NEW = 'NEW', 'New'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        RESOLVED = 'RESOLVED', 'Resolved'

    name = models.CharField(max_length=150)
    email = models.EmailField()
    subject = models.CharField(max_length=120)
    message = models.TextField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NEW)

    class Meta:
        verbose_name = 'contact inquiry'
        verbose_name_plural = 'contact inquiries'

    def __str__(self):
        return f'{self.subject} - {self.email}'


class NewsletterSubscriber(TimeStampedModel):
    email = models.EmailField(unique=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'newsletter subscriber'
        verbose_name_plural = 'newsletter subscribers'

    def __str__(self):
        return self.email
