

## Corriger l'extinction des lumieres au passage de question

### Le probleme
Le bouton "Question suivante" s'active des que les deux joueurs ont repondu, mais `is_correct` est mis a jour dans un second appel base de donnees asynchrone (dans `submitAnswer`). Quand l'admin clique rapidement, `currentQuestion?.is_correct` est encore `null`, donc aucune des deux conditions n'est remplie et aucun signal n'est envoye.

### La solution
Remplacer la verification de `is_correct` par une comparaison directe des reponses des joueurs. Les reponses (`player1_answer` et `player2_answer`) sont toujours disponibles quand le bouton est actif.

### Modification : `src/pages/Admin.tsx`

Remplacer dans `handleNextQuestion` (lignes 184-189) :

```typescript
// Avant (ne fonctionne pas - is_correct peut etre null)
if (currentQuestion?.is_correct === true) {
  sendSignal('GREEN');
} else if (currentQuestion?.is_correct === false) {
  sendSignal('RED');
}
```

Par :

```typescript
// Apres (fonctionne toujours - les reponses sont disponibles)
if (currentQuestion?.player1_answer && currentQuestion?.player2_answer) {
  if (currentQuestion.player1_answer === currentQuestion.player2_answer) {
    sendSignal('GREEN');
  } else {
    sendSignal('RED');
  }
}
```

### Aucun autre fichier modifie
Seule cette condition dans `handleNextQuestion` change. Le companion et le hook restent identiques.
