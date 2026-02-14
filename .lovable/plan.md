

## Ecran d'attente entre les quiz + heure de la prochaine seance

### Fonctionnement

1. **Ecran public** : Apres la fin d'une partie, les resultats s'affichent pendant 2 minutes, puis un ecran d'attente apparait avec le logo, les logos partenaires, et l'heure de la prochaine seance (ex: "Prochaine seance a 15h30").
2. **Espace admin** : Un nouveau champ dans l'onglet "Partie" permet de saisir l'heure de la prochaine seance. Cette heure est stockee en base de donnees dans une table `settings`.

### Modifications

#### 1. Base de donnees : nouvelle table `settings`

Creation d'une table `settings` avec une seule ligne contenant `next_session_time` (texte, ex: "15h30"). Pas de RLS car les donnees sont publiques (affichees sur le projecteur).

```text
CREATE TABLE public.settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  next_session_time text DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

INSERT INTO public.settings (next_session_time) VALUES ('');

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Anyone can update settings" ON public.settings FOR UPDATE USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.settings;
```

#### 2. `src/hooks/useGame.ts` : nouveau hook `useSettings`

Ajouter un hook `useSettings()` qui :
- Lit la ligne unique de `settings` via Supabase
- Ecoute les changements en realtime
- Expose `nextSessionTime` et `updateNextSessionTime(time: string)`

#### 3. `src/pages/Public.tsx` : timer 2 min + ecran d'attente

- Quand `game?.status === 'finished'`, demarrer un timer de 2 minutes
- Apres 2 minutes, remplacer l'ecran de resultats par un ecran d'attente :
  - Logo en haut
  - Icone coeur animee
  - "Prochaine seance a [heure]" si une heure est configuree
  - Logos partenaires en bas
- Si aucune heure n'est configuree, afficher "A bientot pour la prochaine partie !"

#### 4. `src/pages/Admin.tsx` : champ "Prochaine seance"

- Ajouter dans l'onglet "Partie" (en haut, visible meme sans partie active) un champ input pour saisir l'heure de la prochaine seance
- Bouton "Enregistrer" a cote
- Utiliser `useSettings()` pour lire/ecrire la valeur

### Details techniques

- La table `settings` est en realtime pour que le changement d'heure sur l'admin se repercute immediatement sur l'ecran public
- Le timer de 2 minutes est gere par un `useState` + `useEffect` dans `Public.tsx`, declenche quand le jeu passe en `finished`
- L'ecran d'attente reste affiche jusqu'a ce qu'une nouvelle partie soit creee

### Fichiers modifies
- `src/hooks/useGame.ts` (ajout hook `useSettings`)
- `src/pages/Public.tsx` (timer 2 min + ecran d'attente)
- `src/pages/Admin.tsx` (champ heure prochaine seance)
- Migration SQL (table `settings`)

