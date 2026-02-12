

## Diagnostiquer et corriger le signal FINISH

### Analyse

Le code dans `handleNextQuestion` appelle bien `sendSignal('FINISH')` quand la partie se termine. Cependant, il est possible que :
1. La fonction `sendSignal` soit appelee mais que le WebSocket ne soit plus `OPEN` a ce moment-la
2. Le signal soit envoye mais que le companion ne le traite pas correctement

### Modifications

#### 1. `src/hooks/useLightingControl.ts`
Ajouter un log plus explicite dans `sendSignal` pour confirmer si le message est envoye ou non :

```typescript
const sendSignal = useCallback((type: 'GREEN' | 'RED' | 'FINISH') => {
  if (ws.current?.readyState === WebSocket.OPEN) {
    ws.current.send(JSON.stringify({ type }));
    console.log(`Signal ${type} sent successfully`);
  } else {
    console.warn(`Signal ${type} FAILED - WebSocket not open (state: ${ws.current?.readyState})`);
  }
}, []);
```

#### 2. `src/pages/Admin.tsx`
Ajouter un log avant l'appel a `sendSignal` dans `handleNextQuestion` pour confirmer que le code est atteint :

```typescript
} else if (finished) {
  console.log('Game finished - sending FINISH signal');
  sendSignal('FINISH');
  toast({ title: "Termine !", description: "La partie est terminee" });
}
```

Ces logs permettront de verifier dans la console du navigateur si le signal est bien envoye. Si les logs confirment que le signal part correctement, le probleme est cote companion ou logiciel de lumieres.

### Fichiers modifies
1. `src/hooks/useLightingControl.ts` - ajout de logs de diagnostic
2. `src/pages/Admin.tsx` - ajout d'un log dans handleNextQuestion

