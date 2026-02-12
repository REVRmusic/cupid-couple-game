

## Ajouter la musique de fin de partie au Companion App

### Objectif
Quand la partie se termine, le companion joue automatiquement une musique differente selon le score : musique speciale pour un score parfait 10/10, musique normale sinon. La touche F continue de s'enclencher normalement en parallele.

### Modifications

#### 1. `src/hooks/useLightingControl.ts`
- Enrichir `sendSignal` pour accepter un payload optionnel `{ score, total }`

#### 2. `src/pages/Admin.tsx`
- Modifier les 3 appels `sendSignal('FINISH')` pour inclure le score : `sendSignal('FINISH', { score: game.score, total: game.total_questions })`

#### 3. `lighting-companion/index.js`
- Ajouter une fonction `playMusic(filePath)` qui utilise Windows Media Player via PowerShell (supporte MP3/WAV/WMA)
- Dans le handler FINISH : apres l'envoi de la touche F, jouer `music/perfect.mp3` si score parfait 10/10, sinon `music/normal.mp3`

#### 4. Nouveau fichier `lighting-companion/music/README.md`
- Instructions pour placer les fichiers `perfect.mp3` et `normal.mp3`

### Fonctionnement
1. La touche F s'enclenche immediatement (inchange)
2. En parallele, la musique demarre selon le score recu
3. La musique joue pendant 60 secondes maximum puis s'arrete

### Fichiers modifies
- `src/hooks/useLightingControl.ts` (~2 lignes)
- `src/pages/Admin.tsx` (~3 lignes)
- `lighting-companion/index.js` (~25 lignes ajoutees)
- `lighting-companion/music/README.md` (nouveau)

