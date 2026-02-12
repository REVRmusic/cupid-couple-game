

## Maintenir les touches V et R pendant 8 secondes

### Objectif
Actuellement, quand une reponse est revelee, le companion envoie un simple appui sur V ou R. L'utilisateur souhaite que ces touches soient "maintenues" pendant 8 secondes (appui, puis relachement 8s plus tard), comme pour la touche F qui est maintenue 10 secondes.

### Ce qui change

Le systeme actuel d'extinction manuelle (re-envoi du signal au clic sur "Question suivante") n'est plus necessaire puisque la touche se relachera automatiquement apres 8 secondes.

### Modifications

#### 1. `lighting-companion/index.js`
Modifier les handlers GREEN et RED pour utiliser la meme logique que FINISH : appui sur la touche, puis `setTimeout` de 8 secondes, puis re-appui pour eteindre.

```javascript
if (data.type === 'GREEN') {
  console.log('Signal VERT - Appui touche V (8s)');
  await sendKey('v');
  setTimeout(async () => {
    console.log('Signal VERT - Relache touche V');
    await sendKey('v');
  }, 8000);
} else if (data.type === 'RED') {
  console.log('Signal ROUGE - Appui touche R (8s)');
  await sendKey('r');
  setTimeout(async () => {
    console.log('Signal ROUGE - Relache touche R');
    await sendKey('r');
  }, 8000);
}
```

#### 2. `src/pages/Admin.tsx`
Supprimer le code d'extinction manuelle dans `handleNextQuestion` (les lignes qui renvoient GREEN/RED avant de passer a la question suivante), puisque l'extinction est maintenant automatique apres 8 secondes.

#### 3. `lighting-companion/README.md`
Mettre a jour la documentation pour indiquer que V et R sont maintenus 8 secondes.

### Fichiers modifies
1. `lighting-companion/index.js` - V et R maintenus 8 secondes
2. `src/pages/Admin.tsx` - suppression de l'extinction manuelle
3. `lighting-companion/README.md` - mise a jour documentation

