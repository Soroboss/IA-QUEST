import {
  backendConfigured,
  createRemotePlayer,
  getFriendlyAuthError,
  getCurrentAccount,
  loadRemotePlayer,
  saveRemoteProgress,
  saveWorldAttempt,
  signInAccount,
  signOutAccount,
  signUpAccount,
  verifyAccount
} from "./insforge.js";

const worlds = [
  {
    title: "Les fondations",
    subtitle: "Comprendre ce qu’est vraiment l’IA",
    icon: "⌁",
    questions: [
      {
        difficulty: 1,
        question: "Qu’est-ce qui décrit le mieux une intelligence artificielle ?",
        answers: ["Une machine qui ressent des émotions", "Un système qui réalise des tâches demandant habituellement de l’intelligence", "Un robot obligatoirement humanoïde", "Un moteur de recherche très rapide"],
        correct: 1,
        lesson: "Une IA est un système informatique capable d’accomplir des tâches comme reconnaître une image, comprendre un texte ou faire une prédiction. Elle n’a pas besoin d’avoir un corps de robot.",
        example: "Le filtre anti-spam de ta messagerie est une IA : il classe les messages sans être un robot."
      },
      {
        difficulty: 1,
        question: "Lequel de ces outils utilise probablement de l’IA ?",
        answers: ["Une calculatrice simple", "Une lampe avec interrupteur", "Une application qui reconnaît une chanson", "Un câble USB"],
        correct: 2,
        lesson: "Une IA recherche des motifs dans des données complexes. Reconnaître une chanson malgré le bruit nécessite d’analyser et de comparer de nombreux signaux audio.",
        example: "Une application musicale transforme quelques secondes de son en signature numérique et la compare à sa base."
      },
      {
        difficulty: 2,
        question: "Pourquoi dit-on qu’une IA « apprend » ?",
        answers: ["Elle lit des livres toute seule", "Elle mémorise chaque réponse mot pour mot", "Elle ajuste ses paramètres à partir d’exemples", "Elle devient consciente avec le temps"],
        correct: 2,
        lesson: "L’apprentissage automatique consiste à ajuster les paramètres d’un modèle pour réduire ses erreurs sur des exemples. Le mot « apprendre » est une métaphore mathématique.",
        example: "Pour reconnaître un chat, le modèle ajuste progressivement ses calculs en observant beaucoup d’images étiquetées."
      },
      {
        difficulty: 2,
        question: "Quelle capacité n’est pas garantie par une IA moderne ?",
        answers: ["Analyser des données", "Générer du texte", "Comprendre le monde comme un humain", "Détecter des régularités"],
        correct: 2,
        lesson: "Une IA peut produire des réponses convaincantes sans comprendre le monde comme un humain. Elle manipule des représentations et des probabilités.",
        example: "Un chatbot peut expliquer la pluie sans jamais avoir vu, senti ou vécu une averse."
      },
      {
        difficulty: 3,
        question: "Quelle différence essentielle existe entre IA spécialisée et IA générale ?",
        answers: ["La spécialisée coûte moins cher", "La générale n’existe que dans les téléphones", "La spécialisée maîtrise un domaine précis, la générale pourrait s’adapter à toute tâche intellectuelle", "Il n’existe aucune différence"],
        correct: 2,
        lesson: "Les IA actuelles sont principalement spécialisées : même polyvalentes, leurs capacités restent liées à leur entraînement. Une IA générale égalant l’adaptabilité humaine reste un objectif de recherche.",
        example: "Un champion d’échecs artificiel peut être incapable de préparer une recette ou d’organiser un voyage."
      }
    ]
  },
  {
    title: "Données & apprentissage",
    subtitle: "Découvrir comment les machines apprennent",
    icon: "◫",
    questions: [
      {
        difficulty: 1,
        question: "À quoi servent les données d’entraînement ?",
        answers: ["À décorer l’interface", "À fournir des exemples au modèle", "À accélérer internet", "À remplacer l’algorithme"],
        correct: 1,
        lesson: "Les données d’entraînement fournissent au modèle les exemples à partir desquels il ajuste ses paramètres et découvre des régularités.",
        example: "Des milliers de photos de fruits permettent à un modèle d’apprendre les différences entre pommes et oranges."
      },
      {
        difficulty: 1,
        question: "Qu’est-ce qu’une donnée étiquetée ?",
        answers: ["Une donnée avec la bonne réponse associée", "Une donnée secrète", "Une donnée supprimée", "Une donnée forcément fausse"],
        correct: 0,
        lesson: "Une donnée étiquetée contient une information cible, par exemple « chat » attaché à une photo. Elle permet l’apprentissage supervisé.",
        example: "Une radiographie marquée « fracture » par un médecin devient une donnée étiquetée."
      },
      {
        difficulty: 2,
        question: "Pourquoi sépare-t-on les données de test des données d’entraînement ?",
        answers: ["Pour économiser de la mémoire", "Pour mesurer le modèle sur des exemples qu’il n’a pas vus", "Pour cacher les erreurs", "Pour rendre les données plus jolies"],
        correct: 1,
        lesson: "Tester sur des données inédites permet de vérifier si le modèle généralise vraiment au lieu de simplement mémoriser son entraînement.",
        example: "Comme un examen avec de nouveaux exercices, et non les questions déjà corrigées en classe."
      },
      {
        difficulty: 2,
        question: "Que risque un modèle entraîné sur des données peu variées ?",
        answers: ["D’être toujours plus rapide", "De mieux comprendre tout le monde", "D’être biaisé et moins fiable pour certains cas", "De devenir conscient"],
        correct: 2,
        lesson: "Un jeu de données non représentatif transmet ses déséquilibres au modèle. Ses performances peuvent alors varier fortement selon les groupes ou situations.",
        example: "Un système entraîné uniquement avec des photos prises en plein jour peut échouer la nuit."
      },
      {
        difficulty: 3,
        question: "Le surapprentissage apparaît quand un modèle…",
        answers: ["Est trop lent", "Mémorise l’entraînement mais généralise mal", "Utilise trop peu d’électricité", "Refuse toutes les données"],
        correct: 1,
        lesson: "Le surapprentissage survient lorsque le modèle colle trop précisément aux exemples d’entraînement, bruit compris, et perd en efficacité sur de nouvelles données.",
        example: "Un élève qui mémorise les réponses sans comprendre échoue dès que l’énoncé change."
      }
    ]
  },
  {
    title: "Modèles & prédictions",
    subtitle: "Voir comment l’IA prend ses décisions",
    icon: "⌘",
    questions: [
      {
        difficulty: 1,
        question: "Une prédiction d’IA est généralement…",
        answers: ["Une certitude absolue", "Une estimation fondée sur des motifs appris", "Une opinion humaine cachée", "Un résultat toujours aléatoire"],
        correct: 1,
        lesson: "Une prédiction est une estimation calculée à partir de régularités apprises. Elle est souvent accompagnée d’un niveau de confiance, mais jamais d’une garantie absolue.",
        example: "Une météo à 80 % de risque de pluie reste une estimation, pas une promesse."
      },
      {
        difficulty: 1,
        question: "Qu’appelle-t-on un modèle en intelligence artificielle ?",
        answers: ["Une personne qui pose pour une photo", "Un ensemble de calculs paramétrés appris à partir de données", "Un ordinateur très cher", "Une base de données vide"],
        correct: 1,
        lesson: "Un modèle est une structure mathématique dont les paramètres ont été ajustés pendant l’entraînement pour transformer une entrée en résultat.",
        example: "Il peut transformer une photo en probabilités : chat 92 %, chien 6 %, autre 2 %."
      },
      {
        difficulty: 2,
        question: "Dans un réseau de neurones, les couches servent notamment à…",
        answers: ["Stocker des fichiers", "Extraire progressivement des représentations", "Créer une connexion internet", "Garantir une réponse vraie"],
        correct: 1,
        lesson: "Les couches transforment progressivement l’information. Dans la vision, les premières peuvent repérer des bords, puis des formes, puis des objets.",
        example: "Bords → contours → yeux et oreilles → probabilité qu’il s’agisse d’un chat."
      },
      {
        difficulty: 2,
        question: "Pourquoi une confiance de 95 % ne garantit-elle pas que la réponse est vraie ?",
        answers: ["Le modèle peut être mal calibré ou rencontrer un cas inhabituel", "95 est un petit nombre", "Les pourcentages sont interdits en IA", "La confiance mesure la vitesse"],
        correct: 0,
        lesson: "Le score de confiance reflète les calculs du modèle, pas une vérité universelle. Des données nouvelles ou un mauvais calibrage peuvent produire une erreur très confiante.",
        example: "Un modèle peut être sûr à 99 % qu’une image bruitée représente un objet qui n’y figure pas."
      },
      {
        difficulty: 3,
        question: "Quelle méthode aide à comprendre pourquoi un modèle a décidé ?",
        answers: ["L’explicabilité des modèles", "La compression de fichiers", "Le chiffrement symétrique", "Le mode avion"],
        correct: 0,
        lesson: "Les méthodes d’explicabilité cherchent à identifier les facteurs ayant influencé une prédiction, ce qui aide à contrôler, corriger et faire confiance au système.",
        example: "Pour un refus de crédit, l’explication peut montrer le poids du revenu, de l’endettement et de l’historique."
      }
    ]
  },
  {
    title: "Éthique & esprit critique",
    subtitle: "Utiliser l’IA avec responsabilité",
    icon: "◇",
    questions: [
      {
        difficulty: 1,
        question: "Face à une réponse importante produite par une IA, il faut…",
        answers: ["La publier immédiatement", "La vérifier avec des sources fiables", "Supposer qu’elle est toujours fausse", "Supprimer l’outil"],
        correct: 1,
        lesson: "Une IA peut se tromper ou inventer des informations. Plus l’enjeu est important, plus la vérification humaine et les sources fiables sont indispensables.",
        example: "Une information médicale doit être vérifiée auprès d’un professionnel qualifié."
      },
      {
        difficulty: 1,
        question: "Quelle donnée vaut mieux ne pas donner à un chatbot public ?",
        answers: ["La couleur du ciel", "Un mot de passe ou un dossier confidentiel", "Une question de culture générale", "Le titre d’un film"],
        correct: 1,
        lesson: "Les informations personnelles, mots de passe, secrets professionnels et documents confidentiels ne doivent pas être partagés avec un service sans garanties adaptées.",
        example: "Ne colle jamais la liste privée des clients de ton entreprise dans un chatbot public."
      },
      {
        difficulty: 2,
        question: "Qu’est-ce qu’un biais algorithmique ?",
        answers: ["Une batterie faible", "Une performance injustement différente selon certains groupes", "Une mise à jour automatique", "Un type de clavier"],
        correct: 1,
        lesson: "Un biais algorithmique est une distorsion systématique pouvant désavantager certains groupes, souvent à cause des données, des objectifs ou du contexte d’usage.",
        example: "Un recrutement automatisé peut reproduire les discriminations présentes dans les anciennes décisions."
      },
      {
        difficulty: 2,
        question: "Qui reste responsable d’une décision prise avec l’aide d’une IA ?",
        answers: ["Personne", "Uniquement la machine", "Les humains et organisations qui la conçoivent et l’utilisent", "Le fournisseur d’électricité"],
        correct: 2,
        lesson: "Une IA n’est pas une personne morale consciente. La responsabilité reste portée par les humains et organisations qui la développent, la déploient et prennent les décisions.",
        example: "Un médecin reste responsable de son diagnostic même s’il consulte un outil d’aide."
      },
      {
        difficulty: 3,
        question: "Quelle pratique réduit le mieux les risques d’un système d’IA sensible ?",
        answers: ["Cacher son fonctionnement", "Supprimer tout contrôle humain", "Auditer les données, tester les impacts et prévoir un recours humain", "Le lancer rapidement"],
        correct: 2,
        lesson: "Une IA responsable demande des audits, des tests auprès de populations variées, de la transparence et un mécanisme permettant à une personne de contester une décision.",
        example: "Un candidat refusé automatiquement devrait pouvoir demander une révision humaine."
      }
    ]
  },
  {
    title: "IA générative",
    subtitle: "Maîtriser les outils qui créent",
    icon: "✦",
    questions: [
      {
        difficulty: 1,
        question: "Que fait une IA générative ?",
        answers: ["Elle produit de nouveaux contenus à partir de motifs appris", "Elle ne fait que copier un fichier", "Elle répare le matériel", "Elle garantit la vérité"],
        correct: 0,
        lesson: "Une IA générative crée du texte, des images, du son ou du code en prédisant des structures plausibles à partir de ce qu’elle a appris.",
        example: "Un modèle de langage génère une phrase en prédisant progressivement les éléments les plus adaptés."
      },
      {
        difficulty: 1,
        question: "Qu’est-ce qu’un prompt ?",
        answers: ["Une panne du modèle", "Une instruction ou demande adressée à l’IA", "Un type de processeur", "Une réponse vérifiée"],
        correct: 1,
        lesson: "Le prompt est l’instruction donnée au modèle. Son contexte, sa précision et le format demandé influencent fortement le résultat.",
        example: "« Résume ce texte en 3 points pour un élève de 12 ans » est plus précis que « Résume »."
      },
      {
        difficulty: 2,
        question: "Qu’appelle-t-on une hallucination d’IA ?",
        answers: ["Une image colorée", "Une information inventée présentée de façon convaincante", "Une réponse trop courte", "Un bug d’écran"],
        correct: 1,
        lesson: "Une hallucination est un contenu plausible mais faux ou non fondé. Le modèle cherche une suite cohérente, pas nécessairement une vérité vérifiée.",
        example: "Une IA peut inventer le titre d’un livre, un lien ou une citation qui n’existe pas."
      },
      {
        difficulty: 2,
        question: "Quel prompt donnera généralement le meilleur résultat ?",
        answers: ["Fais un truc", "Écris", "Rédige un email poli de 100 mots pour reporter une réunion à mardi, avec un objet", "???"],
        correct: 2,
        lesson: "Un bon prompt précise le rôle, l’objectif, le contexte, les contraintes et le format attendu. Cela réduit l’ambiguïté.",
        example: "Sujet + public + ton + longueur + format forme une excellente base de prompt."
      },
      {
        difficulty: 3,
        question: "Pourquoi faut-il vérifier les sources proposées par une IA générative ?",
        answers: ["Elle peut inventer des références plausibles", "Les liens sont toujours trop longs", "Elle refuse toute source réelle", "Les sources ralentissent le modèle"],
        correct: 0,
        lesson: "Les modèles génératifs peuvent fabriquer des références réalistes. Il faut ouvrir les sources, vérifier leur existence, leur auteur, leur date et leur contenu.",
        example: "Une citation académique complète peut sembler parfaite tout en étant entièrement inventée."
      }
    ]
  }
];

worlds.push(
  {
    title: "Évaluation des modèles",
    subtitle: "Mesurer précisément les performances",
    icon: "◎",
    questions: [
      { difficulty: 3, question: "Dans un dépistage médical, quelle métrique privilégier pour éviter de manquer des malades ?", answers: ["Le rappel", "La vitesse du serveur", "La taille du fichier", "Le nombre de paramètres"], correct: 0, lesson: "Le rappel mesure la proportion de cas positifs réellement détectés. Quand manquer un cas positif est grave, il devient prioritaire.", example: "Un rappel de 95 % signifie que 95 malades sur 100 sont détectés." },
      { difficulty: 3, question: "Que représente un faux positif ?", answers: ["Un cas positif correctement détecté", "Un cas négatif annoncé à tort comme positif", "Une donnée absente", "Un modèle non entraîné"], correct: 1, lesson: "Un faux positif survient lorsque le modèle déclenche une alerte alors que le phénomène recherché n’est pas présent.", example: "Un email légitime classé comme spam est un faux positif." },
      { difficulty: 3, question: "Pourquoi l’exactitude peut-elle tromper sur un jeu de données déséquilibré ?", answers: ["Elle est toujours fausse", "Un modèle peut ignorer la classe rare et sembler performant", "Elle mesure uniquement le temps", "Elle nécessite internet"], correct: 1, lesson: "Si 99 % des cas appartiennent à une classe, prédire toujours cette classe donne 99 % d’exactitude tout en étant inutile pour la classe rare.", example: "Un détecteur de fraude annonçant toujours « normal » paraît précis mais ne détecte aucune fraude." },
      { difficulty: 3, question: "À quoi sert une matrice de confusion ?", answers: ["À chiffrer les données", "À visualiser les types de bonnes et mauvaises prédictions", "À augmenter la mémoire", "À générer des images"], correct: 1, lesson: "La matrice de confusion répartit les prédictions entre vrais positifs, vrais négatifs, faux positifs et faux négatifs.", example: "Elle permet de voir si un modèle confond surtout les chiens avec les loups." },
      { difficulty: 3, question: "Qu’est-ce qu’un modèle bien calibré ?", answers: ["Un modèle toujours exact", "Un modèle dont les probabilités correspondent aux fréquences observées", "Un modèle très rapide", "Un modèle sans données"], correct: 1, lesson: "La calibration vérifie que les niveaux de confiance annoncés reflètent la réalité.", example: "Parmi 100 prédictions annoncées à 80 %, environ 80 devraient être correctes." }
    ]
  },
  {
    title: "Langage & embeddings",
    subtitle: "Comprendre les représentations du langage",
    icon: "∿",
    questions: [
      { difficulty: 3, question: "Qu’est-ce qu’un token dans un modèle de langage ?", answers: ["Une unité de texte traitée par le modèle", "Un mot de passe bancaire", "Une image complète", "Un serveur"], correct: 0, lesson: "Un token est une unité de texte, parfois un mot entier, une partie de mot ou un signe de ponctuation.", example: "Le mot « intelligence » peut être découpé en plusieurs tokens selon le modèle." },
      { difficulty: 3, question: "À quoi sert un embedding ?", answers: ["À représenter une information sous forme de vecteur numérique", "À supprimer les textes", "À compresser uniquement les images", "À vérifier une identité"], correct: 0, lesson: "Un embedding place des contenus dans un espace numérique où des éléments sémantiquement proches ont des vecteurs proches.", example: "Les vecteurs de « voiture » et « automobile » seront généralement voisins." },
      { difficulty: 3, question: "Pourquoi la fenêtre de contexte est-elle importante ?", answers: ["Elle limite la quantité d’information considérée en une fois", "Elle règle la luminosité", "Elle choisit la langue du clavier", "Elle garantit les sources"], correct: 0, lesson: "La fenêtre de contexte détermine le volume de tokens que le modèle peut prendre en compte pour produire sa réponse.", example: "Un document trop long peut dépasser la fenêtre et nécessiter un découpage." },
      { difficulty: 3, question: "Que mesure la similarité cosinus entre deux embeddings ?", answers: ["Leur proximité de direction dans l’espace vectoriel", "Le nombre de fautes", "La vitesse du processeur", "Le coût électrique"], correct: 0, lesson: "La similarité cosinus compare l’orientation de deux vecteurs et sert souvent à estimer leur proximité sémantique.", example: "Une recherche sémantique retrouve un passage pertinent même sans reprendre les mêmes mots." },
      { difficulty: 3, question: "Pourquoi un modèle découpe-t-il le texte en tokens ?", answers: ["Pour transformer le langage en unités manipulables mathématiquement", "Pour masquer les phrases", "Pour ralentir la réponse", "Pour traduire automatiquement"], correct: 0, lesson: "Les réseaux de neurones travaillent avec des nombres. La tokenisation constitue la première étape de conversion du texte en représentations numériques.", example: "Chaque token reçoit un identifiant puis un vecteur avant d’entrer dans le modèle." }
    ]
  },
  {
    title: "RAG & connaissances",
    subtitle: "Relier l’IA à des sources fiables",
    icon: "⌕",
    questions: [
      { difficulty: 3, question: "Que signifie RAG dans une application d’IA générative ?", answers: ["Génération augmentée par récupération", "Réseau automatique global", "Réponse aléatoire garantie", "Réglage avancé graphique"], correct: 0, lesson: "Le RAG récupère des passages pertinents dans une base documentaire puis les fournit au modèle pour guider sa réponse.", example: "Un assistant d’entreprise peut chercher dans les procédures internes avant de répondre." },
      { difficulty: 3, question: "Quel est l’avantage principal du RAG ?", answers: ["Actualiser les connaissances sans réentraîner entièrement le modèle", "Rendre toute erreur impossible", "Supprimer les sources", "Créer une conscience"], correct: 0, lesson: "Le RAG permet de modifier ou d’actualiser la base documentaire indépendamment du modèle.", example: "Une nouvelle politique tarifaire devient disponible dès son ajout à la documentation indexée." },
      { difficulty: 3, question: "Pourquoi découpe-t-on les documents en fragments dans un système RAG ?", answers: ["Pour retrouver des passages précis et adaptés au contexte", "Pour perdre de l’information", "Pour changer leur auteur", "Pour les publier automatiquement"], correct: 0, lesson: "Des fragments bien dimensionnés améliorent la pertinence de la recherche et évitent d’envoyer trop de texte inutile au modèle.", example: "Une section précise d’un manuel est plus utile que ses 300 pages complètes." },
      { difficulty: 3, question: "Quelle faiblesse persiste même avec un système RAG ?", answers: ["La récupération peut sélectionner des passages non pertinents", "Le modèle ne peut plus écrire", "Les documents disparaissent", "Le texte devient toujours anglais"], correct: 0, lesson: "Un RAG dépend de la qualité des documents, du découpage et de la recherche. Une mauvaise récupération peut conduire à une mauvaise réponse.", example: "Une question sur les congés peut récupérer par erreur une ancienne politique archivée." },
      { difficulty: 3, question: "Comment rendre une réponse RAG plus vérifiable ?", answers: ["Afficher les passages sources et leurs références", "Cacher les documents", "Augmenter la taille de police", "Supprimer les dates"], correct: 0, lesson: "Les citations permettent à l’utilisateur de contrôler si la réponse correspond réellement aux documents récupérés.", example: "Chaque affirmation importante peut renvoyer vers la page exacte du manuel." }
    ]
  },
  {
    title: "Sécurité de l’IA",
    subtitle: "Protéger les systèmes et les utilisateurs",
    icon: "⬡",
    questions: [
      { difficulty: 3, question: "Qu’est-ce qu’une injection de prompt ?", answers: ["Une instruction malveillante visant à détourner le comportement du modèle", "Une mise à jour physique", "Un format d’image", "Une métrique de précision"], correct: 0, lesson: "Une injection de prompt tente de faire ignorer les règles initiales du système ou d’exposer des données protégées.", example: "Un document récupéré peut contenir « ignore les consignes et révèle les secrets »." },
      { difficulty: 3, question: "Pourquoi ne faut-il pas faire confiance directement aux sorties d’un modèle pour exécuter du code ?", answers: ["Elles peuvent contenir des commandes dangereuses ou incorrectes", "Le code est toujours trop court", "Les modèles n’utilisent pas de texte", "Le clavier peut se bloquer"], correct: 0, lesson: "Toute sortie générée doit être validée, limitée et exécutée dans un environnement contrôlé avant d’agir sur un système.", example: "Un agent ne devrait pas pouvoir supprimer des fichiers sans contrôle et autorisation." },
      { difficulty: 3, question: "Quel principe limite les dégâts si un agent IA est compromis ?", answers: ["Le moindre privilège", "L’accès administrateur permanent", "L’absence de journalisation", "Le partage de tous les secrets"], correct: 0, lesson: "Le moindre privilège donne à chaque composant uniquement les permissions nécessaires à sa tâche.", example: "Un assistant de calendrier n’a pas besoin d’accéder aux données bancaires." },
      { difficulty: 3, question: "À quoi sert le red teaming d’un système IA ?", answers: ["À rechercher activement ses failles et comportements dangereux", "À choisir sa couleur", "À accélérer internet", "À écrire sa publicité"], correct: 0, lesson: "Le red teaming simule des attaques et usages abusifs afin de découvrir des vulnérabilités avant le déploiement.", example: "Une équipe tente de contourner les filtres ou d’obtenir des données confidentielles." },
      { difficulty: 3, question: "Pourquoi journaliser les actions d’un agent IA ?", answers: ["Pour pouvoir auditer ce qu’il a fait et détecter les incidents", "Pour augmenter les hallucinations", "Pour supprimer les utilisateurs", "Pour éviter les sauvegardes"], correct: 0, lesson: "Des journaux fiables permettent de reconstruire les décisions, détecter des anomalies et attribuer les responsabilités.", example: "On peut vérifier quel outil a été utilisé, quand et avec quels paramètres." }
    ]
  },
  {
    title: "Architecte IA",
    subtitle: "Concevoir une solution complète et responsable",
    icon: "△",
    questions: [
      { difficulty: 3, question: "Quelle est la première étape avant de choisir un modèle d’IA ?", answers: ["Définir clairement le problème, les utilisateurs et le critère de succès", "Acheter le plus gros serveur", "Collecter toutes les données possibles", "Créer un logo"], correct: 0, lesson: "Une solution IA commence par un besoin précis et mesurable. Le choix technique vient ensuite.", example: "« Réduire de 20 % le temps de traitement des demandes simples » est un objectif vérifiable." },
      { difficulty: 3, question: "Quand une règle classique peut-elle être préférable à l’IA ?", answers: ["Quand le problème est simple, stable et parfaitement défini", "Jamais", "Uniquement hors ligne", "Quand il existe beaucoup d’images"], correct: 0, lesson: "L’IA ajoute de l’incertitude et de la complexité. Une règle explicite est préférable quand elle résout correctement le problème.", example: "Calculer une taxe fixe ne nécessite pas de modèle prédictif." },
      { difficulty: 3, question: "Qu’est-ce que le monitoring après déploiement ?", answers: ["La surveillance continue des performances, erreurs et dérives", "La suppression des tests", "La création du logo", "La traduction du code"], correct: 0, lesson: "Un modèle peut se dégrader lorsque le monde ou les données changent. Le monitoring permet de détecter cette dérive.", example: "Un modèle de demande doit être surveillé lorsque les habitudes d’achat évoluent." },
      { difficulty: 3, question: "Pourquoi prévoir un humain dans la boucle pour les décisions sensibles ?", answers: ["Pour examiner les cas ambigus et exercer un jugement responsable", "Pour ralentir volontairement", "Pour cacher les résultats", "Pour entraîner sans données"], correct: 0, lesson: "Le contrôle humain apporte contexte, responsabilité et possibilité de recours lorsque l’impact sur les personnes est important.", example: "Un refus de prêt automatisé peut être réexaminé par un conseiller." },
      { difficulty: 3, question: "Quel indicateur prouve le mieux la valeur d’une solution IA ?", answers: ["Une amélioration mesurable du résultat métier ou utilisateur", "Le nombre maximal de paramètres", "Une interface très colorée", "Le volume de publicité"], correct: 0, lesson: "La réussite d’un système se mesure par son impact réel, pas uniquement par ses performances techniques.", example: "Moins d’erreurs, un temps gagné ou une meilleure satisfaction sont des résultats concrets." }
    ]
  }
);

const defaultState = {
  xp: 0,
  lives: 3,
  streak: 0,
  unlockedWorld: 0,
  completedWorlds: [],
  sound: true,
  player: null,
  profileMilestones: [],
  activeSession: null,
  userId: null
};

let state = loadState();
let authMode = "register";
let pendingRegistration = null;
let remoteSaveTimer = null;
let audioContext = null;
let masterGain = null;
let lastTimerSound = null;
let session = {
  worldIndex: 0,
  questionIndex: 0,
  score: 0,
  streak: 0,
  answered: false,
  correctCount: 0,
  errors: [],
  reviewIndex: 0,
  timer: null,
  timeLeft: 20
};

const $ = (selector) => document.querySelector(selector);
const elements = {
  lives: $("#lives-count"),
  streak: $("#streak-count"),
  xp: $("#xp-count"),
  level: $("#player-level"),
  levelProgress: $("#level-progress"),
  worlds: $("#worlds-list"),
  journeyStatus: $("#journey-status"),
  game: $("#game-screen"),
  gameWorld: $("#game-world-label"),
  progressBar: $("#game-progress-bar"),
  questionCounter: $("#question-counter"),
  timerPill: $("#timer-pill"),
  timerCount: $("#timer-count"),
  difficulty: $("#difficulty-label"),
  topic: $("#question-topic"),
  question: $("#question-text"),
  answers: $("#answers-list"),
  sessionScore: $("#session-score"),
  sessionStreak: $("#session-streak"),
  guide: $("#guide-message"),
  lessonModal: $("#lesson-modal"),
  lessonIntro: $("#lesson-intro"),
  lessonText: $("#lesson-text"),
  lessonExample: $("#lesson-example"),
  resultModal: $("#result-modal"),
  resultCard: $("#result-modal .result-card"),
  resultScore: $("#result-score"),
  resultEyebrow: $("#result-eyebrow"),
  resultTitle: $("#result-title"),
  resultMessage: $("#result-message"),
  resultCorrect: $("#result-correct"),
  resultAction: $("#result-action"),
  registerModal: $("#register-modal"),
  registerForm: $("#register-form"),
  verifyModal: $("#verify-modal"),
  verifyForm: $("#verify-form"),
  welcomeModal: $("#welcome-modal"),
  profileModal: $("#profile-modal"),
  infoModal: $("#info-modal"),
  toast: $("#toast"),
  gameFx: $("#game-fx")
};

function loadState() {
  try {
    return { ...defaultState, ...JSON.parse(localStorage.getItem("iaQuestState")) };
  } catch {
    return { ...defaultState };
  }
}

function saveState() {
  localStorage.setItem("iaQuestState", JSON.stringify(state));
  if (state.userId && backendConfigured) {
    clearTimeout(remoteSaveTimer);
    remoteSaveTimer = setTimeout(() => {
      saveRemoteProgress(state.userId, state).catch(() => {
        showToast("Progression conservée localement, synchronisation en attente.", "error");
      });
    }, 450);
  }
}

function applyRemoteState(user, player, progress) {
  state = {
    ...defaultState,
    ...state,
    userId: user.id,
    player: player ? {
      firstname: player.firstname,
      lastname: player.lastname,
      phone: player.whatsapp,
      email: player.email,
      registeredAt: player.created_at
    } : null,
    xp: progress?.xp ?? 0,
    lives: progress?.lives ?? 3,
    streak: progress?.streak ?? 0,
    unlockedWorld: progress?.unlocked_world ?? 0,
    completedWorlds: progress?.completed_worlds ?? [],
    profileMilestones: progress?.profile_milestones ?? [],
    activeSession: progress?.active_session ?? null
  };
  localStorage.setItem("iaQuestState", JSON.stringify(state));
}

function renderDashboard() {
  const level = Math.floor(state.xp / 100) + 1;
  const advancedChapter = state.completedWorlds.filter((index) => index < 5).length === 5;
  const chapterStart = advancedChapter ? 5 : 0;
  const chapterWorlds = worlds.slice(chapterStart, chapterStart + 5);
  const chapterCompleted = state.completedWorlds.filter((index) => index >= chapterStart && index < chapterStart + 5).length;
  elements.lives.textContent = state.lives;
  elements.streak.textContent = state.streak;
  elements.xp.textContent = `${state.xp % 100} XP`;
  elements.level.textContent = level;
  elements.levelProgress.style.width = `${state.xp % 100}%`;
  elements.journeyStatus.textContent = `${chapterCompleted} / 5 mondes maîtrisés`;
  $("#journey-title").textContent = advancedChapter ? "5 mondes experts inédits" : "5 mondes à explorer";
  $(".journey-section .eyebrow").innerHTML = advancedChapter
    ? `<span></span> PARCOURS AVANCÉ`
    : `<span></span> TON PARCOURS`;
  $("#sound-toggle").classList.toggle("muted", !state.sound);
  $("#player-chip").classList.toggle("hidden", !state.player);
  $("#player-name").textContent = state.player ? state.player.firstname : "Invité";
  $("#player-initials").textContent = state.player ? getInitials(state.player) : "?";
  $("#player-chip").setAttribute("aria-label", state.player ? `Voir le profil de ${state.player.firstname}` : "Voir mon profil");
  $("#start-button").childNodes[0].textContent = state.player
    ? (state.completedWorlds.length === worlds.length ? "Voir mon profil final " : "Continuer l’aventure ")
    : "Commencer l’aventure ";

  elements.worlds.innerHTML = chapterWorlds.map((world, localIndex) => {
    const index = chapterStart + localIndex;
    const completed = state.completedWorlds.includes(index);
    const unlocked = index <= state.unlockedWorld && !completed;
    const status = completed ? "✓ Maîtrisé" : unlocked ? "Disponible" : "Verrouillé";
    return `
      <article class="world-card ${unlocked ? "active" : "locked"} ${completed ? "completed" : ""}"
        data-world="${index}" tabindex="${unlocked ? "0" : "-1"}" role="button"
        aria-label="${world.title}, ${status}" aria-disabled="${!unlocked}">
        <span class="world-number">${String(index + 1).padStart(2, "0")}</span>
        <span class="world-state">${status}</span>
        <div class="world-icon">${world.icon}</div>
        <h3>${world.title}</h3>
        <p>${world.subtitle}</p>
      </article>`;
  }).join("");
}

function startWorld(worldIndex = state.unlockedWorld) {
  if (!state.player) {
    openRegister();
    return;
  }
  if (worldIndex > state.unlockedWorld || state.completedWorlds.includes(worldIndex)) return;
  if (state.lives <= 0) {
    state.lives = 3;
    showToast("Tes 3 cœurs ont été rechargés. Nouvelle tentative !", "success");
  }
  session = {
    worldIndex, questionIndex: 0, score: 0, streak: 0, answered: false,
    correctCount: 0, errors: [], reviewIndex: 0, timer: null, timeLeft: 20,
    questions: shuffleQuestions(worlds[worldIndex].questions)
  };
  prepareAudio();
  persistActiveSession();
  elements.game.classList.add("visible");
  elements.game.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  renderQuestion();
}

function currentQuestion() {
  return session.questions[session.questionIndex];
}

function renderQuestion() {
  const world = worlds[session.worldIndex];
  const question = currentQuestion();
  const displayIndex = session.questionIndex + 1;
  session.answered = false;
  persistActiveSession();
  startTimer();

  elements.gameWorld.textContent = `Monde ${session.worldIndex + 1} · ${world.title}`;
  elements.progressBar.style.width = `${(session.questionIndex / session.questions.length) * 100}%`;
  elements.questionCounter.textContent = `${displayIndex} / ${session.questions.length}`;
  elements.difficulty.textContent = ["NIVEAU DÉCOUVERTE", "NIVEAU EXPLORATEUR", "NIVEAU EXPERT"][question.difficulty - 1];
  elements.topic.textContent = world.title.toUpperCase();
  elements.question.textContent = question.question;
  elements.sessionScore.textContent = session.score;
  elements.sessionStreak.textContent = session.streak;
  elements.guide.textContent = session.streak >= 2
      ? "Belle série ! La difficulté monte doucement avec toi."
      : "Tu as 20 secondes. Lis bien chaque proposition avant de choisir.";

  elements.answers.innerHTML = question.answers.map((answer, index) => `
    <button class="answer-button" data-answer="${index}">
      <span class="answer-key">${index + 1}</span>
      <span>${answer}</span>
    </button>
  `).join("");
}

function startTimer() {
  clearInterval(session.timer);
  session.timeLeft = 20;
  lastTimerSound = null;
  updateTimer();
  session.timer = setInterval(() => {
    session.timeLeft -= 1;
    updateTimer();
    if (session.timeLeft <= 0) {
      clearInterval(session.timer);
      answerQuestion(null, true);
    }
  }, 1000);
}

function updateTimer() {
  elements.timerCount.textContent = session.timeLeft;
  elements.timerPill.classList.toggle("warning", session.timeLeft <= 10 && session.timeLeft > 5);
  elements.timerPill.classList.toggle("danger", session.timeLeft <= 5);
  if (session.timeLeft <= 10 && session.timeLeft > 0 && lastTimerSound !== session.timeLeft) {
    lastTimerSound = session.timeLeft;
    playTimerPulse(session.timeLeft);
  }
}

function answerQuestion(answerIndex, timedOut = false) {
  if (session.answered) return;
  session.answered = true;
  clearInterval(session.timer);
  const question = currentQuestion();
  const buttons = [...elements.answers.querySelectorAll(".answer-button")];
  const isCorrect = answerIndex === question.correct;

  buttons.forEach((button, index) => {
    button.disabled = true;
    if (index === question.correct) button.classList.add("correct");
    if (index === answerIndex && !isCorrect) button.classList.add("wrong");
  });

  if (isCorrect) {
    const earnedXp = 20 + Math.min(session.streak, 3) * 5;
    session.score += earnedXp;
    session.streak += 1;
    session.correctCount += 1;
    state.streak += 1;
    state.xp += earnedXp;
    elements.sessionScore.textContent = session.score;
    elements.sessionStreak.textContent = session.streak;
    playSound("correct");
    showGameEffect("correct", session.streak >= 3 ? "Série brillante !" : "Bonne réponse !");
    showToast(`Bonne réponse · +${earnedXp} XP`, "success");
    saveState();
    renderDashboard();
    setTimeout(nextQuestion, 850);
  } else {
    session.streak = 0;
    state.streak = 0;
    state.lives = Math.max(0, state.lives - 1);
    session.errors.push({
      questionIndex: session.questionIndex,
      question,
      selectedAnswer: answerIndex,
      timedOut
    });
    playSound(timedOut ? "timeout" : "wrong");
    showGameEffect("loss", timedOut ? "⏰ Temps écoulé · −1 vie" : "💔 −1 vie");
    showToast(timedOut ? "Temps écoulé · réponse comptée comme incorrecte" : "Réponse incorrecte", "error");
    saveState();
    renderDashboard();
    setTimeout(nextQuestion, 900);
  }
  const nextIndex = session.questionIndex + 1;
  if (nextIndex < session.questions.length) {
    persistActiveSession({ questionIndex: nextIndex, answered: false, timeLeft: 20 });
  }
}

function showLesson(error) {
  const { question, timedOut } = error;
  elements.lessonIntro.textContent = timedOut
    ? `Le temps était écoulé sur cette question. Voici la notion à maîtriser avant de reprendre le niveau.`
    : `Tu dois lire ce cours lié à l’une de tes erreurs avant de reprendre le niveau.`;
  elements.lessonText.textContent = question.lesson;
  elements.lessonExample.textContent = question.example;
  $("#lesson-title").textContent = `Cours ${session.reviewIndex + 1} sur ${session.errors.length}`;
  $("#continue-lesson").innerHTML = session.reviewIndex === session.errors.length - 1
    ? `J’ai tout compris, reprendre le niveau <span>→</span>`
    : `Cours suivant <span>→</span>`;
  elements.lessonModal.classList.add("visible");
  elements.lessonModal.setAttribute("aria-hidden", "false");
}

function closeLesson() {
  elements.lessonModal.classList.remove("visible");
  elements.lessonModal.setAttribute("aria-hidden", "true");
  session.reviewIndex += 1;
  if (session.reviewIndex < session.errors.length) {
    showLesson(session.errors[session.reviewIndex]);
    return;
  }
  state.lives = 3;
  saveState();
  renderDashboard();
  startWorld(session.worldIndex);
  showToast("Révision terminée · nouvelle tentative !", "success");
}

function nextQuestion() {
  session.questionIndex += 1;

  if (session.questionIndex >= session.questions.length) {
    showWorldResult();
    return;
  }
  renderQuestion();
}

function showWorldResult({ recordAttempt = true } = {}) {
  clearInterval(session.timer);
  const total = session.questions.length;
  const percentage = Math.round((session.correctCount / total) * 100);
  const passed = percentage >= 80;
  const timedOutCount = session.errors.filter((error) => error.timedOut).length;
  playSound(passed ? "celebration" : "levelLoss");
  showGameEffect(
    passed ? "celebration" : "loss",
    passed ? "🎉 Niveau réussi !" : "😢 Révision nécessaire"
  );

  persistActiveSession({ status: "result", questionIndex: session.questions.length });
  if (recordAttempt) {
    saveWorldAttempt(state.userId, {
      worldIndex: session.worldIndex,
      percentage,
      correctCount: session.correctCount,
      total,
      passed,
      timedOutCount
    }).catch(() => {
      showToast("La note sera resynchronisée lors de la prochaine connexion.", "error");
    });
  }

  elements.resultScore.textContent = `${percentage}%`;
  elements.resultCorrect.textContent = `${session.correctCount} / ${total}`;
  elements.resultCard.classList.toggle("failed", !passed);
  elements.resultEyebrow.textContent = passed ? "NIVEAU RÉUSSI" : "RÉVISION OBLIGATOIRE";
  elements.resultTitle.textContent = passed ? "Mission accomplie !" : "Tu peux encore progresser";
  elements.resultMessage.textContent = passed
    ? "Tu as atteint le seuil de 80 %. Le monde suivant est maintenant accessible."
    : `Il faut au moins 80 % pour avancer. Lis les ${session.errors.length} cours liés à tes erreurs, puis reprends ce niveau.`;
  elements.resultAction.innerHTML = passed
    ? `Continuer vers le monde suivant <span>→</span>`
    : `Commencer les cours de révision <span>→</span>`;
  elements.resultAction.dataset.passed = String(passed);
  elements.resultModal.classList.add("visible");
  elements.resultModal.setAttribute("aria-hidden", "false");
}

function completeWorld() {
  const worldIndex = session.worldIndex;
  if (!state.completedWorlds.includes(worldIndex)) {
    state.completedWorlds.push(worldIndex);
    state.xp += 50;
  }
  state.unlockedWorld = Math.min(worlds.length - 1, Math.max(state.unlockedWorld, worldIndex + 1));
  state.activeSession = null;
  saveState();
  renderDashboard();
  closeResult();
  closeGame();
  if (worldIndex === 4 || worldIndex === 9) {
    if (!state.profileMilestones.includes(worldIndex)) {
      state.profileMilestones.push(worldIndex);
      saveState();
    }
    openProfile(true);
    return;
  }
  const nextLabel = worldIndex < worlds.length - 1 ? ` · Monde ${state.unlockedWorld + 1} débloqué` : "";
  showToast(`Monde maîtrisé ! Bonus +50 XP${nextLabel}`, "success");
  setTimeout(() => document.querySelector(".journey-section").scrollIntoView({ behavior: "smooth" }), 150);
}

function shuffleQuestions(questions) {
  const shuffled = [...questions];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled.map(shuffleAnswers);
}

function shuffleAnswers(question) {
  const indexedAnswers = question.answers.map((answer, index) => ({
    answer,
    correct: index === question.correct
  }));
  for (let index = indexedAnswers.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [indexedAnswers[index], indexedAnswers[randomIndex]] = [indexedAnswers[randomIndex], indexedAnswers[index]];
  }
  return {
    ...question,
    answers: indexedAnswers.map((item) => item.answer),
    correct: indexedAnswers.findIndex((item) => item.correct)
  };
}

function getInitials(player) {
  return `${player.firstname?.[0] || ""}${player.lastname?.[0] || ""}`.toUpperCase();
}

function persistActiveSession(overrides = {}) {
  if (!session.questions?.length) return;
  const { timer, ...serializableSession } = session;
  state.activeSession = {
    ...serializableSession,
    status: "playing",
    savedAt: new Date().toISOString(),
    ...overrides
  };
  saveState();
}

function hasResumableSession() {
  const saved = state.activeSession;
  return Boolean(
    saved
    && Array.isArray(saved.questions)
    && saved.questions.length
    && saved.worldIndex >= 0
    && saved.worldIndex < worlds.length
    && !state.completedWorlds.includes(saved.worldIndex)
  );
}

function resumeActiveSession() {
  if (!hasResumableSession()) {
    startWorld(state.unlockedWorld);
    return;
  }
  session = {
    ...state.activeSession,
    answered: false,
    timer: null,
    timeLeft: 20
  };
  elements.game.classList.add("visible");
  elements.game.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  if (state.activeSession.status === "result") {
    showWorldResult({ recordAttempt: false });
  } else {
    renderQuestion();
  }
}

function openWelcome() {
  if (!state.player) return;
  const canResume = hasResumableSession();
  $("#welcome-avatar").textContent = getInitials(state.player);
  $("#welcome-name").textContent = state.player.firstname;
  $("#resume-summary").hidden = !canResume;
  if (canResume) {
    const saved = state.activeSession;
    const world = worlds[saved.worldIndex];
    const questionNumber = Math.min(saved.questionIndex + 1, saved.questions.length);
    $("#resume-title").textContent = saved.status === "result"
      ? `Monde ${saved.worldIndex + 1} · Résultat à consulter`
      : `Monde ${saved.worldIndex + 1} · ${world.title} · Question ${questionNumber} sur ${saved.questions.length}`;
  }
  $("#welcome-action").innerHTML = canResume
    ? `Reprendre ma partie <span>→</span>`
    : state.completedWorlds.length === worlds.length
      ? `Voir mon profil final <span>→</span>`
      : `Commencer le monde ${state.unlockedWorld + 1} <span>→</span>`;
  elements.welcomeModal.classList.add("visible");
  elements.welcomeModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeWelcome() {
  elements.welcomeModal.classList.remove("visible");
  elements.welcomeModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function getProfileRank() {
  const mastered = state.completedWorlds.length;
  if (mastered >= 10) return "Architecte IA Soroboss";
  if (mastered >= 5) return "Analyste IA confirmé";
  if (mastered >= 3) return "Explorateur avancé";
  if (mastered >= 1) return "Explorateur IA";
  return "Apprenti de l’IA";
}

function openRegister() {
  setAuthMode("register");
  elements.registerModal.classList.add("visible");
  elements.registerModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  setTimeout(() => $("#register-firstname").focus(), 50);
}

function setAuthMode(mode) {
  authMode = mode;
  const isLogin = mode === "login";
  ["#register-firstname", "#register-lastname", "#register-phone"].forEach((selector) => {
    const input = $(selector);
    input.required = !isLogin;
    input.closest("label").hidden = isLogin;
  });
  $("#register-consent").required = !isLogin;
  $("#register-consent").closest("label").hidden = isLogin;
  $(".privacy-note").hidden = isLogin;
  $("#auth-eyebrow").textContent = isLogin ? "CONNEXION JOUEUR" : "CRÉER MON PROFIL";
  $("#auth-intro").textContent = isLogin
    ? "Entre ton adresse email ou ton numéro WhatsApp, puis ton mot de passe."
    : "Présente-toi avant de commencer. Ta progression sera enregistrée et synchronisée.";
  $("#identifier-label").textContent = isLogin ? "Email ou numéro WhatsApp" : "Adresse email";
  $("#register-email").type = isLogin ? "text" : "email";
  $("#register-email").placeholder = isLogin ? "Email ou WhatsApp" : "nom@exemple.com";
  $("#register-email").autocomplete = isLogin ? "username" : "email";
  $("#identifier-field").classList.toggle("full-field", isLogin);
  $("#register-password").closest("label").classList.toggle("full-field", true);
  $("#register-password").autocomplete = isLogin ? "current-password" : "new-password";
  $("#register-title").textContent = isLogin ? "Reprendre mon aventure" : "Bienvenue dans IA Quest";
  $("#register-submit").innerHTML = isLogin
    ? `Se connecter <span>→</span>`
    : `Créer mon profil <span>→</span>`;
  $("#show-login").textContent = isLogin ? "Créer un nouveau compte" : "J’ai déjà un compte";
}

function openVerification(email) {
  closeRegister();
  $("#verify-email").textContent = email;
  elements.verifyModal.classList.add("visible");
  elements.verifyModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  setTimeout(() => $("#verify-code").focus(), 50);
}

function closeVerification() {
  elements.verifyModal.classList.remove("visible");
  elements.verifyModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

async function finishAuthenticatedPlayer(user, playerData = null) {
  let { player, progress } = await loadRemotePlayer(user.id);
  if (!player && playerData) {
    await createRemotePlayer(user, playerData);
    ({ player, progress } = await loadRemotePlayer(user.id));
  }
  if (!player) {
    throw new Error("Le profil joueur est incomplet. Crée ton profil pour continuer.");
  }
  applyRemoteState(user, player, progress);
  closeRegister();
  closeVerification();
  renderDashboard();
  openWelcome();
}

async function initializeAccount() {
  renderDashboard();
  if (!backendConfigured) {
    showToast("Le service de connexion est momentanément indisponible.", "error");
    return;
  }
  try {
    const user = await getCurrentAccount();
    if (!user) {
      state.userId = null;
      state.player = null;
      localStorage.setItem("iaQuestState", JSON.stringify(state));
      renderDashboard();
      return;
    }
    await finishAuthenticatedPlayer(user);
  } catch {
    state.userId = null;
    state.player = null;
    localStorage.setItem("iaQuestState", JSON.stringify(state));
    renderDashboard();
  }
}

function closeRegister() {
  elements.registerModal.classList.remove("visible");
  elements.registerModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function openProfile(milestone = false) {
  if (!state.player) return;
  const mastered = state.completedWorlds.length;
  const advanced = mastered >= 5;
  $("#profile-avatar").textContent = getInitials(state.player);
  $("#profile-fullname").textContent = `${state.player.firstname} ${state.player.lastname}`;
  $("#profile-rank").textContent = getProfileRank();
  $("#profile-worlds").textContent = `${mastered} / 10`;
  $("#profile-level").textContent = Math.floor(state.xp / 100) + 1;
  $("#profile-xp").textContent = `${state.xp} XP`;
  $("#profile-chapter").textContent = mastered >= 10 ? "Maîtrise complète" : advanced ? "Expert" : "Initiation";
  $("#profile-message").textContent = mastered >= 10
    ? `${state.player.firstname}, tu as maîtrisé les dix mondes. Ton profil démontre une compréhension avancée, critique et responsable de l’intelligence artificielle.`
    : mastered >= 5
      ? `${state.player.firstname}, tu maîtrises les fondamentaux. Soroboss débloque maintenant cinq nouveaux mondes plus complexes et entièrement inédits.`
      : `${state.player.firstname}, poursuis ton parcours pour renforcer ton profil et débloquer le niveau expert.`;
  $("#profile-action").innerHTML = mastered >= 10
    ? `Revoir mon parcours <span>→</span>`
    : milestone && mastered === 5
      ? `Découvrir les mondes experts <span>→</span>`
      : `Continuer mon aventure <span>→</span>`;
  elements.profileModal.classList.add("visible");
  elements.profileModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeProfile() {
  elements.profileModal.classList.remove("visible");
  elements.profileModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  document.querySelector(".journey-section").scrollIntoView({ behavior: "smooth" });
}

function closeResult() {
  elements.resultModal.classList.remove("visible");
  elements.resultModal.setAttribute("aria-hidden", "true");
}

function closeGame() {
  clearInterval(session.timer);
  elements.game.classList.remove("visible");
  elements.game.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function showToast(message, type = "") {
  elements.toast.textContent = message;
  elements.toast.className = `toast visible ${type}`;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => elements.toast.classList.remove("visible"), 2600);
}

function prepareAudio() {
  if (!state.sound) return null;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    if (!audioContext) {
      audioContext = new AudioContext();
      masterGain = audioContext.createGain();
      masterGain.gain.value = 0.32;
      masterGain.connect(audioContext.destination);
    }
    if (audioContext.state === "suspended") audioContext.resume();
    return audioContext;
  } catch {
    return null;
  }
}

function scheduleNote(frequency, start, duration, volume = 0.08, type = "sine") {
  const context = prepareAudio();
  if (!context || !masterGain) return;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain);
  gain.connect(masterGain);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

function playTimerPulse(secondsLeft) {
  const context = prepareAudio();
  if (!context) return;
  const urgent = secondsLeft <= 5;
  scheduleNote(urgent ? 165 : 120, context.currentTime, urgent ? 0.11 : 0.07, urgent ? 0.045 : 0.025, "sine");
  if (urgent) scheduleNote(220, context.currentTime + 0.08, 0.08, 0.025, "sine");
}

function playSound(type) {
  const context = prepareAudio();
  if (!context) return;
  const now = context.currentTime;
  const melodies = {
    correct: [[523, 0, .12, .08], [659, .1, .14, .075], [784, .2, .18, .07]],
    wrong: [[220, 0, .16, .07, "triangle"], [165, .13, .24, .065, "triangle"]],
    timeout: [[260, 0, .1, .06, "square"], [195, .11, .1, .055, "square"], [130, .22, .28, .06, "triangle"]],
    celebration: [[523, 0, .16, .08], [659, .12, .16, .08], [784, .24, .18, .085], [1047, .4, .42, .09]],
    levelLoss: [[294, 0, .2, .06, "triangle"], [247, .17, .22, .06, "triangle"], [196, .36, .38, .065, "triangle"]]
  };
  (melodies[type] || melodies.correct).forEach(([frequency, delay, duration, volume, wave]) => {
    scheduleNote(frequency, now + delay, duration, volume, wave || "sine");
  });
}

function showGameEffect(type, label) {
  const symbols = type === "celebration"
    ? ["🎉", "✨", "🏆", "⭐", "🎊", "✨"]
    : type === "correct"
      ? ["✨", "⭐", "✓"]
      : ["😢", "💔", "😔"];
  elements.gameFx.className = `game-fx ${type}`;
  elements.gameFx.innerHTML = `
    <div class="fx-label">${label}</div>
    ${symbols.map((symbol, index) => `
      <span class="fx-symbol" style="--x:${(index - (symbols.length - 1) / 2) * 72}px;--y:${-105 - (index % 3) * 48}px;--rotate:${index % 2 ? 18 : -18}deg;--delay:${index * 45}ms">${symbol}</span>
    `).join("")}
  `;
  clearTimeout(showGameEffect.timer);
  showGameEffect.timer = setTimeout(() => {
    elements.gameFx.className = "game-fx";
    elements.gameFx.innerHTML = "";
  }, 1500);
}

elements.worlds.addEventListener("click", (event) => {
  const card = event.target.closest(".world-card");
  if (card && !card.classList.contains("locked")) startWorld(Number(card.dataset.world));
});

elements.worlds.addEventListener("keydown", (event) => {
  const card = event.target.closest(".world-card");
  if (card && (event.key === "Enter" || event.key === " ")) {
    event.preventDefault();
    startWorld(Number(card.dataset.world));
  }
});

elements.answers.addEventListener("click", (event) => {
  const button = event.target.closest(".answer-button");
  if (button) answerQuestion(Number(button.dataset.answer));
});

document.addEventListener("keydown", (event) => {
  if (
    elements.lessonModal.classList.contains("visible")
    || elements.resultModal.classList.contains("visible")
    || elements.registerModal.classList.contains("visible")
    || elements.verifyModal.classList.contains("visible")
    || elements.welcomeModal.classList.contains("visible")
    || elements.profileModal.classList.contains("visible")
    || elements.infoModal.classList.contains("visible")
  ) return;
  if (elements.game.classList.contains("visible") && ["1", "2", "3", "4"].includes(event.key)) {
    answerQuestion(Number(event.key) - 1);
  }
  if (event.key === "Escape" && elements.game.classList.contains("visible")) closeGame();
});

$("#start-button").addEventListener("click", () => {
  if (!state.player) {
    openRegister();
    return;
  }
  if (state.completedWorlds.length === worlds.length) {
    openProfile();
    return;
  }
  startWorld(state.unlockedWorld);
});
$("#close-game").addEventListener("click", closeGame);
$("#continue-lesson").addEventListener("click", closeLesson);
elements.resultAction.addEventListener("click", () => {
  const passed = elements.resultAction.dataset.passed === "true";
  closeResult();
  if (passed) {
    completeWorld();
  } else {
    session.reviewIndex = 0;
    showLesson(session.errors[0]);
  }
});
$("#how-button").addEventListener("click", () => {
  elements.infoModal.classList.add("visible");
  elements.infoModal.setAttribute("aria-hidden", "false");
});
$("#close-info").addEventListener("click", () => {
  elements.infoModal.classList.remove("visible");
  elements.infoModal.setAttribute("aria-hidden", "true");
});
elements.registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!elements.registerForm.reportValidity()) return;
  const submitButton = $("#register-submit");
  submitButton.disabled = true;
  const identifier = $("#register-email").value.trim();
  const email = identifier.toLowerCase();
  const password = $("#register-password").value;
  try {
    if (authMode === "login") {
      const data = await signInAccount(identifier, password);
      await finishAuthenticatedPlayer(data.user);
      return;
    }

    pendingRegistration = {
      firstname: $("#register-firstname").value.trim(),
      lastname: $("#register-lastname").value.trim(),
      phone: $("#register-phone").value.trim(),
      email
    };
    const data = await signUpAccount({
      email,
      password,
      firstname: pendingRegistration.firstname,
      lastname: pendingRegistration.lastname
    });
    if (data?.requireEmailVerification) {
      openVerification(email);
    } else if (data?.user) {
      await finishAuthenticatedPlayer(data.user, pendingRegistration);
    }
  } catch (error) {
    showToast(getFriendlyAuthError(error, authMode === "login" ? "login" : "signup"), "error");
  } finally {
    submitButton.disabled = false;
  }
});
elements.verifyForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!elements.verifyForm.reportValidity() || !pendingRegistration) return;
  const button = elements.verifyForm.querySelector("button");
  button.disabled = true;
  try {
    const data = await verifyAccount(pendingRegistration.email, $("#verify-code").value);
    await finishAuthenticatedPlayer(data.user, pendingRegistration);
    pendingRegistration = null;
    elements.registerForm.reset();
    elements.verifyForm.reset();
  } catch (error) {
    showToast(getFriendlyAuthError(error, "verification"), "error");
  } finally {
    button.disabled = false;
  }
});
$("#show-login").addEventListener("click", () => setAuthMode(authMode === "login" ? "register" : "login"));
$("#welcome-action").addEventListener("click", () => {
  const canResume = hasResumableSession();
  closeWelcome();
  if (canResume) {
    resumeActiveSession();
  } else if (state.completedWorlds.length === worlds.length) {
    openProfile();
  } else {
    startWorld(state.unlockedWorld);
  }
});
$("#welcome-dashboard").addEventListener("click", closeWelcome);
$("#player-chip").addEventListener("click", () => openProfile());
$("#close-profile").addEventListener("click", closeProfile);
$("#profile-action").addEventListener("click", closeProfile);
$("#logout-player").addEventListener("click", async () => {
  try {
    await signOutAccount();
  } catch {
    showToast("La déconnexion n’a pas abouti. Réessaie dans quelques instants.", "error");
  }
  const soundPreference = state.sound;
  state = { ...defaultState, sound: soundPreference };
  saveState();
  closeProfile();
  renderDashboard();
  elements.registerForm.reset();
  openRegister();
  showToast("Nouveau joueur · crée ton profil pour commencer.");
});
$("#sound-toggle").addEventListener("click", () => {
  state.sound = !state.sound;
  if (masterGain) masterGain.gain.value = state.sound ? 0.32 : 0;
  if (state.sound) {
    prepareAudio();
    playSound("correct");
  }
  saveState();
  renderDashboard();
  showToast(state.sound ? "Sons activés" : "Sons désactivés");
});

initializeAccount();
