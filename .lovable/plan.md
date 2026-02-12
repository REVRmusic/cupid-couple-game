

## Corriger definitivement le signal FINISH

### Diagnostic

Le code actuel envoie bien `sendSignal('FINISH')` avant la mise a jour de la base de donnees, mais le signal ne semble toujours pas atteindre le companion. Plusieurs causes possibles :

1. **L'objet `game` pourrait avoir des valeurs inattendues** au moment du clic (mis a jour par le realtime entre-temps)
2. **Le message WebSocket pourrait ne pas etre flush** avant que le re-rendu du composant ne ferme la connexion
3. **La condition `isLastQuestion` pourrait etre fausse** si `current_question_index` ou `total_questions` ont des valeurs inattendues

### Solution

Adopter une approche plus robuste avec :
1. Logs detailles pour confirmer les valeurs de `game` au moment du clic
2. Ajout d'un petit delai (`await` d'un timeout de 200ms) apres l'envoi du signal FINISH et avant l'appel a `nextQuestion`, pour s'assurer que le message WebSocket est bien parti
3. Garder aussi l'envoi apres le retour de `nextQuestion` comme filet de securite (double envoi)

### Modifications

#### `src/pages/Admin.tsx` - fonction `handleNextQuestion`

```typescript
const handleNextQuestion = async () => {
  if (!game) return;
  
  const isLastQuestion = game.current_question_index + 1 >= game.total_questions;
  
  console.log('🎭 handleNextQuestion called', {
    currentIndex: game.current_question_index,
    totalQuestions: game.total_questions,
    isLastQuestion,
    wsConnected: isLightingConnected
  });
  
  if (isLastQuestion) {
    console.log('🎭 Sending FINISH signal before DB update');
    sendSignal('FINISH');
    // Attendre 200ms pour s'assurer que le message WebSocket est bien envoye
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  const { error, finished } = await nextQuestion(game.id, game.current_question_index, game.total_questions);
  if (error) {
    toast({ title: "Erreur", description: "Impossible de passer a la question suivante", variant: "destructive" });
  } else if (finished) {
    // Double envoi comme filet de securite
    console.log('🎭 DB confirmed finished - sending FINISH signal again as safety net');
    sendSignal('FINISH');
    toast({ title: "Termine !", description: "La partie est terminee" });
  }
};
```

### Fichier modifie
- `src/pages/Admin.tsx` uniquement (fonction `handleNextQuestion`)

