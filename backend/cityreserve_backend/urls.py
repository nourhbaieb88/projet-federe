"""
URL configuration for cityreserve_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import JsonResponse
from django.urls import path, include
from django.views.generic.base import RedirectView
from establishments import views


def api_root(request):
    base_url = request.build_absolute_uri("/").rstrip("/")
    return JsonResponse(
        {
            "name": "CityReserve API",
            "status": "ok",
            "endpoints": {
                "admin": f"{base_url}/api/admin/",
                "accounts": f"{base_url}/api/accounts/",
                "establishments": f"{base_url}/api/establishments/",
                "reservations": f"{base_url}/api/reservations/",
                "messaging": f"{base_url}/api/messaging/",
                "services": f"{base_url}/api/services/",
                "reviews": f"{base_url}/api/reviews/",
            },
        }
    )


urlpatterns = [
    path('api/', api_root, name='api-root'),
    path('admin/', RedirectView.as_view(url='/api/admin/', permanent=False)),
    path('api/admin/', admin.site.urls),
    path('api/accounts/', include('accounts.urls')),
    path('api/establishments/', include('establishments.urls')),
    path('api/reservations/', include('reservations.urls')),
    path('api/messaging/', include('messaging.urls')),
    
    # Global endpoints mapped to establishments app
    path('api/services/', include([
        path('', views.ServiceListCreateView.as_view(), name='service-list-create'),
        path('<int:pk>/', views.ServiceDetailView.as_view(), name='service-detail'),
    ])),
    path('api/reviews/', include([
        path('', views.ReviewListCreateView.as_view(), name='review-list-create'),
        path('<int:pk>/', views.ReviewDetailView.as_view(), name='review-detail'),
    ])),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
