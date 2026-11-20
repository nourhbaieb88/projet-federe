from django.contrib import admin
from .models import Establishment, Review, Service

@admin.register(Establishment)
class EstablishmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'owner', 'rating', 'is_active')
    search_fields = ('name', 'owner__email')
    list_filter = ('category', 'is_active')

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('user', 'establishment', 'rating', 'created_at')
    list_filter = ('rating',)

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('name', 'establishment', 'price', 'duration', 'is_active')
    list_filter = ('is_active',)
