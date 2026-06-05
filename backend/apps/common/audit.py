from apps.common.models import AuditLog


def log_action(actor, action, resource, resource_id='', description='', request=None):
    """Helper to write an AuditLog entry from any view or service."""
    ip = None
    if request:
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        ip = x_forwarded_for.split(',')[0] if x_forwarded_for else request.META.get('REMOTE_ADDR')
    AuditLog.objects.create(
        actor=actor if actor and actor.is_authenticated else None,
        action=action,
        resource=resource,
        resource_id=str(resource_id),
        description=description,
        ip_address=ip,
    )
