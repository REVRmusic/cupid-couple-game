

## Fix : delai entre la touche et la musique dans la companion app

### Probleme identifie
Le probleme vient de `lighting-companion/index.js`. Dans les handlers `LAST_GREEN` et `LAST_RED`, la musique se lance immediatement apres l'envoi de la touche. Comme `sendKey` utilise PowerShell (qui a un leger delai d'execution), le lecteur audio Windows peut prendre le focus avant que la touche ne soit effectivement recue par Daslight.

### Solution
Ajouter un delai de 500ms entre l'envoi de la touche (`sendKey`) et le lancement de la musique (`playMusic`) dans les handlers `LAST_GREEN` et `LAST_RED`.

### Modification dans `lighting-companion/index.js`

Pour les deux handlers `LAST_GREEN` (ligne 96-110) et `LAST_RED` (ligne 111-125) :

**Avant :**
```javascript
await sendKey('o');
// Jouer la musique immediatement
playMusic('music/perfect.mp3');
```

**Apres :**
```javascript
await sendKey('o');
// Attendre 500ms pour que Daslight ait le temps de recevoir la touche
setTimeout(() => {
  playMusic('music/perfect.mp3');
}, 500);
```

### Fichier modifie
- `lighting-companion/index.js` (~6 lignes modifiees dans les 2 handlers)

