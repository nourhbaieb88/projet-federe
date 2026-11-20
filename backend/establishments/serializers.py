import base64
import uuid

from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from rest_framework import serializers

from .models import Establishment, Review, Service


def _decode_base64_image(data):
    try:
        header, encoded = data.split(";base64,", 1)
    except ValueError as error:
        raise serializers.ValidationError("Format d'image invalide.") from error

    extension = header.split("/")[-1] or "jpg"
    return extension, ContentFile(base64.b64decode(encoded))


def _save_gallery_image(data):
    extension, content = _decode_base64_image(data)
    path = default_storage.save(
        f"establishments/gallery/{uuid.uuid4()}.{extension}",
        content,
    )
    return f"{settings.MEDIA_URL}{path}".replace("\\", "/")


def _absolute_media_url(request, value):
    if not value or not request or str(value).startswith("http"):
        return value
    return request.build_absolute_uri(value)


class ReviewSerializer(serializers.ModelSerializer):
    """Serializer for reviews."""

    user_name = serializers.CharField(source="user.get_full_name", read_only=True)
    user_username = serializers.CharField(source="user.username", read_only=True)
    establishment_name = serializers.CharField(
        source="establishment.name",
        read_only=True,
    )

    class Meta:
        model = Review
        fields = [
            "id",
            "establishment",
            "establishment_name",
            "user",
            "user_name",
            "user_username",
            "rating",
            "comment",
            "created_at",
        ]
        read_only_fields = ["id", "establishment", "user", "created_at"]


class ServiceSerializer(serializers.ModelSerializer):
    """Serializer for services."""

    establishment_name = serializers.CharField(
        source="establishment.name",
        read_only=True,
    )

    class Meta:
        model = Service
        fields = [
            "id",
            "establishment",
            "establishment_name",
            "name",
            "description",
            "price",
            "duration",
            "is_active",
            "created_at",
        ]
        read_only_fields = ["id", "establishment", "created_at"]


class EstablishmentSerializer(serializers.ModelSerializer):
    """Serializer for establishments."""

    owner_name = serializers.CharField(source="owner.get_full_name", read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    average_rating = serializers.SerializerMethodField()
    title = serializers.CharField(source="name", read_only=True)
    location = serializers.CharField(source="address", read_only=True)
    lat = serializers.SerializerMethodField()
    lng = serializers.SerializerMethodField()
    profile_image_base64 = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
    )
    images_base64 = serializers.ListField(
        child=serializers.CharField(),
        write_only=True,
        required=False,
    )

    class Meta:
        model = Establishment
        fields = [
            "id",
            "owner",
            "owner_name",
            "name",
            "category",
            "description",
            "address",
            "phone",
            "email",
            "latitude",
            "longitude",
            "price_range",
            "capacity",
            "opening_hours",
            "profile_image",
            "images",
            "rating",
            "total_reviews",
            "average_rating",
            "reviews",
            "is_active",
            "is_verified",
            "created_at",
            "title",
            "location",
            "lat",
            "lng",
            "profile_image_base64",
            "images_base64",
        ]
        read_only_fields = [
            "id",
            "owner",
            "rating",
            "total_reviews",
            "average_rating",
            "reviews",
            "created_at",
            "profile_image",
            "images",
        ]

    def get_average_rating(self, obj):
        return float(obj.rating or 0)

    def get_lat(self, obj):
        return float(obj.latitude) if obj.latitude is not None else None

    def get_lng(self, obj):
        return float(obj.longitude) if obj.longitude is not None else None

    def update(self, instance, validated_data):
        profile_image_base64 = validated_data.pop("profile_image_base64", "")
        images_base64 = validated_data.pop("images_base64", None)

        if profile_image_base64:
            extension, content = _decode_base64_image(profile_image_base64)
            instance.profile_image.save(
                f"establishment-{instance.pk or uuid.uuid4()}.{extension}",
                content,
                save=False,
            )

        if images_base64 is not None:
            instance.images = [
                _save_gallery_image(image)
                for image in images_base64
                if image
            ]

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get("request")
        data["images"] = [
            _absolute_media_url(request, image)
            for image in (data.get("images") or [])
        ]
        return data


class EstablishmentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating establishments."""

    profile_image_base64 = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
    )
    images_base64 = serializers.ListField(
        child=serializers.CharField(),
        write_only=True,
        required=False,
    )

    class Meta:
        model = Establishment
        fields = [
            "name",
            "category",
            "description",
            "address",
            "phone",
            "email",
            "latitude",
            "longitude",
            "price_range",
            "capacity",
            "opening_hours",
            "profile_image",
            "images",
            "profile_image_base64",
            "images_base64",
        ]
        read_only_fields = ["profile_image", "images"]

    def validate(self, attrs):
        request = self.context.get("request")
        if request and hasattr(request, "user"):
            if request.user.user_type != "establishment":
                raise serializers.ValidationError(
                    "Seuls les comptes etablissement peuvent creer un etablissement."
                )

            if Establishment.objects.filter(owner=request.user).exists():
                raise serializers.ValidationError(
                    "Un seul etablissement est autorise par compte."
                )
        return attrs

    def create(self, validated_data):
        profile_image_base64 = validated_data.pop("profile_image_base64", "")
        images_base64 = validated_data.pop("images_base64", None)
        validated_data["owner"] = self.context["request"].user
        establishment = super().create(validated_data)

        if profile_image_base64:
            extension, content = _decode_base64_image(profile_image_base64)
            establishment.profile_image.save(
                f"establishment-{establishment.pk}.{extension}",
                content,
                save=False,
            )

        if images_base64 is not None:
            establishment.images = [
                _save_gallery_image(image)
                for image in images_base64
                if image
            ]

        if profile_image_base64 or images_base64 is not None:
            establishment.save()

        return establishment


class EstablishmentListSerializer(serializers.ModelSerializer):
    """Serializer for establishment list view."""

    owner_name = serializers.CharField(source="owner.get_full_name", read_only=True)
    distance = serializers.FloatField(read_only=True)
    title = serializers.CharField(source="name", read_only=True)
    location = serializers.CharField(source="address", read_only=True)
    lat = serializers.SerializerMethodField()
    lng = serializers.SerializerMethodField()

    class Meta:
        model = Establishment
        fields = [
            "id",
            "owner",
            "name",
            "title",
            "category",
            "address",
            "location",
            "phone",
            "latitude",
            "longitude",
            "lat",
            "lng",
            "price_range",
            "rating",
            "total_reviews",
            "profile_image",
            "distance",
            "owner_name",
        ]

    def get_lat(self, obj):
        return float(obj.latitude) if obj.latitude is not None else None

    def get_lng(self, obj):
        return float(obj.longitude) if obj.longitude is not None else None
