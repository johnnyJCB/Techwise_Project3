from rest_framework import permissions

class IsStaffOrOwnerOrReadOnly(permissions.BasePermission):
    """
    Allows write access if a user is staff, or the owner of an object.
    Otherwise, the user is only given read access.
    """
    def has_object_permission(self, request, view, obj):
        # If this is a read request (GET, HEAD, etc.)
        if request.method in permissions.SAFE_METHODS:
            return True
        # Check if user has permission to write to this object.
        else:
            if request.user.is_staff:
                return True
            # Is the owner.
            if request.user == obj:
                return True

            # The user does not have access to this object.
            return False

class IsStaffOrOwner(permissions.BasePermission):
    """
    Allows read/write access if a user is staff, or the owner of an object.
    """
    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        # Is the owner.
        if request.user == obj:
            return True

        # The user does not have access to this object.
        return False

class IsStaffForPOST(permissions.BasePermission):
    """
    Allows POST operations for staff users.
    """
    def has_permission(self, request, view):
        if request.method == "POST":
            print(request.method)
            return request.user.is_staff
        # Do not check for non-POST operations.
        else:
            return True