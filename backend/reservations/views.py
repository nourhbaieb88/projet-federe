from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, permissions, serializers, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from establishments.models import Establishment
from messaging.models import Conversation, Message

from .models import AvailabilitySlot, Reservation
from .serializers import (
    AvailabilitySlotSerializer,
    ReservationCreateSerializer,
    ReservationSerializer,
    ReservationStatusSerializer,
)


def _format_reservation_datetime(reservation):
    return (
        f"le {reservation.date.strftime('%d/%m/%Y')} "
        f"a {reservation.time.strftime('%H:%M')}"
    )


def _build_reservation_message(reservation, actor, event):
    schedule = _format_reservation_datetime(reservation)
    guests = f"{reservation.number_of_people} personne(s)"
    reference = f"Reservation #{reservation.id}"

    if event == "created":
        message = (
            f"{reference} : nouvelle demande de reservation {schedule} pour {guests}."
        )
        if reservation.special_requests:
            message += f" Demandes speciales : {reservation.special_requests}"
        return message

    if event == Reservation.STATUS_CONFIRMED:
        return f"{reference} : votre reservation {schedule} a ete acceptee pour {guests}."

    if event == Reservation.STATUS_REJECTED:
        return f"{reference} : votre reservation {schedule} a ete refusee."

    if event == Reservation.STATUS_COMPLETED:
        return f"{reference} : votre reservation {schedule} est maintenant marquee comme terminee."

    if event == Reservation.STATUS_CANCELLED:
        if actor.user_type == "establishment":
            return f"{reference} : l'etablissement a annule votre reservation {schedule}."
        return f"{reference} : le client a annule la reservation {schedule}."

    return f"{reference} : le statut de la reservation est maintenant {reservation.get_status_display().lower()}."


def _notify_reservation_event(reservation, actor, event):
    conversation, _ = Conversation.objects.get_or_create(
        establishment=reservation.establishment,
        client=reservation.client,
    )
    Message.objects.create(
        conversation=conversation,
        sender=actor,
        content=_build_reservation_message(reservation, actor, event),
    )


class ReservationListCreateView(generics.ListCreateAPIView):
    """List reservations for the current user or create a new reservation."""

    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return ReservationCreateSerializer
        return ReservationSerializer

    def get_queryset(self):
        user = self.request.user

        if user.user_type == "client":
            return Reservation.objects.filter(client=user).select_related(
                "establishment",
                "client",
            )

        if user.user_type == "establishment":
            return Reservation.objects.filter(establishment__owner=user).select_related(
                "establishment",
                "client",
            )

        return Reservation.objects.none()

    def perform_create(self, serializer):
        reservation = serializer.save()
        _notify_reservation_event(reservation, self.request.user, "created")


class ReservationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or soft-cancel a reservation."""

    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ["PATCH", "PUT"]:
            return ReservationStatusSerializer
        return ReservationSerializer

    def get_queryset(self):
        user = self.request.user

        if user.user_type == "client":
            return Reservation.objects.filter(client=user).select_related(
                "establishment",
                "client",
            )

        if user.user_type == "establishment":
            return Reservation.objects.filter(establishment__owner=user).select_related(
                "establishment",
                "client",
            )

        return Reservation.objects.none()

    def update(self, request, *args, **kwargs):
        partial = True
        instance = self.get_object()
        previous_status = instance.status
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        new_status = serializer.validated_data.get("status")
        if not new_status:
            raise serializers.ValidationError({"status": "Ce champ est obligatoire."})

        self._validate_status_change(instance, new_status)
        serializer.save()

        if previous_status != new_status:
            _notify_reservation_event(instance, request.user, new_status)

        output = ReservationSerializer(instance, context=self.get_serializer_context())
        return Response(output.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self._validate_status_change(instance, Reservation.STATUS_CANCELLED)
        instance.status = Reservation.STATUS_CANCELLED
        instance.save(update_fields=["status", "updated_at"])
        _notify_reservation_event(instance, request.user, Reservation.STATUS_CANCELLED)
        return Response(status=status.HTTP_204_NO_CONTENT)

    def _validate_status_change(self, reservation, new_status):
        user = self.request.user

        allowed_statuses = {
            "client": {Reservation.STATUS_CANCELLED},
            "establishment": {
                Reservation.STATUS_CONFIRMED,
                Reservation.STATUS_REJECTED,
                Reservation.STATUS_CANCELLED,
                Reservation.STATUS_COMPLETED,
            },
        }
        allowed_transitions = {
            Reservation.STATUS_PENDING: {
                Reservation.STATUS_CONFIRMED,
                Reservation.STATUS_REJECTED,
                Reservation.STATUS_CANCELLED,
            },
            Reservation.STATUS_CONFIRMED: {
                Reservation.STATUS_COMPLETED,
                Reservation.STATUS_CANCELLED,
            },
            Reservation.STATUS_REJECTED: set(),
            Reservation.STATUS_CANCELLED: set(),
            Reservation.STATUS_COMPLETED: set(),
        }

        if new_status not in allowed_statuses.get(user.user_type, set()):
            raise serializers.ValidationError(
                {"status": "Transition de statut non autorisee."}
            )

        if user.user_type == "client" and reservation.status in {
            Reservation.STATUS_CANCELLED,
            Reservation.STATUS_REJECTED,
            Reservation.STATUS_COMPLETED,
        }:
            raise serializers.ValidationError(
                {"status": "Cette reservation ne peut plus etre modifiee."}
            )

        if new_status not in allowed_transitions.get(reservation.status, set()):
            raise serializers.ValidationError(
                {"status": "Cette transition n'est pas autorisee pour l'etat actuel."}
            )


class AvailabilitySlotListCreateView(generics.ListCreateAPIView):
    """List availability slots for an establishment or create new ones."""

    serializer_class = AvailabilitySlotSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        establishment_id = self.kwargs.get("establishment_id")
        queryset = AvailabilitySlot.objects.filter(establishment_id=establishment_id)

        if self.request.user.user_type == "establishment":
            queryset = queryset.filter(establishment__owner=self.request.user)

        return queryset

    def perform_create(self, serializer):
        if self.request.user.user_type != "establishment":
            raise serializers.ValidationError(
                "Seuls les gerants peuvent gerer les creneaux."
            )

        establishment_id = self.kwargs.get("establishment_id")
        establishment = get_object_or_404(
            Establishment,
            id=establishment_id,
            owner=self.request.user,
        )
        serializer.save(establishment=establishment)


class AvailabilitySlotDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete an availability slot."""

    serializer_class = AvailabilitySlotSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        establishment_id = self.kwargs.get("establishment_id")
        return AvailabilitySlot.objects.filter(
            establishment_id=establishment_id,
            establishment__owner=self.request.user,
        )


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def cancel_reservation(request, pk):
    """Compatibility endpoint for cancelling a reservation."""

    if request.user.user_type == "client":
        reservation = get_object_or_404(Reservation, pk=pk, client=request.user)
    elif request.user.user_type == "establishment":
        reservation = get_object_or_404(
            Reservation,
            pk=pk,
            establishment__owner=request.user,
        )
    else:
        return Response({"error": "Invalid user type."}, status=status.HTTP_400_BAD_REQUEST)

    if reservation.status not in {
        Reservation.STATUS_PENDING,
        Reservation.STATUS_CONFIRMED,
    }:
        raise serializers.ValidationError(
            {"status": "Cette reservation ne peut plus etre annulee."}
        )

    reservation.status = Reservation.STATUS_CANCELLED
    reservation.save(update_fields=["status", "updated_at"])
    _notify_reservation_event(reservation, request.user, Reservation.STATUS_CANCELLED)
    return Response(ReservationSerializer(reservation).data, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def reservation_stats(request):
    """Get reservation statistics for the current user."""

    user = request.user
    today = timezone.localdate()

    if user.user_type == "client":
        queryset = Reservation.objects.filter(client=user)
        return Response(
            {
                "total_reservations": queryset.count(),
                "pending_reservations": queryset.filter(
                    status=Reservation.STATUS_PENDING
                ).count(),
                "upcoming_reservations": queryset.filter(
                    date__gte=today,
                    status=Reservation.STATUS_CONFIRMED,
                ).count(),
                "past_reservations": queryset.filter(date__lt=today).count(),
            }
        )

    if user.user_type == "establishment":
        queryset = Reservation.objects.filter(establishment__owner=user)
        return Response(
            {
                "total_reservations": queryset.count(),
                "pending_reservations": queryset.filter(
                    status=Reservation.STATUS_PENDING
                ).count(),
                "rejected_reservations": queryset.filter(
                    status=Reservation.STATUS_REJECTED
                ).count(),
                "upcoming_reservations": queryset.filter(
                    date__gte=today,
                    status=Reservation.STATUS_CONFIRMED,
                ).count(),
                "today_reservations": queryset.filter(
                    date=today,
                    status=Reservation.STATUS_CONFIRMED,
                ).count(),
            }
        )

    return Response({"error": "Invalid user type."}, status=status.HTTP_400_BAD_REQUEST)
