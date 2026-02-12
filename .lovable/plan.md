

## Ajouter un signal "FINISH" avec touche F maintenue 10 secondes

### Objectif
A la fin du quizz, envoyer un signal special au companion qui appuiera sur la touche `F` pendant 10 secondes pour activer un programme lumineux de fin de partie.

### Modifications

#### 1. `lighting-companion/index.js`
- Ajouter une fonction `holdKey(key, durationMs)` qui utilise PowerShell pour maintenir une touche enfoncee pendant une duree donnee (via `SendKeys` avec un `Start-Sleep` entre le press et le release, en utilisant l'API `keybd_event` de Windows pour simuler un appui maintenu)
- Note : `SendKeys.SendWait` ne supporte pas le maintien de touche. On utilisera plutot deux appuis : un premier appui sur `F` pour activer, puis un second appui 10s plus tard pour desactiver (meme logique toggle que pour V et R)
- Ajouter le traitement du signal `FINISH` : appui sur `f`, puis `setTimeout` de 10 secondes, puis re-appui sur `f`
- Mettre a jour les logs de demarrage pour afficher la touche F

#### 2. `src/hooks/useLightingControl.ts`
- Etendre le type du signal de `'GREEN' | 'RED'` a `'GREEN' | 'RED' | 'FINISH'`

#### 3. `src/pages/Admin.tsx`
- Dans `handleNextQuestion`, quand `finished === true`, envoyer `sendSignal('FINISH')` apres avoir eteint la lumiere de la derniere question

### Details techniques

**Companion (`index.js`)** - nouveau handler :
```javascript
} else if (data.type === 'FINISH') {
  console.log('Signal FINISH - Appui touche F (10s)');
  await sendKey('f');
  setTimeout(async () => {
    console.log('Signal FINISH - Relache touche F');
    await sendKey('f');
  }, 10000);
}
```

**Hook (`useLightingControl.ts`)** - signature mise a jour :
```typescript
const sendSignal = useCallback((type: 'GREEN' | 'RED' | 'FINISH') => {
```

**Admin (`Admin.tsx`)** - dans `handleNextQuestion` apres le `nextQuestion()` :
```typescript
} else if (finished) {
  sendSignal('FINISH');
  toast({ title: "Termine !", description: "La partie est terminee" });
}
```

### Fichiers modifies
1. `lighting-companion/index.js` - ajout handler FINISH avec double appui espace de 10s
2. `src/hooks/useLightingControl.ts` - ajout type FINISH
3. `src/pages/Admin.tsx` - envoi signal FINISH quand la partie se termine
4. `lighting-companion/README.md` - mise a jour documentation avec touche F

