# Configuration de Google Maps API

## 🚀 Comment obtenir et configurer une clé API Google Maps

### Étape 1 : Créer un projet Google Cloud
1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez l'API Google Maps JavaScript

### Étape 2 : Activer les APIs nécessaires
Dans Google Cloud Console :
1. Allez dans "APIs et services" > "Bibliothèque"
2. Recherchez et activez :
   - **Maps JavaScript API**
   - **Geocoding API** (optionnel, pour la conversion adresse ↔ coordonnées)

### Étape 3 : Créer une clé API
1. Allez dans "APIs et services" > "Identifiants"
2. Cliquez sur "Créer des identifiants" > "Clé API"
3. Copiez la clé API générée

### Étape 4 : Configurer la restriction (recommandé)
1. Dans les paramètres de la clé API, ajoutez des restrictions :
   - **Restriction d'application** : HTTP referrers
   - **Sites web autorisés** : `localhost:3000` (pour le développement)
   - **Restriction d'API** : Maps JavaScript API uniquement

### Étape 5 : Configurer dans l'application
1. Ouvrez le fichier `.env` à la racine du projet
2. Remplacez `YOUR_API_KEY_HERE` par votre clé API :

```env
REACT_APP_GOOGLE_MAPS_API_KEY=votre_clé_api_ici
```

### Étape 6 : Redémarrer l'application
```bash
npm start
```

## 🔒 Sécurité
- **Ne jamais commiter** le fichier `.env` dans Git
- **Restreignez toujours** votre clé API aux domaines autorisés
- **Surveillez l'utilisation** dans Google Cloud Console pour éviter les frais excessifs

## 💰 Coûts
- Les 28 000 premiers chargements de carte par mois sont gratuits
- Au-delà : $7 pour 1000 chargements supplémentaires
- [Consultez les tarifs](https://developers.google.com/maps/billing-and-pricing/pricing)

## 🐛 Dépannage
Si la carte ne s'affiche pas :
1. Vérifiez que la clé API est correctement configurée
2. Vérifiez la console du navigateur pour les erreurs
3. Assurez-vous que les APIs sont activées
4. Vérifiez les restrictions de la clé API