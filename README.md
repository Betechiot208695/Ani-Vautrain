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

Crée un fichier `.env` à la racine (ne le commit jamais) :

```env
GEMINI_API_KEY=ta_cle_gemini
VITE_GEMINI_API_KEY=ta_cle_gemini
MISTRAL_API_KEY=ta_cle_mistral
VITE_MISTRAL_API_KEY=ta_cle_mistral
MISTRAL_API_URL=https://api.mistral.ai/v1/chat/completions
```

Lance le dev server :

```bash
npm run dev
```

Ouvre http://localhost:3000

## Scripts

- `npm run dev` — développement
- `npm run build` — build production
- `npm run preview` — preview du build
- `npm run lint` — check TypeScript

## Notes

- Les outils (`tools/`) sont encore des mocks : le chat fonctionne, les actions externes sont simulées.
- Les historiques de prompts lourds ne sont plus versionnés.
- Passe le dépôt en **Private** dans Settings → Danger Zone.

## Auteur

Damien Vautrain (@Betechiot208695)
