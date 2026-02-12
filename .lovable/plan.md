
## Revenir a un simple appui pour V et R

### Objectif
Le systeme de double appui (toggle ON puis toggle OFF apres 8s) ne fonctionne pas bien avec le logiciel de lumieres. On revient a un simple appui unique sur V et R, et c'est le logiciel de lumieres qui gerera l'extinction automatique.

Le signal FINISH garde son comportement actuel (double appui avec 10s de delai) sauf indication contraire.

### Modification : `lighting-companion/index.js`

Supprimer les `setTimeout` pour GREEN et RED, ne garder qu'un seul appui :

```javascript
if (data.type === 'GREEN') {
  console.log('Signal VERT - Appui touche V');
  await sendKey('v');
} else if (data.type === 'RED') {
  console.log('Signal ROUGE - Appui touche R');
  await sendKey('r');
} else if (data.type === 'FINISH') {
  // Garde le comportement actuel avec 10s
  ...
}
```

### Fichier modifie
- `lighting-companion/index.js` uniquement
