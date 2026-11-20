from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from accounts.models import User


class Establishment(models.Model):
    """Model for establishments"""
    
    CATEGORY_CHOICES = [
        ('Restaurants', 'Restaurants'),
        ('Cafés', 'Cafés'),
        ('Bibliothèques', 'Bibliothèques'),
        ('Terrains de sport', 'Terrains de sport'),
        ('Centres de coiffure', 'Centres de coiffure'),
        ('Centres esthétiques', 'Centres esthétiques'),
        ('Autres établissements', 'Autres établissements'),
    ]
    
    PRICE_RANGE_CHOICES = [
        ('TND - Budget', 'TND - Budget'),
        ('TND TND - Moyen', 'TND TND - Moyen'),
        ('TND TND TND - Élevé', 'TND TND TND - Élevé'),
        ('TND TND TND TND - Très élevé', 'TND TND TND TND - Très élevé'),
        ('0-20 TND - Budget', '0-20 TND - Budget'),
        ('20-50 TND - Moyen', '20-50 TND - Moyen'),
        ('50-100 TND - Premium', '50-100 TND - Premium'),
        ('+100 TND - Prestige', '+100 TND - Prestige'),
    ]
    
    owner = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='establishment',
        verbose_name="Propriétaire"
    )
    
    name = models.CharField(
        max_length=200,
        verbose_name="Nom de l'établissement"
    )
    
    category = models.CharField(
        max_length=50,
        choices=CATEGORY_CHOICES,
        verbose_name="Catégorie"
    )
    
    description = models.TextField(
        verbose_name="Description"
    )
    
    address = models.TextField(
        verbose_name="Adresse"
    )
    
    phone = models.CharField(
        max_length=50,
        verbose_name="Téléphone"
    )
    
    email = models.EmailField(
        verbose_name="Email"
    )
    
    latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        verbose_name="Latitude"
    )
    
    longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        verbose_name="Longitude"
    )
    
    price_range = models.CharField(
        max_length=50,
        choices=PRICE_RANGE_CHOICES,
        blank=True,
        verbose_name="Gamme de prix"
    )
    
    capacity = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
        verbose_name="Capacité"
    )
    
    opening_hours = models.JSONField(
        default=dict,
        verbose_name="Horaires d'ouverture"
    )
    
    profile_image = models.ImageField(
        upload_to='establishments/',
        blank=True,
        null=True,
        verbose_name="Photo de profil"
    )
    
    images = models.JSONField(
        default=list,
        verbose_name="Galerie d'images"
    )
    
    rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0.00,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        verbose_name="Note moyenne"
    )
    
    total_reviews = models.PositiveIntegerField(
        default=0,
        verbose_name="Nombre d'avis"
    )
    
    is_active = models.BooleanField(
        default=True,
        verbose_name="Actif"
    )
    
    is_verified = models.BooleanField(
        default=False,
        verbose_name="Vérifié"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Établissement"
        verbose_name_plural = "Établissements"
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name
    
    def update_rating(self):
        """Update the average rating based on reviews"""
        from django.db.models import Avg
        avg_rating = self.reviews.aggregate(avg_rating=Avg('rating'))['avg_rating']
        self.rating = avg_rating or 0.00
        self.total_reviews = self.reviews.count()
        self.save(update_fields=['rating', 'total_reviews'])


class Review(models.Model):
    """Model for establishment reviews"""
    
    establishment = models.ForeignKey(
        Establishment,
        on_delete=models.CASCADE,
        related_name='reviews',
        verbose_name="Établissement"
    )
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='reviews',
        verbose_name="Utilisateur"
    )
    
    rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name="Note"
    )
    
    comment = models.TextField(
        blank=True,
        verbose_name="Commentaire"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Avis"
        verbose_name_plural = "Avis"
        unique_together = ['establishment', 'user']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Avis de {self.user.username} sur {self.establishment.name}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.establishment.update_rating()

    def delete(self, *args, **kwargs):
        establishment = self.establishment
        super().delete(*args, **kwargs)
        establishment.update_rating()


class Service(models.Model):
    """Model for specific services offered by an establishment"""
    
    establishment = models.ForeignKey(
        Establishment,
        on_delete=models.CASCADE,
        related_name='services',
        verbose_name="Établissement"
    )
    
    name = models.CharField(
        max_length=200,
        verbose_name="Nom du service"
    )
    
    description = models.TextField(
        blank=True,
        verbose_name="Description"
    )
    
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name="Prix"
    )
    
    duration = models.PositiveIntegerField(
        help_text="Durée en minutes",
        verbose_name="Durée (min)"
    )
    
    is_active = models.BooleanField(
        default=True,
        verbose_name="Actif"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Service"
        verbose_name_plural = "Services"
        ordering = ['establishment', 'name']
    
    def __str__(self):
        return f"{self.name} - {self.establishment.name}"
