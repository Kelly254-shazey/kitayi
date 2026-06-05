from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.users.models import User


@receiver(post_save, sender=User)
def create_customer_profile(sender, instance, created, **kwargs):
    if created:
        from apps.customers.models import CustomerProfile

        CustomerProfile.objects.create(user=instance)
