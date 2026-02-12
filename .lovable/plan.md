

## Affichage plein écran sur tablette Android

La meilleure solution combine deux approches complémentaires pour garantir un affichage plein écran professionnel :

### Approche 1 : PWA (Progressive Web App) - Solution principale

Transformer l'app en PWA avec le mode `standalone` (ou `fullscreen`). Une fois installée sur l'écran d'accueil de la tablette, l'app s'ouvrira **sans barre de navigation du navigateur**, exactement comme une application native.

### Approche 2 : Fullscreen API - Complément

Ajouter un bouton discret sur la page d'accueil pour activer le mode plein écran via l'API Fullscreen du navigateur. Utile si l'app est ouverte directement dans Chrome sans être installée.

---

### Modifications techniques

#### 1. Installer et configurer `vite-plugin-pwa`

- Installer la dépendance `vite-plugin-pwa`
- Configurer dans `vite.config.ts` avec un manifest incluant :
  - `display: "fullscreen"` (supprime toute barre système)
  - `name`, `short_name`, `theme_color`, `background_color` adaptés au thème romantique
  - Icônes PWA (utilisation de placeholder pour commencer)
- Ajouter `navigateFallbackDenylist: [/^\/~oauth/]` dans la config workbox

#### 2. Mettre à jour `index.html`

- Ajouter les balises meta pour PWA :
  - `<meta name="mobile-web-app-capable" content="yes">`
  - `<meta name="apple-mobile-web-app-capable" content="yes">`
  - `<meta name="theme-color" content="...">`
  - `<link rel="manifest" href="/manifest.webmanifest">`

#### 3. Ajouter un bouton "Plein écran" sur la page d'accueil (`src/pages/Index.tsx`)

- Un bouton qui appelle `document.documentElement.requestFullscreen()` au clic
- Visible uniquement si l'app n'est pas déjà en mode standalone/fullscreen
- Détection via `window.matchMedia('(display-mode: standalone)')` ou `(display-mode: fullscreen)`
- Style discret et intégré au design existant

#### 4. Créer les icônes PWA

- Ajouter des icônes dans `public/` (192x192 et 512x512) - des placeholders pour commencer

---

### Utilisation sur la tablette Redmi Pad 2

1. Ouvrir l'app dans Chrome
2. Menu Chrome (trois points) → "Ajouter à l'écran d'accueil" ou "Installer l'application"
3. L'app s'ouvre désormais en plein écran total, sans barre de navigation

| Fichier | Action |
|---------|--------|
| `vite.config.ts` | Modifier - Ajouter vite-plugin-pwa |
| `index.html` | Modifier - Ajouter meta tags PWA |
| `src/pages/Index.tsx` | Modifier - Ajouter bouton plein écran |
| `public/pwa-192x192.png` | Créer - Icône PWA |
| `public/pwa-512x512.png` | Créer - Icône PWA |

