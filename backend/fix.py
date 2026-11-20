import io
with io.open('establishments/models.py', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('€€€€ - Très élevé', 'TND TND TND TND - Très élevé')
content = content.replace('€€€ - Élevé', 'TND TND TND - Élevé')
content = content.replace('€€ - Moyen', 'TND TND - Moyen')
content = content.replace('€ - Budget', 'TND - Budget')

with io.open('establishments/models.py', 'w', encoding='utf-8') as f:
    f.write(content)
