

## Fin de partie automatique apres la derniere question

### Comportement actuel
Quand les deux joueurs repondent a la derniere question, le resultat (vert/rouge) s'affiche mais l'admin doit cliquer manuellement sur "Question suivante" pour terminer la partie et envoyer le signal FINISH.

### Nouveau comportement
Quand les deux joueurs repondent a la **derniere question** :
1. Le signal vert (V) ou rouge (R) est envoye immediatement (inchange)
2. **5 secondes apres**, la partie se termine automatiquement et le signal FINISH est envoye

Le bouton "Question suivante" reste fonctionnel pour les questions intermediaires et comme securite sur la derniere question.

### Modification technique

**Fichier : `src/pages/Admin.tsx`**

Ajouter un `useEffect` qui detecte quand :
- La partie est en cours (`game.status === 'playing'`)
- C'est la derniere question (`game.current_question_index + 1 >= game.total_questions`)
- Le resultat vient d'etre revele (`currentQuestion.is_correct` passe de `null` a une valeur)

Dans ce cas, lancer un `setTimeout` de 5 secondes qui appelle `handleNextQuestion()` automatiquement (ce qui termine la partie et envoie le signal FINISH).

Le timeout sera nettoye si le composant se demonte ou si l'admin clique manuellement avant les 5 secondes.

### Fichier modifie
- `src/pages/Admin.tsx` (~15 lignes ajoutees)

