

## Corriger definitivement le signal FINISH

### Diagnostic

Les signaux GREEN et RED fonctionnent parce qu'ils sont declenches de maniere **reactive** via un `useEffect` qui surveille `currentQuestion.is_correct`. Le signal FINISH, lui, depend uniquement du clic sur "Question suivante" dans `handleNextQuestion`. Meme avec le pre-envoi avant la mise a jour DB, le signal peut echouer si :
- L'etat `game` est desynchronise au moment du clic
- Le WebSocket n'est pas pret a ce moment precis
- Un re-rendu rapide interfere avec l'envoi

### Solution

Adopter la meme approche reactive que GREEN/RED : ajouter un `useEffect` qui surveille le changement de statut du jeu et envoie automatiquement le signal FINISH quand `game.status` passe a `'finished'`.

### Modifications

#### `src/pages/Admin.tsx`

1. **Ajouter un ref pour tracker le statut precedent** (comme `prevIsCorrectRef` pour GREEN/RED) :

```typescript
const prevGameStatusRef = useRef<string | undefined>(undefined);
```

2. **Ajouter un useEffect reactif pour FINISH** :

```typescript
// Send FINISH signal when game status transitions to 'finished'
useEffect(() => {
  if (game?.status === 'finished' && prevGameStatusRef.current === 'playing') {
    console.log('🎭 Game status changed to finished - sending FINISH signal');
    sendSignal('FINISH');
  }
  prevGameStatusRef.current = game?.status;
}, [game?.status, sendSignal]);
```

3. **Garder aussi le pre-envoi dans handleNextQuestion** comme mesure de securite supplementaire (ceinture et bretelles).

### Pourquoi ca va marcher

- C'est exactement le meme mecanisme que GREEN/RED, qui fonctionne
- Le signal est declenche par le changement d'etat reel, pas par un clic
- Meme si le realtime met a jour `game.status` avant que `handleNextQuestion` ne termine, le useEffect captera la transition

### Fichier modifie
- `src/pages/Admin.tsx` : ajout d'un ref et d'un useEffect (~10 lignes)

