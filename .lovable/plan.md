

## Fix : Signal FINISH intermittent - le timer est annule par React

### Cause racine

Le `useEffect` d'auto-finish (ligne 142) contient un `return () => { clearTimeout(...) }` (ligne 156-161). Quand Supabase envoie une mise a jour realtime pendant les 2.5 secondes de delai (par exemple, la mise a jour du score), React re-execute l'effet et declenche le cleanup, ce qui annule le timer. Le FINISH n'est alors jamais envoye. Cela explique le comportement "une fois sur deux" : ca depend de si une mise a jour realtime arrive ou non pendant le delai.

### Solution

Retirer le cleanup du `useEffect` d'auto-finish. A la place, utiliser un flag (`autoFinishScheduledRef`) pour empecher de creer plusieurs timers, et ne nettoyer le timer que lors du demontage du composant dans un `useEffect` separe.

### Modifications dans `src/pages/Admin.tsx`

**a) Ajouter une ref de flag** (a cote de `autoFinishTimerRef`, ligne 141) :
```text
const autoFinishScheduledRef = useRef(false);
```

**b) Remplacer le useEffect d'auto-finish** (lignes 142-163) par :
```text
useEffect(() => {
  if (
    game?.status === 'playing' &&
    game.current_question_index + 1 >= game.total_questions &&
    currentQuestion?.is_correct !== null &&
    currentQuestion?.is_correct !== undefined &&
    !autoFinishScheduledRef.current
  ) {
    autoFinishScheduledRef.current = true;
    const finalScore = game.score + (currentQuestion.is_correct ? 1 : 0);
    const gameId = game.id;
    const questionIndex = game.current_question_index;
    const totalQ = game.total_questions;

    console.log('Last question answered - scheduling FINISH in 2.5s');

    autoFinishTimerRef.current = setTimeout(async () => {
      sendSignal('FINISH', { score: finalScore, total: totalQ });
      await nextQuestion(gameId, questionIndex, totalQ);
    }, 2500);
    // PAS de cleanup ici - le timer doit survivre aux re-renders
  }

  // Reset le flag quand on revient en attente d'une nouvelle partie
  if (game?.status !== 'playing') {
    autoFinishScheduledRef.current = false;
  }
}, [game?.status, game?.current_question_index, game?.total_questions, currentQuestion?.is_correct, sendSignal]);
```

**c) Ajouter un useEffect de cleanup au demontage** (apres le useEffect d'auto-finish) :
```text
useEffect(() => {
  return () => {
    if (autoFinishTimerRef.current) {
      clearTimeout(autoFinishTimerRef.current);
    }
  };
}, []);
```

**d) Remplacer `handleNextQuestion()` par un appel direct a `nextQuestion()`** avec les valeurs capturees dans des variables locales (pour eviter les closures perimees).

### Points cles de la solution

- Le flag `autoFinishScheduledRef` empeche de relancer le timer a chaque re-render
- Le timer n'est PAS nettoye quand l'effet se re-execute (pas de return cleanup)
- Les valeurs (score, gameId, etc.) sont capturees dans des variables locales au moment ou le timer est cree, pour eviter les closures sur des valeurs perimees
- Le cleanup ne se fait qu'au demontage du composant

### Fichier modifie
- `src/pages/Admin.tsx` (environ 25 lignes modifiees, meme section)

### Aucun changement dans les autres fichiers
- `lighting-companion/index.js` : deja correct
- `src/hooks/useLightingControl.ts` : deja correct

