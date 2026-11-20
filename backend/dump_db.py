import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cityreserve_backend.settings')
django.setup()

from establishments.models import Establishment, Service

print("| Nom de l'établissement | Catégorie | Gamme de Prix | Capacité | Services |")
print("|---|---|---|---|---|")

establishments = Establishment.objects.all()
for est in establishments:
    services = Service.objects.filter(establishment=est)
    services_str = ", ".join([f"{s.name} ({s.price} TND)" for s in services])
    if not services_str:
        services_str = "Aucun"
    print(f"| {est.name} | {est.category} | {est.price_range} | {est.capacity} | {services_str} |")
