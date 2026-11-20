from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("reservations", "0003_alter_availabilityslot_options_and_more"),
    ]

    operations = [
        migrations.AlterField(
            model_name="reservation",
            name="status",
            field=models.CharField(
                choices=[
                    ("pending", "En attente"),
                    ("confirmed", "Confirmee"),
                    ("rejected", "Refusee"),
                    ("cancelled", "Annulee"),
                    ("completed", "Terminee"),
                ],
                default="pending",
                max_length=20,
                verbose_name="Statut",
            ),
        ),
    ]
