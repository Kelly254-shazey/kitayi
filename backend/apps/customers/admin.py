from django.contrib import admin

from apps.customers.models import Address, CustomerProfile


@admin.register(CustomerProfile)
class CustomerProfileAdmin(admin.ModelAdmin):
    list_display = (
        'user',
        'account_number',
        'user_type',
        'verification_status',
        'account_balance',
    )
    list_filter = ('verification_status',)
    search_fields = ('user__email', 'account_number', 'business_name')
    readonly_fields = ('account_number', 'created_at', 'updated_at')

    @admin.display(description='User type')
    def user_type(self, obj):
        return obj.user.user_type


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ('customer', 'address_type', 'city', 'is_default', 'is_active')
    list_filter = ('address_type', 'city', 'is_default', 'is_active')
    search_fields = ('customer__user__email', 'street_address', 'city')
