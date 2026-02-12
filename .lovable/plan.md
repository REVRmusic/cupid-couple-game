

## Ecran de fin : retirer le classement et agrandir l'affichage

### Modifications dans `src/pages/Public.tsx`

#### 1. Retirer le classement
Supprimer le bloc "Leaderboard" (la Card contenant le Trophy, le titre "Classement" et la liste des scores) de l'ecran affiche quand `game?.status === 'finished'`.

#### 2. Agrandir l'affichage du resultat final
- Augmenter la largeur max du conteneur (`max-w-4xl` vers `max-w-6xl`)
- Augmenter la taille du logo
- Augmenter la taille de l'emoji resultat (de `text-6xl` a `text-8xl` ou `text-9xl`)
- Augmenter le titre "Bravo X et Y" (de `text-4xl` a `text-5xl` ou `text-6xl`)
- Augmenter le score (de `text-6xl` a `text-8xl` ou `text-9xl`)
- Augmenter le commentaire humoristique (de `text-2xl` a `text-3xl` ou `text-4xl`)
- Augmenter le padding de la carte resultat (de `p-12` a `p-16` ou `p-20`)

### Fichier modifie
- `src/pages/Public.tsx` (~20 lignes modifiees)

