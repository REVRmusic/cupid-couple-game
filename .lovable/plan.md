

## Solution : Companion sans aucune compilation native

### Le problème
- `windows-build-tools` est obsolète et échoue à l'installation
- `robotjs` et `@nut-tree/nut-js` nécessitent tous les deux une compilation C++ native qui ne fonctionne pas
- Ces outils sont abandonnés ou très difficiles à installer sur Windows moderne

### La solution
Utiliser **PowerShell** (déjà installé sur tout Windows) via `child_process` de Node.js pour simuler les appuis clavier. Cela signifie :
- **Aucune dépendance native** a compiler
- **Seule dépendance** : le package `ws` (pur JavaScript)
- `npm install` fonctionnera du premier coup, sans erreur

### Comment ca marche
Node.js appelle PowerShell en arrière-plan avec la classe .NET `System.Windows.Forms.SendKeys` pour envoyer les touches 'v' et 'r' au logiciel Daslight/Sunlite.

### Fichiers a modifier

#### `lighting-companion/package.json`
- Retirer `robotjs` et `@nut-tree/nut-js` des dépendances
- Garder uniquement `ws` comme dépendance

#### `lighting-companion/index.js`
- Supprimer l'import de robotjs
- Utiliser `child_process.exec` pour appeler PowerShell
- Commande PowerShell : `Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait('v')`
- La fonction `sendKey` devient asynchrone mais sans dépendance native

### Etapes sur le Mac

1. Supprimer l'ancien dossier `lighting-companion` s'il existe
2. Creer un nouveau dossier `lighting-companion`
3. Y mettre les deux fichiers (`package.json` et `index.js`)
4. **Ne pas** faire `npm install` sur Mac
5. Copier le dossier entier sur cle USB

### Etapes sur le PC Windows

1. Brancher la cle USB
2. Copier le dossier `lighting-companion` sur le Bureau
3. Ouvrir le menu Demarrer, taper `cmd`, ouvrir l'Invite de commandes
4. Taper : `cd Desktop\lighting-companion`
5. Taper : `npm install` (sera tres rapide, aucune compilation)
6. Taper : `npm start`
7. Ouvrir Daslight/Sunlite et le mettre au premier plan
8. Ouvrir la page Admin du jeu dans Chrome sur le meme PC

### Code complet

**package.json** :
```json
{
  "name": "lighting-companion",
  "version": "1.0.0",
  "description": "Companion app pour controler les lumieres via simulation clavier",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "ws": "^8.16.0"
  }
}
```

**index.js** :
```javascript
const WebSocket = require('ws');
const { exec } = require('child_process');

const PORT = 3001;
const wss = new WebSocket.Server({ port: PORT });

function sendKey(key) {
  return new Promise((resolve, reject) => {
    const cmd = `powershell -command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait('${key}')"`;
    exec(cmd, (error) => {
      if (error) {
        console.error('Erreur envoi touche:', error.message);
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

console.log('');
console.log('========================================');
console.log('  LIGHTING COMPANION - Cupid Game');
console.log('========================================');
console.log(`  Serveur demarre sur le port ${PORT}`);
console.log('');
console.log('  Touches configurees:');
console.log('    V = Vert (bonne reponse)');
console.log('    R = Rouge (mauvaise reponse)');
console.log('');
console.log('  En attente de connexion...');
console.log('========================================');
console.log('');

wss.on('connection', (ws) => {
  console.log('Connexion etablie avec la page Admin');

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message.toString());

      if (data.type === 'GREEN') {
        console.log('Signal VERT - Appui touche V');
        await sendKey('v');
      } else if (data.type === 'RED') {
        console.log('Signal ROUGE - Appui touche R');
        await sendKey('r');
      }
    } catch (e) {
      console.error('Erreur:', e.message);
    }
  });

  ws.on('close', () => {
    console.log('Connexion fermee');
  });
});

process.on('SIGINT', () => {
  console.log('Arret du serveur...');
  wss.close(() => process.exit(0));
});
```

### Pourquoi cette solution est meilleure
- `ws` est du pur JavaScript, aucune compilation necessaire
- `child_process` et `exec` font partie de Node.js (rien a installer)
- PowerShell est pre-installe sur tous les Windows depuis Windows 7
- `npm install` prendra 2 secondes au lieu d'echouer

### Mise a jour des fichiers dans le projet Lovable
Les fichiers `lighting-companion/package.json` et `lighting-companion/index.js` dans le repo seront mis a jour pour refléter cette nouvelle approche. Le hook `useLightingControl.ts` ne change pas car il communique via WebSocket, independamment de la methode de simulation clavier cote serveur.
