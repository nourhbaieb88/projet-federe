from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        ownership_candidates = [
            getattr(obj, 'owner', None),
            getattr(obj, 'user', None),
            getattr(obj, 'client', None),
            getattr(obj, 'sender', None),
        ]

        establishment = getattr(obj, 'establishment', None)
        if establishment is not None:
            ownership_candidates.append(getattr(establishment, 'owner', None))

        conversation = getattr(obj, 'conversation', None)
        if conversation is not None:
            ownership_candidates.extend([
                getattr(conversation, 'client', None),
                getattr(getattr(conversation, 'establishment', None), 'owner', None),
            ])

        return request.user in ownership_candidates


class IsEstablishmentOwner(permissions.BasePermission):
    """
    Custom permission to only allow establishment owners to access certain views.
    """
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type == 'establishment'


class IsClient(permissions.BasePermission):
    """
    Custom permission to only allow clients to access certain views.
    """
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type == 'client'
