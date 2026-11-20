from datetime import datetime

from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.db import models
from django.db.models import Sum
from django.utils import timezone

from accounts.models import User
from establishments.models import Establishment


class Reservation(models.Model):
    """Model for reservations."""

    STATUS_PENDING = "pending"
    STATUS_CONFIRMED = "confirmed"
    STATUS_REJECTED = "rejected"
    STATUS_CANCELLED = "cancelled"
    STATUS_COMPLETED = "completed"

    ACTIVE_STATUSES = [STATUS_PENDING, STATUS_CONFIRMED]

    STATUS_CHOICES = [
        (STATUS_PENDING, "En attente"),
        (STATUS_CONFIRMED, "Confirmee"),
        (STATUS_REJECTED, "Refusee"),
        (STATUS_CANCELLED, "Annulee"),
        (STATUS_COMPLETED, "Terminee"),
    ]

    establishment = models.ForeignKey(
        Establishment,
        on_delete=models.CASCADE,
        related_name="reservations",
        verbose_name="Etablissement",
    )
    client = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="reservations",
        verbose_name="Client",
    )
    date = models.DateField(verbose_name="Date")
    time = models.TimeField(verbose_name="Heure")
    number_of_people = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1)],
        verbose_name="Nombre de personnes",
    )
    special_requests = models.TextField(
        blank=True,
        verbose_name="Demandes speciales",
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_PENDING,
        verbose_name="Statut",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Reservation"
        verbose_name_plural = "Reservations"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Reservation de {self.client.username} chez {self.establishment.name}"

    @property
    def slot_capacity(self):
        return int(self.establishment.capacity or 0)

    @property
    def slot_reserved_people(self):
        total = (
            Reservation.objects.filter(
                establishment=self.establishment,
                date=self.date,
                time=self.time,
                status__in=self.ACTIVE_STATUSES,
            )
            .aggregate(total=Sum("number_of_people"))
            .get("total")
            or 0
        )
        return int(total)

    @property
    def remaining_capacity(self):
        return max(self.slot_capacity - self.slot_reserved_people, 0)

    def clean(self):
        """Validate reservation data."""

        if self.status not in self.ACTIVE_STATUSES:
            return

        today = timezone.localdate()

        if self.date and self.date < today:
            raise ValidationError("La date de reservation ne peut pas etre dans le passe.")

        if self.date == today and self.time:
            current_time = timezone.localtime().time().replace(second=0, microsecond=0)
            if self.time < current_time:
                raise ValidationError(
                    "L'heure de reservation ne peut pas etre deja passee."
                )

        if self.number_of_people > self.establishment.capacity:
            raise ValidationError(
                "Le nombre de personnes depasse la capacite de l'etablissement."
            )

        if self.date and self.time:
            opening_hours = self.establishment.opening_hours or {}
            day_name = self.date.strftime("%A").lower()

            if day_name in opening_hours:
                day_hours = opening_hours[day_name]
                if day_hours.get("closed", False):
                    raise ValidationError("L'etablissement est ferme ce jour-la.")

                open_time = self._parse_opening_time(day_hours.get("open"))
                close_time = self._parse_opening_time(day_hours.get("close"))

                if open_time and self.time < open_time:
                    raise ValidationError("L'etablissement n'est pas encore ouvert a cette heure.")

                if close_time and self.time > close_time:
                    raise ValidationError("L'etablissement n'est pas ouvert a cette heure.")

        current_bookings = (
            Reservation.objects.filter(
                establishment=self.establishment,
                date=self.date,
                time=self.time,
                status__in=self.ACTIVE_STATUSES,
            )
            .exclude(pk=self.pk)
            .aggregate(total=Sum("number_of_people"))
            .get("total")
            or 0
        )

        if current_bookings + self.number_of_people > self.establishment.capacity:
            raise ValidationError("Ce creneau ne dispose plus d'assez de places.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    @staticmethod
    def _parse_opening_time(value):
        if not value:
            return None
        if isinstance(value, str):
            return datetime.strptime(value[:5], "%H:%M").time()
        return value


class AvailabilitySlot(models.Model):
    """Model for availability slots management."""

    establishment = models.ForeignKey(
        Establishment,
        on_delete=models.CASCADE,
        related_name="availability_slots",
        verbose_name="Etablissement",
    )
    date = models.DateField(verbose_name="Date")
    time = models.TimeField(verbose_name="Heure")
    is_available = models.BooleanField(default=True, verbose_name="Disponible")
    max_capacity = models.PositiveIntegerField(default=1, verbose_name="Capacite maximale")
    current_bookings = models.PositiveIntegerField(default=0, verbose_name="Reservations actuelles")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Creneau de disponibilite"
        verbose_name_plural = "Creneaux de disponibilite"
        unique_together = ["establishment", "date", "time"]
        ordering = ["date", "time"]

    def __str__(self):
        return f"{self.establishment.name} - {self.date} {self.time}"

    @property
    def is_fully_booked(self):
        return self.current_bookings >= self.max_capacity

    def can_book(self, number_of_people=1):
        return self.is_available and (self.current_bookings + number_of_people) <= self.max_capacity
