

## Redesign de l'ecran d'attente entre les seances

### Objectif
Modifier uniquement l'ecran d'attente (waiting screen) dans `Public.tsx` pour :
- Monter le titre "Jeu des Couples" en haut
- Retirer le coeur central
- Afficher "Prochaine seance a [heure]" juste sous le titre
- Afficher le Top 3 du classement au centre
- Logos partenaires en bas
- Tout visible sans scroll, responsive

### Layout propose

```text
+----------------------------------+
|                                  |
|      [coeur] Jeu des Couples     |
|    Prochaine seance a 11h45      |
|                                  |
|         --- Top 3 ---            |
|  1. Alice & Bob    8/10          |
|  2. Clara & David  7/10          |
|  3. Eve & Frank    6/10          |
|                                  |
|       [logos partenaires]        |
+----------------------------------+
```

### Modifications

#### `src/pages/Public.tsx` (lignes 122-147)

Remplacer le bloc de l'ecran d'attente :

- **Supprimer** le `<Heart>` central (ligne 130)
- **Deplacer** le Logo tout en haut avec un margin top reduit
- **Ajouter** le texte "Prochaine seance a..." directement sous le logo (sans icone Clock, juste du texte)
- **Ajouter** le Top 3 du classement en utilisant le hook `useLeaderboard` (deja importe)
- **Utiliser** `h-screen` avec `flex flex-col justify-between` pour repartir verticalement : titre+heure en haut, classement au centre, logos en bas
- Tailles de texte adaptees avec des classes responsive (`text-2xl md:text-4xl`, etc.)

Le top 3 sera affiche sous forme de cartes ou lignes stylisees :
- Medaille emoji (or/argent/bronze) + noms du couple + score (ex: "8/10")
- Tailles de police suffisamment grandes pour etre lisibles sur projecteur

#### Aucun autre fichier modifie

Le hook `useLeaderboard` est deja importe et utilise dans `Public.tsx`. La table `settings` et le hook `useSettings` existent deja. Pas de changement backend.

### Details techniques

- Le layout utilise `h-screen flex flex-col` avec `justify-between` pour distribuer les 3 zones (titre, classement, logos) sur toute la hauteur sans scroll
- Les tailles de police utilisent des classes Tailwind responsive (`text-3xl md:text-5xl lg:text-6xl`) pour s'adapter a la taille de l'ecran
- Le `PartnerLogos` reste en position fixe en bas comme actuellement
- Le classement est limite a `leaderboard.slice(0, 3)` pour n'afficher que le top 3
- Si le classement est vide, on affiche un message par defaut

