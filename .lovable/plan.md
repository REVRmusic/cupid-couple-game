

## Corriger le score parfait et le lecteur multimedia

### Probleme 1 : Score parfait mal detecte

Dans `lighting-companion/index.js` ligne 87, la condition est :

```javascript
const isPerfect = data.score === data.total && data.total === 10;
```

Le `&& data.total === 10` est en trop. Avec une partie de 3 questions et un score de 3/3, ca ne passe jamais en "parfait". Il faut simplement verifier que le score est egal au total :

```javascript
const isPerfect = data.score === data.total;
```

### Probleme 2 : Lecteur multimedia

Le code utilise `WMPlayer.OCX` (Windows Media Player classique) qui n'est plus installe par defaut sur les versions recentes de Windows. Il faut utiliser a la place la commande `start` qui ouvre le fichier avec l'application par defaut du systeme (le lecteur multimedia moderne de Windows).

La fonction `playMusic` sera modifiee pour utiliser :

```javascript
const cmd = `start "" "${absolutePath}"`;
```

Cela ouvrira le fichier MP3 avec le lecteur multimedia par defaut de Windows. Pour arreter la musique precedente, on utilisera `taskkill` pour fermer le processus du lecteur.

### Modifications

#### `lighting-companion/index.js`

1. **Ligne 87** : Retirer `&& data.total === 10` de la condition `isPerfect`
2. **Fonction `playMusic`** : Remplacer la commande PowerShell `WMPlayer.OCX` par `start ""` qui lance le lecteur multimedia par defaut de Windows
3. **Fonction `stopMusic`** : Adapter pour fermer le processus du lecteur multimedia si necessaire

### Fichier modifie
- `lighting-companion/index.js` (~10 lignes modifiees)
