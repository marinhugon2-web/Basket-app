# Court Forge — Dashboard Aujourd’hui + moteur XP

Module Expo / React Native autonome qui implémente uniquement :

1. l’écran principal **Aujourd’hui** ;
2. le moteur XP complet des six catégories basket.

Le projet fonctionne sur iOS, Android et web avec Expo Router.

## Lancer le projet

Prérequis : Node.js 20 ou plus récent et npm.

```bash
npm install
npm start
```

Puis utiliser :

- `i` pour le simulateur iOS ;
- `a` pour Android ;
- `w` pour le navigateur ;
- le QR code avec Expo Go.

Commandes directes :

```bash
npm run ios
npm run android
npm run web
```

## Validation technique

```bash
npm run validate
```

Cette commande exécute successivement :

- le contrôle TypeScript strict ;
- ESLint avec la configuration Expo ;
- les tests Vitest du moteur XP.

## Dashboard Aujourd’hui

L’écran contient :

- carte joueur et niveau global ;
- répartition réelle XP vérifiés / régularité ;
- prochaine quête prioritaire ;
- trois types de quêtes : progression vérifiée, séance de qualité et présence ;
- streak de qualité distinct du streak de présence ;
- progression des six catégories ;
- XP de régularité en réserve ;
- accès fonctionnels aux quatre espaces principaux sous forme de panneaux de synthèse ;
- navigation basse fixe ;
- persistance locale avec AsyncStorage ;
- bouton de réinitialisation de la démonstration.

Les données de démonstration sont complètes et peuvent être réinitialisées à tout moment.

## Catégories XP

- Finition
- Tir
- Explosivité
- Défense
- Handle
- Endurance

Chaque catégorie possède son propre ledger :

```text
verifiedXp
regularityXp
pendingRegularityXp
totalXp
eventCount
```

## Règle 70 / 30 réellement appliquée

Pour chaque catégorie :

```text
regularityXp <= floor(verifiedXp × 3 / 7)
```

Cette formule garantit simultanément :

```text
verifiedXp / totalXp >= 70 %
regularityXp / totalXp <= 30 %
```

Lorsqu’une séance de qualité ou une présence dépasse la capacité autorisée, l’excédent est stocké dans `pendingRegularityXp`.

Lorsqu’une nouvelle preuve vérifiée est validée :

1. l’XP vérifié est attribué ;
2. la capacité de régularité autorisée est recalculée ;
3. la réserve est libérée uniquement dans cette nouvelle capacité ;
4. les invariants 70 / 30 sont contrôlés avant de retourner le nouvel état.

La règle est appliquée **catégorie par catégorie**, ce qui est plus strict qu’un simple plafond global.

## Sources XP

### Sources vérifiées

- `verified_test`
- `verified_video`
- `standard_measurement`

Elles exigent :

- un reçu de validation complet ;
- un protocole identifié ;
- une empreinte d’intégrité ;
- une date de validation ;
- une progression positive mesurée.

Une preuve sans amélioration positive est refusée et ne génère aucun XP.

### Sources de régularité

- `quality_session`
- `presence`

Une séance de qualité exige au minimum :

- trois champs mesurés ;
- un score de qualité entre 0,60 et 1,00 ;
- une durée entre 15 et 240 minutes ;
- des dates cohérentes.

Une présence brute vaut seulement 5 XP bruts et reste soumise au plafond 30 %.

## Calcul des XP

Le calcul dépend :

- de la source ;
- de la difficulté ;
- du progrès relatif mesuré ;
- de la qualité et de la durée pour les séances documentées.

Les améliorations extrêmes sont plafonnées dans le multiplicateur afin d’éviter une inflation artificielle.

## Niveaux

Les niveaux utilisent des seuils croissants :

```text
seuil = base × (niveau - 1)^1,55
```

- base catégorie : 110 XP ;
- base globale : 700 XP.

Le moteur retourne pour chaque niveau :

- niveau actuel ;
- seuil actuel ;
- seuil suivant ;
- XP dans le niveau ;
- XP nécessaires ;
- progression normalisée de 0 à 1.

## Streaks

Les streaks sont calculés par **jour calendaire**, pas par nombre d’événements.

- plusieurs événements le même jour ne comptent qu’une fois ;
- un jour consécutif incrémente le streak ;
- une interruption supérieure à un jour réinitialise le streak ;
- une séance de qualité alimente les streaks qualité et présence ;
- une simple présence n’alimente que le streak de présence.

## Animations

### Gain d’XP standard

- apparition rapide ;
- translation et léger rebond ;
- feedback haptique ;
- durée totale : environ 820 ms.

### Montée de niveau — Forge Break

- extinction visuelle du fond ;
- ligne de validation traversante ;
- arc signature ;
- feedback haptique fort ;
- durée totale : environ 1 100 ms.

La première quête vérifiée de la démonstration est calibrée pour déclencher une montée de niveau de catégorie.

## Structure principale

```text
app/
  _layout.tsx
  index.tsx
src/
  components/
  design/
  domain/
    dashboard.ts
    xp/
      engine.ts
      seed.ts
      types.ts
  screens/
    TodayDashboard.tsx
  state/
    xp-context.tsx
tests/
  xp-engine.test.ts
```

## Design system appliqué

- fond Abyss `#090A0C` ;
- surfaces `#12151A`, `#181C22`, `#20252D` ;
- accent Volt `#C7FF2F` ;
- validation `#2CE0C1` ;
- titres Barlow Condensed ;
- interface Inter ;
- chiffres JetBrains Mono ;
- cartes à coupe 45 degrés ;
- espace basé sur une grille de 4 px ;
- thème sombre uniquement.
