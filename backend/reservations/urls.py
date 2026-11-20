from django.urls import path
from . import views

app_name = 'reservations'

urlpatterns = [
    # Reservation CRUD
    path('', views.ReservationListCreateView.as_view(), name='reservation-list-create'),
    path('<int:pk>/', views.ReservationDetailView.as_view(), name='reservation-detail'),
    path('<int:pk>/cancel/', views.cancel_reservation, name='reservation-cancel'),
    
    # Availability slots for establishments
    path('establishments/<int:establishment_id>/slots/', 
         views.AvailabilitySlotListCreateView.as_view(), name='availability-slot-list-create'),
    path('establishments/<int:establishment_id>/slots/<int:pk>/', 
         views.AvailabilitySlotDetailView.as_view(), name='availability-slot-detail'),
    
    # Statistics
    path('stats/', views.reservation_stats, name='reservation-stats'),
]
