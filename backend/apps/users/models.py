from uuid import uuid4

from django.contrib.auth.models import AbstractUser
from django.db import models

from apps.users.managers import CustomUserManager
from apps.users.validators import validate_e164_phone


class User(AbstractUser):
    """Custom user model using email as the primary login identifier."""

    class UserType(models.TextChoices):
        RESIDENTIAL = 'Residential', 'Residential'
        COMMERCIAL = 'Commercial', 'Commercial'
        INDUSTRIAL = 'Industrial', 'Industrial'
        CASHIER = 'Cashier', 'Cashier'
        BRANCH_MANAGER = 'Branch Manager', 'Branch Manager'
        SYSTEM_ADMINISTRATOR = 'System Administrator', 'System Administrator'
        DRIVER = 'Driver', 'Driver'
        WAREHOUSE_STAFF = 'Warehouse Staff', 'Warehouse Staff'
        CUSTOMER_SUPPORT = 'Customer Support', 'Customer Support'
        AUDITOR = 'Auditor', 'Auditor'

    class SocialProvider(models.TextChoices):
        GOOGLE = 'Google', 'Google'
        APPLE = 'Apple', 'Apple'
        FACEBOOK = 'Facebook', 'Facebook'

    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    username = None
    email = models.EmailField('email address', unique=True)
    phone_number = models.CharField(
        max_length=20,
        unique=True,
        validators=[validate_e164_phone],
    )
    full_name = models.CharField(max_length=255)
    user_type = models.CharField(
        max_length=30,
        choices=UserType.choices,
        default=UserType.RESIDENTIAL,
    )
    social_login_provider = models.CharField(
        max_length=20,
        choices=SocialProvider.choices,
        null=True,
        blank=True,
    )
    is_email_verified = models.BooleanField(default=False)
    is_phone_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['phone_number', 'full_name']

    objects = CustomUserManager()

    class Meta:
        ordering = ('-created_at',)
        verbose_name = 'user'
        verbose_name_plural = 'users'

    def __str__(self):
        return self.email

    def get_full_name(self):
        return self.full_name or self.email

    @property
    def is_customer(self):
        return self.user_type in {
            self.UserType.RESIDENTIAL,
            self.UserType.COMMERCIAL,
            self.UserType.INDUSTRIAL,
        }

    @property
    def is_employee(self):
        return self.user_type in {
            self.UserType.CASHIER,
            self.UserType.BRANCH_MANAGER,
            self.UserType.DRIVER,
            self.UserType.WAREHOUSE_STAFF,
            self.UserType.CUSTOMER_SUPPORT,
            self.UserType.AUDITOR,
        }
