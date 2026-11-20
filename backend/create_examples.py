import os

import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "cityreserve_backend.settings")
django.setup()

from accounts.models import User
from establishments.models import Establishment, Review, Service


DEFAULT_OPENING_HOURS = {
    "monday": {"open": "09:00", "close": "22:00", "closed": False},
    "tuesday": {"open": "09:00", "close": "22:00", "closed": False},
    "wednesday": {"open": "09:00", "close": "22:00", "closed": False},
    "thursday": {"open": "09:00", "close": "22:00", "closed": False},
    "friday": {"open": "09:00", "close": "23:00", "closed": False},
    "saturday": {"open": "10:00", "close": "23:00", "closed": False},
    "sunday": {"open": "10:00", "close": "18:00", "closed": False},
}

EXAMPLES = [
    {
        "username": "demo_restaurant_owner",
        "email": "restaurant.demo@cityreserve.tn",
        "name": "Dar El Medina",
        "category": "Restaurants",
        "description": "Restaurant tunisien pour familles, groupes et diners prives.",
        "address": "Rue Sidi Ben Arous, Medina de Tunis",
        "phone": "+216 71 560 916",
        "latitude": 36.798900,
        "longitude": 10.171600,
        "price_range": "20-50 TND - Moyen",
        "capacity": 80,
        "images": [
            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80",
        ],
        "services": [
            ("Menu tunisien complet", "Entree, plat, dessert et the a la menthe.", 42, 90),
            ("Reservation groupe", "Table preparee pour anniversaires et sorties equipe.", 75, 120),
        ],
        "reviews": [
            ("Nour", 5, "Service rapide et ambiance parfaite."),
            ("Sarra", 4, "Le parcours de reservation est tres clair."),
            ("Mehdi", 5, "Tres bon accueil, la table etait prete a l'heure."),
            ("Ines", 5, "Plats genereux et cadre agreable pour une sortie en famille."),
        ],
    },
    {
        "username": "demo_cafe_owner",
        "email": "cafe.demo@cityreserve.tn",
        "name": "Cafe Lac 1",
        "category": "Caf\u00e9s",
        "description": "Cafe moderne pour rendez-vous, travail calme et pauses rapides.",
        "address": "Les Berges du Lac, Tunis",
        "phone": "+216 70 245 110",
        "latitude": 36.842600,
        "longitude": 10.238200,
        "price_range": "0-20 TND - Budget",
        "capacity": 45,
        "images": [
            "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&q=80",
        ],
        "services": [
            ("Table coworking", "Table avec prise et Wi-Fi.", 12, 120),
            ("Pack cafe + patisserie", "Formule rapide pour deux personnes.", 18, 45),
        ],
        "reviews": [
            ("Amine", 5, "Tres bon spot pour trouver une table rapidement."),
            ("Rania", 4, "Endroit calme, parfait pour travailler deux heures."),
            ("Omar", 5, "Reservation simple et personnel attentif."),
        ],
    },
    {
        "username": "demo_library_owner",
        "email": "bibliotheque.demo@cityreserve.tn",
        "name": "Bibliotheque Pilote Sfax",
        "category": "Biblioth\u00e8ques",
        "description": "Espace calme pour revision, lecture et salles de groupe.",
        "address": "Jardin Public, Sfax",
        "phone": "+216 74 228 310",
        "latitude": 34.739800,
        "longitude": 10.760000,
        "price_range": "0-20 TND - Budget",
        "capacity": 120,
        "images": [
            "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80",
        ],
        "services": [
            ("Place de revision", "Reservation d'une place silencieuse.", 5, 180),
            ("Salle de groupe", "Salle pour revision collective.", 20, 120),
        ],
        "reviews": [
            ("Mariem", 5, "Espace silencieux, tres utile pendant les revisions."),
            ("Ahmed", 4, "La reservation de salle evite l'attente."),
        ],
    },
    {
        "username": "demo_sport_owner",
        "email": "sport.demo@cityreserve.tn",
        "name": "Sousse Foot Arena",
        "category": "Terrains de sport",
        "description": "Terrains de mini-foot avec vestiaires et eclairage nocturne.",
        "address": "Route touristique, Sousse",
        "phone": "+216 73 401 920",
        "latitude": 35.843900,
        "longitude": 10.626500,
        "price_range": "50-100 TND - Premium",
        "capacity": 60,
        "images": [
            "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&q=80",
        ],
        "services": [
            ("Terrain 5v5", "Location une heure avec ballon inclus.", 70, 60),
            ("Terrain 7v7", "Creneau premium en soiree.", 110, 90),
        ],
        "reviews": [
            ("Youssef", 5, "Le choix de l'heure est simple et rapide."),
            ("Karim", 5, "Terrain propre, bon eclairage en soiree."),
            ("Hatem", 4, "Bon systeme pour organiser le match entre amis."),
        ],
    },
    {
        "username": "demo_beauty_owner",
        "email": "beauty.demo@cityreserve.tn",
        "name": "Marsa Beauty Studio",
        "category": "Centres esth\u00e9tiques",
        "description": "Studio beaute pour soins visage, massage et bien-etre.",
        "address": "Avenue Habib Bourguiba, La Marsa",
        "phone": "+216 29 650 420",
        "latitude": 36.884100,
        "longitude": 10.331600,
        "price_range": "50-100 TND - Premium",
        "capacity": 25,
        "images": [
            "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&q=80",
        ],
        "services": [
            ("Soin visage eclat", "Nettoyage, masque et hydratation.", 65, 60),
            ("Massage relaxant", "Massage complet aux huiles essentielles.", 90, 75),
        ],
        "reviews": [
            ("Lina", 5, "Soin visage tres professionnel et horaire respecte."),
            ("Nesrine", 5, "Ambiance relaxante, je recommande le massage."),
        ],
    },
    {
        "username": "demo_hair_owner",
        "email": "coiffure.demo@cityreserve.tn",
        "name": "Atelier Coiffure Nabeul",
        "category": "Centres de coiffure",
        "description": "Salon mixte pour coupes, brushing et coloration.",
        "address": "Centre-ville, Nabeul",
        "phone": "+216 72 287 511",
        "latitude": 36.451300,
        "longitude": 10.735000,
        "price_range": "20-50 TND - Moyen",
        "capacity": 18,
        "images": [
            "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1595475884562-073c30d45670?auto=format&fit=crop&q=80",
        ],
        "services": [
            ("Coupe + brushing", "Prestation rapide sur rendez-vous.", 35, 45),
            ("Coloration", "Diagnostic couleur et application.", 85, 120),
        ],
        "reviews": [
            ("Chaima", 4, "Brushing rapide et equipe souriante."),
            ("Wassim", 5, "Coupe propre, rendez-vous bien respecte."),
        ],
    },
]


def create_examples():
    print("Creating CityReserve demo examples...")

    for example in EXAMPLES:
        user, _ = User.objects.get_or_create(
            username=example["username"],
            defaults={
                "email": example["email"],
                "user_type": "establishment",
                "first_name": "Demo",
                "last_name": example["name"],
                "phone": example["phone"],
                "is_verified": True,
            },
        )
        user.email = example["email"]
        user.user_type = "establishment"
        user.phone = example["phone"]
        user.is_verified = True
        user.set_password("password123")
        user.save()

        establishment, _ = Establishment.objects.update_or_create(
            owner=user,
            defaults={
                "name": example["name"],
                "category": example["category"],
                "description": example["description"],
                "address": example["address"],
                "phone": example["phone"],
                "email": example["email"],
                "latitude": example["latitude"],
                "longitude": example["longitude"],
                "price_range": example["price_range"],
                "capacity": example["capacity"],
                "opening_hours": DEFAULT_OPENING_HOURS,
                "images": example.get("images", []),
                "is_verified": True,
                "is_active": True,
            },
        )

        for name, description, price, duration in example["services"]:
            Service.objects.update_or_create(
                establishment=establishment,
                name=name,
                defaults={
                    "description": description,
                    "price": price,
                    "duration": duration,
                    "is_active": True,
                },
            )

        for index, (first_name, rating, comment) in enumerate(example.get("reviews", []), start=1):
            review_user, _ = User.objects.get_or_create(
                username=f"sample_client_{example['username']}_{index}",
                defaults={
                    "email": f"sample.client.{example['username']}.{index}@cityreserve.tn",
                    "user_type": "client",
                    "first_name": first_name,
                    "last_name": "Client",
                    "is_verified": True,
                },
            )
            review_user.email = f"sample.client.{example['username']}.{index}@cityreserve.tn"
            review_user.user_type = "client"
            review_user.first_name = first_name
            review_user.last_name = "Client"
            review_user.is_verified = True
            review_user.set_password("password123")
            review_user.save()

            Review.objects.update_or_create(
                establishment=establishment,
                user=review_user,
                defaults={
                    "rating": rating,
                    "comment": comment,
                },
            )

    print(f"{len(EXAMPLES)} demo establishments are ready.")
    print("Owner password for all examples: password123")


if __name__ == "__main__":
    create_examples()
