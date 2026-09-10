# Ani-Vautrain

Compagne virtuelle Ani (React + TypeScript + Vite) avec Gemini et Mistral.

## Fonctionnalités

- Chat multi-modèles : Google Gemini et Mistral AI
- Personnalité Ani (Base / Eve / Ara) + mode Sexy 18+ optionnel
- Édition d'images via Gemini
- Historique local (localStorage), recherche, synthèse vocale FR
- Paramètres Damien / quotas / clés API

## Stack

- React 19 + TypeScript + Vite 6
- `@google/genai`
- Tailwind via CDN

## Installation

Prérequis : Node.js 18+

```bash
git clone https://github.com/Betechiot208695/Ani-Vautrain.git
cd Ani-Vautrain
npm install
```

## Configuration Mistral — IMPORTANT

Le dépôt ne contient **aucune clé API Mistral par défaut**. Chaque utilisateur doit utiliser sa propre clé API Mistral.

Pour une configuration complète et éviter les problèmes de connexion, configure **les deux niveaux suivants**.

### 1. Configuration du fichier `.env`

Crée un fichier `.env` à la racine du projet (**ne le commit jamais**) :

```env
GEMINI_API_KEY=ta_cle_gemini
VITE_GEMINI_API_KEY=ta_cle_gemini

MISTRAL_API_KEY=ta_cle_mistral
VITE_MISTRAL_API_KEY=ta_cle_mistral
MISTRAL_API_URL=https://api.mistral.ai/v1/chat/completions
```

La clé Mistral et l'URL sont utilisées par la configuration Vite et par la résolution de la configuration du service IA.

### 2. Configuration dans l'application Ani

Après avoir démarré Ani :

1. Ouvre **Paramètres**.
2. Dans **Choisir mon cerveau (IA)**, sélectionne **Mistral AI (Les autres)**.
3. Dans **Clé API Mistral AI (Override UI)**, renseigne **ta propre clé API Mistral**.
4. Dans **URL API Mistral (Override UI)**, renseigne :
   `https://api.mistral.ai/v1/chat/completions`
5. Vérifie que l'interface indique que la clé et l'URL Mistral sont configurées.
6. Lance un message dans le chat Mistral pour tester la connexion.

> **Important :** la configuration de l'interface utilise un système d'Override. Les valeurs saisies dans l'UI peuvent prendre la priorité sur les valeurs provenant de l'environnement. Pour une installation reproductible, il est donc recommandé de renseigner la clé et l'URL dans le `.env` **et** de les vérifier/renseigner dans les paramètres de l'application.

### Pourquoi configurer les deux ?

Le fichier `.env` prépare l'environnement de développement et permet à Vite de charger la configuration Mistral au démarrage.

Les paramètres de l'application permettent ensuite de vérifier et, si nécessaire, de remplacer cette configuration directement depuis l'interface grâce aux champs **Override UI**.

En pratique :

```text
.env
  │
  ├── MISTRAL_API_KEY
  └── MISTRAL_API_URL
          │
          ▼
     Configuration Vite
          │
          ▼
  Paramètres Ani / Override UI
          │
          ▼
     Service Mistral
          │
          ▼
https://api.mistral.ai/v1/chat/completions
          │
          ▼
       Mistral AI
```

**Une clé API valide doit être disponible pour utiliser le chat Mistral.** Ne partage jamais ta clé API et ne l'ajoute jamais dans GitHub.

## Lancement

Lance le serveur de développement local :

```bash
npm run dev
```

Puis ouvre :

```text
http://localhost:3000
```

Le serveur local utilisé ici est le serveur de développement **Vite**. Il sert l'application Ani ; les requêtes Mistral sont envoyées vers l'URL API configurée.

## Scripts

- `npm run dev` — développement
- `npm run build` — build production
- `npm run preview` — preview du build
- `npm run lint` — check TypeScript

## Notes

- Les outils (`tools/`) sont encore des mocks : le chat fonctionne, les actions externes sont simulées.
- Les historiques de prompts lourds ne sont plus versionnés.
- **Ne publie jamais ton fichier `.env` ni une clé API réelle dans le dépôt.**
- Si une clé API a été exposée publiquement, révoque-la immédiatement et crée-en une nouvelle.

## Auteur

Damien Vautrain (@Betechiot208695)
