from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator
from django.db import models


class User(AbstractUser):
    """Custom user model for CityReserve."""

    USER_TYPE_CHOICES = [
        ("client", "Client"),
        ("establishment", "Etablissement"),
    ]

    user_type = models.CharField(
        max_length=20,
        choices=USER_TYPE_CHOICES,
        default="client",
        verbose_name="Type d'utilisateur",
    )
    email = models.EmailField(unique=True, verbose_name="Email")

    phone_regex = RegexValidator(
        regex=r"^[\+\d\s\-]{8,20}$",
        message="Le numero de telephone doit etre valide.",
    )
    phone = models.CharField(
        validators=[phone_regex],
        max_length=20,
        blank=True,
        verbose_name="Telephone",
    )
    profile_image = models.ImageField(
        upload_to="profiles/",
        blank=True,
        null=True,
        verbose_name="Photo de profil",
    )
    latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        blank=True,
        null=True,
        verbose_name="Latitude",
    )
    longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        blank=True,
        null=True,
        verbose_name="Longitude",
    )
    address = models.TextField(blank=True, verbose_name="Adresse")
    is_verified = models.BooleanField(default=False, verbose_name="Verifie")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    groups = models.ManyToManyField(
        "auth.Group",
        related_name="custom_user_groups",
        blank=True,
        verbose_name="groups",
    )
    user_permissions = models.ManyToManyField(
        "auth.Permission",
        related_name="custom_user_permissions",
        blank=True,
        verbose_name="user permissions",
    )

    class Meta:
        verbose_name = "Utilisateur"
        verbose_name_plural = "Utilisateurs"

    def __str__(self):
        return f"{self.username} ({self.get_user_type_display()})"
