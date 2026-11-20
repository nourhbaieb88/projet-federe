from django.conf import settings
from django.core.mail import send_mail


def send_welcome_email(user):
    """Send a generic welcome email after signup."""

    send_mail(
        subject="Bienvenue sur CityReserve",
        message=(
            f"Bonjour {user.first_name or user.username},\n\n"
            "Votre compte CityReserve a bien ete cree.\n"
            "Vous pouvez maintenant vous connecter, gerer votre profil et utiliser la plateforme.\n\n"
            f"Connexion : {settings.FRONTEND_BASE_URL}/login\n\n"
            "A bientot sur CityReserve."
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,
    )


def send_password_reset_email(user, reset_url):
    """Send a password reset email."""

    send_mail(
        subject="Reinitialisation de votre mot de passe CityReserve",
        message=(
            f"Bonjour {user.first_name or user.username},\n\n"
            "Vous avez demande la reinitialisation de votre mot de passe.\n"
            f"Ouvrez ce lien pour choisir un nouveau mot de passe :\n{reset_url}\n\n"
            "Si vous n'etes pas a l'origine de cette demande, ignorez simplement cet email."
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,
    )
