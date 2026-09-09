# 🤖 Ani-Vautrain — Assistant IA Multi-API

&gt; Application d'intelligence artificielle développée en React.js, TypeScript et Vite, intégrant les API de **Google Gemini** et **Mistral AI**.

---

## 📌 Présentation du projet

**Ani-Vautrain** est une application web d'assistant virtuel développée par **Damien Vautrain** ([@Betechiot208695](https://github.com/Betechiot208695)). Conçue à partir du template AI Studio de Google Gemini, elle permet d'interagir avec des modèles de langage avancés (Gemini &amp; Mistral AI) à travers une interface dynamique, typée et réactive.

---

## ✨ Fonctionnalités principales

- 💬 **Interaction multi-modèles** : Intégration et gestion des API **Google Gemini** et **Mistral AI**.
- 🛠️ **Architecture modulaire** : Séparation claire des composants UI, des outils (*tools*) et des constantes.
- ⚡ **Performance &amp; Vitesse** : Développé avec **Vite** pour un rechargement à chaud (HMR) ultra-rapide.
- 🔷 **Typage rigoureux** : Intégration complète de **TypeScript** (types.ts, tsconfig.json) pour assurer la robustesse du code.
- 📜 **Historique de prompts** : Migration et gestion d'historiquFront-Endtions.

---

## 🛠️ Stack Technique

- **Front-EBuild Tools, TypeScript (97.1%), HTMLAPI AI **Build Tool** : Vite (vite.config.ts)
- **Template d'origineni API &amp; Mistral AI API
- **Template d'origine** : google-gemini/aistudio-repository-template

---

## 📁 Structure du Projet

`text
Ani-Vautrain/
├── components/               # Composants React de l'interface utilisateur
├── constants/                # Constantes et configurations globales
├── tools/                    # Outils et utilitaires pour les appels API
├── migrated_prompt_history/  # Historique et données de prompts
├── App.tsx                   # Composant racine de l'application
├── index.html                # Point d'entrée HTML
├── index.tsx                 # Script d'initialisation React
├── metadata.json             # Métadonnées de l'application
├── package.json              # Dépendances et scripts npm
├── tsconfig.json             # Configuration TypeScript
├── types.ts                  # Définitions de types TypeScript
└── vite.config.ts            # Configuration de Vite



🚀 Installation & Configuration
Prérequis

Node.js (v18 ou supérieur)
npm ou yarn
Une clé d'API Google Gemini et/ou Mistral AI

1. Cloner le dépôt
git clone https://github.com/Betechiot208695/Ani-Vautrain.git
cd Ani-Vautrain


2. Installer les dépendances
npm install


3. Configurer les clés d'API
Créez un fichier .env à la racine du projet et ajoutez vos clés d'accès :
VITE_GEMINI_API_KEY=votre_cle_gemini_ici
VITE_MISTRAL_API_KEY=votre_cle_mistral_ici


4. Lancer l'application en mode développement
npm run dev


L'application sera accessible sur http://localhost:5173.

👤 Auteur
Damien Vautrain (Betechiot208695)

GitHub : @Betechiot208695
LinkedIn : damien-vautrain-b264a9270
Portail Officiel : bio.site/Damien_dams47
