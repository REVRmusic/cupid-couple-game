
## Eteindre les lumieres entre les questions

### Objectif
Quand l'admin passe a la question suivante (bouton "Question suivante"), renvoyer le meme signal (V ou R) au companion pour eteindre la lumiere avant de changer de question.

### Modification : `src/pages/Admin.tsx`

Dans la fonction `handleNextQuestion`, avant d'appeler `nextQuestion()`, on renverra le signal correspondant au resultat de la question en cours :

- Si `currentQuestion.is_correct === true` : envoyer `GREEN` (pour eteindre le vert)
- Si `currentQuestion.is_correct === false` : envoyer `RED` (pour eteindre le rouge)

Le code ajoutera ces 2-3 lignes au debut de `handleNextQuestion` :

```typescript
const handleNextQuestion = async () => {
  if (!game) return;
  
  // Eteindre les lumieres en renvoyant le meme signal
  if (currentQuestion?.is_correct === true) {
    sendSignal('GREEN');
  } else if (currentQuestion?.is_correct === false) {
    sendSignal('RED');
  }
  
  const { error, finished } = await nextQuestion(game.id, game.current_question_index, game.total_questions);
  // ... reste inchange
};
```

### Aucun autre fichier modifie
Le companion (`index.js`) et le hook (`useLightingControl.ts`) restent inchanges. Le companion recoit simplement un deuxieme signal identique, ce qui dans Daslight/Sunlite desactive le programme lumineux (toggle).
