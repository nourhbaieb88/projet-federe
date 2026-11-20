# CityReserve Backend

API Django REST pour la plateforme CityReserve.

## Stack

- Django
- Django REST Framework
- Simple JWT
- django-cors-headers
- SQLite en developpement

## Applications

- `accounts` : utilisateurs, auth, profil
- `establishments` : etablissements, services, avis
- `reservations` : reservations et statistiques
- `messaging` : conversations et messages

## Installation

```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Serveur local : `http://localhost:8000`

## Endpoints principaux

### Accounts

- `POST /api/accounts/users/` : inscription
- `POST /api/accounts/token/` : connexion JWT par email ou username
- `POST /api/accounts/token/refresh/` : refresh token
- `GET /api/accounts/users/me/` : utilisateur courant
- `PATCH /api/accounts/users/update_profile/` : mise a jour profil

### Establishments

- `GET /api/establishments/`
- `POST /api/establishments/`
- `GET /api/establishments/mine/`
- `GET /api/establishments/<id>/`
- `PATCH /api/establishments/<id>/`
- `GET /api/establishments/<id>/reviews/`
- `POST /api/establishments/<id>/reviews/`
- `GET /api/establishments/<id>/services/`

### Services

- `GET /api/services/`
- `POST /api/services/`
- `PATCH /api/services/<id>/`
- `DELETE /api/services/<id>/`

### Reservations

- `GET /api/reservations/`
- `POST /api/reservations/`
- `PATCH /api/reservations/<id>/`
- `POST /api/reservations/<id>/cancel/`
- `GET /api/reservations/stats/`

### Messaging

- `GET /api/messaging/conversations/`
- `POST /api/messaging/conversations/`
- `GET /api/messaging/conversations/<id>/messages/`
- `POST /api/messaging/conversations/<id>/messages/`
- `POST /api/messaging/conversations/<id>/mark-read/`

## Verification

```bash
python manage.py check
python manage.py makemigrations --check
python manage.py test
```

## Emails

Le backend est pret a envoyer des emails a tous les utilisateurs depuis une adresse centrale de
l'application.

- email de bienvenue apres inscription
- lien de reinitialisation de mot de passe

Par defaut, les emails partent dans la console Django.
Pour un vrai envoi, configurez ces variables dans l'environnement du backend :

```bash
FRONTEND_BASE_URL=http://localhost:3000
DJANGO_EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
DJANGO_EMAIL_HOST=smtp.gmail.com
DJANGO_EMAIL_PORT=587
DJANGO_EMAIL_HOST_USER=votre-adresse@gmail.com
DJANGO_EMAIL_HOST_PASSWORD=votre-mot-de-passe-application
DJANGO_EMAIL_USE_TLS=True
DJANGO_DEFAULT_FROM_EMAIL=CityReserve <votre-adresse@gmail.com>
```

## Notes

- `db.sqlite3`, `media/`, `staticfiles/` et `venv/` sont ignores
- L'admin Django est expose sous `/api/admin/`
- La configuration CORS est prete pour `localhost:3000`, `3001`, `3016` et `5173`
