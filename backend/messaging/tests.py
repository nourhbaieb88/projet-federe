from rest_framework.test import APIClient, APITestCase

from accounts.models import User
from establishments.models import Establishment
from .models import Conversation, Message


class MessagingApiTests(APITestCase):
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
        self.establishment = Establishment.objects.create(
            owner=self.owner_user,
            name="Cafe Medina",
            category="Cafés",
            description="Cafe convivial",
            address="Medina",
            phone="+21612345678",
            email="contact@cafemedina.tn",
            latitude=36.8065,
            longitude=10.1815,
            capacity=30,
            opening_hours={},
        )

    def test_client_can_create_conversation_and_send_message(self):
        api_client = APIClient()
        api_client.force_authenticate(user=self.client_user)

        conversation_response = api_client.post(
            "/api/messaging/conversations/",
            {"establishment": self.establishment.id},
            format="json",
        )
        self.assertEqual(conversation_response.status_code, 201)

        conversation_id = conversation_response.data["id"]
        message_response = api_client.post(
            f"/api/messaging/conversations/{conversation_id}/messages/",
            {"content": "Bonjour, avez-vous encore de la place ce soir ?"},
            format="json",
        )

        self.assertEqual(message_response.status_code, 201)
        self.assertIn("id", message_response.data)
        self.assertIn("created_at", message_response.data)
        self.assertEqual(message_response.data["content"], "Bonjour, avez-vous encore de la place ce soir ?")
        self.assertTrue(message_response.data["is_from_me"])
        self.assertEqual(Message.objects.count(), 1)
        self.assertEqual(Message.objects.first().content, "Bonjour, avez-vous encore de la place ce soir ?")

    def test_owner_can_mark_client_messages_as_read(self):
        conversation = Conversation.objects.create(
            establishment=self.establishment,
            client=self.client_user,
        )
        Message.objects.create(
            conversation=conversation,
            sender=self.client_user,
            content="Bonsoir",
        )

        api_client = APIClient()
        api_client.force_authenticate(user=self.owner_user)

        response = api_client.post(
            f"/api/messaging/conversations/{conversation.id}/mark-read/"
        )

        self.assertEqual(response.status_code, 200)
        self.assertTrue(Message.objects.first().is_read)
