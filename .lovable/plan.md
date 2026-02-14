

## Fix : Eliminer la desynchronisation a la source dans useGame.ts

### Pourquoi le fix precedent ne suffit pas

Le garde `currentQuestion?.question_order === game.current_question_index` dans Admin.tsx est correct en theorie, mais le probleme fondamental reste : `currentQuestion` est calcule dans un `useEffect` (ligne 111-115 de `useGame.ts`), ce qui signifie qu'il est mis a jour **un rendu en retard** par rapport a `game`. Cela cree une fenetre de desynchronisation a chaque changement de question.

La vraie solution est d'eliminer ce decalage en calculant `currentQuestion` de maniere **synchrone** avec `useMemo` au lieu d'un `useEffect` + `useState`.

### Cause racine

Dans `src/hooks/useGame.ts`, lignes 111-116 :

```text
useEffect(() => {
  if (game && gameQuestions.length > 0) {
    const current = gameQuestions[game.current_question_index];
    setCurrentQuestion(current || null);
  }
}, [game, gameQuestions]);
```

`useEffect` s'execute APRES le rendu. Donc quand `game.current_question_index` passe a 9 (derniere question), il y a un rendu intermediaire ou `game` est a jour mais `currentQuestion` pointe encore sur l'ancienne question (index 8) avec `is_correct` deja defini. Meme avec le garde, les effets dans Admin.tsx peuvent s'executer dans un ordre imprevisible selon le batching de React.

### Solution

Remplacer le `useEffect` + `useState` pour `currentQuestion` par un `useMemo`. Le `useMemo` est calcule **pendant** le rendu, pas apres. Il n'y a donc jamais de decalage entre `game.current_question_index` et `currentQuestion`.

### Modification dans `src/hooks/useGame.ts`

**Avant :**
```text
const [currentQuestion, setCurrentQuestion] = useState<GameQuestion | null>(null);

// ... plus loin ...

useEffect(() => {
  if (game && gameQuestions.length > 0) {
    const current = gameQuestions[game.current_question_index];
    setCurrentQuestion(current || null);
  }
}, [game, gameQuestions]);
```

**Apres :**
```text
const currentQuestion = useMemo(() => {
  if (game && gameQuestions.length > 0) {
    return gameQuestions[game.current_question_index] || null;
  }
  return null;
}, [game, gameQuestions]);
```

- Supprimer le `useState` pour `currentQuestion`
- Supprimer le `useEffect` qui le mettait a jour
- Ajouter `useMemo` a l'import React
- `currentQuestion` est maintenant toujours synchronise avec `game.current_question_index` dans le meme rendu

### Impact

- `currentQuestion` est toujours en phase avec `game.current_question_index` - plus jamais de rendu intermediaire desynchronise
- L'auto-finish dans Admin.tsx ne peut plus se declencher avec des donnees obsoletes
- Le garde `question_order === current_question_index` reste en place comme securite supplementaire
- Aucun changement d'API : le hook retourne toujours `{ game, gameQuestions, currentQuestion, loading, refetch }`

### Fichier modifie
- `src/hooks/useGame.ts` uniquement (3 lignes modifiees)

