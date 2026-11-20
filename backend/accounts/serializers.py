import base64
import uuid

from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model."""

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "user_type",
            "phone",
            "profile_image",
            "latitude",
            "longitude",
            "address",
            "is_verified",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
        extra_kwargs = {
            "password": {"write_only": True},
        }

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        instance.save()
        return instance


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""

    password = serializers.CharField(write_only=True, required=True)
    password_confirm = serializers.CharField(write_only=True, required=True)
    username = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password",
            "password_confirm",
            "first_name",
            "last_name",
            "user_type",
            "phone",
            "latitude",
            "longitude",
            "address",
        ]

    def validate(self, attrs):
        if attrs.get("password") != attrs.get("password_confirm"):
            raise serializers.ValidationError(
                "Les mots de passe ne correspondent pas."
            )

        if not attrs.get("username"):
            email = attrs.get("email", "")
            base_username = email.split("@")[0] if email else "user"
            import time

            attrs["username"] = f"{base_username}_{int(time.time())}"

        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm", None)
        user = User.objects.create_user(**validated_data)

        if user.user_type == "establishment":
            self._create_establishment_profile(user, validated_data)

        return user

    def _create_establishment_profile(self, user, validated_data):
        from establishments.models import Establishment

        request_data = self.initial_data

        establishment = Establishment.objects.create(
            owner=user,
            name=request_data.get("establishment_name", user.first_name),
            category=request_data.get("category", Establishment.CATEGORY_CHOICES[-1][0]),
            price_range=request_data.get("price_range", ""),
            capacity=int(request_data.get("capacity", 50)),
            address=validated_data.get("address", ""),
            phone=validated_data.get("phone", ""),
            email=validated_data.get("email", ""),
            latitude=validated_data.get("latitude", 0.0),
            longitude=validated_data.get("longitude", 0.0),
            description=request_data.get("description", ""),
            opening_hours=request_data.get("opening_hours", {}),
        )

        profile_image_base64 = request_data.get("establishment_profile_image_base64")
        if profile_image_base64:
            header, encoded = profile_image_base64.split(";base64,", 1)
            extension = header.split("/")[-1] or "jpg"
            establishment.profile_image.save(
                f"establishment-{establishment.pk}.{extension}",
                ContentFile(base64.b64decode(encoded)),
                save=False,
            )

        images_base64 = request_data.get("establishment_images_base64") or []
        if images_base64:
            gallery = []
            for image in images_base64:
                header, encoded = image.split(";base64,", 1)
                extension = header.split("/")[-1] or "jpg"
                path = default_storage.save(
                    f"establishments/gallery/{uuid.uuid4()}.{extension}",
                    ContentFile(base64.b64decode(encoded)),
                )
                gallery.append(f"/media/{path}".replace("\\", "/"))
            establishment.images = gallery

        if profile_image_base64 or images_base64:
            establishment.save()


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile updates."""

    profile_image_base64 = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
    )

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "user_type",
            "phone",
            "profile_image",
            "latitude",
            "longitude",
            "address",
            "is_verified",
            "updated_at",
            "profile_image_base64",
        ]
        read_only_fields = [
            "id",
            "username",
            "user_type",
            "is_verified",
            "updated_at",
        ]

    def update(self, instance, validated_data):
        profile_image_base64 = validated_data.pop("profile_image_base64", None)

        if profile_image_base64:
            header, encoded = profile_image_base64.split(";base64,", 1)
            extension = header.split("/")[-1]
            filename = f"profile-{instance.pk or uuid.uuid4()}.{extension}"
            instance.profile_image.save(
                filename,
                ContentFile(base64.b64decode(encoded)),
                save=False,
            )

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance


class EmailTokenObtainPairSerializer(serializers.Serializer):
    """JWT serializer that accepts either email or username."""

    email = serializers.EmailField(required=False)
    username = serializers.CharField(required=False)
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        login_identifier = attrs.get("email") or attrs.get("username")
        password = attrs.get("password")

        if not login_identifier or not password:
            raise serializers.ValidationError(
                {
                    "detail": (
                        "Veuillez fournir un email (ou un nom d'utilisateur) "
                        "et un mot de passe."
                    )
                }
            )

        user = User.objects.filter(email__iexact=login_identifier).first()
        authenticated_user = authenticate(
            username=user.username if user else login_identifier,
            password=password,
        )

        if authenticated_user is None:
            raise serializers.ValidationError({"detail": "Identifiants invalides."})

        refresh = RefreshToken.for_user(authenticated_user)

        return {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": UserSerializer(
                authenticated_user,
                context=self.context,
            ).data,
        }


class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer for requesting a password reset email."""

    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer for resetting a password with a secure token."""

    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True)
    new_password_confirm = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs["new_password"] != attrs["new_password_confirm"]:
            raise serializers.ValidationError(
                {"new_password_confirm": "Les mots de passe ne correspondent pas."}
            )

        validate_password(attrs["new_password"])
        return attrs
