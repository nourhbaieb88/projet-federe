from datetime import datetime, time, timedelta
from unittest.mock import patch

from django.utils import timezone
from rest_framework.test import APIClient, APITestCase

from accounts.models import User
from establishments.models import Establishment
from messaging.models import Conversation, Message

from .models import Reservation


class ReservationApiTests(APITestCase):
    def setUp(self):
        self.client_user = User.objects.create_user(
            username="client_user",
            email="client@example.com",
            password="Password123!",
            user_type="client",
        )
        self.owner_user = User.objects.create_user(
            username="owner_user",
            email="owner@example.com",
            password="Password123!",
            user_type="establishment",
        )

        self.future_date = timezone.localdate() + timedelta(days=1)
        self.opening_hours = {
            self.future_date.strftime("%A").lower(): {
                "open": "09:00",
                "close": "18:00",
                "closed": False,
            }
        }

        self.establishment = Establishment.objects.create(
            owner=self.owner_user,
            name="Le Jardin",
            category="Restaurants",
            description="Cuisine tunisienne",
            address="Centre-ville",
            phone="+21612345678",
            email="contact@lejardin.tn",
            latitude=36.8065,
            longitude=10.1815,
            price_range="â‚¬â‚¬ - Moyen",
            capacity=10,
            opening_hours=self.opening_hours,
        )

    def test_client_can_create_reservation_and_owner_receives_notification(self):
        api_client = APIClient()
        api_client.force_authenticate(user=self.client_user)

        response = api_client.post(
            "/api/reservations/",
            {
                "establishment": self.establishment.id,
                "date": self.future_date.isoformat(),
                "time": "10:00",
                "number_of_people": 4,
                "special_requests": "Table en terrasse",
            },
            format="json",
        )

        reservation = Reservation.objects.first()
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Reservation.objects.count(), 1)
        self.assertEqual(reservation.status, Reservation.STATUS_PENDING)
        self.assertEqual(Conversation.objects.count(), 1)
        self.assertEqual(Message.objects.count(), 1)
        self.assertEqual(Message.objects.first().sender, self.client_user)
        self.assertIn("nouvelle demande de reservation", Message.objects.first().content.lower())

    def test_establishment_owner_can_confirm_reservation(self):
        reservation = Reservation.objects.create(
            establishment=self.establishment,
            client=self.client_user,
            date=self.future_date,
            time="11:00",
            number_of_people=2,
        )

        api_client = APIClient()
        api_client.force_authenticate(user=self.owner_user)

        response = api_client.patch(
            f"/api/reservations/{reservation.id}/",
            {"status": Reservation.STATUS_CONFIRMED},
            format="json",
        )

        reservation.refresh_from_db()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(reservation.status, Reservation.STATUS_CONFIRMED)
        self.assertEqual(Message.objects.count(), 1)
        self.assertIn("a ete acceptee", Message.objects.first().content.lower())

    def test_establishment_owner_can_reject_reservation(self):
        reservation = Reservation.objects.create(
            establishment=self.establishment,
            client=self.client_user,
            date=self.future_date,
            time="11:30",
            number_of_people=2,
        )

        api_client = APIClient()
        api_client.force_authenticate(user=self.owner_user)

        response = api_client.patch(
            f"/api/reservations/{reservation.id}/",
            {"status": Reservation.STATUS_REJECTED},
            format="json",
        )

        reservation.refresh_from_db()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(reservation.status, Reservation.STATUS_REJECTED)
        self.assertEqual(Message.objects.count(), 1)
        self.assertIn("a ete refusee", Message.objects.first().content.lower())

    def test_client_can_cancel_reservation(self):
        reservation = Reservation.objects.create(
            establishment=self.establishment,
            client=self.client_user,
            date=self.future_date,
            time="12:00",
            number_of_people=2,
        )

        api_client = APIClient()
        api_client.force_authenticate(user=self.client_user)

        response = api_client.post(f"/api/reservations/{reservation.id}/cancel/")

        reservation.refresh_from_db()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(reservation.status, Reservation.STATUS_CANCELLED)
        self.assertEqual(Message.objects.count(), 1)
        self.assertIn("a annule", Message.objects.first().content.lower())

    def test_owner_cannot_complete_pending_reservation_directly(self):
        reservation = Reservation.objects.create(
            establishment=self.establishment,
            client=self.client_user,
            date=self.future_date,
            time="13:00",
            number_of_people=2,
        )

        api_client = APIClient()
        api_client.force_authenticate(user=self.owner_user)

        response = api_client.patch(
            f"/api/reservations/{reservation.id}/",
            {"status": Reservation.STATUS_COMPLETED},
            format="json",
        )

        reservation.refresh_from_db()
        self.assertEqual(response.status_code, 400)
        self.assertEqual(reservation.status, Reservation.STATUS_PENDING)

    def test_invalid_reservation_time_returns_400_instead_of_500(self):
        api_client = APIClient()
        api_client.force_authenticate(user=self.client_user)

        response = api_client.post(
            "/api/reservations/",
            {
                "establishment": self.establishment.id,
                "date": self.future_date.isoformat(),
                "time": "08:00",
                "number_of_people": 2,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("__all__", response.data)

    def test_client_cannot_create_reservation_in_past_today(self):
        fixed_date = timezone.localdate() + timedelta(days=2)
        fixed_now = timezone.make_aware(datetime.combine(fixed_date, time(15, 0)))
        self.establishment.opening_hours = {
            fixed_date.strftime("%A").lower(): {
                "open": "00:00",
                "close": "23:59",
                "closed": False,
            }
        }
        self.establishment.save(update_fields=["opening_hours", "updated_at"])

        api_client = APIClient()
        api_client.force_authenticate(user=self.client_user)

        with patch("reservations.models.timezone.localdate", return_value=fixed_date), patch(
            "reservations.models.timezone.localtime", return_value=fixed_now
        ):
            response = api_client.post(
                "/api/reservations/",
                {
                    "establishment": self.establishment.id,
                    "date": fixed_date.isoformat(),
                    "time": "14:30",
                    "number_of_people": 2,
                },
                format="json",
            )

        self.assertEqual(response.status_code, 400)
        self.assertIn("__all__", response.data)

    def test_list_exposes_remaining_capacity_and_status_label(self):
        Reservation.objects.create(
            establishment=self.establishment,
            client=self.client_user,
            date=self.future_date,
            time="14:00",
            number_of_people=4,
        )

        second_client = User.objects.create_user(
            username="client_two",
            email="client2@example.com",
            password="Password123!",
            user_type="client",
        )
        Reservation.objects.create(
            establishment=self.establishment,
            client=second_client,
            date=self.future_date,
            time="14:00",
            number_of_people=3,
            status=Reservation.STATUS_CONFIRMED,
        )

        api_client = APIClient()
        api_client.force_authenticate(user=self.owner_user)

        response = api_client.get("/api/reservations/")

        self.assertEqual(response.status_code, 200)
        results = response.data.get("results", response.data)
        slot = next(
            item
            for item in results
            if item["time"].startswith("14:00") and item["status"] == Reservation.STATUS_PENDING
        )
        self.assertEqual(slot["slot_reserved_people"], 7)
        self.assertEqual(slot["remaining_capacity"], 3)
        self.assertEqual(slot["status_label"], "En attente")
