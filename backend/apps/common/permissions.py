from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """Customer can only access or modify their own profile data."""

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        if hasattr(obj, 'user'):
            return obj.user == request.user
        if hasattr(obj, 'customer'):
            return obj.customer.user == request.user
        return False


class IsAdminUser(permissions.BasePermission):
    """Only Django staff/superuser."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_staff)


def _user_in_group(user, group_name):
    return user.is_authenticated and (
        user.is_staff or user.groups.filter(name=group_name).exists()
    )


class IsSuperAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return _user_in_group(request.user, 'Super Admin')


class IsOperationsManager(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_staff
            or request.user.groups.filter(name__in=['Super Admin', 'Operations Manager']).exists()
        )


class IsFinanceManager(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_staff
            or request.user.groups.filter(name__in=['Super Admin', 'Finance Manager']).exists()
        )


class IsDriver(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_staff
            or request.user.groups.filter(name__in=['Super Admin', 'Operations Manager', 'Driver']).exists()
        )


class IsWarehouseStaff(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_staff
            or request.user.groups.filter(
                name__in=['Super Admin', 'Operations Manager', 'Warehouse Staff']
            ).exists()
        )


class IsCustomerSupport(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_staff
            or request.user.groups.filter(
                name__in=['Super Admin', 'Customer Support']
            ).exists()
        )


class IsAdminOrOwner(permissions.BasePermission):
    """Admin sees all; customers only see their own objects."""

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        if hasattr(obj, 'user'):
            return obj.user == request.user
        if hasattr(obj, 'customer'):
            return obj.customer.user == request.user
        if hasattr(obj, 'driver'):
            return obj.driver == request.user
        return False
