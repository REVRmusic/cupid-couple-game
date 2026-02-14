

## Fix : Les signaux lumineux ne se declenchent pas a chaque question

### Cause racine

Dans l'effet de signal lumineux (lignes 128-153 de Admin.tsx), quand la question change :

1. `prevIsCorrectRef.current` est mis a `undefined` et l'effet fait un `return` premature (lignes 131-133)
2. Au rendu suivant, `prevIsCorrectRef` est `undefined`
3. Si le realtime a deja mis a jour `is_correct` (les reponses et le resultat arrivent dans le meme batch), la condition `prevIsCorrectRef.current === null` (ligne 144) echoue car la valeur est `undefined`, pas `null`
4. L'effet met alors `prevIsCorrectRef` a `true` ou `false` (ligne 152) -- le signal est definitivement perdu

En resume : le signal est rate quand les donnees arrivent trop vite apres un changement de question, car `undefined !== null`.

### Solution

Simplifier la logique de detection en supprimant le `return` premature et en utilisant `undefined` comme valeur "pas encore pret" correctement. Concretement :

**Modifier l'effet de signal (lignes 128-153) :**

```text
useEffect(() => {
  // Detect question change and reset tracking
  if (game && prevQuestionIndexRef.current !== undefined && 
      prevQuestionIndexRef.current !== game.current_question_index) {
    prevIsCorrectRef.current = null;  // null au lieu de undefined
    prevQuestionIndexRef.current = game.current_question_index;
    // PAS de return - on continue pour traiter le cas ou is_correct est deja defini
  }
  if (game) {
    prevQuestionIndexRef.current = game.current_question_index;
  }

  if (currentQuestion?.question_order === game?.current_question_index &&
      currentQuestion?.player1_answer !== null &&
      currentQuestion?.player2_answer !== null &&
      currentQuestion?.is_correct !== null && 
      currentQuestion?.is_correct !== undefined &&
      (prevIsCorrectRef.current === null || prevIsCorrectRef.current === undefined)) {
    if (currentQuestion.is_correct === true) {
      sendSignal('GREEN');
    } else {
      sendSignal('RED');
    }
  }
  prevIsCorrectRef.current = currentQuestion?.is_correct ?? null;
}, [currentQuestion?.is_correct, currentQuestion?.player1_answer, currentQuestion?.player2_answer, sendSignal, game]);
```

Les changements :
- `prevIsCorrectRef.current = null` au lieu de `undefined` lors du reset
- Suppression du `return` premature pour ne pas rater le signal si les donnees arrivent dans le meme rendu
- La condition accepte `prevIsCorrectRef.current === null || prevIsCorrectRef.current === undefined` pour couvrir les deux cas (reset et premier chargement)
- `prevIsCorrectRef.current` est toujours mis a jour a la fin (ligne du bas) avec `?? null` pour eviter les valeurs `undefined`

### Fichier modifie
- `src/pages/Admin.tsx` uniquement (environ 5 lignes modifiees dans l'effet de signal lumineux)

