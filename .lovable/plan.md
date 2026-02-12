
## Ajouter des boutons de test lumieres dans l'Admin

### Objectif
Ajouter 3 boutons dans le header de l'interface Admin, a cote de l'indicateur de connexion lumieres, pour envoyer manuellement les signaux GREEN, RED et FINISH vers le companion.

### Modification : `src/pages/Admin.tsx`

Remplacer l'indicateur de connexion lumieres actuel (lignes 264-268) par un groupe incluant l'indicateur existant + 3 boutons de test :

```typescript
{/* Lighting Control */}
<div className="flex items-center gap-2" title={isLightingConnected ? "Companion lumieres connecte" : "Companion lumieres deconnecte"}>
  <span className={`w-2 h-2 rounded-full ${isLightingConnected ? 'bg-green-500' : 'bg-gray-300'}`} />
  <span className="text-xs text-muted-foreground">Lumieres</span>
  {isLightingConnected && (
    <div className="flex items-center gap-1 ml-2">
      <Button size="sm" variant="outline" className="h-6 px-2 text-xs" onClick={() => sendSignal('GREEN')}>V</Button>
      <Button size="sm" variant="outline" className="h-6 px-2 text-xs" onClick={() => sendSignal('RED')}>R</Button>
      <Button size="sm" variant="outline" className="h-6 px-2 text-xs" onClick={() => sendSignal('FINISH')}>F</Button>
    </div>
  )}
</div>
```

Les boutons n'apparaissent que quand le companion est connecte. Chaque bouton envoie directement le signal correspondant (V = 8s, R = 8s, F = 10s).

### Fichier modifie
- `src/pages/Admin.tsx` uniquement (quelques lignes dans le header)
