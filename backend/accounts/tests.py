from django.core import mail
from django.test import override_settings
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from rest_framework.test import APITestCase

from establishments.models import Establishment

from .models import User
from .views import password_reset_token_generator


class AuthApiTests(APITestCase):
    def test_login_accepts_email_and_returns_tokens(self):
        user = User.objects.create_user(
            username="client_demo",
            email="client@example.com",
            password="Password123!",
            user_type="client",
        )

        response = self.client.post(
            "/api/accounts/token/",
            {"email": user.email, "password": "Password123!"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertEqual(response.data["user"]["email"], user.email)

    def test_registration_creates_user_and_tokens(self):
        payload = {
            "first_name": "Test",
            "last_name": "User",
            "email": "new-user@example.com",
            "password": "Password123!",
            "password_confirm": "Password123!",
            "phone": "+21612345678",
            "user_type": "client",
            "latitude": 36.8065,
            "longitude": 10.1815,
            "address": "Tunis Center",
        }

        response = self.client.post("/api/accounts/users/", payload, format="json")

        self.assertEqual(response.status_code, 201)
        self.assertTrue(User.objects.filter(email=payload["email"]).exists())
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    @override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
    def test_registration_sends_welcome_email(self):
        payload = {
            "first_name": "Welcome",
            "last_name": "User",
            "email": "welcome@example.com",
            "password": "Password123!",
            "password_confirm": "Password123!",
            "phone": "+21612345678",
            "user_type": "client",
            "latitude": 36.8065,
            "longitude": 10.1815,
            "address": "Tunis Center",
        }

        response = self.client.post("/api/accounts/users/", payload, format="json")

        self.assertEqual(response.status_code, 201)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("Bienvenue sur CityReserve", mail.outbox[0].subject)
        self.assertIn(payload["email"], mail.outbox[0].to)

    def test_establishment_registration_creates_establishment_profile(self):
        payload = {
            "first_name": "Le",
            "last_name": "Jardin",
            "email": "partner@example.com",
            "password": "Password123!",
            "password_confirm": "Password123!",
            "phone": "+21612345678",
            "user_type": "establishment",
            "latitude": 36.8065,
            "longitude": 10.1815,
            "address": "Centre-ville",
            "establishment_name": "Le Jardin",
            "category": "Restaurants",
            "description": "Cuisine tunisienne",
            "price_range": "â‚¬â‚¬ - Moyen",
            "capacity": 20,
            "opening_hours": {
                "monday": {"open": "09:00", "close": "18:00", "closed": False}
            },
        }

        response = self.client.post("/api/accounts/users/", payload, format="json")

        self.assertEqual(response.status_code, 201)
        user = User.objects.get(email=payload["email"])
        establishment = Establishment.objects.get(owner=user)
        self.assertEqual(establishment.name, payload["establishment_name"])
        self.assertEqual(establishment.category, payload["category"])

    @override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
    def test_password_reset_request_sends_email_with_reset_link(self):
        user = User.objects.create_user(
            username="reset_user",
            email="reset@example.com",
            password="Password123!",
            user_type="client",
        )

        response = self.client.post(
            "/api/accounts/password-reset/request/",
            {"email": user.email},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("/reset-password?uid=", mail.outbox[0].body)
        self.assertIn(user.email, mail.outbox[0].to)

    def test_password_reset_confirm_updates_password(self):
        user = User.objects.create_user(
            username="reset_confirm_user",
            email="confirm@example.com",
            password="OldPassword123!",
            user_type="client",
        )
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = password_reset_token_generator.make_token(user)

        response = self.client.post(
            "/api/accounts/password-reset/confirm/",
            {
                "uid": uid,
                "token": token,
                "new_password": "NewPassword123!",
                "new_password_confirm": "NewPassword123!",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        user.refresh_from_db()
        self.assertTrue(user.check_password("NewPassword123!"))
