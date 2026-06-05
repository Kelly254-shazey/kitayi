from django.contrib import admin
from apps.common.models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('action', 'resource', 'resource_id', 'actor', 'ip_address', 'timestamp')
    list_filter = ('action', 'resource')
    search_fields = ('actor__email', 'resource', 'resource_id', 'description')
    readonly_fields = ('id', 'actor', 'action', 'resource', 'resource_id', 'description', 'ip_address', 'timestamp')

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
