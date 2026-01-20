-- Add category column to questions table
ALTER TABLE public.questions 
ADD COLUMN category text NOT NULL DEFAULT 'Général';

-- Update existing questions with categories based on their content
UPDATE public.questions SET category = 'Vie quotidienne' WHERE text ILIKE '%matin%' OR text ILIKE '%courses%' OR text ILIKE '%ménage%' OR text ILIKE '%cuisine%' OR text ILIKE '%vaisselle%' OR text ILIKE '%poubelles%' OR text ILIKE '%repassage%' OR text ILIKE '%plantes%' OR text ILIKE '%douche%' OR text ILIKE '%retard%' OR text ILIKE '%budget%' OR text ILIKE '%vacances%' OR text ILIKE '%téléphone%' OR text ILIKE '%affaires%' OR text ILIKE '%restes%' OR text ILIKE '%mange%vite%';

UPDATE public.questions SET category = 'Romance' WHERE text ILIKE '%premier pas%' OR text ILIKE '%câlin%' OR text ILIKE '%amour%' OR text ILIKE '%romantique%' OR text ILIKE '%cadeaux%' OR text ILIKE '%surprises%' OR text ILIKE '%bisous%' OR text ILIKE '%compliments%' OR text ILIKE '%vivre ensemble%' OR text ILIKE '%futur ensemble%' OR text ILIKE '%possessif%' OR text ILIKE '%attentionné%' OR text ILIKE '%sensible%' OR text ILIKE '%jaloux%';

UPDATE public.questions SET category = 'Personnalité' WHERE text ILIKE '%patient%' OR text ILIKE '%énerve%' OR text ILIKE '%boude%' OR text ILIKE '%optimiste%' OR text ILIKE '%stressé%' OR text ILIKE '%organisé%' OR text ILIKE '%créatif%' OR text ILIKE '%timide%' OR text ILIKE '%bavard%' OR text ILIKE '%sportif%' OR text ILIKE '%paresseux%' OR text ILIKE '%gourmand%' OR text ILIKE '%curieux%' OR text ILIKE '%rêveur%' OR text ILIKE '%aventurier%' OR text ILIKE '%perfectionniste%';

UPDATE public.questions SET category = 'Sorties' WHERE text ILIKE '%restaurant%' OR text ILIKE '%maison%' OR text ILIKE '%danse%' OR text ILIKE '%chante%' OR text ILIKE '%soirée%' OR text ILIKE '%rentrer%' OR text ILIKE '%drague%' OR text ILIKE '%playlists%' OR text ILIKE '%jeux de société%' OR text ILIKE '%triche%' OR text ILIKE '%film%' OR text ILIKE '%séries%' OR text ILIKE '%télé%';

UPDATE public.questions SET category = 'Disputes' WHERE text ILIKE '%raison%' OR text ILIKE '%excuse%' OR text ILIKE '%tête%' OR text ILIKE '%crie%' OR text ILIKE '%portes%' OR text ILIKE '%histoires%' OR text ILIKE '%compromis%' OR text ILIKE '%canapé%' OR text ILIKE '%dispute%' OR text ILIKE '%pardonner%' OR text ILIKE '%rancune%' OR text ILIKE '%pardonne%';

UPDATE public.questions SET category = 'Famille' WHERE text ILIKE '%belle-famille%' OR text ILIKE '%beaux-parents%' OR text ILIKE '%enfants%' OR text ILIKE '%parent%' OR text ILIKE '%amis%' OR text ILIKE '%repas de famille%' OR text ILIKE '%prénoms%';

UPDATE public.questions SET category = 'Humour' WHERE text ILIKE '%île déserte%' OR text ILIKE '%célèbre%' OR text ILIKE '%super-héros%' OR text ILIKE '%karaoké%' OR text ILIKE '%pizza%' OR text ILIKE '%pieds%froid%' OR text ILIKE '%couette%' OR text ILIKE '%sommeil%' OR text ILIKE '%tatouage%' OR text ILIKE '%voyage%' OR text ILIKE '%zombie%' OR text ILIKE '%horreur%' OR text ILIKE '%détective%' OR text ILIKE '%loto%' OR text ILIKE '%animaux%' OR text ILIKE '%végétarien%' OR text ILIKE '%mariage%';

UPDATE public.questions SET category = 'Habitudes' WHERE text ILIKE '%ronfle%' OR text ILIKE '%dormant%' OR text ILIKE '%humeur%' OR text ILIKE '%lever%' OR text ILIKE '%préparer%' OR text ILIKE '%dressing%' OR text ILIKE '%vêtements%' OR text ILIKE '%chaussures%' OR text ILIKE '%salle de bain%' OR text ILIKE '%eau chaude%';

UPDATE public.questions SET category = 'Nourriture' WHERE text ILIKE '%cuisine%mieux%' OR text ILIKE '%brûler%' OR text ILIKE '%chocolat%' OR text ILIKE '%grignote%' OR text ILIKE '%difficile%table%' OR text ILIKE '%assiette%' OR text ILIKE '%épicé%' OR text ILIKE '%café%' OR text ILIKE '%commande%même%';

UPDATE public.questions SET category = 'Tech' WHERE text ILIKE '%réseaux sociaux%' OR text ILIKE '%abonnés%' OR text ILIKE '%photos%couple%' OR text ILIKE '%jeux vidéo%' OR text ILIKE '%onglets%' OR text ILIKE '%mots de passe%' OR text ILIKE '%ligne%';

UPDATE public.questions SET category = 'Argent' WHERE text ILIKE '%dépense%' OR text ILIKE '%radin%' OR text ILIKE '%impulsifs%' OR text ILIKE '%négocie%' OR text ILIKE '%tickets%' OR text ILIKE '%paie%' OR text ILIKE '%chers%' OR text ILIKE '%économies%' OR text ILIKE '%fidélité%';

UPDATE public.questions SET category = 'Voyage' WHERE text ILIKE '%valises%' OR text ILIKE '%voyage%' OR text ILIKE '%carte%' OR text ILIKE '%chemin%' OR text ILIKE '%avion%' OR text ILIKE '%voiture%' OR text ILIKE '%destinations%' OR text ILIKE '%vacances%' OR text ILIKE '%musées%' OR text ILIKE '%plage%' OR text ILIKE '%montagne%';

UPDATE public.questions SET category = 'Santé' WHERE text ILIKE '%hypocondriaque%' OR text ILIKE '%malade%' OR text ILIKE '%soin%' OR text ILIKE '%sport%' OR text ILIKE '%sainement%' OR text ILIKE '%sommeil%' OR text ILIKE '%frileux%' OR text ILIKE '%chaud%' OR text ILIKE '%eau%' OR text ILIKE '%médicaments%';

UPDATE public.questions SET category = 'Émotions' WHERE text ILIKE '%pleure%' OR text ILIKE '%rit%' OR text ILIKE '%araignées%' OR text ILIKE '%sursaute%' OR text ILIKE '%noir%' OR text ILIKE '%émotif%' OR text ILIKE '%cache%émotions%' OR text ILIKE '%nostalgique%';

UPDATE public.questions SET category = 'Communication' WHERE text ILIKE '%parle%plus%' OR text ILIKE '%écoute%' OR text ILIKE '%interrompt%' OR text ILIKE '%histoires%' OR text ILIKE '%exagère%' OR text ILIKE '%secrets%' OR text ILIKE '%menteur%' OR text ILIKE '%questions%' OR text ILIKE '%conseils%' OR text ILIKE '%dernier mot%';

UPDATE public.questions SET category = 'Travail' WHERE text ILIKE '%carriériste%' OR text ILIKE '%travail%' OR text ILIKE '%retraite%' OR text ILIKE '%patron%' OR text ILIKE '%dur%' OR text ILIKE '%procrastine%' OR text ILIKE '%mail%';