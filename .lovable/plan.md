
## Nouveaux raccourcis "O" et "P" pour la derniere question

### Concept
Sur la derniere question, au lieu d'envoyer V/R puis F separement, on envoie un seul signal combine :
- **"O"** = derniere question correcte (remplace V + F)
- **"P"** = derniere question incorrecte (remplace R + F)

Cela permet de declencher un programme lumineux specifique dans Daslight qui gere a la fois le resultat et la transition de fin de partie.

### Modifications

#### 1. `src/hooks/useLightingControl.ts`
- Ajouter `'LAST_GREEN' | 'LAST_RED'` aux types de signaux acceptes par `sendSignal`

#### 2. `src/pages/Admin.tsx`
- Modifier le `useEffect` qui detecte le resultat (lignes 118-129) : si c'est la derniere question, envoyer `LAST_GREEN` ou `LAST_RED` au lieu de `GREEN` ou `RED`
- Supprimer le `useEffect` d'auto-finish (lignes 140-160) car le signal combine remplace ce mecanisme
- Supprimer l'envoi du signal `FINISH` reactif (lignes 131-138) car il est inclus dans O/P
- Conserver l'appel automatique a `handleNextQuestion()` apres un delai de 2,5s pour terminer la partie cote base de donnees (mais sans envoyer de signal FINISH supplementaire)

#### 3. `lighting-companion/index.js`
- Ajouter les handlers pour `LAST_GREEN` et `LAST_RED` :
  - `LAST_GREEN` : envoie la touche `o` + lance la musique selon le score
  - `LAST_RED` : envoie la touche `p` + lance la musique selon le score
- Mettre a jour les logs de demarrage pour documenter les nouvelles touches O et P

### Fichiers modifies
- `src/hooks/useLightingControl.ts` (~1 ligne modifiee)
- `src/pages/Admin.tsx` (~15 lignes modifiees)
- `lighting-companion/index.js` (~20 lignes ajoutees)
