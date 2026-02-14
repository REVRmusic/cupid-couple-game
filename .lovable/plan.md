

## Fix robuste : empecher la fin prematuree de la derniere question

### Diagnostic approfondi

Les correctifs precedents (garde `question_order` et `useMemo`) sont theoriquement corrects mais ne suffisent pas. Le probleme persiste probablement pour l'une de ces raisons :

1. **Desynchronisation entre `game` et `gameQuestions`** : le state `game` est mis a jour instantanement via realtime (`setGame(payload.new)`), mais `gameQuestions` est mis a jour via un `fetchGameQuestions()` asynchrone. Pendant la fenetre ou le fetch n'a pas encore retourne, `gameQuestions` peut contenir des donnees intermediaires.

2. **Effet auto-finish trop permissif** : il ne verifie que `is_correct !== null`, mais ne verifie pas que les deux joueurs ont reellement repondu (`player1_answer` et `player2_answer`).

### Solution en 3 couches de protection

**Couche 1 : Verifier les reponses des joueurs (pas seulement `is_correct`)**

Ajouter dans la condition auto-finish :
```text
currentQuestion?.player1_answer !== null &&
currentQuestion?.player2_answer !== null
```

Meme si `is_correct` est defini par erreur, cette condition garantit que les deux joueurs ont bien clique.

**Couche 2 : Verification en base de donnees avant de finir**

Avant de declencher le `nextQuestion` (qui termine la partie), faire une requete a la base de donnees pour verifier que la derniere question a bien les deux reponses :

```text
const { data: lastQ } = await supabase
  .from('game_questions')
  .select('player1_answer, player2_answer, is_correct')
  .eq('id', currentQuestion.id)
  .single();

if (!lastQ?.player1_answer || !lastQ?.player2_answer) {
  // Les joueurs n'ont pas repondu - on ne finit PAS
  autoFinishScheduledRef.current = false;
  return;
}
```

Cela ajoute une verification directe en base, independante de l'etat React.

**Couche 3 : Logs de debug detailles**

Ajouter des console.log pour tracer exactement quand et pourquoi l'auto-finish se declenche :

```text
console.log('Auto-finish check:', {
  status: game?.status,
  index: game?.current_question_index,
  total: game?.total_questions,
  questionOrder: currentQuestion?.question_order,
  isCorrect: currentQuestion?.is_correct,
  p1Answer: currentQuestion?.player1_answer,
  p2Answer: currentQuestion?.player2_answer,
  scheduled: autoFinishScheduledRef.current
});
```

### Modifications dans `src/pages/Admin.tsx`

**1. Condition auto-finish renforcee (lignes 157-165)**

Ajouter 2 conditions supplementaires dans le `if` :
- `currentQuestion?.player1_answer !== null`
- `currentQuestion?.player2_answer !== null`

**2. Verification DB dans le setTimeout (lignes 174-177)**

Avant d'appeler `nextQuestion`, faire une requete Supabase pour confirmer que la question a bien les deux reponses. Si la verification echoue, annuler le finish et remettre `autoFinishScheduledRef.current = false`.

**3. Logs de debug (avant le `if`)**

Ajouter un `console.log` avec tous les parametres de la condition pour pouvoir diagnostiquer si le probleme revient.

**4. Meme renforcement pour le signal lumineux (lignes 139-148)**

Ajouter la verification `player1_answer && player2_answer` dans la condition d'envoi du signal vert/rouge.

### Fichier modifie
- `src/pages/Admin.tsx` uniquement (environ 25 lignes ajoutees/modifiees)

