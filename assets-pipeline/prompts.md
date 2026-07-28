# Prompts d'illustration — Squirrel Heroes

Chantier transverse « pipeline d'assets » (§6.3 des specs). Ce document ne
contient **que des prompts texte** — pas de script d'appel API pour
l'instant (décision actée : génération manuelle via un outil gratuit, cf.
ci-dessous). Couvre désormais **l'ensemble du jeu** : les 51 cartes
authored (Phase 1, lots 1-3 de la Phase 7), les 3 héros, les 4 familiers,
les 10 ennemis, les icônes de statut, les effets de combat, tous les
écrans, et les animations de combat qu'ils permettent.

## Outils gratuits recommandés

**Google Gemini** (app ou AI Studio, modèle de génération/édition d'image
« Nano Banana » / Gemini 2.5 Flash Image) — recommandé en priorité pour
**tout ce qui doit rester le même personnage d'une image à l'autre**
(les 3 poses d'un héros/ennemi, les 4 familiers, et toute carte où ce
personnage réapparaît) :
- Édition conversationnelle : on peut redonner un portrait déjà généré en
  référence et demander « le même personnage, mais en pleine action » —
  c'est exactement le problème central ici (cohérence d'un même
  personnage à travers ses poses ET ses cartes).
- Très bon suivi d'instructions complexes (plusieurs éléments à la fois :
  pose, effet de statut, cadrage).
- Gratuit avec un compte Google classique.
- Limites : quota quotidien gratuit limité et fluctuant (généralement
  quelques dizaines d'images/jour) — générer ~136 images prendra
  plusieurs jours/sessions. Pas de seed numérique façon Stable Diffusion,
  la reproductibilité vient de la conversation. Le cadrage carré 1:1
  n'est pas garanti par défaut : toujours le redemander explicitement.

**Microsoft Copilot** (Designer, moteur DALL·E 3) — bonne alternative,
en particulier pour les assets **sans personnage récurrent à préserver**
(fonds d'écran, icônes de statut, effets de combat, cartes neutres) ou
quand le quota Gemini du jour est épuisé :
- Gratuit avec un compte Microsoft, « boosts » quotidiens généreux pour
  des générations rapides.
- Bon rendu « peint numériquement » cartoon par défaut, proche du style
  visé sans forcer beaucoup le prompt.
- Limites : moins fiable pour « garde ce personnage exact, change juste
  la pose » — chaque génération est plus indépendante, donc la
  cohérence d'un même héros/ennemi à travers ses poses demande plus
  d'allers-retours manuels. Les boosts rapides s'épuisent puis les
  générations passent en file d'attente plus lente.

Les prompts de ce document sont écrits pour fonctionner sur les deux
(aucune syntaxe propriétaire) — possible de basculer de l'un à l'autre
sans rien réécrire.

## Vue d'ensemble du volume total

| Catégorie | Quantité | Priorité suggérée |
|---|---|---|
| Cartes (51) | 51 images | déjà rédigé, à générer en 1er (pool le plus utilisé en jeu) |
| Héros — 3 poses × 3 héros | 9 images | 2 — apporte enfin de l'illustration en combat (aujourd'hui : aucune) |
| Ennemis — 3 poses × 10 ennemis | 30 images | 2 — idem, priorité égale aux héros |
| Familiers — 2 poses × 4 familiers | 8 images | 3 |
| Icônes de statut (8) | 8 images | 3 — petites, rapides, remplacent des ronds de couleur unis |
| Effets de combat/overlays (7) | 7 images | 4 — c'est ce qui rend les coups/soins/blocages "sympas" à l'écran |
| Écrans du jeu (17) | 17 images | 5 |
| Icônes de nœuds de la carte de run (6) | 6 images | 5 |
| **Total** | **136 images** | — |

Rien de tout ça n'est bloquant pour le jeu : `Card.art` est déjà optionnel
et rien d'autre n'a de champ `art` dans le moteur aujourd'hui — le câblage
en code (afficher ces images, ajouter les champs `art` manquants sur
`HeroDefinition`/`EnemyDefinition`/`FamiliarDefinition`) est un lot
d'implémentation séparé, à traiter une fois les images en main.

## Comment utiliser ce document

1. Pour chaque carte, colle **le bloc de style** ci-dessous suivi du
   **prompt de la carte**. Si l'outil accepte un prompt système/persistant
   séparé, mets-y le bloc de style une fois pour toute la session — les
   images resteront plus cohérentes entre elles (même esprit que le
   « seed et référence de style figés » des specs, juste sans seed
   numérique puisqu'on change d'outil).
2. Génère toutes les images d'un même personnage à la suite (ses 3 poses,
   puis ses cartes), dans la même conversation/session si l'outil le
   permet — c'est ce qui aide le plus à garder une silhouette cohérente
   d'une image à l'autre. Pour Gemini en particulier : redonne le
   **portrait déjà généré** en pièce jointe/référence avant de demander
   la pose suivante du même personnage, plutôt que de repartir de zéro.
3. **Revue systématique avant intégration** (§3.1, non négociable) :
   rejette toute image qui évoque un costume ou logo de super-héros
   existant (toile rouge et bleue, chauve-souris jaune, bouclier étoilé,
   couleurs/emblèmes trop proches d'une franchise identifiable). Si un
   doute existe, régénère plutôt que de trancher soi-même.
4. Cibles techniques finales (à appliquer après génération, même en
   manuel) — trois gabarits selon la catégorie :
   - **Cartes, portraits/poses de personnages, icônes de statut** :
     recadrage carré, **512 × 512 px, WebP, < 150 Ko**.
   - **Écrans (fonds)** : format portrait mobile (ratio ~9:16 ou 3:4 —
     ces écrans remplissent tout le viewport vertical, un carré
     laisserait des bandes vides), WebP, viser **< 250 Ko** vu la taille
     d'affichage plus grande.
   - **Icônes de nœud de carte de run et overlays d'effets de combat** :
     petit format transparent (alpha), **256 × 256 px, WebP, < 50 Ko**
     — assez petit pour rester net une fois réduit à l'affichage.
   Les fichiers `.webp` finaux vont dans
   `assets-pipeline/generated/<catégorie>/<id>.webp` (arborescence à
   créer au fur et à mesure, ex. `generated/cards/noisette_explosive.webp`,
   `generated/heroes/casse_noix-portrait.webp`,
   `generated/enemies/baron_griffu-action.webp`,
   `generated/status/force.webp`, `generated/screens/menu.webp`,
   `generated/fx/impact-degats.webp`, `generated/nodes/boss.webp`).
5. Aucune de ces images n'est requise pour que le jeu tourne — `Card.art`
   est déjà optionnel, et rien d'autre n'a encore de champ `art` dans le
   moteur (`HeroDefinition`/`EnemyDefinition`/`FamiliarDefinition`) : le
   câblage en code est un lot d'implémentation séparé, à traiter une fois
   les images en main.

## Bloc de style (à coller devant chaque prompt)

```
Illustration de carte à collectionner, style semi-cartoon peint
numériquement, cel-shading doux, contours nets mais pas de contour noir
épais façon comics. Cadrage carré 1:1, sujet centré, lisible même en très
petite taille (miniature de carte à jouer). Éclairage doux en contre-jour
(rim light) chaud, palette automnale de forêt : vert mousse, brun
écorce, ambre doré, orange rouille, quelques touches de vert émeraude ou
bleu nuit selon l'effet. Fond simplement suggéré ou légèrement flouté
(sous-bois, feuilles, écorce), jamais chargé ni distrayant. Aucun texte,
aucun logo, aucun filigrane dans l'image. Ton familial, second degré,
jamais sombre ou effrayant.

Contrainte absolue : aucun costume ni logo de super-héros existant. Pas
de toile d'araignée rouge et bleue, pas de chauve-souris jaune sur fond
noir, pas de bouclier étoilé rouge-blanc-bleu, pas d'emblème en forme
d'éclair ou de "S" stylisé. Utiliser uniquement des archétypes
génériques : cape courte, masque loup simple, plastron, symbole en
forme de gland ou de feuille. Si le résultat évoque une franchise
existante, le rejeter et régénérer.
```

## Personnages de référence (silhouettes à réutiliser sur chaque carte du même héros/familier)

**Casse-Noix** — écureuil trapu et musclé, plastron d'écorce clouté,
grosses moufles/gants matelassés couleur brun-roux, queue touffue,
expression déterminée et bourrue. Archétype force brute.

**Captain Cabriole** — écureuil svelte et athlétique, courte cape
tissée de feuilles, masque loup simple type domino (pas de cornes ni
d'oreilles pointues stylisées), petites bottes de cuir, posture
acrobatique et sourire malicieux. Archétype agilité/combo.

**Docteur Bogue** — écureuil futé à lunettes rondes, blouse de
laborantin élimée, bandoulière portant plusieurs bogues de châtaigne
hérissées comme des fioles, regard rusé, gestes précis. Archétype
ruse/poison.

**Mésange Radar** (familier) — petite mésange bleue, plumage vif, un
minuscule serre-tête ou aigrette évoquant une antenne/radar, posture
alerte, tête inclinée comme à l'écoute.

**Hérisson Kevlar** (familier) — petit hérisson trapu, piquants
renforcés par endroits d'un gilet matelassé rapiécé (jamais un vrai
gilet pare-balles, juste un patchwork protecteur artisanal), posture
solide, plantée fermement au sol.

**Bourdon Bourru** (familier) — bourdon duveteux, expression renfrognée
et grognon, dard arrière qui luise légèrement, vol en position basse
et concentrée plutôt que léger.

**Taupe Secrète** (familier) — petite taupe portant un simple bandana ou
petites lunettes de fouisseur, posture de creusement/filature, un œil
à demi fermé, malicieuse et furtive.

## Légende des effets visuels (pour garder les cartes cohérentes entre elles)

- **Force** (buff dégâts) : aura rouge-orangé autour des poings/pattes,
  petite étincelle de puissance.
- **Leste** (buff blocage) : filet de vitesse bleu pâle, image rémanente
  légère derrière le personnage.
- **Étourdi** : petites étoiles/spirales jaunes tournant autour de la
  tête de la cible, regard hagard.
- **À découvert** (vulnérabilité) : fine mire ou fissure rougeoyante sur
  la cible, comme un point faible qui s'illumine.
- **Coquille fêlée** (blocage réduit) : petites fissures apparaissant sur
  une carapace/écorce, éclats qui se détachent.
- **Piquants** (riposte) : petite auréole de piquants hérissés, ton
  brun-doré, discret mais visible.
- **Sève empoisonnée** : liquide visqueux vert luminescent, quelques
  gouttes ou une légère brume verte autour de la blessure/cible.

---

## Cartes neutres (6)

### Bouclier réflexe — `bouclier_reflexe` (défense, commune, coût 1)
> Un écureuil générique (silhouette neutre, sans identité de héros
> précise) se recroqueville derrière un petit bouclier d'écorce
> improvisé hérissé de petites épines dorées (effet Piquants) — l'air de
> dire "qui s'y frotte s'y pique". Pose défensive ramassée, calme et sûre
> d'elle.

### Coup de semonce — `coup_de_semonce` (attaque, légendaire, coût 2)
> Un écureuil neutre frappe le sol ou lève les deux pattes en même temps,
> une onde de choc dorée balayant tout l'horizon vers plusieurs
> silhouettes ennemies floues à l'arrière-plan (effet dégâts de zone +
> Étourdi). Composition large et dramatique, lumière éclatante, digne
> d'une carte légendaire.

### Flair du fourré — `flair_du_fourre` (compétence, commune, coût 1)
> Un écureuil neutre, museau levé, reniflant l'air avec attention ; deux
> petites cartes à jouer stylisées flottent en transparence devant lui
> comme des pistes qu'il vient de repérer. Ambiance calme, sous-bois
> feuillu en arrière-plan flouté.

### Griffure croisée — `griffure_croisee` (attaque, rare, coût 2)
> Un écureuil neutre exécute un triple coup de griffes croisées en plein
> mouvement, trois traces lumineuses ambrées superposées dans les airs.
> Dynamique, légèrement plus intense qu'une carte commune, sans être
> aussi spectaculaire qu'une légendaire.

### Second souffle — `second_souffle` (compétence, commune, coût 1)
> Un écureuil neutre inspire profondément, poitrine gonflée, une légère
> aura dorée d'énergie fraîche l'entourant ; une carte à jouer flotte en
> transparence à côté de lui. Ton apaisant, reprise de souffle après
> l'effort.

### Toilettage — `toilettage` (compétence, commune, coût 1)
> Un écureuil neutre se toilette calmement la fourrure d'une patte,
> quelques particules dorées (soin léger) flottant autour de lui ; une
> fissure rougeoyante (À découvert) qui s'efface doucement de son pelage.
> Scène tranquille, presque domestique.

---

## Cartes signature Casse-Noix (9)

### Noisette explosive — `noisette_explosive` (attaque, commune, coût 1)
> Casse-Noix lance une grosse noisette qui explose au contact d'un
> adversaire flou à l'arrière-plan, petit éclat de fumée et d'éclisses de
> coque ; une fissure rougeoyante (À découvert) apparaît sur la cible.
> Impact net et satisfaisant, échelle "commune".

### Coup de boutoir — `coup_de_boutoir` (attaque, commune, coût 2)
> Casse-Noix charge tête baissée, plastron d'écorce en avant, poussière
> et feuilles volant sous l'impact frontal. Sensation de poids et de
> force brute pure, pas d'effet de statut à représenter.

### Mur de ronces — `mur_de_ronces` (défense, commune, coût 1)
> Casse-Noix plante fermement ses pattes au sol derrière un mur de ronces
> épaisses qui surgit devant lui, bras croisés, posture inébranlable.
> Palette plus verte/brune, ambiance protection solide.

### Grognement féroce — `grognement_feroce` (compétence, commune, coût 1)
> Casse-Noix pousse un grognement sourd, poitrine bombée, une aura
> rouge-orangé (Force) enveloppant ses poings serrés. Expression bourrue
> et intimidante mais jamais effrayante.

### Rage du terrier — `rage_du_terrier` (attaque, commune, coût 1)
> Casse-Noix jaillit d'un terrier dans un geste rageur, une carte à
> jouer défaussée qui s'efface en fumée derrière lui pendant qu'il frappe
> devant lui. Mouvement brusque, terre qui vole.

### Carapace de granit — `carapace_de_granit` (pouvoir, rare, coût 2)
> Casse-Noix se tient stable, un léger halo bleu pâle (Leste) recouvrant
> son plastron d'écorce comme une pellicule de pierre polie. Pose de
> pouvoir permanent, calme et massive, légèrement plus travaillée qu'une
> carte commune.

### Coup de grâce — `coup_de_grace` (attaque, rare, coût 2)
> Casse-Noix abat son poing sur un adversaire flou dont une fissure
> rougeoyante (À découvert) brille déjà sur le flanc — le coup final qui
> exploite la faiblesse. Lumière plus dramatique qu'une carte commune,
> sans aller jusqu'au grand spectacle d'une légendaire.

### Instinct du fauve — `instinct_du_fauve` (compétence, rare, coût 2)
> Casse-Noix rugit, l'aura rouge-orangé (Force) qui l'entourait déjà
> redoublant d'intensité et se dédoublant visuellement (effet
> "doubleStatus"). Regard sauvage, posture plus intense qu'une carte
> commune.

### Écrasement sismique — `ecrasement_sismique` (attaque, légendaire, coût 3)
> Casse-Noix s'écrase au sol à deux pattes depuis les airs, onde de choc
> circulaire massive faisant trembler tout le décor, éclisses de bois et
> de terre en suspension, halo protecteur bleu pâle (Leste) l'enveloppant
> juste après l'impact. Composition la plus large et la plus spectaculaire
> du kit — carte légendaire, sensation d'apothéose finale (la carte
> s'épuise après usage).

---

## Cartes signature Captain Cabriole (16)

### Griffe éclair — `griffe_eclair` (attaque, commune, coût 1)
> Captain Cabriole frappe en un éclair et rebondit déjà en arrière,
> silhouette dédoublée par la vitesse (traînée de mouvement), une carte
> à jouer flottant en transparence signalant la pioche gagnée. Rapide et
> vif, échelle "commune".

### Esquive féline — `esquive_feline` (défense, commune, coût 1)
> Captain Cabriole se penche de côté dans un mouvement souple, laissant
> une attaque adverse floue passer dans le vide juste à côté de lui.
> Grâce féline, pas de contact, posture légère.

### Coup d'œil — `coup_d_oeil` (compétence, commune, coût 1)
> Captain Cabriole jette un regard en coin par-dessus son masque loup,
> une carte à jouer flottant en transparence à côté de sa tête (pioche) et
> une petite aura rouge-orangé (Force) naissant sur son poing fermé.
> Expression complice et confiante.

### Réflexe du gamin — `reflexe_du_gamin` (défense, commune, coût 1)
> Captain Cabriole esquive dans un réflexe presque enfantin, petite
> auréole de piquants hérissés dorés (Piquants) apparaissant brièvement
> autour de lui, une carte flottant en transparence (pioche). Ton
> joueur et spontané.

### Lancer de gland — `lancer_de_gland` (attaque, commune, coût 1)
> Captain Cabriole lance un gland avec une précision de sniper, trajectoire
> nette tracée dans les airs jusqu'à une cible floue à l'arrière-plan.
> Geste sec et assuré, rien de superflu.

### Roulade arrière — `roulade_arriere` (attaque, commune, coût 1)
> Captain Cabriole exécute une roulade arrière fluide tout en décochant
> deux coups de patte successifs, deux traces lumineuses ambrées
> superposées marquant les deux impacts. Mouvement acrobatique et léger.

### Corde à linge — `corde_a_linge` (compétence, commune, coût 1)
> Captain Cabriole tend une corde tendue au ras du sol juste devant un
> adversaire flou qui trébuche, petites étoiles jaunes tournoyant déjà
> autour de sa tête (Étourdi). Ton espiègle, presque un gag visuel.

### Croc-en-jambe — `croc_en_jambe` (compétence, commune, coût 1)
> Captain Cabriole tend la patte pour faire trébucher un adversaire flou
> dont la carapace se fissure visiblement (Coquille fêlée), petit sourire
> en coin. Malice assumée, pas de violence frontale.

### Pied léger — `pied_leger` (compétence, commune, coût 0)
> Captain Cabriole se tient sur la pointe des pattes, presque en
> apesanteur, une légère traînée de vitesse bleu pâle (Leste) sous ses
> bottes. Carte très légère visuellement, geste minimal, presque gratuit
> à l'image du coût nul de la carte.

### Pas de deux — `pas_de_deux` (pouvoir, rare, coût 1)
> Captain Cabriole exécute un pas de danse chorégraphié, deux traînées de
> vitesse bleu pâle (Leste) se dédoublant autour de ses bottes en plein
> mouvement. Pose de pouvoir gracieuse et confiante, un peu plus élaborée
> qu'une carte commune.

### Feinte basse — `feinte_basse` (attaque, rare, coût 1)
> Captain Cabriole feinte bas puis frappe vers le haut un adversaire flou
> dont la tête est déjà cerclée de petites étoiles jaunes (Étourdi) — le
> coup profite de sa confusion. Plus dramatique qu'une attaque commune.

### Diversion — `diversion` (compétence, rare, coût 1)
> Captain Cabriole jette un objet scintillant d'une patte pendant que
> l'autre patte reste cachée dans le dos ; un adversaire flou regarde
> dans la mauvaise direction, étoiles jaunes tournoyant autour de sa tête
> (Étourdi), une carte flottant en transparence (pioche). Composition en
> deux temps suggérée dans une seule image.

### Sac à malices — `sac_a_malices` (compétence, rare, coût 1)
> Captain Cabriole plonge la patte dans une petite sacoche en bandoulière,
> en ressortant une étincelle d'énergie dorée et une aura rouge-orangé
> naissante (Force) sur l'autre patte. Clin d'œil malicieux à la caméra.

### Grand final du capitaine — `grand_final_du_capitaine` (attaque, légendaire, coût 2)
> Captain Cabriole termine un enchaînement acrobatique par un coup final
> spectaculaire en plein saut, cape déployée comme un rideau de scène,
> étoiles jaunes (Étourdi) explosant autour de la cible floue en contrebas.
> Composition la plus large et théâtrale du kit, lumière de projecteur —
> carte légendaire, la carte s'épuise après ce numéro final.

### Combo du capitaine — `combo_du_capitaine` (attaque, rare, coût 2)
> Captain Cabriole enchaîne quatre coups en une seule fraction de seconde,
> quatre traces lumineuses ambrées disposées en arc devant lui. Rythme et
> précision, plus ample qu'une carte commune, sans le grand spectacle
> d'une légendaire.

### Tourbillon acrobatique — `tourbillon_acrobatique` (attaque, légendaire, coût 2)
> Captain Cabriole tournoie sur lui-même au centre d'un cercle de
> silhouettes ennemies floues, cape en éventail, une étincelle dorée
> d'énergie regagnée s'élevant de son geste. Composition circulaire et
> ample, carte légendaire à effet de zone.

---

## Cartes signature Docteur Bogue (16)

### Piqûre toxique — `piqure_toxique` (attaque, commune, coût 1)
> Docteur Bogue plante une petite seringue-épine dans un adversaire flou,
> une légère brume verte luminescente (Sève empoisonnée) se répandant
> déjà autour du point d'impact. Geste précis et clinique, calme
> assurance.

### Blouse renforcée — `blouse_renforcee` (défense, commune, coût 1)
> Docteur Bogue resserre sa blouse de laborantin renforcée, bras croisés
> devant lui en position défensive, lunettes rondes reflétant une lueur
> calme. Posture posée, presque professorale.

### Diagnostic — `diagnostic` (compétence, commune, coût 1)
> Docteur Bogue examine un adversaire flou à travers ses lunettes rondes,
> une petite fissure rougeoyante (À découvert) apparaissant là où son
> regard se pose, une carte flottant en transparence (pioche). Attitude
> analytique et froide, jamais menaçante.

### Fiole corrosive — `fiole_corrosive` (attaque, commune, coût 1)
> Docteur Bogue lance une petite fiole qui se brise au sol devant un
> adversaire flou, libérant une brume verte luminescente (Sève
> empoisonnée) qui l'enveloppe. Aucune trajectoire de dégât direct, juste
> le nuage toxique qui s'étend.

### Poudre irritante — `poudre_irritante` (compétence, commune, coût 1)
> Docteur Bogue projette une pincée de poudre jaunâtre dans les airs,
> un adversaire flou toussant, cerné de petites étoiles jaunes tournoyantes
> (Étourdi). Geste vif du poignet, nuage léger et volatil.

### Griffe empoisonnée — `griffe_empoisonnee` (attaque, commune, coût 1)
> Docteur Bogue griffe légèrement un adversaire flou, une simple goutte
> de liquide vert luminescent (Sève empoisonnée) perlant sur l'égratignure.
> Geste minimal, presque anodin en apparence.

### Bogue piquante — `bogue_piquante` (défense, commune, coût 1)
> Docteur Bogue brandit une bogue de châtaigne hérissée devant lui comme
> un petit bouclier improvisé, quelques piquants dorés (Piquants)
> scintillant à sa surface. Posture défensive mais espiègle.

### Remède de fortune — `remede_de_fortune` (compétence, commune, coût 1)
> Docteur Bogue prépare un remède de fortune dans une petite fiole
> bricolée, une douce lueur dorée de soin l'enveloppant lui-même en la
> buvant. Ambiance chaleureuse malgré le décor de laboratoire de fortune.

### Analyse clinique — `analyse_clinique` (compétence, commune, coût 0)
> Docteur Bogue jette un rapide coup d'œil par-dessus ses lunettes, une
> carte à jouer flottant en transparence à côté de lui (pioche). Geste
> minimal et instantané, à l'image du coût nul de la carte.

### Esprit calculateur — `esprit_calculateur` (pouvoir, rare, coût 1)
> Docteur Bogue, l'air pensif, entouré d'une aura rouge-orangé (Force)
> discrète mais stable, comme si chaque variable de son prochain coup
> était déjà calculée. Pose de pouvoir permanent, posée et réfléchie,
> un peu plus travaillée qu'une carte commune.

### Poison concentré — `poison_concentre` (compétence, rare, coût 1)
> Docteur Bogue verse une fiole dans une autre, la brume verte
> luminescente (Sève empoisonnée) qui enveloppait déjà un adversaire flou
> redoublant d'intensité (effet "doubleStatus"). Plus intense visuellement
> qu'une carte commune.

### Dérivatif — `derivatif` (compétence, rare, coût 1)
> Docteur Bogue détourne l'attention d'un geste de la patte pendant
> qu'une petite étincelle d'énergie dorée jaillit de l'autre ; une
> fissure rougeoyante (À découvert) apparaît sur un adversaire flou qui
> ne regarde pas dans la bonne direction. Composition en deux temps
> suggérée dans une seule image.

### Piège à bogues — `piege_a_bogues` (compétence, rare, coût 1)
> Docteur Bogue referme un piège fait de bogues de châtaigne autour d'un
> adversaire flou, étoiles jaunes tournoyantes (Étourdi) et brume verte
> luminescente (Sève empoisonnée) l'enveloppant tous les deux à la fois.
> Plus élaboré qu'une carte commune, sans être une légendaire.

### Bogue explosive — `bogue_explosive` (attaque, rare, coût 2)
> Docteur Bogue lance une bogue de châtaigne qui explose au contact d'un
> adversaire flou, éclat net entouré d'une brume verte luminescente
> dense (Sève empoisonnée). Impact plus marqué qu'une attaque commune.

### Overdose — `overdose` (attaque, légendaire, coût 2)
> Docteur Bogue injecte une dose finale à un adversaire flou déjà
> enveloppé d'une brume verte luminescente épaisse (Sève empoisonnée) qui
> redouble d'intensité (effet "doubleStatus") sous ses yeux, avant de
> laisser tomber la fiole vide (la carte s'épuise après usage). Ambiance
> plus dramatique et saturée de vert qu'une carte commune ou rare —
> carte légendaire.

### Chimie du chaos — `chimie_du_chaos` (attaque, légendaire, coût 2)
> Docteur Bogue renverse un chaudron de fortune, une vague de brume verte
> luminescente (Sève empoisonnée) se répandant vers plusieurs silhouettes
> ennemies floues à l'arrière-plan en même temps. Composition large et
> spectaculaire, carte légendaire à effet de zone.

---

## Cartes signature des familiers (4)

### Radar de mésange — `radar_visuel` (Mésange Radar, compétence, commune, coût 1)
> Mésange Radar, tête inclinée et attentive, une carte à jouer flottant
> en transparence juste devant son bec comme si elle venait de la
> repérer avant tout le monde. Petite scène vive et alerte, échelle
> "commune".

### Boule défensive — `boule_defensive` (Hérisson Kevlar, défense, commune, coût 1)
> Hérisson Kevlar roulé en boule compacte, piquants renforcés hérissés
> vers l'extérieur, gilet matelassé rapiécé à peine visible entre les
> piquants. Posture immobile et solide, rien ne passe.

### Piqué furieux — `pique_furieux` (Bourdon Bourru, attaque, commune, coût 1)
> Bourdon Bourru fond en piqué sur un adversaire flou, dard arrière
> luisant d'une pointe d'énergie au moment de l'impact, expression
> renfrognée et concentrée. Un seul coup net, pas de fioritures.

### Galerie souterraine — `galerie_souterraine` (Taupe Secrète, compétence, commune, coût 1)
> Taupe Secrète émerge à moitié d'une petite galerie creusée dans la
> terre, une carte à jouer et une étincelle d'énergie dorée flottant en
> transparence juste au-dessus du trou. Ambiance furtive et malicieuse,
> clin d'œil complice.

---

# Personnages en combat — portraits & poses

Aujourd'hui, l'écran de combat n'affiche **aucune illustration** : le
héros et les ennemis sont de simples panneaux texte/couleur. Cette
section prépare de quoi changer ça, avec une mécanique d'animation
volontairement légère (compatible 60 fps / APK < 60 Mo) : **3 images
fixes par héros/ennemi**, permutées par du code (Framer Motion, déjà en
place) selon les événements de combat déjà détectés par
`diffCombatStates` — pas de sprite-sheet, pas de vidéo.

## Recettes de pose (à combiner avec la silhouette de chaque personnage)

**Pose « Portrait » (par défaut)** — le personnage est montré au repos,
posture naturelle et caractéristique, vue trois quarts, regard face ou
légèrement tourné vers le joueur, calme mais prêt. C'est l'image affichée
en permanence ; les deux autres ne s'affichent que brièvement.

**Pose « Action »** — le personnage en plein geste d'attaque ou dans son
mouvement le plus caractéristique, légère inclinaison dynamique, un soupçon
de flou de mouvement aux extrémités, même tenue/couleurs que le portrait
pour rester reconnaissable. Même cadrage trois-quarts que le portrait —
le fondu enchaîné entre les deux doit se lire comme "le même personnage qui
bouge", pas comme un changement de personnage.

**Pose « Touché / K.O. »** — deux usages dans le jeu : affichée brièvement
en cas de gros coup encaissé (grimace, recul, petites étoiles d'impact) et
maintenue quand les PV tombent à 0 (posture vaincue). Toujours cartoon et
familial : yeux en spirale ou fermés, posture affalée, jamais une blessure
réaliste ni une image sombre/effrayante. Même cadrage/tenue que les deux
autres poses.

Pour les 2 boss (Baronne Bec-de-Fer, Baron Griffu), traiter les 3 poses
avec un surcroît d'ampleur/dramatisation (mêmes proportions que le
traitement "légendaire" des cartes) — plus grands à l'écran, éclairage
plus intense.

## Héros (3 héros × 3 poses = 9 images)

Silhouettes de référence : voir plus haut (section « Personnages de
référence »). Ne pas les répéter ici — les réutiliser telles quelles.

### Casse-Noix
> **Portrait** : debout, bras croisés, plastron d'écorce bien visible,
> regard bourru mais bienveillant.
> **Action** : en pleine charge/coup de poing, plastron en avant, petits
> éclats de terre et de feuilles soulevés par l'impact.
> **Touché/K.O.** : assis à terre, étourdi, petites étoiles tournant
> autour de la tête, moufles pendantes — comique, jamais dramatique.

### Captain Cabriole
> **Portrait** : posture acrobatique légère, cape courte flottant, masque
> loup, sourire malicieux, en équilibre sur la pointe des bottes.
> **Action** : en plein saut/pirouette, griffe tendue vers l'avant, cape
> déployée, traînée de vitesse bleu pâle (Leste).
> **Touché/K.O.** : à plat dos, masque légèrement de travers, cape
> froissée sous lui, étoiles tournoyantes — ton léger et comique.

### Docteur Bogue
> **Portrait** : blouse de laborantin, lunettes rondes, bandoulière de
> bogues de châtaigne, regard rusé et posé.
> **Action** : en train de lancer une fiole, brume verte luminescente
> (Sève empoisonnée) juste devant lui, blouse qui virevolte.
> **Touché/K.O.** : lunettes de travers sur le bout du nez, assis contre
> un tronc, fioles vides éparpillées — comique, pas alarmant.

## Ennemis (10 ennemis × 3 poses = 30 images)

Aucune silhouette n'existait encore pour les ennemis (les cartes ne les
montrent jamais) — les descriptions ci-dessous sont nouvelles. Même
contrainte de style/légalité que pour les héros (§3.1) : archétypes
génériques, aucune référence à une franchise existante.

### Le Mulot Masqué — `mulot_masque` (commun, 42 PV)
> Silhouette : petit mulot des champs, simple masque de bandit noir sur
> les yeux, posture furtive et un peu craintive.
> **Portrait** : accroupi, prêt à détaler, regard en coin.
> **Action** : bondissant griffes en avant (Griffade).
> **Touché/K.O.** : masque de travers, sur le dos, pattes en l'air.

### Le Campagnol Cagoulé — `campagnol_cagoule` (commun, 38 PV)
> Silhouette : campagnol trapu, capuche/cagoule sommaire nouée sous le
> menton, petites dents visibles.
> **Portrait** : posture basse, prêt à mordre, cagoule remontée.
> **Action** : mordant avec une lueur verte luminescente (Sève
> empoisonnée) autour des crocs.
> **Touché/K.O.** : cagoule tombée sur les yeux, allongé, groggy.

### La Pie Kleptomane — `pie_kleptomane` (commun, 34 PV)
> Silhouette : pie élégante, quelques babioles brillantes volées
> accrochées aux plumes (boutons, bout de ruban), regard vif et malicieux.
> **Portrait** : tête inclinée, œil brillant fixé sur un objet hors champ.
> **Action** : bec en plein double coup rapide, plumes ébouriffées par le
> mouvement (Bec vif).
> **Touché/K.O.** : plumes en désordre, babioles volées éparpillées au
> sol, étourdie.

### Le Merle Mercenaire — `merle_mercenaire` (élite Acte I, 60 PV)
> Silhouette : merle plus robuste que les communs, petit baudrier de
> corde en bandoulière façon mercenaire, regard dur.
> **Portrait** : posture campée, ailes légèrement écartées, prêt au
> combat.
> **Action** : piqué en plongée, bec en avant, vitesse marquée (Plongeon
> vif).
> **Touché/K.O.** : à terre, une aile repliée maladroitement, sonné mais
> toujours un peu fier.

### La Baronne Bec-de-Fer — `baronne_bec_de_fer` (boss Acte I, 100 PV)
> Silhouette : grand rapace (buse/faucon), bec orné d'un renfort métallique
> patiné évoquant une couronne de bec, collerette de plumes façon col de
> cape déchiré, posture impériale et dominatrice. Traitement "boss" (plus
> grande, plus dramatique) sur les 3 poses.
> **Portrait** : perchée, ailes mi-déployées, regard perçant droit sur le
> joueur.
> **Action** : fondant en tornade de plumes, serres en avant, plumes
> arrachées tourbillonnant autour d'elle (Tornade de plumes).
> **Touché/K.O.** : ailes affaissées au sol, couronne de bec légèrement
> ébréchée, posture vaincue mais toujours digne — jamais pathétique.

### Le Griffeur de Gouttière — `griffeur_de_gouttiere` (commun Acte II, 40 PV)
> Silhouette : chat de gouttière efflanqué, oreille déchirée, fourrure
> ébouriffée façon chat errant, regard mauvais.
> **Portrait** : accroupi, dos légèrement voûté, prêt à feuler.
> **Action** : griffes lacérant l'air, petit nuage glacé (Feulement
> glacial) s'échappant de sa gueule.
> **Touché/K.O.** : assis, une patte sur le nez, fourrure encore plus en
> bataille, l'air vexé plus qu'amoché.

### La Fouine Fatale — `fouine_fatale` (commun Acte II, 44 PV)
> Silhouette : fouine longiligne et élégante, regard mi-clos façon
> "femme fatale", mouvements fluides et sûrs d'elle.
> **Portrait** : posture nonchalante mais alerte, un sourcil relevé.
> **Action** : enchaînant plusieurs morsures rapides en un éclair de
> mouvement (Morsures rapides).
> **Touché/K.O.** : allongée sur le flanc, toujours l'air blasé plutôt
> que paniquée — garde son chic jusqu'au bout, avec humour.

### Le Corvidé Masqué — `corvide_masque` (commun Acte II, 40 PV)
> Silhouette : corbeau/corneille avec un petit masque ou capuchon sombre,
> attitude moqueuse.
> **Portrait** : tête penchée, regard narquois, une plume légèrement
> ébouriffée.
> **Action** : arrachant une plume adverse en plein vol (Vol de plumes),
> petite lueur dorée de soin autour de lui.
> **Touché/K.O.** : masque de travers, plumes en vrac, mais toujours un
> petit sourire en coin moqueur.

### La Belette Braqueuse — `belette_braqueuse` (élite Acte II, 68 PV)
> Silhouette : belette svelte et nerveuse, petit foulard de braqueur noué
> sur le museau, posture agressive et tendue.
> **Portrait** : ramassée sur elle-même, prête à bondir, foulard flottant.
> **Action** : rafale de griffes lancée en avant, traînées lumineuses
> ambrées (Rafale de griffes).
> **Touché/K.O.** : foulard tombé, à terre, toujours crispée et hargneuse
> même vaincue.

### Le Baron Griffu — `baron_griffu` (boss Acte II, 112 PV)
> Silhouette : gros blaireau imposant, petite cape/collier d'autorité
> élimé, énormes griffes de fouisseur mises en avant, posture de baron
> autoritaire. Traitement "boss" (plus grand, plus dramatique) sur les 3
> poses, à l'image de la Baronne Bec-de-Fer.
> **Portrait** : campé sur ses pattes arrière, cape flottant légèrement,
> regard dominateur droit sur le joueur.
> **Action** : dans une tempête de griffes, terre et racines arrachées
> volant autour de lui (Tempête de griffes).
> **Touché/K.O.** : affalé sur le flanc, cape déchirée, toujours
> l'air revêche plutôt que piteux — vaincu mais jamais grotesque.

## Familiers (4 familiers × 2 poses = 8 images)

Le familier n'est jamais une unité ciblable (§3.3) : pas de pose
"touché/K.O.", seulement un portrait et une pose "activation" (le moment
où son passif se déclenche).

### Mésange Radar
> **Portrait** : voir silhouette de référence plus haut, posture alerte.
> **Activation** : tête soudain dressée, aigrette/serre-tête scintillant
> comme un radar qui capte un signal, une carte à jouer flottant en
> transparence (le tour où elle repère une carte en plus).

### Hérisson Kevlar
> **Portrait** : voir silhouette de référence plus haut, posture solide.
> **Activation** : en train de se rouler en boule, piquants se
> hérissant d'un coup, petite auréole bleu pâle (Leste/blocage) au moment
> où le bonus de blocage du 1er tour s'active.

### Bourdon Bourru
> **Portrait** : voir silhouette de référence plus haut, expression
> renfrognée.
> **Activation** : en piqué furtif vers un ennemi flou à l'arrière-plan,
> dard luisant d'une pointe d'énergie — le déclenchement de ses dégâts de
> fin de tour.

### Taupe Secrète
> **Portrait** : voir silhouette de référence plus haut, posture furtive.
> **Activation** : émergeant d'une petite galerie, étincelle dorée
> d'énergie flottant devant elle — le tour où son bonus d'énergie
> périodique se déclenche.

---

# Icônes de statut (8 images)

Remplacent les ronds de couleur unis actuels (`StatusIcon.tsx`). Icône
seule sur fond transparent, silhouette simple et bien lisible même très
petite (affichée aujourd'hui dans un cercle de 24×24 px) — pas de scène,
pas de détails fins qui disparaîtraient à cette taille. Garder la couleur
dominante déjà utilisée en interface pour que l'icône s'intègre sans
retoucher le code existant.

- **Force** (`force`, dominante orange) : un petit poing serré entouré
  d'une aura, style icône bold.
- **Leste** (`leste`, dominante bleu ciel) : un petit éclair/chevron de
  vitesse stylisé, comme une traînée de mouvement figée.
- **Étourdi** (`etourdi`, dominante gris ardoise) : une petite spirale ou
  3 étoiles tournoyantes.
- **À découvert** (`a_decouvert`, dominante rouge) : une mire/reticule
  simple avec une fissure lumineuse au centre.
- **Coquille fêlée** (`coquille_fetee`, dominante ambre/brun) : une petite
  coquille ou écorce fissurée, éclat qui se détache.
- **Piquants** (`piquants`, dominante jaune) : une petite auréole de 3-4
  piquants hérissés.
- **Sève empoisonnée** (`seve_empoisonnee`, dominante vert émeraude) : une
  goutte de liquide visqueux luminescent, forme simple.
- **Repousse** (`repousse`, dominante rose) : une petite feuille/plume qui
  repousse, entourée d'un léger halo de soin.

---

# Effets de combat — overlays d'animation (7 images)

Petites images transparentes destinées à être superposées brièvement
(Framer Motion) sur le personnage ciblé au moment de l'événement
correspondant — c'est ce qui rendra les coups/blocages/soins "sympas" à
l'écran sans sprite-animation lourde. Format transparent, contenu centré,
lisible en médaillon.

- **Impact de dégâts** : éclat/étoile d'impact blanc-rouge, lignes de
  choc courtes autour.
- **Étincelle de blocage** : petit éclair de bouclier bleu qui se déploie
  puis s'efface.
- **Étincelle de soin** : petites paillettes dorées/vertes montantes.
- **Brume de poison** : petit nuage vert luminescent qui s'élève et se
  dissipe (à réutiliser à chaque tick de Sève empoisonnée).
- **Tourbillon d'étourdissement** : 3 étoiles/spirale jaune tournant
  au-dessus de la tête.
- **Pulsation de force** : anneau de pulsation orange qui s'étend depuis
  le personnage.
- **Traînée de vitesse** : filet de stries bleu pâle derrière le
  personnage.

---

# Écrans du jeu (17 images)

Format **portrait mobile** (~9:16 ou 3:4), pas carré — ces images
remplissent le fond de tout l'écran vertical. Même palette/style que le
bloc de style plus haut, mais composition plus large et surtout **jamais
chargée au centre** : l'UI (texte, boutons, cartes) doit rester lisible
par-dessus. Prévoir un espace visuel dégagé (ciel, sol flouté, feuillage
en bordure) plutôt qu'un sujet complexe au centre.

## Accueil / Menu (1)
> Vue large du Potager au crépuscule doré, quelques silhouettes floues
> d'écureuils héroïques au loin sur une branche, ambiance chaleureuse et
> accueillante, ciel dégagé en haut de l'image pour le titre du jeu.

## Sélection héros + familier (1)
> Un établi/repaire douillet sous un tronc creux, lanternes à lucioles,
> espace dégagé au centre et sur les côtés pour les fiches de
> personnages, ambiance "coulisses avant la mission".

## Carte de run — Acte I, Le Potager (1)
> Vue en hauteur d'un potager stylisé (rangs de légumes, cabanes
> d'outils, noisetiers), sentiers qui serpentent, palette chaude
> vert/brun/ambre, espace dégagé pour superposer les nœuds de carte.

## Carte de run — Acte II, Le Parc (1)
> Vue en hauteur d'un parc urbain stylisé (bancs, kiosque, grilles
> basses, arbres plus taillés que sauvages), palette plus fraîche
> (vert émeraude, gris pierre, touches d'ambre), même esprit dégagé.

## Carte de run — Acte III, La Forêt (1, contenu prévu v1.0 mais pas encore implémenté)
> Vue en hauteur d'une forêt plus dense et sauvage, sous-bois profond,
> rayons de lumière filtrant à travers la canopée, palette plus sombre
> et mystérieuse mais toujours chaleureuse, jamais menaçante.

## Combat — fond Acte I, Le Potager (1)
> Scène de combat au sol dans le potager, rangs de légumes en
> arrière-plan flou, lumière de fin d'après-midi, espace central dégagé
> pour les personnages et l'UI de combat.

## Combat — fond Acte II, Le Parc (1)
> Scène de combat dans une allée de parc, bancs et grilles floutés en
> arrière-plan, lumière plus fraîche, même dégagement central.

## Combat — fond Acte III, La Forêt (1, contenu prévu v1.0 mais pas encore implémenté)
> Scène de combat en sous-bois profond, troncs flous en arrière-plan,
> rayons de lumière tombant du feuillage, même dégagement central.

## Récompense (1)
> Un petit tas de Noisettes dorées et de cartes à jouer stylisées
> éparpillées sur un tapis de feuilles, lumière chaude et généreuse,
> ambiance de petite victoire méritée.

## Boutique (1)
> Un étal de marchand ambulant improvisé (caisse en bois, auvent de
> feuilles, quelques babioles et fioles exposées), marchand hors-champ
> ou simplement suggéré, espace dégagé pour la liste d'articles.

## Feu de camp (1)
> Un petit feu de camp crépitant entouré de pierres, ambiance nocturne
> douce et sûre (jamais inquiétante), quelques lucioles, espace dégagé
> autour du feu pour l'UI.

## Événement — Le Noyer Ancestral (1)
> Un immense noyer noueux et vénérable, quelques noix dorées brillant
> entre les branches, ambiance mystique mais bienveillante.

## Événement — La Fontaine Moussue (1)
> Une petite fontaine de pierre couverte de mousse, eau claire qui
> scintille, ambiance calme et régénérante.

## Événement — Le Marchand Ambulant Mystérieux (1)
> Un chariot de marchand miniature couvert de fioles et de bibelots,
> silhouette du marchand restant discrète/floutée (mystérieux, jamais
> inquiétant), lanterne suspendue.

## Fin de run — Victoire (1)
> Une pluie douce de Glands d'Or et de feuilles dorées tombant sur une
> scène de clairière ensoleillée, ambiance triomphante et chaleureuse,
> espace dégagé au centre pour le texte "Victoire !".

## Fin de run — Défaite (1)
> Une clairière au crépuscule, ton mélancolique mais doux (jamais sombre
> ni effrayant) — l'idée d'une pause avant de recommencer, pas d'un échec
> cuisant. Une seule feuille qui tombe lentement, espace dégagé pour le
> texte de fin de run.

## Collection / méta-progression (1)
> Un petit coffre en bois entrouvert débordant de Glands d'Or, entouré
> d'insignes/emblèmes de jalons (silhouettes simples de gland, de
> feuille, de patte), ambiance "salle des trophées" chaleureuse et
> modeste.

---

# Icônes de nœuds de la carte de run (6 images)

Petites icônes seules, fond transparent, même exigence de lisibilité à
petite taille que les icônes de statut (aujourd'hui, chaque nœud de
`RunMapScreen` est un simple bouton texte de ~80 px de large).

- **Combat** (`combat`) : silhouette simple de deux griffures croisées.
- **Élite** (`elite`) : une petite couronne posée sur une empreinte de
  patte.
- **Événement** (`evenement`) : une feuille stylisée avec un point
  d'interrogation discret en son centre.
- **Boutique** (`boutique`) : une petite pièce en forme de gland.
- **Feu de camp** (`feu_de_camp`) : une flamme stylisée simple.
- **Boss** (`boss`) : une couronne plus large et ouvragée que celle de
  l'élite, posée sur une silhouette de crâne stylisé et non effrayant
  (rond, cartoon).

---

# Prochaines étapes

Une fois une catégorie générée et revue (§3.1), les fichiers `.webp`
attendent dans `assets-pipeline/generated/<catégorie>/` qu'un lot
d'implémentation séparé les câble :

1. Ajouter un champ `art?: string` à `HeroDefinition`/`EnemyDefinition`/
   `FamiliarDefinition` (aujourd'hui seul `Card.art` existe), + entrée
   Zod correspondante.
2. Remplacer les panneaux texte/couleur de `HeroPanel`/`EnemyCard` par
   l'image de portrait, avec un composant qui bascule vers la pose
   "action"/"touché" selon les événements déjà produits par
   `diffCombatStates` (aucun nouveau calcul moteur requis — l'info existe
   déjà, seule la présentation change).
3. Remplacer les ronds unis de `StatusIcon`/`IntentIcon` par les icônes
   correspondantes.
4. Ajouter les fonds d'écran (composant de fond partagé par écran/acte).
5. Ce document reste la source de vérité pour tout prompt futur — toute
   nouvelle carte/ennemi/héros/écran ajouté au jeu doit y gagner son
   prompt, au même titre que le manifeste JSON envisagé initialement au
   §6.3.
