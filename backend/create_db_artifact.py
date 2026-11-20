import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cityreserve_backend.settings')
django.setup()

from establishments.models import Establishment, Service

lines = []
lines.append("# Données de la Base de Données (Établissements)")
lines.append("Voici un aperçu du contenu de la base de données :")
lines.append("")
lines.append("| Nom de l'établissement | Catégorie | Gamme de Prix | Capacité | Services |")
lines.append("|---|---|---|---|---|")

for e in Establishment.objects.all():
    services = Service.objects.filter(establishment=e)
    if services.exists():
        services_str = "<br>".join([f"• {s.name} ({s.price} TND)" for s in services])
    else:
        services_str = "Aucun"
    lines.append(f"| **{e.name}** | {e.category} | {e.price_range} | {e.capacity} | {services_str} |")

# Path to the current conversation brain directory
artifact_path = r'C:\Users\nourh\.gemini\antigravity\brain\4b08a9b2-a584-41dd-8556-60a967f0b269\database_view.md'
with open(artifact_path, 'w', encoding='utf-8') as f:
    f.write("\n".join(lines))
