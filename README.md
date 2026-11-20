# CityReserve

CityReserve est une plateforme de reservation entre clients et etablissements.
Le projet est organise en deux parties :

- `src/` : frontend React
- `backend/` : API Django REST + base SQLite de developpement

## Fonctionnalites

- Authentification JWT par email
- Comptes client et etablissement
- Catalogue d'etablissements avec carte et filtres
- Reservation avec validation de capacite et horaires
- Avis clients
- Messagerie entre client et etablissement
- Tableau de bord partenaire pour gerer reservations et services

## Structure

```text
frontend/
|- src/
|  |- components/
|  |- context/
|  |- pages/
|  \- services/
|- public/
\- backend/
   |- accounts/
   |- establishments/
   |- reservations/
   |- messaging/
   \- cityreserve_backend/
```

## Demarrage local

### Frontend

```bash
npm install
npm start
```

Application disponible sur `http://localhost:3000`.
Configurez `REACT_APP_API_URL` dans `.env` ou `.env.demo` avant un deploiement distant.

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

API disponible sur `http://localhost:8000/api`.
L'admin Django reste disponible sur `http://localhost:8000/api/admin/`.

### Email de reinitialisation

Le flux `Mot de passe oublie` envoie un lien de reinitialisation par email.
Par defaut, Django utilise un backend console en local.
Pour un vrai envoi, configurez au minimum :

```bash
FRONTEND_BASE_URL=http://localhost:3000
DJANGO_EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
DJANGO_EMAIL_HOST=smtp.votre-fournisseur.com
DJANGO_EMAIL_PORT=587
DJANGO_EMAIL_HOST_USER=votre-compte
DJANGO_EMAIL_HOST_PASSWORD=votre-mot-de-passe
DJANGO_EMAIL_USE_TLS=True
DJANGO_DEFAULT_FROM_EMAIL=CityReserve <no-reply@votre-domaine.com>
```

## Commandes utiles

### Frontend

```bash
npm run build
npm test -- --watchAll=false --runInBand --passWithNoTests
```

### Backend

```bash
cd backend
python manage.py check
python manage.py test
python manage.py makemigrations --check
```

## Endpoints principaux

- `POST /api/accounts/users/`
- `POST /api/accounts/token/`
- `GET /api/accounts/users/me/`
- `PATCH /api/accounts/users/update_profile/`
- `GET /api/establishments/`
- `GET /api/establishments/<id>/`
- `GET /api/establishments/<id>/reviews/`
- `GET /api/services/`
- `GET /api/reservations/`
- `POST /api/reservations/<id>/cancel/`
- `GET /api/messaging/conversations/`

## Etat verifie

Les verifications suivantes passent dans l'etat actuel du projet :

- `python manage.py makemigrations --check`
- `python manage.py test`
- `npm run build`
- `npm test -- --watchAll=false --runInBand --passWithNoTests`

## Notes Git

- Les artefacts locaux sont ignores via `.gitignore` et `backend/.gitignore`
- La base SQLite de developpement et le `venv` backend ne doivent pas etre commits
- Si vous voulez versionner le backend pour la premiere fois, ajoutez uniquement le code source et les migrations
