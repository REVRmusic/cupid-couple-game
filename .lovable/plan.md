

## Fix : La sequence de fin se declenche avant que les joueurs repondent a la derniere question

### Cause racine

C'est un probleme de synchronisation entre deux states React dans le hook `useGame.ts` :

1. Quand l'admin clique "Question suivante" sur l'avant-derniere question, `game.current_question_index` passe a l'index de la derniere question via la mise a jour temps reel
2. Mais `currentQuestion` est derive dans un `useEffect` separe qui ne s'execute qu'au rendu SUIVANT
3. Pendant un rendu intermediaire, `game.current_question_index` pointe deja sur la derniere question, mais `currentQuestion` contient encore l'ANCIENNE question (l'avant-derniere) avec `is_correct` defini
4. L'effet auto-finish voit : "derniere question + is_correct non null" → il declenche la fin immediatement

En resume : le jeu se termine parce que l'auto-finish confond le resultat de l'avant-derniere question avec celui de la derniere question, le temps d'un rendu.

### Solution

Ajouter une verification dans l'effet auto-finish (`src/pages/Admin.tsx`, lignes 156-183) pour s'assurer que `currentQuestion` correspond bien a la question actuelle avant de declencher la fin. On verifie que `currentQuestion.question_order` est egal a `game.current_question_index`.

### Modification dans `src/pages/Admin.tsx`

Ajouter une condition supplementaire dans le `useEffect` d'auto-finish (ligne 157-162) :

```text
Avant :
  if (
    game?.status === 'playing' &&
    game.current_question_index + 1 >= game.total_questions &&
    currentQuestion?.is_correct !== null &&
    currentQuestion?.is_correct !== undefined &&
    !autoFinishScheduledRef.current
  )

Apres :
  if (
    game?.status === 'playing' &&
    game.current_question_index + 1 >= game.total_questions &&
    currentQuestion?.question_order === game.current_question_index &&
    currentQuestion?.is_correct !== null &&
    currentQuestion?.is_correct !== undefined &&
    !autoFinishScheduledRef.current
  )
```

La ligne ajoutee (`currentQuestion?.question_order === game.current_question_index`) garantit que `currentQuestion` est bien la question correspondant a l'index courant du jeu, et pas une question obsolete d'un rendu precedent.

### Meme verification pour le signal lumineux

Appliquer la meme garde dans l'effet d'envoi de signal lumineux (lignes 128-150) pour eviter d'envoyer un signal GREEN/RED au mauvais moment :

```text
Ajouter avant la condition ligne 139 :
  currentQuestion?.question_order === game?.current_question_index &&
```

### Fichier modifie
- `src/pages/Admin.tsx` uniquement (2 lignes ajoutees)

### Impact
- Les joueurs auront le temps de repondre a la derniere question
- La sequence de fin ne se declenchera qu'apres que les deux joueurs auront repondu
- Le score de la derniere question sera bien comptabilise

