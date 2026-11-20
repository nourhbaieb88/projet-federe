from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from .models import AvailabilitySlot, Reservation


def _raise_rest_validation_error(error):
    if hasattr(error, "message_dict"):
        raise serializers.ValidationError(error.message_dict)

    raise serializers.ValidationError({"detail": error.messages})


class AvailabilitySlotSerializer(serializers.ModelSerializer):
    """Serializer for availability slots."""

    class Meta:
        model = AvailabilitySlot
        fields = [
            "id",
            "establishment",
            "date",
            "time",
            "is_available",
            "max_capacity",
            "current_bookings",
        ]
        read_only_fields = ["id", "current_bookings"]


class ReservationSerializer(serializers.ModelSerializer):
    """Serializer for reservations."""

    establishment_name = serializers.CharField(source="establishment.name", read_only=True)
    client_name = serializers.CharField(source="client.get_full_name", read_only=True)
    client_username = serializers.CharField(source="client.username", read_only=True)
    client_email = serializers.EmailField(source="client.email", read_only=True)
    client_phone = serializers.CharField(source="client.phone", read_only=True)
    status_label = serializers.SerializerMethodField()
    slot_reserved_people = serializers.IntegerField(read_only=True)
    remaining_capacity = serializers.IntegerField(read_only=True)
    slot_capacity = serializers.IntegerField(read_only=True)
    can_cancel = serializers.SerializerMethodField()

    class Meta:
        model = Reservation
        fields = [
            "id",
            "client",
            "client_name",
            "client_username",
            "client_email",
            "client_phone",
            "establishment",
            "establishment_name",
            "date",
            "time",
            "number_of_people",
            "special_requests",
            "status",
            "status_label",
            "slot_reserved_people",
            "remaining_capacity",
            "slot_capacity",
            "can_cancel",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "client", "created_at", "updated_at"]

    def get_status_label(self, obj):
        return obj.get_status_display()

    def get_can_cancel(self, obj):
        return obj.status in {
            Reservation.STATUS_PENDING,
            Reservation.STATUS_CONFIRMED,
        }


class ReservationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating reservations."""

    class Meta:
        model = Reservation
        fields = [
            "establishment",
            "date",
            "time",
            "number_of_people",
            "special_requests",
        ]

    def validate(self, data):
        request = self.context.get("request")
        establishment = data.get("establishment")

        if request and hasattr(request, "user"):
            if request.user.user_type != "client":
                raise serializers.ValidationError(
                    "Seuls les clients peuvent effectuer une reservation."
                )

            if establishment and request.user == establishment.owner:
                raise serializers.ValidationError(
                    "Vous ne pouvez pas reserver dans votre propre etablissement."
                )

        return data

    def create(self, validated_data):
        validated_data["client"] = self.context["request"].user
        try:
            return super().create(validated_data)
        except DjangoValidationError as error:
            _raise_rest_validation_error(error)


class ReservationStatusSerializer(serializers.ModelSerializer):
    """Serializer for reservation status updates."""

    class Meta:
        model = Reservation
        fields = ["status"]

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        try:
            instance.save()
        except DjangoValidationError as error:
            _raise_rest_validation_error(error)

        return instance
