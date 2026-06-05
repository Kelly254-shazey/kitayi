from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from apps.users.models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('full_name', 'phone_number')}),
        ('Account Info', {'fields': ('user_type', 'social_login_provider')}),
        ('Verification', {'fields': ('is_email_verified', 'is_phone_verified')}),
        (
            'Permissions',
            {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')},
        ),
        ('Important Dates', {'fields': ('last_login', 'created_at', 'updated_at')}),
    )
    add_fieldsets = (
        (
            None,
            {
                'classes': ('wide',),
                'fields': ('email', 'phone_number', 'full_name', 'password1', 'password2'),
            },
        ),
    )
    list_display = ('email', 'full_name', 'user_type', 'is_active', 'created_at')
    list_filter = ('user_type', 'is_active', 'is_email_verified')
    search_fields = ('email', 'phone_number', 'full_name')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at', 'last_login', 'date_joined')
