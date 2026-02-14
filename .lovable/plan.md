

## Fix : signal premature sur la derniere question + retour a V/R + F

### Probleme
Quand on avance a la derniere question, le signal V/R se declenche immediatement sans attendre la reponse des joueurs. Cela vient du `useEffect` (ligne 115) qui ne detecte pas correctement le changement de question -- `prevIsCorrectRef` garde la valeur de la question precedente et ne se reinitialise pas proprement.

### Solution en 3 fichiers

#### 1. `src/pages/Admin.tsx` (~20 lignes modifiees)

**a) Ajouter un tracking de l'index de question** pour reinitialiser `prevIsCorrectRef` quand on change de question :
```text
const prevQuestionIndexRef = useRef<number | undefined>(undefined);
```

**b) Modifier le useEffect du signal (lignes 115-135)** :
- Detecter le changement de question et reinitialiser `prevIsCorrectRef` a `undefined` dans ce cas (sans envoyer de signal)
- Supprimer toute la logique `isLastQuestion` / `LAST_GREEN` / `LAST_RED`
- Toujours envoyer `GREEN` ou `RED` uniquement, quelle que soit la question

**c) Modifier le useEffect d'auto-finish (lignes 139-157)** :
- Envoyer `sendSignal('FINISH', { score, total })` juste avant d'appeler `handleNextQuestion()`
- Le score passe via le signal pour que la companion app joue la bonne musique

#### 2. `lighting-companion/index.js` (~40 lignes modifiees)

- Supprimer les handlers `LAST_GREEN` et `LAST_RED` entierement
- Modifier le handler `FINISH` pour :
  1. Envoyer la touche `f`
  2. Attendre 500ms
  3. Jouer la musique selon le score (si `data.score` et `data.total` sont fournis)

#### 3. `src/hooks/useLightingControl.ts` (~1 ligne)

- Retirer `LAST_GREEN` et `LAST_RED` du type de signal : `'GREEN' | 'RED' | 'FINISH'`

### Resultat attendu
- Questions 1 a N-1 : V ou R envoye quand les deux joueurs ont repondu (inchange)
- Derniere question : V ou R envoye quand les deux joueurs ont repondu (comme les autres)
- 2.5s apres la derniere reponse : F envoye, puis musique 500ms plus tard
- Plus de declenchement premature sur la derniere question

