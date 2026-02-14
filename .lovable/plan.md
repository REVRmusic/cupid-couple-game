

## Fix : Le score de fin de partie ne s'affiche plus sur l'ecran public

### Cause racine

Quand une partie se termine (status = 'finished'), le hook `useActiveGame()` cherche les parties avec status `['waiting', 'playing']`. Il ne trouve plus rien, donc `activeGame` devient `null`. L'effet a la ligne 92-94 detecte `!activeGame` et met immediatement `showWaitingScreen = true`, ce qui affiche l'ecran d'attente et saute completement l'affichage du score.

Le timer de 2 minutes n'a jamais l'occasion de se declencher.

### Solution

Modifier la logique dans `src/pages/Public.tsx` pour que l'ecran d'attente ne s'active pas quand un jeu termine vient de se terminer et que le timer de 2 minutes n'est pas encore ecoule.

### Modifications dans `src/pages/Public.tsx`

**a) Garder une reference au dernier jeu termine**

Ajouter un state `finishedGameId` qui memorise l'ID du jeu qui vient de finir. Cela permet de savoir qu'on est dans la phase "affichage du score pendant 2 min" meme si `activeGame` est devenu `null`.

**b) Modifier l'effet "no active game" (lignes 92-99)**

Ne plus mettre `showWaitingScreen = true` immediatement quand `activeGame` est null. A la place, verifier si on est dans la phase d'affichage du score (timer de 2 min en cours). Si oui, ne rien faire - le timer s'en chargera.

```text
useEffect(() => {
  if (!loadingActive && !activeGame && !waitingTimerRef.current && game?.status !== 'finished') {
    setShowWaitingScreen(true);
  }
  if (activeGame && activeGame.status !== 'finished') {
    setShowWaitingScreen(false);
  }
}, [activeGame, loadingActive, game?.status]);
```

**c) Modifier le timer de 2 minutes (lignes 68-89)**

Supprimer le cleanup qui annule le timer a chaque re-render (meme probleme que le fix precedent sur Admin). Utiliser un ref de garde pour ne creer le timer qu'une seule fois par partie terminee.

```text
const finishTimerScheduledRef = useRef<string | null>(null);

useEffect(() => {
  if (game?.status === 'finished' && finishTimerScheduledRef.current !== game.id) {
    finishTimerScheduledRef.current = game.id;
    waitingTimerRef.current = setTimeout(() => {
      setShowWaitingScreen(true);
      waitingTimerRef.current = null;
    }, 2 * 60 * 1000);
  }

  if (game?.status === 'playing' || game?.status === 'waiting') {
    finishTimerScheduledRef.current = null;
    setShowWaitingScreen(false);
    if (waitingTimerRef.current) {
      clearTimeout(waitingTimerRef.current);
      waitingTimerRef.current = null;
    }
  }
}, [game?.status, game?.id]);
```

**d) Ajuster l'ordre des conditions de rendu (lignes 122-229)**

Deplacer le bloc "Game finished - show results" (lignes 191-229) AVANT le bloc "Waiting screen" (lignes 122-174). Ainsi, tant que `showWaitingScreen` est false et que `game?.status === 'finished'`, le score s'affiche. L'ecran d'attente ne prend le relais qu'apres les 2 minutes.

Nouvelle logique de rendu :
1. Loading
2. Game finished + pas encore en waiting → afficher le score
3. Waiting screen (apres 2 min ou pas de partie)
4. No active game fallback
5. Waiting to start
6. Show result / Show question

### Concernant la derniere question non enregistree

Le code de `submitAnswer` et le mecanisme d'auto-finish dans Admin.tsx semblent corrects. Le probleme de "derniere reponse non enregistree" est probablement lie au fait que l'ecran de score ne s'affichait pas du tout (il sautait directement a l'ecran d'attente), donnant l'impression que la reponse n'etait pas prise en compte. Une fois le score correctement affiche, cela devrait etre verifie.

### Fichier modifie
- `src/pages/Public.tsx` uniquement (environ 30 lignes modifiees)

