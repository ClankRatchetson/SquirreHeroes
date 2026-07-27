# Prompts d'illustration — Squirrel Heroes

Chantier transverse « pipeline d'assets » (§6.3 des specs). Ce document ne
contient **que des prompts texte** — pas de script d'appel API pour
l'instant (décision actée : génération manuelle via Gemini/Copilot par
l'auteur du jeu). Couvre les **51 cartes actuellement authored** (Phase 1,
lots 1-3 de la Phase 7).

## Comment utiliser ce document

1. Pour chaque carte, colle **le bloc de style** ci-dessous suivi du
   **prompt de la carte**. Si l'outil accepte un prompt système/persistant
   séparé, mets-y le bloc de style une fois pour toute la session — les
   images resteront plus cohérentes entre elles (même esprit que le
   « seed et référence de style figés » des specs, juste sans seed
   numérique puisqu'on change d'outil).
2. Génère toutes les cartes d'un même héros/familier à la suite, dans la
   même conversation/session si l'outil le permet — c'est ce qui aide le
   plus à garder une silhouette cohérente d'une carte à l'autre.
3. **Revue systématique avant intégration** (§3.1, non négociable) :
   rejette toute image qui évoque un costume ou logo de super-héros
   existant (toile rouge et bleue, chauve-souris jaune, bouclier étoilé,
   couleurs/emblèmes trop proches d'une franchise identifiable). Si un
   doute existe, régénère plutôt que de trancher soi-même.
4. Cible technique finale (à appliquer après génération, même en manuel) :
   recadrage carré, export **512 × 512 px, WebP, < 150 Ko**. Les fichiers
   `.webp` finaux vont dans `assets-pipeline/generated/<cardId>.webp` (à
   créer) puis sont référencés depuis `Card.art` dans le JSON de la carte
   correspondante.
5. Aucune de ces images n'est requise pour que le jeu tourne — `Card.art`
   est optionnel, le moteur et l'UI fonctionnent déjà sans elles.

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
