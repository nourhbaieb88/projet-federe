from django.urls import path
from . import views

app_name = 'establishments'

urlpatterns = [
    # Establishment CRUD
    path('', views.EstablishmentListCreateView.as_view(), name='establishment-list-create'),
    path('mine/', views.MyEstablishmentView.as_view(), name='establishment-mine'),
    path('<int:pk>/', views.EstablishmentDetailView.as_view(), name='establishment-detail'),
    
    # Reviews
    path('<int:establishment_id>/reviews/', views.EstablishmentReviewsView.as_view(), name='establishment-reviews'),
    path('<int:establishment_id>/add_review/', views.EstablishmentReviewsView.as_view(), name='establishment-add-review'),
    path('<int:establishment_id>/reviews/<int:pk>/', views.EstablishmentReviewDetailView.as_view(), name='establishment-review-detail'),
    path('<int:establishment_id>/services/', views.EstablishmentServicesView.as_view(), name='establishment-services'),
    
    # Utility endpoints
    path('categories/', views.establishment_categories, name='establishment-categories'),
    path('price-ranges/', views.establishment_price_ranges, name='establishment-price-ranges'),
]
