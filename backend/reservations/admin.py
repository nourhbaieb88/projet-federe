from django.contrib import admin
from .models import Reservation, AvailabilitySlot

@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ('establishment', 'client', 'date', 'time', 'status')
    list_filter = ('status', 'date')
    search_fields = ('establishment__name', 'client__username')

@admin.register(AvailabilitySlot)
class AvailabilitySlotAdmin(admin.ModelAdmin):
    list_display = ('establishment', 'date', 'time', 'is_available')
    list_filter = ('date', 'is_available')
