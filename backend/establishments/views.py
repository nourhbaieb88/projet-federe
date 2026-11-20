from math import cos, radians

from django.db.models import Q
from rest_framework import generics, permissions, serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from accounts.permissions import IsOwnerOrReadOnly
from .models import Establishment, Review, Service
from .serializers import (
    EstablishmentCreateSerializer,
    EstablishmentListSerializer,
    EstablishmentSerializer,
    ReviewSerializer,
    ServiceSerializer,
)


class EstablishmentListCreateView(generics.ListCreateAPIView):
    """List all establishments or create a new one."""

    queryset = Establishment.objects.filter(is_active=True).select_related("owner")
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return EstablishmentCreateSerializer
        return EstablishmentListSerializer

    def get_queryset(self):
        queryset = Establishment.objects.filter(is_active=True).select_related("owner")

        category = self.request.query_params.get("category")
        if category:
            queryset = queryset.filter(category=category)

        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search)
                | Q(description__icontains=search)
                | Q(address__icontains=search)
            )

        price_range = self.request.query_params.get("price_range")
        if price_range:
            queryset = queryset.filter(price_range=price_range)

        owner_id = self.request.query_params.get("owner")
        if owner_id:
            queryset = queryset.filter(owner_id=owner_id)

        lat = self.request.query_params.get("lat")
        lng = self.request.query_params.get("lng")
        radius = self.request.query_params.get("radius")
        if lat and lng and radius:
            try:
                lat_float = float(lat)
                lng_float = float(lng)
                radius_float = float(radius)
                lat_delta = radius_float / 111.0
                lng_divisor = max(0.1, 111.320 * abs(cos(radians(lat_float))))
                lng_delta = radius_float / lng_divisor

                queryset = queryset.filter(
                    latitude__range=(lat_float - lat_delta, lat_float + lat_delta),
                    longitude__range=(lng_float - lng_delta, lng_float + lng_delta),
                )
            except (TypeError, ValueError):
                pass

        order_by = self.request.query_params.get("order_by", "rating")
        if order_by == "distance":
            return queryset.order_by("-rating", "-total_reviews")
        return queryset.order_by("-rating", "-total_reviews")

    def perform_create(self, serializer):
        if self.request.user.user_type != "establishment":
            raise PermissionDenied("Seuls les gerants peuvent creer un etablissement.")
        serializer.save()


class EstablishmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete an establishment."""

    queryset = Establishment.objects.select_related("owner").prefetch_related(
        "reviews",
        "services",
    )
    serializer_class = EstablishmentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]


class MyEstablishmentView(generics.RetrieveAPIView):
    """Retrieve the authenticated owner's establishment."""

    serializer_class = EstablishmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return generics.get_object_or_404(Establishment, owner=self.request.user)


class EstablishmentReviewsView(generics.ListCreateAPIView):
    """List reviews for an establishment or create a new review."""

    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        establishment_id = self.kwargs["establishment_id"]
        return Review.objects.filter(establishment_id=establishment_id).select_related(
            "user",
            "establishment",
        )

    def perform_create(self, serializer):
        establishment_id = self.kwargs["establishment_id"]
        establishment = generics.get_object_or_404(Establishment, id=establishment_id)

        if self.request.user.user_type != "client":
            raise PermissionDenied("Seuls les clients peuvent laisser un avis.")

        if establishment.owner == self.request.user:
            raise PermissionDenied("Vous ne pouvez pas noter votre propre etablissement.")

        serializer.save(user=self.request.user, establishment=establishment)


class EstablishmentReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a review."""

    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]

    def get_queryset(self):
        establishment_id = self.kwargs["establishment_id"]
        return Review.objects.filter(
            establishment_id=establishment_id,
            user=self.request.user,
        ).select_related("user", "establishment")


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def establishment_categories(request):
    """Get all available establishment categories."""

    categories = [
        {"value": choice[0], "label": choice[1]}
        for choice in Establishment.CATEGORY_CHOICES
    ]
    return Response(categories)


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def establishment_price_ranges(request):
    """Get all available price ranges."""

    price_ranges = [
        {"value": choice[0], "label": choice[1]}
        for choice in Establishment.PRICE_RANGE_CHOICES
    ]
    return Response(price_ranges)


class ServiceListCreateView(generics.ListCreateAPIView):
    """List all services or create a new one."""

    queryset = Service.objects.all().select_related("establishment")
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Service.objects.filter(is_active=True).select_related("establishment")
        establishment_id = self.request.query_params.get("establishment")
        if establishment_id:
            queryset = queryset.filter(establishment_id=establishment_id)
        return queryset

    def perform_create(self, serializer):
        if self.request.user.user_type != "establishment":
            raise PermissionDenied("Seuls les gerants peuvent ajouter un service.")
        establishment = generics.get_object_or_404(Establishment, owner=self.request.user)
        serializer.save(establishment=establishment)


class EstablishmentServicesView(generics.ListAPIView):
    """List services for a single establishment."""

    serializer_class = ServiceSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        establishment_id = self.kwargs["establishment_id"]
        return Service.objects.filter(
            establishment_id=establishment_id,
            is_active=True,
        ).select_related("establishment").order_by("name")


class ServiceDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a service."""

    queryset = Service.objects.select_related("establishment", "establishment__owner")
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_update(self, serializer):
        service = self.get_object()
        if service.establishment.owner != self.request.user:
            raise permissions.PermissionDenied("You do not own this establishment.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.establishment.owner != self.request.user:
            raise permissions.PermissionDenied("You do not own this establishment.")
        instance.delete()


class ReviewListCreateView(generics.ListCreateAPIView):
    """List all reviews globally or create a new review."""

    queryset = Review.objects.all().select_related("user", "establishment")
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Review.objects.all().select_related("user", "establishment")
        establishment_id = self.request.query_params.get("establishment")
        user_id = self.request.query_params.get("user")
        if establishment_id:
            queryset = queryset.filter(establishment_id=establishment_id)
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        return queryset

    def perform_create(self, serializer):
        establishment_id = self.request.data.get("establishment")
        if not establishment_id:
            raise serializers.ValidationError(
                {"establishment": "This field is required."}
            )
        establishment = generics.get_object_or_404(Establishment, id=establishment_id)

        if self.request.user.user_type != "client":
            raise PermissionDenied("Seuls les clients peuvent laisser un avis.")

        if establishment.owner == self.request.user:
            raise PermissionDenied("Vous ne pouvez pas noter votre propre etablissement.")

        serializer.save(user=self.request.user, establishment=establishment)


class ReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a review globally."""

    queryset = Review.objects.all().select_related("user", "establishment")
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_update(self, serializer):
        review = self.get_object()
        if review.user != self.request.user:
            raise permissions.PermissionDenied("You did not write this review.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.user != self.request.user:
            raise permissions.PermissionDenied("You did not write this review.")
        instance.delete()
