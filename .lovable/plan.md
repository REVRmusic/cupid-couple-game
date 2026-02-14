

## Modal de detail des reponses par partie dans l'onglet Classement

### Objectif
Permettre a l'admin de cliquer sur une partie dans le classement pour ouvrir une modal affichant toutes les questions et reponses des deux joueurs, optimisee pour mobile.

### Fonctionnement
- Cliquer sur une ligne du classement ouvre une modal (Dialog)
- La modal affiche le nom du couple, le score, et la liste des questions avec :
  - Le texte de la question
  - La reponse de chaque joueur (Joueur 1 ou Joueur 2)
  - Si les reponses concordent (correct) ou non
- Un bouton X ou "Fermer" permet de fermer la modal
- Layout optimise pour telephone (pas de tableau, cartes empilees)

### Layout de la modal

```text
+-------------------------------+
|  Alice & Bob - 8/10      [X] |
+-------------------------------+
| Q1. Qui cuisine le mieux ?    |
|   Alice: Alice  |  Bob: Alice |
|   [vert] Correct              |
+-------------------------------+
| Q2. Qui est le plus jaloux ?  |
|   Alice: Bob    |  Bob: Alice |
|   [rouge] Pas d'accord        |
+-------------------------------+
| ...                           |
+-------------------------------+
```

### Modifications dans `src/pages/Admin.tsx`

**1. Nouveau state pour la modal**

Ajouter un state `selectedGameId: string | null` pour controler quelle partie est selectionnee.

**2. Fetch des questions de la partie selectionnee**

Quand `selectedGameId` change, charger les `game_questions` avec la jointure `questions(text)` depuis Supabase. Stocker dans un state local `selectedGameQuestions`.

**3. Rendre les lignes du classement cliquables**

Ajouter un `onClick` + `cursor-pointer` sur chaque ligne du classement (lignes 755-784) pour ouvrir la modal en settant `selectedGameId`.

**4. Ajouter le composant Dialog**

Apres le bloc du classement, ajouter un `<Dialog>` qui :
- S'ouvre quand `selectedGameId !== null`
- Affiche le titre avec les noms des joueurs et le score
- Liste chaque question dans une carte compacte :
  - Texte de la question
  - Reponse joueur 1 et joueur 2 (affichees cote a cote)
  - Indicateur vert/rouge selon `is_correct`
- Le contenu scrolle via `ScrollArea` si necessaire
- Se ferme en cliquant X ou a l'exterieur

**5. Optimisation mobile**

- La modal prend `max-w-md w-[95vw]` pour bien s'adapter au telephone
- Les reponses sont affichees en grille `grid-cols-2` compacte
- Les tailles de texte sont reduites (`text-sm`, `text-xs`)
- Le `ScrollArea` limite la hauteur a `max-h-[70vh]`

### Imports a ajouter
- `Dialog, DialogContent, DialogHeader, DialogTitle` depuis `@/components/ui/dialog`
- `ScrollArea` depuis `@/components/ui/scroll-area`
- `Eye` depuis `lucide-react` (icone optionnelle)

### Fichier modifie
- `src/pages/Admin.tsx` uniquement (environ 80 lignes ajoutees)

