
## Corriger le signal FINISH en fin de quizz

### Analyse du probleme

Apres examen du code, le flux est le suivant :
1. L'admin clique "Question suivante" sur la derniere question
2. `nextQuestion()` met a jour le statut en `'finished'` dans la base de donnees (appel asynchrone)
3. Au retour, `sendSignal('FINISH')` est appele

Le probleme potentiel : la mise a jour de la base de donnees (etape 2) declenche une notification realtime. Le hook `useActiveGame` ecoute les changements sur la table `games` et ne cherche que les parties avec le statut `'waiting'` ou `'playing'`. Quand le statut passe a `'finished'`, `activeGame` devient `null`, ce qui provoque un re-rendu qui peut interrompre le WebSocket ou causer un comportement inattendu.

De plus, le hook `useLightingControl` est monte dans le composant Admin. Si un re-rendu rapide cause un demontage/remontage, le WebSocket pourrait etre brievement ferme.

### Solution

Envoyer le signal FINISH **avant** la mise a jour de la base de donnees, pour s'assurer que le WebSocket est encore ouvert et stable au moment de l'envoi.

### Modifications

#### 1. `src/pages/Admin.tsx` - Envoyer FINISH avant l'appel a nextQuestion

Modifier `handleNextQuestion` pour detecter que c'est la derniere question et envoyer le signal AVANT de mettre a jour la base :

```typescript
const handleNextQuestion = async () => {
  if (!game) return;
  
  // Detecter si c'est la derniere question AVANT l'appel
  const isLastQuestion = game.current_question_index + 1 >= game.total_questions;
  
  if (isLastQuestion) {
    console.log('🎭 Last question - sending FINISH signal before DB update');
    sendSignal('FINISH');
  }
  
  const { error, finished } = await nextQuestion(game.id, game.current_question_index, game.total_questions);
  if (error) {
    toast({ title: "Erreur", description: "Impossible de passer à la question suivante", variant: "destructive" });
  } else if (finished) {
    toast({ title: "Terminé !", description: "La partie est terminée" });
  }
};
```

### Fichier modifie
- `src/pages/Admin.tsx` uniquement (fonction `handleNextQuestion`, environ 5 lignes modifiees)
