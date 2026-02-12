# 🎭 Lighting Companion - Cupid Game

Application compagnon pour contrôler les lumières Daslight/Sunlite lors du jeu Cupid.

## Fonctionnement

Cette application écoute les signaux envoyés par la page Admin du jeu Cupid et simule des appuis clavier pour déclencher les programmes lumineux dans Daslight/Sunlite.

```
┌─────────────────┐    WebSocket     ┌──────────────────┐    Keyboard    ┌─────────────────┐
│   Admin Page    │ ──────────────▶  │  Companion App   │ ─────────────▶ │ Daslight/Sunlite│
│   (Navigateur)  │   localhost:3001 │   (Node.js)      │   V ou R       │   (Lumières)    │
└─────────────────┘                  └──────────────────┘                └─────────────────┘
```

## Touches configurées

| Touche | Signal | Signification |
|--------|--------|---------------|
| **V** | VERT | Bonne réponse - maintenu 8 secondes |
| **R** | ROUGE | Mauvaise réponse - maintenu 8 secondes |
| **F** | FINISH | Fin de partie - maintenu 10 secondes |

## Installation

### Prérequis
- Node.js 18 ou supérieur
- npm

### Étapes

1. **Ouvrir un terminal** dans ce dossier `lighting-companion/`

2. **Installer les dépendances** :
   ```bash
   npm install
   ```

3. **Configuration Daslight/Sunlite** :
   - Ouvrir Daslight/Sunlite
   - Configurer un raccourci clavier pour la touche `V` → Programme "éclairage vert"
   - Configurer un raccourci clavier pour la touche `R` → Programme "éclairage rouge"

## Utilisation

1. **Lancer l'application companion** (avant d'ouvrir la page Admin) :
   ```bash
   npm start
   ```

2. **Ouvrir la page Admin** dans le navigateur
   - La connexion s'établit automatiquement
   - Un indicateur dans le header Admin montre si la connexion est active

3. **Jouer !**
   - Quand le résultat d'une question est révélé, le signal est envoyé automatiquement
   - Les lumières s'allument en vert ou rouge selon le résultat

## Dépannage

### L'application ne démarre pas
- Vérifier que Node.js 18+ est installé : `node --version`
- Vérifier que les dépendances sont installées : `npm install`

### La connexion ne s'établit pas
- Vérifier que l'application companion est lancée AVANT d'ouvrir la page Admin
- Vérifier qu'aucun pare-feu ne bloque le port 3001
- Vérifier qu'aucune autre application n'utilise le port 3001

### Les touches ne fonctionnent pas dans Daslight/Sunlite
- S'assurer que Daslight/Sunlite est au premier plan quand le signal est envoyé
- Vérifier la configuration des raccourcis clavier dans Daslight/Sunlite

## Arrêt

Pour arrêter l'application, appuyer sur `Ctrl+C` dans le terminal.
