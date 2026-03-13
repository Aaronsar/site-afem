window.QCM_DATA = {

  // ═══════════════════════════════════════════════════════════════
  // ANATOMIE — 20 questions (10 QCU + 10 VF)
  // ═══════════════════════════════════════════════════════════════
  anatomie: {
    label: 'Anatomie',
    emoji: '🦴',
    questions: [
      // QCU 1
      {
        type: 'qcu',
        question: 'Quel os ne fait PAS partie du carpe ?',
        options: ['Scaphoïde', 'Lunatum', 'Cuboïde', 'Pisiforme'],
        answer: 2,
        explanation: 'Le cuboïde est un os du tarse (pied). Le scaphoïde, le lunatum et le pisiforme appartiennent au carpe (poignet).'
      },
      // VF 1
      {
        type: 'vf',
        question: 'Concernant le cœur et les gros vaisseaux :',
        items: [
          { text: 'A. Le ventricule gauche éjecte le sang dans l\'aorte', answer: true },
          { text: 'B. La valve mitrale est une valve tricuspide', answer: false },
          { text: 'C. L\'artère pulmonaire transporte du sang désoxygéné', answer: true },
          { text: 'D. Le nœud sinusal est situé dans l\'oreillette gauche', answer: false },
          { text: 'E. Les veines pulmonaires ramènent du sang oxygéné au cœur', answer: true }
        ],
        explanation: 'La valve mitrale est bicuspide. Le nœud sinusal se situe dans l\'oreillette droite, au niveau de l\'abouchement de la veine cave supérieure.'
      },
      // QCU 2
      {
        type: 'qcu',
        question: 'Quel muscle est le principal fléchisseur de l\'avant-bras sur le bras ?',
        options: ['Triceps brachial', 'Biceps brachial', 'Deltoïde', 'Brachio-radial'],
        answer: 1,
        explanation: 'Le biceps brachial est le principal fléchisseur de l\'avant-bras sur le bras. Le brachio-radial est un fléchisseur accessoire.'
      },
      // VF 2
      {
        type: 'vf',
        question: 'Concernant la colonne vertébrale :',
        items: [
          { text: 'A. Elle comporte 7 vertèbres cervicales', answer: true },
          { text: 'B. Elle comporte 10 vertèbres thoraciques', answer: false },
          { text: 'C. L\'atlas est la première vertèbre cervicale (C1)', answer: true },
          { text: 'D. Le sacrum résulte de la fusion de 5 vertèbres', answer: true },
          { text: 'E. Le disque intervertébral est constitué uniquement de fibrocartilage', answer: false }
        ],
        explanation: 'Il y a 12 vertèbres thoraciques (et non 10). Le disque intervertébral comporte un anneau fibreux (fibrocartilage) et un noyau pulpeux (nucleus pulposus) gélatineux.'
      },
      // QCU 3
      {
        type: 'qcu',
        question: 'Quel nerf innerve le muscle deltoïde ?',
        options: ['Nerf musculo-cutané', 'Nerf axillaire', 'Nerf radial', 'Nerf médian'],
        answer: 1,
        explanation: 'Le nerf axillaire (C5-C6), branche du plexus brachial, innerve le deltoïde et le petit rond.'
      },
      // VF 3
      {
        type: 'vf',
        question: 'Concernant les os du crâne :',
        items: [
          { text: 'A. L\'os frontal forme le front et le toit des orbites', answer: true },
          { text: 'B. L\'os sphénoïde est un os impair et médian', answer: true },
          { text: 'C. L\'os temporal contient l\'organe de l\'audition', answer: true },
          { text: 'D. L\'os ethmoïde fait partie de la voûte crânienne', answer: false },
          { text: 'E. L\'os pariétal est un os impair', answer: false }
        ],
        explanation: 'L\'os ethmoïde fait partie de la base du crâne (étage antérieur), pas de la voûte. L\'os pariétal est un os pair (un de chaque côté).'
      },
      // QCU 4
      {
        type: 'qcu',
        question: 'Quelle artère vascularise principalement l\'estomac le long de la petite courbure ?',
        options: ['Artère splénique', 'Artère gastrique gauche', 'Artère mésentérique supérieure', 'Artère hépatique propre'],
        answer: 1,
        explanation: 'L\'artère gastrique gauche (branche du tronc cœliaque) chemine le long de la petite courbure de l\'estomac.'
      },
      // VF 4
      {
        type: 'vf',
        question: 'Concernant l\'appareil respiratoire :',
        items: [
          { text: 'A. La trachée se divise en deux bronches principales au niveau de la carène', answer: true },
          { text: 'B. Le poumon droit comporte deux lobes', answer: false },
          { text: 'C. La plèvre viscérale tapisse la face interne de la paroi thoracique', answer: false },
          { text: 'D. Le hile pulmonaire contient les bronches, artères et veines pulmonaires', answer: true },
          { text: 'E. Le muscle principal de l\'inspiration est le diaphragme', answer: true }
        ],
        explanation: 'Le poumon droit comporte trois lobes (supérieur, moyen, inférieur). La plèvre pariétale tapisse la paroi thoracique ; la plèvre viscérale recouvre le poumon.'
      },
      // QCU 5
      {
        type: 'qcu',
        question: 'Le ligament croisé antérieur du genou empêche principalement :',
        options: ['La rotation latérale du tibia', 'Le tiroir antérieur du tibia', 'Le valgus du genou', 'L\'hyperflexion du genou'],
        answer: 1,
        explanation: 'Le ligament croisé antérieur (LCA) s\'oppose principalement à la translation antérieure du tibia par rapport au fémur (tiroir antérieur).'
      },
      // VF 5
      {
        type: 'vf',
        question: 'Concernant le système nerveux central :',
        items: [
          { text: 'A. L\'encéphale est composé du cerveau, du tronc cérébral et du cervelet', answer: true },
          { text: 'B. La moelle épinière se termine au niveau de L5 chez l\'adulte', answer: false },
          { text: 'C. Les méninges comprennent la dure-mère, l\'arachnoïde et la pie-mère', answer: true },
          { text: 'D. Le liquide cérébrospinal circule dans l\'espace sous-arachnoïdien', answer: true },
          { text: 'E. Le bulbe rachidien fait partie du tronc cérébral', answer: true }
        ],
        explanation: 'La moelle épinière se termine au niveau de L1-L2 chez l\'adulte (cône médullaire), et non en L5.'
      },
      // QCU 6
      {
        type: 'qcu',
        question: 'Quel est le plus grand os du corps humain ?',
        options: ['Humérus', 'Tibia', 'Fémur', 'Fibula'],
        answer: 2,
        explanation: 'Le fémur est le plus grand et le plus solide os du corps humain. Il s\'articule en haut avec l\'os coxal et en bas avec le tibia et la patella.'
      },
      // VF 6
      {
        type: 'vf',
        question: 'Concernant le membre supérieur :',
        items: [
          { text: 'A. La clavicule s\'articule avec la scapula et le sternum', answer: true },
          { text: 'B. Le radius est l\'os médial de l\'avant-bras', answer: false },
          { text: 'C. L\'olécrane est une saillie osseuse de l\'ulna', answer: true },
          { text: 'D. Le nerf ulnaire passe dans la gouttière épitrochléo-olécranienne', answer: true },
          { text: 'E. La scapula s\'articule directement avec le thorax par une articulation synoviale', answer: false }
        ],
        explanation: 'Le radius est l\'os latéral de l\'avant-bras. La scapula est appliquée contre le thorax par un plan de glissement musculaire (articulation scapulo-thoracique), ce n\'est pas une articulation synoviale.'
      },
      // QCU 7
      {
        type: 'qcu',
        question: 'Quel foramen permet le passage du nerf optique ?',
        options: ['Foramen magnum', 'Fissure orbitaire supérieure', 'Canal optique', 'Foramen ovale'],
        answer: 2,
        explanation: 'Le nerf optique (II) traverse le canal optique de l\'os sphénoïde pour rejoindre la cavité crânienne.'
      },
      // VF 7
      {
        type: 'vf',
        question: 'Concernant le système digestif :',
        items: [
          { text: 'A. Le duodénum est la première portion de l\'intestin grêle', answer: true },
          { text: 'B. Le canal cholédoque s\'abouche dans le jéjunum', answer: false },
          { text: 'C. Le cæcum est situé dans la fosse iliaque droite', answer: true },
          { text: 'D. Le pancréas est un organe rétropéritonéal', answer: true },
          { text: 'E. Le côlon sigmoïde fait suite au côlon ascendant', answer: false }
        ],
        explanation: 'Le canal cholédoque s\'abouche dans le duodénum (ampoule de Vater, D2). Le côlon sigmoïde fait suite au côlon descendant, pas au côlon ascendant.'
      },
      // QCU 8
      {
        type: 'qcu',
        question: 'L\'articulation coxo-fémorale est de quel type ?',
        options: ['Trochléenne', 'Condylienne', 'Sphéroïde (énarthrose)', 'Selle'],
        answer: 2,
        explanation: 'L\'articulation coxo-fémorale (hanche) est une articulation sphéroïde (énarthrose) permettant des mouvements dans les trois plans de l\'espace.'
      },
      // VF 8
      {
        type: 'vf',
        question: 'Concernant les artères du membre inférieur :',
        items: [
          { text: 'A. L\'artère fémorale fait suite à l\'artère iliaque externe', answer: true },
          { text: 'B. L\'artère poplitée est située en avant du genou', answer: false },
          { text: 'C. L\'artère tibiale antérieure vascularise la loge antérieure de la jambe', answer: true },
          { text: 'D. L\'artère dorsale du pied est la continuation de l\'artère tibiale antérieure', answer: true },
          { text: 'E. L\'artère fémorale profonde est une branche collatérale de l\'artère fémorale', answer: true }
        ],
        explanation: 'L\'artère poplitée est située en arrière du genou, dans le creux poplité.'
      },
      // QCU 9
      {
        type: 'qcu',
        question: 'Combien de paires de nerfs crâniens existe-t-il ?',
        options: ['10', '11', '12', '13'],
        answer: 2,
        explanation: 'Il existe 12 paires de nerfs crâniens (I à XII), du nerf olfactif (I) au nerf hypoglosse (XII).'
      },
      // VF 9
      {
        type: 'vf',
        question: 'Concernant le rein et les voies urinaires :',
        items: [
          { text: 'A. Le rein droit est plus bas que le rein gauche', answer: true },
          { text: 'B. L\'uretère droit passe en avant de l\'artère iliaque commune droite', answer: false },
          { text: 'C. Le néphron est l\'unité fonctionnelle du rein', answer: true },
          { text: 'D. L\'artère rénale naît directement de l\'aorte abdominale', answer: true },
          { text: 'E. La vessie est un organe sous-péritonéal', answer: true }
        ],
        explanation: 'L\'uretère croise l\'artère iliaque commune (ou ses branches) en passant en avant, mais classiquement il passe en avant de la bifurcation des vaisseaux iliaques communs. En fait l\'uretère croise les vaisseaux iliaques en avant au niveau de la bifurcation.'
      },
      // QCU 10
      {
        type: 'qcu',
        question: 'Le muscle quadriceps fémoral s\'insère distalement sur :',
        options: ['Le grand trochanter', 'La tubérosité tibiale (via le ligament patellaire)', 'La tête de la fibula', 'L\'épicondyle latéral du fémur'],
        answer: 1,
        explanation: 'Le quadriceps se termine par le tendon quadricipital sur la patella, puis par le ligament patellaire sur la tubérosité tibiale.'
      },
      // VF 10
      {
        type: 'vf',
        question: 'Concernant le médiastin :',
        items: [
          { text: 'A. Le médiastin est la région centrale du thorax entre les deux poumons', answer: true },
          { text: 'B. L\'œsophage thoracique est situé dans le médiastin postérieur', answer: true },
          { text: 'C. Le thymus est situé dans le médiastin antérieur', answer: true },
          { text: 'D. Le nerf phrénique chemine dans le médiastin moyen', answer: true },
          { text: 'E. La crosse de l\'aorte est située dans le médiastin inférieur', answer: false }
        ],
        explanation: 'La crosse de l\'aorte est située dans le médiastin supérieur. Le médiastin inférieur est subdivisé en antérieur, moyen et postérieur.'
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // BIOLOGIE CELLULAIRE — 20 questions (10 QCU + 10 VF)
  // ═══════════════════════════════════════════════════════════════
  biologie_cellulaire: {
    label: 'Biologie cellulaire',
    emoji: '🔬',
    questions: [
      // QCU 1
      {
        type: 'qcu',
        question: 'Quel organite est le siège principal de la production d\'ATP par phosphorylation oxydative ?',
        options: ['Réticulum endoplasmique lisse', 'Mitochondrie', 'Appareil de Golgi', 'Peroxysome'],
        answer: 1,
        explanation: 'La mitochondrie est le siège de la chaîne respiratoire et de la phosphorylation oxydative, produisant la majorité de l\'ATP cellulaire.'
      },
      // VF 1
      {
        type: 'vf',
        question: 'Concernant la membrane plasmique :',
        items: [
          { text: 'A. Elle est constituée d\'une bicouche de phospholipides', answer: true },
          { text: 'B. Le cholestérol augmente la fluidité membranaire à basse température', answer: true },
          { text: 'C. Les protéines transmembranaires traversent la bicouche une ou plusieurs fois', answer: true },
          { text: 'D. Les glucides sont présents sur le feuillet cytoplasmique de la membrane', answer: false },
          { text: 'E. Le modèle de la mosaïque fluide a été proposé par Singer et Nicolson', answer: true }
        ],
        explanation: 'Les glucides (glycocalyx) sont toujours sur le feuillet exoplasmique (face externe) de la membrane plasmique, jamais du côté cytoplasmique.'
      },
      // QCU 2
      {
        type: 'qcu',
        question: 'Quel type de jonction cellulaire assure l\'étanchéité entre les cellules épithéliales ?',
        options: ['Desmosomes', 'Jonctions communicantes (gap)', 'Jonctions serrées (zonula occludens)', 'Hémidesmosomes'],
        answer: 2,
        explanation: 'Les jonctions serrées (zonula occludens) forment une barrière étanche entre les cellules épithéliales, empêchant le passage paracellulaire des molécules.'
      },
      // VF 2
      {
        type: 'vf',
        question: 'Concernant le réticulum endoplasmique (RE) :',
        items: [
          { text: 'A. Le RE rugueux est recouvert de ribosomes', answer: true },
          { text: 'B. Le RE lisse est impliqué dans la synthèse des lipides', answer: true },
          { text: 'C. Le RE rugueux synthétise les protéines destinées au cytosol', answer: false },
          { text: 'D. Le RE lisse participe à la détoxification des médicaments dans le foie', answer: true },
          { text: 'E. Le RE rugueux est en continuité avec l\'enveloppe nucléaire', answer: true }
        ],
        explanation: 'Le RE rugueux synthétise les protéines sécrétées, membranaires ou lysosomales. Les protéines cytosoliques sont synthétisées par les ribosomes libres du cytoplasme.'
      },
      // QCU 3
      {
        type: 'qcu',
        question: 'Au cours de la mitose, les chromosomes s\'alignent sur la plaque équatoriale pendant :',
        options: ['La prophase', 'La prométaphase', 'La métaphase', 'L\'anaphase'],
        answer: 2,
        explanation: 'Pendant la métaphase, les chromosomes sont alignés sur la plaque équatoriale (plaque métaphasique), attachés au fuseau mitotique par leurs kinétochores.'
      },
      // VF 3
      {
        type: 'vf',
        question: 'Concernant le cytosquelette :',
        items: [
          { text: 'A. Les microfilaments d\'actine ont un diamètre d\'environ 7 nm', answer: true },
          { text: 'B. Les microtubules sont constitués de dimères d\'actine et de myosine', answer: false },
          { text: 'C. Les filaments intermédiaires assurent la résistance mécanique de la cellule', answer: true },
          { text: 'D. Les microtubules sont impliqués dans le transport intracellulaire', answer: true },
          { text: 'E. La colchicine inhibe la polymérisation des microtubules', answer: true }
        ],
        explanation: 'Les microtubules sont constitués de dimères de tubuline α et β, et non d\'actine et de myosine.'
      },
      // QCU 4
      {
        type: 'qcu',
        question: 'Quel processus permet l\'internalisation de grosses particules par la cellule ?',
        options: ['Pinocytose', 'Endocytose médiée par récepteur', 'Phagocytose', 'Exocytose'],
        answer: 2,
        explanation: 'La phagocytose est le processus par lequel la cellule internalise de grosses particules (bactéries, débris) en formant un phagosome.'
      },
      // VF 4
      {
        type: 'vf',
        question: 'Concernant l\'appareil de Golgi :',
        items: [
          { text: 'A. Il est constitué d\'un empilement de saccules (dictyosomes)', answer: true },
          { text: 'B. La face cis reçoit les vésicules provenant du RE', answer: true },
          { text: 'C. Il est le lieu principal de la N-glycosylation initiale des protéines', answer: false },
          { text: 'D. La face trans émet des vésicules de sécrétion', answer: true },
          { text: 'E. Il participe à la maturation des glycoprotéines', answer: true }
        ],
        explanation: 'La N-glycosylation initiale (transfert en bloc de l\'oligosaccharide) a lieu dans le RE rugueux. L\'appareil de Golgi modifie et mature les glycanes déjà ajoutés.'
      },
      // QCU 5
      {
        type: 'qcu',
        question: 'Le complexe de pore nucléaire permet le passage :',
        options: ['Uniquement de petites molécules par diffusion passive', 'De molécules de plus de 40 kDa sans signal d\'adressage', 'De protéines possédant un signal NLS par transport actif', 'Uniquement d\'ARN messagers'],
        answer: 2,
        explanation: 'Les protéines de plus de 40 kDa nécessitent un signal de localisation nucléaire (NLS) pour être transportées activement à travers le complexe de pore via les importines.'
      },
      // VF 5
      {
        type: 'vf',
        question: 'Concernant le cycle cellulaire :',
        items: [
          { text: 'A. La phase S correspond à la réplication de l\'ADN', answer: true },
          { text: 'B. La phase G1 précède la phase S', answer: true },
          { text: 'C. Les cyclines sont des protéines dont le taux reste constant au cours du cycle', answer: false },
          { text: 'D. Le point de restriction se situe en fin de phase G1', answer: true },
          { text: 'E. La protéine p53 est un suppresseur de tumeur impliqué dans l\'arrêt du cycle', answer: true }
        ],
        explanation: 'Les cyclines ont un taux qui varie au cours du cycle cellulaire (expression et dégradation cycliques), d\'où leur nom. Elles activent les CDK de manière phase-dépendante.'
      },
      // QCU 6
      {
        type: 'qcu',
        question: 'Quel organite contient des hydrolases acides et assure la digestion intracellulaire ?',
        options: ['Peroxysome', 'Lysosome', 'Endosome', 'Protéasome'],
        answer: 1,
        explanation: 'Le lysosome contient des hydrolases acides (pH optimal ~5) et assure la dégradation des macromolécules intracellulaires et du matériel endocyté.'
      },
      // VF 6
      {
        type: 'vf',
        question: 'Concernant les mitochondries :',
        items: [
          { text: 'A. Elles possèdent leur propre ADN circulaire', answer: true },
          { text: 'B. La membrane interne forme des crêtes mitochondriales', answer: true },
          { text: 'C. Le cycle de Krebs se déroule dans l\'espace intermembranaire', answer: false },
          { text: 'D. La chaîne respiratoire est localisée dans la membrane interne', answer: true },
          { text: 'E. L\'ADN mitochondrial est d\'hérédité maternelle', answer: true }
        ],
        explanation: 'Le cycle de Krebs se déroule dans la matrice mitochondriale, pas dans l\'espace intermembranaire.'
      },
      // QCU 7
      {
        type: 'qcu',
        question: 'Quel type de transport membranaire nécessite un transporteur protéique mais pas d\'énergie ?',
        options: ['Transport actif primaire', 'Diffusion facilitée', 'Transport actif secondaire', 'Endocytose'],
        answer: 1,
        explanation: 'La diffusion facilitée utilise des protéines de transport (canaux ou transporteurs) pour permettre le passage de molécules dans le sens de leur gradient, sans apport d\'énergie.'
      },
      // VF 7
      {
        type: 'vf',
        question: 'Concernant la signalisation cellulaire :',
        items: [
          { text: 'A. Les récepteurs couplés aux protéines G (RCPG) possèdent 7 domaines transmembranaires', answer: true },
          { text: 'B. L\'AMPc est un second messager produit par l\'adénylate cyclase', answer: true },
          { text: 'C. Les récepteurs à activité tyrosine kinase se dimérisent après fixation du ligand', answer: true },
          { text: 'D. La signalisation autocrine concerne une cellule qui agit sur une cellule distante', answer: false },
          { text: 'E. La protéine Ras est une petite GTPase impliquée dans la voie des MAP kinases', answer: true }
        ],
        explanation: 'La signalisation autocrine concerne une cellule qui agit sur elle-même. La signalisation sur une cellule distante est de type endocrine.'
      },
      // QCU 8
      {
        type: 'qcu',
        question: 'Lors de la méiose, la recombinaison homologue (crossing-over) se produit en :',
        options: ['Prophase I', 'Métaphase I', 'Anaphase I', 'Prophase II'],
        answer: 0,
        explanation: 'Le crossing-over se produit pendant la prophase I de la méiose (stade pachytène), lorsque les chromosomes homologues sont appariés en bivalents.'
      },
      // VF 8
      {
        type: 'vf',
        question: 'Concernant les peroxysomes :',
        items: [
          { text: 'A. Ils contiennent de la catalase', answer: true },
          { text: 'B. Ils participent à la β-oxydation des acides gras à très longue chaîne', answer: true },
          { text: 'C. Ils sont entourés d\'une double membrane', answer: false },
          { text: 'D. Un déficit en peroxysomes peut provoquer le syndrome de Zellweger', answer: true },
          { text: 'E. Ils dégradent le peroxyde d\'hydrogène (H₂O₂)', answer: true }
        ],
        explanation: 'Les peroxysomes sont entourés d\'une simple membrane, contrairement aux mitochondries qui possèdent une double membrane.'
      },
      // QCU 9
      {
        type: 'qcu',
        question: 'Quelle protéine motrice se déplace vers l\'extrémité (+) des microtubules ?',
        options: ['Dynéine cytoplasmique', 'Kinésine', 'Myosine I', 'Actinine'],
        answer: 1,
        explanation: 'La kinésine est un moteur moléculaire qui se déplace vers l\'extrémité (+) des microtubules, assurant le transport antérograde.'
      },
      // VF 9
      {
        type: 'vf',
        question: 'Concernant l\'apoptose :',
        items: [
          { text: 'A. C\'est une mort cellulaire programmée', answer: true },
          { text: 'B. Elle s\'accompagne d\'une réaction inflammatoire importante', answer: false },
          { text: 'C. Les caspases sont des protéases impliquées dans l\'apoptose', answer: true },
          { text: 'D. La voie intrinsèque fait intervenir la mitochondrie et le cytochrome c', answer: true },
          { text: 'E. La protéine Bcl-2 est pro-apoptotique', answer: false }
        ],
        explanation: 'L\'apoptose ne provoque pas de réaction inflammatoire (contrairement à la nécrose). Bcl-2 est une protéine anti-apoptotique qui inhibe la libération du cytochrome c.'
      },
      // QCU 10
      {
        type: 'qcu',
        question: 'Le glycocalyx est situé :',
        options: ['Dans le cytoplasme', 'Sur la face interne de la membrane plasmique', 'Sur la face externe de la membrane plasmique', 'Dans le noyau'],
        answer: 2,
        explanation: 'Le glycocalyx (cell coat) est l\'ensemble des chaînes glucidiques portées par les glycoprotéines et glycolipides de la face externe (exoplasmique) de la membrane plasmique.'
      },
      // VF 10
      {
        type: 'vf',
        question: 'Concernant la matrice extracellulaire (MEC) :',
        items: [
          { text: 'A. Le collagène est la protéine la plus abondante de la MEC', answer: true },
          { text: 'B. Les intégrines sont des récepteurs transmembranaires liant la MEC au cytosquelette', answer: true },
          { text: 'C. La lame basale est composée principalement de collagène de type I', answer: false },
          { text: 'D. Les protéoglycanes sont constitués de glycosaminoglycanes fixés sur un axe protéique', answer: true },
          { text: 'E. La fibronectine est une glycoprotéine d\'adhérence de la MEC', answer: true }
        ],
        explanation: 'La lame basale est composée principalement de collagène de type IV (réseau en treillis), de laminine et de protéoglycanes (perlécan). Le collagène de type I se trouve dans le tissu conjonctif interstitiel.'
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // BIOLOGIE MOLÉCULAIRE — 20 questions (10 QCU + 10 VF)
  // ═══════════════════════════════════════════════════════════════
  biologie_moleculaire: {
    label: 'Biologie moléculaire',
    emoji: '🧬',
    questions: [
      // QCU 1
      {
        type: 'qcu',
        question: 'Quelle enzyme est responsable de la réplication de l\'ADN chez les eucaryotes pour le brin avancé ?',
        options: ['ADN polymérase I', 'ADN polymérase α', 'ADN polymérase ε', 'ADN polymérase β'],
        answer: 2,
        explanation: 'L\'ADN polymérase ε réplique le brin avancé (leading strand) chez les eucaryotes, tandis que l\'ADN polymérase δ réplique le brin retardé.'
      },
      // VF 1
      {
        type: 'vf',
        question: 'Concernant la structure de l\'ADN :',
        items: [
          { text: 'A. L\'ADN est un polymère de désoxyribonucléotides', answer: true },
          { text: 'B. Les deux brins d\'ADN sont parallèles', answer: false },
          { text: 'C. Les liaisons hydrogène entre A et T sont au nombre de 2', answer: true },
          { text: 'D. Les liaisons hydrogène entre G et C sont au nombre de 3', answer: true },
          { text: 'E. Le sillon majeur est le site principal de liaison des facteurs de transcription', answer: true }
        ],
        explanation: 'Les deux brins d\'ADN sont antiparallèles : l\'un est orienté 5\'→3\' et l\'autre 3\'→5\'.'
      },
      // QCU 2
      {
        type: 'qcu',
        question: 'Quel type d\'ARN est le plus abondant dans la cellule ?',
        options: ['ARN messager (ARNm)', 'ARN de transfert (ARNt)', 'ARN ribosomal (ARNr)', 'Micro-ARN (miARN)'],
        answer: 2,
        explanation: 'L\'ARN ribosomal (ARNr) représente environ 80 % de l\'ARN total de la cellule. Il constitue la composante structurale et catalytique des ribosomes.'
      },
      // VF 2
      {
        type: 'vf',
        question: 'Concernant la transcription chez les eucaryotes :',
        items: [
          { text: 'A. L\'ARN polymérase II transcrit les gènes codant les protéines', answer: true },
          { text: 'B. La boîte TATA est un élément du promoteur reconnu par TBP', answer: true },
          { text: 'C. La transcription se déroule dans le cytoplasme', answer: false },
          { text: 'D. L\'ARN polymérase I transcrit les ARN ribosomaux (sauf 5S)', answer: true },
          { text: 'E. L\'ARN polymérase nécessite une amorce pour initier la transcription', answer: false }
        ],
        explanation: 'La transcription eucaryote se déroule dans le noyau. Contrairement à l\'ADN polymérase, l\'ARN polymérase n\'a pas besoin d\'amorce pour initier la synthèse.'
      },
      // QCU 3
      {
        type: 'qcu',
        question: 'Quel codon est le codon d\'initiation universel de la traduction ?',
        options: ['AUG', 'UAA', 'GUG', 'UAG'],
        answer: 0,
        explanation: 'Le codon AUG code pour la méthionine et sert de codon d\'initiation universel de la traduction chez les eucaryotes comme chez les procaryotes.'
      },
      // VF 3
      {
        type: 'vf',
        question: 'Concernant la maturation des ARNm eucaryotes :',
        items: [
          { text: 'A. La coiffe 5\' est une 7-méthylguanosine liée par une liaison 5\'-5\' triphosphate', answer: true },
          { text: 'B. La polyadénylation ajoute une queue poly(A) en 5\'', answer: false },
          { text: 'C. L\'épissage élimine les introns et joint les exons', answer: true },
          { text: 'D. Le spliceosome est constitué de snRNP (U1, U2, U4, U5, U6)', answer: true },
          { text: 'E. L\'épissage alternatif permet de produire plusieurs protéines à partir d\'un seul gène', answer: true }
        ],
        explanation: 'La queue poly(A) est ajoutée à l\'extrémité 3\' de l\'ARNm (et non en 5\'). La coiffe est en 5\' et la queue poly(A) en 3\'.'
      },
      // QCU 4
      {
        type: 'qcu',
        question: 'Quelle enzyme déroule la double hélice d\'ADN au niveau de la fourche de réplication ?',
        options: ['Topoisomérase', 'Hélicase', 'Primase', 'Ligase'],
        answer: 1,
        explanation: 'L\'hélicase rompt les liaisons hydrogène entre les deux brins d\'ADN pour dérouler la double hélice en amont de la fourche de réplication.'
      },
      // VF 4
      {
        type: 'vf',
        question: 'Concernant le code génétique :',
        items: [
          { text: 'A. Le code génétique est dégénéré (redondant)', answer: true },
          { text: 'B. Un codon est constitué de 4 nucléotides', answer: false },
          { text: 'C. Il existe 3 codons stop : UAA, UAG, UGA', answer: true },
          { text: 'D. Le code génétique est universel avec quelques exceptions', answer: true },
          { text: 'E. La troisième position du codon est appelée position wobble', answer: true }
        ],
        explanation: 'Un codon est constitué de 3 nucléotides (triplet), ce qui donne 4³ = 64 codons possibles.'
      },
      // QCU 5
      {
        type: 'qcu',
        question: 'Quelle technique permet d\'amplifier un fragment d\'ADN de manière exponentielle in vitro ?',
        options: ['Southern blot', 'Western blot', 'PCR (réaction de polymérisation en chaîne)', 'Northern blot'],
        answer: 2,
        explanation: 'La PCR (Polymerase Chain Reaction) permet d\'amplifier un fragment d\'ADN spécifique de manière exponentielle grâce à des cycles de dénaturation, hybridation et élongation.'
      },
      // VF 5
      {
        type: 'vf',
        question: 'Concernant la réparation de l\'ADN :',
        items: [
          { text: 'A. Le système BER (Base Excision Repair) répare les bases endommagées', answer: true },
          { text: 'B. Le système NER (Nucleotide Excision Repair) répare les dimères de thymine', answer: true },
          { text: 'C. Le système MMR (Mismatch Repair) corrige les mésappariements de bases', answer: true },
          { text: 'D. Les cassures double-brin peuvent être réparées par jonction d\'extrémités non homologues (NHEJ)', answer: true },
          { text: 'E. La recombinaison homologue est un mécanisme de réparation infidèle', answer: false }
        ],
        explanation: 'La recombinaison homologue est un mécanisme de réparation fidèle car elle utilise la chromatide sœur comme matrice. Le NHEJ est le mécanisme potentiellement infidèle.'
      },
      // QCU 6
      {
        type: 'qcu',
        question: 'Quel type de mutation ponctuelle remplace une purine par une autre purine ?',
        options: ['Transversion', 'Transition', 'Délétion', 'Insertion'],
        answer: 1,
        explanation: 'Une transition est le remplacement d\'une purine par une purine (A↔G) ou d\'une pyrimidine par une pyrimidine (C↔T). Une transversion est le remplacement d\'une purine par une pyrimidine ou inversement.'
      },
      // VF 6
      {
        type: 'vf',
        question: 'Concernant la traduction :',
        items: [
          { text: 'A. Elle se déroule sur les ribosomes', answer: true },
          { text: 'B. Le ribosome eucaryote a un coefficient de sédimentation de 80S', answer: true },
          { text: 'C. L\'aminoacyl-ARNt synthétase charge l\'acide aminé sur l\'ARNt', answer: true },
          { text: 'D. L\'élongation de la traduction se fait dans le sens C-terminal vers N-terminal', answer: false },
          { text: 'E. Les facteurs eIF sont impliqués dans l\'initiation de la traduction chez les eucaryotes', answer: true }
        ],
        explanation: 'L\'élongation de la chaîne polypeptidique se fait dans le sens N-terminal vers C-terminal, correspondant à la lecture de l\'ARNm en 5\'→3\'.'
      },
      // QCU 7
      {
        type: 'qcu',
        question: 'Les télomères sont maintenus par quelle enzyme ?',
        options: ['ADN polymérase', 'Primase', 'Télomérase', 'Hélicase'],
        answer: 2,
        explanation: 'La télomérase est une transcriptase inverse qui ajoute des répétitions TTAGGG aux extrémités des chromosomes, compensant le raccourcissement à chaque réplication.'
      },
      // VF 7
      {
        type: 'vf',
        question: 'Concernant la régulation de l\'expression génique chez les eucaryotes :',
        items: [
          { text: 'A. La méthylation des îlots CpG est généralement associée à la répression transcriptionnelle', answer: true },
          { text: 'B. L\'acétylation des histones favorise la transcription', answer: true },
          { text: 'C. Les enhancers sont des séquences régulatrices qui doivent être proches du promoteur', answer: false },
          { text: 'D. Les micro-ARN (miARN) régulent l\'expression au niveau post-transcriptionnel', answer: true },
          { text: 'E. L\'euchromatine est une forme condensée et transcriptionnellement inactive', answer: false }
        ],
        explanation: 'Les enhancers peuvent agir à grande distance du promoteur (plusieurs dizaines de kb). L\'euchromatine est une forme décondensée et transcriptionnellement active ; c\'est l\'hétérochromatine qui est condensée et inactive.'
      },
      // QCU 8
      {
        type: 'qcu',
        question: 'Quel niveau de structure de la chromatine correspond au nucléosome ?',
        options: ['Fibre de 30 nm', 'Collier de perles (10 nm)', 'Chromosome métaphasique', 'Boucles de chromatine'],
        answer: 1,
        explanation: 'Le nucléosome (ADN enroulé autour d\'un octamère d\'histones) forme la structure en « collier de perles » d\'environ 10 nm de diamètre, premier niveau de compaction de la chromatine.'
      },
      // VF 8
      {
        type: 'vf',
        question: 'Concernant les techniques de biologie moléculaire :',
        items: [
          { text: 'A. Le Southern blot permet de détecter des fragments d\'ADN spécifiques', answer: true },
          { text: 'B. Le Northern blot permet de détecter des protéines spécifiques', answer: false },
          { text: 'C. Le séquençage Sanger utilise des didésoxyribonucléotides (ddNTP)', answer: true },
          { text: 'D. Les enzymes de restriction coupent l\'ADN au niveau de séquences palindromiques', answer: true },
          { text: 'E. Le clonage moléculaire utilise des vecteurs (plasmides, phages) pour propager un fragment d\'ADN', answer: true }
        ],
        explanation: 'Le Northern blot détecte des ARN, pas des protéines. C\'est le Western blot qui détecte les protéines.'
      },
      // QCU 9
      {
        type: 'qcu',
        question: 'Quel est le rôle principal de la protéine PCNA dans la réplication ?',
        options: ['Dérouler la double hélice', 'Servir de pince coulissante (clamp) pour l\'ADN polymérase', 'Synthétiser les amorces ARN', 'Lier les fragments d\'Okazaki'],
        answer: 1,
        explanation: 'PCNA (Proliferating Cell Nuclear Antigen) sert de pince coulissante qui maintient l\'ADN polymérase δ/ε sur l\'ADN, augmentant sa processivité.'
      },
      // VF 9
      {
        type: 'vf',
        question: 'Concernant les modifications épigénétiques :',
        items: [
          { text: 'A. Elles modifient la séquence nucléotidique de l\'ADN', answer: false },
          { text: 'B. Elles sont héritables au cours des divisions cellulaires', answer: true },
          { text: 'C. La méthylation de l\'ADN est catalysée par les DNMT (ADN méthyltransférases)', answer: true },
          { text: 'D. L\'inactivation du chromosome X est un exemple de régulation épigénétique', answer: true },
          { text: 'E. Les histones peuvent être modifiées par méthylation, acétylation et phosphorylation', answer: true }
        ],
        explanation: 'Les modifications épigénétiques ne modifient pas la séquence de l\'ADN. Elles régulent l\'expression des gènes par des modifications chimiques de l\'ADN ou des histones.'
      },
      // QCU 10
      {
        type: 'qcu',
        question: 'Le système CRISPR-Cas9 utilise quel type de molécule pour guider la coupure de l\'ADN ?',
        options: ['Un ARN guide (sgRNA)', 'Un anticorps', 'Une protéine à doigts de zinc', 'Un primer ADN'],
        answer: 0,
        explanation: 'CRISPR-Cas9 utilise un ARN guide simple (sgRNA) complémentaire de la séquence cible pour diriger la nucléase Cas9 vers le site de coupure dans l\'ADN.'
      },
      // VF 10
      {
        type: 'vf',
        question: 'Concernant la réplication de l\'ADN :',
        items: [
          { text: 'A. La réplication est semi-conservative', answer: true },
          { text: 'B. La synthèse d\'ADN se fait dans le sens 3\'→5\'', answer: false },
          { text: 'C. Les fragments d\'Okazaki sont synthétisés sur le brin retardé', answer: true },
          { text: 'D. L\'ADN ligase relie les fragments d\'Okazaki entre eux', answer: true },
          { text: 'E. Les origines de réplication sont uniques chez les eucaryotes', answer: false }
        ],
        explanation: 'La synthèse d\'ADN se fait toujours dans le sens 5\'→3\'. Les eucaryotes possèdent de multiples origines de réplication par chromosome (et non une seule) pour permettre une réplication rapide du génome.'
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // BIOCHIMIE — 20 questions (10 QCU + 10 VF)
  // ═══════════════════════════════════════════════════════════════
  biochimie: {
    label: 'Biochimie',
    emoji: '⚗️',
    questions: [
      // QCU 1
      {
        type: 'qcu',
        question: 'Quel est le produit final de la glycolyse en conditions aérobies ?',
        options: ['Lactate', 'Pyruvate', 'Acétyl-CoA', 'Oxaloacétate'],
        answer: 1,
        explanation: 'En conditions aérobies, la glycolyse produit 2 molécules de pyruvate à partir d\'une molécule de glucose. Le pyruvate est ensuite converti en acétyl-CoA dans la mitochondrie.'
      },
      // VF 1
      {
        type: 'vf',
        question: 'Concernant les acides aminés :',
        items: [
          { text: 'A. Il existe 20 acides aminés protéinogènes standards', answer: true },
          { text: 'B. À pH physiologique, un acide aminé existe sous forme de zwitterion', answer: true },
          { text: 'C. La glycine possède un carbone asymétrique', answer: false },
          { text: 'D. Les acides aminés essentiels sont synthétisés par l\'organisme humain', answer: false },
          { text: 'E. La liaison peptidique est une liaison covalente entre le groupe α-aminé et le groupe α-carboxylique', answer: true }
        ],
        explanation: 'La glycine est le seul acide aminé sans carbone asymétrique (R = H). Les acides aminés essentiels ne peuvent pas être synthétisés par l\'organisme et doivent être apportés par l\'alimentation.'
      },
      // QCU 2
      {
        type: 'qcu',
        question: 'Quelle enzyme catalyse la première réaction irréversible de la glycolyse ?',
        options: ['Phosphofructokinase-1 (PFK-1)', 'Hexokinase', 'Pyruvate kinase', 'Aldolase'],
        answer: 1,
        explanation: 'L\'hexokinase (ou glucokinase dans le foie) catalyse la phosphorylation du glucose en glucose-6-phosphate, première étape irréversible de la glycolyse.'
      },
      // VF 2
      {
        type: 'vf',
        question: 'Concernant le cycle de Krebs :',
        items: [
          { text: 'A. Il se déroule dans la matrice mitochondriale', answer: true },
          { text: 'B. Il produit directement de grandes quantités d\'ATP', answer: false },
          { text: 'C. L\'oxaloacétate est régénéré à chaque tour du cycle', answer: true },
          { text: 'D. Il produit du NADH et du FADH₂', answer: true },
          { text: 'E. L\'isocitrate déshydrogénase est une enzyme régulatrice du cycle', answer: true }
        ],
        explanation: 'Le cycle de Krebs ne produit qu\'un GTP (équivalent d\'un ATP) par tour. Sa fonction principale est de produire les coenzymes réduits (NADH, FADH₂) qui alimentent la chaîne respiratoire.'
      },
      // QCU 3
      {
        type: 'qcu',
        question: 'Quelle vitamine est le précurseur du coenzyme NAD⁺ ?',
        options: ['Vitamine B1 (thiamine)', 'Vitamine B2 (riboflavine)', 'Vitamine B3 (niacine/nicotinamide)', 'Vitamine B6 (pyridoxine)'],
        answer: 2,
        explanation: 'La vitamine B3 (niacine ou nicotinamide) est le précurseur du NAD⁺ (nicotinamide adénine dinucléotide) et du NADP⁺.'
      },
      // VF 3
      {
        type: 'vf',
        question: 'Concernant les enzymes :',
        items: [
          { text: 'A. Les enzymes diminuent l\'énergie d\'activation d\'une réaction', answer: true },
          { text: 'B. La constante de Michaelis (Km) représente l\'affinité de l\'enzyme pour son substrat', answer: true },
          { text: 'C. Un inhibiteur compétitif augmente le Km apparent sans modifier la Vmax', answer: true },
          { text: 'D. Un inhibiteur non compétitif diminue la Vmax sans modifier le Km', answer: true },
          { text: 'E. Les enzymes modifient l\'équilibre thermodynamique de la réaction', answer: false }
        ],
        explanation: 'Les enzymes accélèrent la vitesse d\'atteinte de l\'équilibre mais ne modifient pas l\'équilibre thermodynamique (ΔG) de la réaction.'
      },
      // QCU 4
      {
        type: 'qcu',
        question: 'L\'insuline stimule principalement quel processus métabolique ?',
        options: ['La glycogénolyse', 'La néoglucogenèse', 'La glycogénogenèse', 'La lipolyse'],
        answer: 2,
        explanation: 'L\'insuline est une hormone hypoglycémiante qui stimule la glycogénogenèse (synthèse du glycogène), la lipogenèse et la captation cellulaire du glucose.'
      },
      // VF 4
      {
        type: 'vf',
        question: 'Concernant les lipides :',
        items: [
          { text: 'A. Les acides gras saturés ne contiennent pas de double liaison', answer: true },
          { text: 'B. L\'acide oléique est un acide gras polyinsaturé', answer: false },
          { text: 'C. La β-oxydation des acides gras se déroule dans la mitochondrie', answer: true },
          { text: 'D. Le cholestérol est le précurseur des hormones stéroïdes', answer: true },
          { text: 'E. Les triglycérides sont composés de glycérol et de trois acides gras', answer: true }
        ],
        explanation: 'L\'acide oléique (C18:1 Δ9) est un acide gras monoinsaturé (une seule double liaison), pas polyinsaturé.'
      },
      // QCU 5
      {
        type: 'qcu',
        question: 'Quel complexe de la chaîne respiratoire n\'est PAS une pompe à protons ?',
        options: ['Complexe I (NADH déshydrogénase)', 'Complexe II (succinate déshydrogénase)', 'Complexe III (cytochrome bc1)', 'Complexe IV (cytochrome c oxydase)'],
        answer: 1,
        explanation: 'Le complexe II (succinate déshydrogénase) est le seul complexe de la chaîne respiratoire qui ne pompe pas de protons à travers la membrane interne mitochondriale.'
      },
      // VF 5
      {
        type: 'vf',
        question: 'Concernant la néoglucogenèse :',
        items: [
          { text: 'A. Elle se déroule principalement dans le foie', answer: true },
          { text: 'B. Elle utilise exactement les mêmes enzymes que la glycolyse en sens inverse', answer: false },
          { text: 'C. Le lactate peut servir de substrat pour la néoglucogenèse', answer: true },
          { text: 'D. La fructose-1,6-bisphosphatase est une enzyme clé de la néoglucogenèse', answer: true },
          { text: 'E. Elle est stimulée par l\'insuline', answer: false }
        ],
        explanation: 'La néoglucogenèse contourne les 3 étapes irréversibles de la glycolyse par des enzymes spécifiques. Elle est stimulée par le glucagon et inhibée par l\'insuline.'
      },
      // QCU 6
      {
        type: 'qcu',
        question: 'Quel type de structure protéique correspond à l\'hélice α et au feuillet β ?',
        options: ['Structure primaire', 'Structure secondaire', 'Structure tertiaire', 'Structure quaternaire'],
        answer: 1,
        explanation: 'L\'hélice α et le feuillet β plissé sont des éléments de structure secondaire stabilisés par des liaisons hydrogène entre les atomes du squelette peptidique.'
      },
      // VF 6
      {
        type: 'vf',
        question: 'Concernant les glucides :',
        items: [
          { text: 'A. Le glucose est un aldohexose', answer: true },
          { text: 'B. Le saccharose est un disaccharide composé de glucose et de fructose', answer: true },
          { text: 'C. Le glycogène est un polysaccharide de réserve végétal', answer: false },
          { text: 'D. La liaison α(1→4) est la liaison principale du glycogène', answer: true },
          { text: 'E. Le lactose est composé de galactose et de glucose', answer: true }
        ],
        explanation: 'Le glycogène est le polysaccharide de réserve animal (foie et muscles). L\'amidon est le polysaccharide de réserve végétal.'
      },
      // QCU 7
      {
        type: 'qcu',
        question: 'Quel est le rôle principal du cycle des pentoses phosphates ?',
        options: ['Produire de l\'ATP', 'Produire du NADPH et du ribose-5-phosphate', 'Dégrader les acides aminés', 'Synthétiser le cholestérol'],
        answer: 1,
        explanation: 'Le cycle des pentoses phosphates produit du NADPH (pouvoir réducteur pour les biosynthèses et la défense antioxydante) et du ribose-5-phosphate (précurseur des nucléotides).'
      },
      // VF 7
      {
        type: 'vf',
        question: 'Concernant le métabolisme des acides aminés :',
        items: [
          { text: 'A. La transamination transfère le groupe aminé sur un α-cétoacide', answer: true },
          { text: 'B. Le cycle de l\'urée se déroule dans le rein', answer: false },
          { text: 'C. Les acides aminés glucoformateurs peuvent servir de précurseurs du glucose', answer: true },
          { text: 'D. La phénylalanine hydroxylase convertit la phénylalanine en tyrosine', answer: true },
          { text: 'E. La désamination oxydative libère de l\'ammoniac (NH₃)', answer: true }
        ],
        explanation: 'Le cycle de l\'urée se déroule dans le foie (et non dans le rein). Il convertit l\'ammoniac toxique en urée, qui est ensuite éliminée par les reins.'
      },
      // QCU 8
      {
        type: 'qcu',
        question: 'Quel est l\'effet d\'un pH inférieur au pI sur la charge nette d\'une protéine ?',
        options: ['La protéine est chargée négativement', 'La protéine est chargée positivement', 'La protéine est neutre', 'La protéine est dénaturée'],
        answer: 1,
        explanation: 'Quand le pH est inférieur au point isoélectrique (pI), les groupes ionisables sont protonés et la protéine porte une charge nette positive.'
      },
      // VF 8
      {
        type: 'vf',
        question: 'Concernant la chaîne respiratoire et la phosphorylation oxydative :',
        items: [
          { text: 'A. L\'ATP synthase utilise le gradient de protons pour synthétiser l\'ATP', answer: true },
          { text: 'B. Le NADH cède ses électrons au complexe I', answer: true },
          { text: 'C. Le FADH₂ cède ses électrons au complexe I', answer: false },
          { text: 'D. L\'oxygène est l\'accepteur final d\'électrons', answer: true },
          { text: 'E. Le cyanure inhibe le complexe IV de la chaîne respiratoire', answer: true }
        ],
        explanation: 'Le FADH₂ cède ses électrons au complexe II (succinate déshydrogénase), pas au complexe I. Le NADH est le substrat du complexe I.'
      },
      // QCU 9
      {
        type: 'qcu',
        question: 'Quelle hormone active la lipolyse dans le tissu adipeux ?',
        options: ['Insuline', 'Glucagon', 'Aldostérone', 'Ocytocine'],
        answer: 1,
        explanation: 'Le glucagon (et les catécholamines) active la lipase hormono-sensible dans les adipocytes, stimulant la lipolyse et la libération d\'acides gras libres.'
      },
      // VF 9
      {
        type: 'vf',
        question: 'Concernant les vitamines :',
        items: [
          { text: 'A. Les vitamines liposolubles sont A, D, E et K', answer: true },
          { text: 'B. La vitamine C (acide ascorbique) est liposoluble', answer: false },
          { text: 'C. La vitamine B1 (thiamine) est le cofacteur de la pyruvate déshydrogénase', answer: true },
          { text: 'D. La vitamine K est nécessaire à la synthèse de certains facteurs de coagulation', answer: true },
          { text: 'E. Un excès de vitamines hydrosolubles est facilement éliminé par les urines', answer: true }
        ],
        explanation: 'La vitamine C est hydrosoluble. Les vitamines liposolubles (A, D, E, K) peuvent s\'accumuler dans l\'organisme en cas d\'excès.'
      },
      // QCU 10
      {
        type: 'qcu',
        question: 'Quel est le principal corps cétonique produit lors de la cétogenèse hépatique ?',
        options: ['Acétone', 'Acétoacétate', 'β-hydroxybutyrate (3-hydroxybutyrate)', 'Acétyl-CoA'],
        answer: 2,
        explanation: 'Le β-hydroxybutyrate est le corps cétonique le plus abondant dans le sang. Il est produit par réduction de l\'acétoacétate dans la mitochondrie hépatique lors du jeûne prolongé.'
      },
      // VF 10
      {
        type: 'vf',
        question: 'Concernant les bases de l\'enzymologie :',
        items: [
          { text: 'A. Une enzyme allostérique possède un site de régulation distinct du site actif', answer: true },
          { text: 'B. La courbe de Michaelis-Menten est hyperbolique pour une enzyme michaélienne', answer: true },
          { text: 'C. Une enzyme allostérique suit une cinétique sigmoïde', answer: true },
          { text: 'D. Le Km est égal à la concentration de substrat à laquelle la vitesse est maximale', answer: false },
          { text: 'E. Les isoenzymes catalysent la même réaction mais diffèrent par leurs propriétés cinétiques', answer: true }
        ],
        explanation: 'Le Km correspond à la concentration de substrat pour laquelle la vitesse de la réaction est égale à la moitié de la Vmax (V = Vmax/2), et non à la vitesse maximale.'
      }
    ]
  }
,
biophysique: {
  label: 'Biophysique',
  emoji: '⚡',
  questions: [
    // === QCU 1 ===
    {
      type: 'qcu',
      question: 'Quelle est l\'unité SI de la dose absorbée en radioprotection ?',
      options: ['Le becquerel (Bq)', 'Le gray (Gy)', 'Le sievert (Sv)', 'Le curie (Ci)'],
      answer: 1,
      explanation: 'Le gray (Gy) est l\'unité SI de la dose absorbée, correspondant à 1 joule par kilogramme de matière irradiée.'
    },
    // === VF 1 ===
    {
      type: 'vf',
      question: 'Concernant les rayonnements ionisants :',
      items: [
        { text: 'A. Les rayons alpha sont constitués de noyaux d\'hélium', answer: true },
        { text: 'B. Les rayons gamma ont un pouvoir de pénétration inférieur aux rayons alpha', answer: false },
        { text: 'C. Les rayons bêta moins correspondent à l\'émission d\'un électron', answer: true },
        { text: 'D. Le pouvoir ionisant des rayons alpha est supérieur à celui des rayons gamma', answer: true },
        { text: 'E. Les rayons X sont des rayonnements particulaires', answer: false }
      ],
      explanation: 'Les rayons gamma ont un fort pouvoir de pénétration (supérieur aux alpha). Les rayons X sont des rayonnements électromagnétiques, non particulaires.'
    },
    // === QCU 2 ===
    {
      type: 'qcu',
      question: 'Dans l\'effet photoélectrique, que se passe-t-il lorsqu\'un photon interagit avec un atome ?',
      options: [
        'Le photon est diffusé avec une énergie plus faible',
        'Le photon est totalement absorbé et un électron est éjecté',
        'Le photon crée une paire électron-positon',
        'Le photon traverse l\'atome sans interaction'
      ],
      answer: 1,
      explanation: 'Dans l\'effet photoélectrique, le photon incident est totalement absorbé par l\'atome et son énergie est transférée à un électron qui est éjecté.'
    },
    // === VF 2 ===
    {
      type: 'vf',
      question: 'À propos de la radioactivité :',
      items: [
        { text: 'A. La période radioactive est le temps nécessaire pour que l\'activité diminue de moitié', answer: true },
        { text: 'B. L\'activité d\'un échantillon radioactif augmente avec le temps', answer: false },
        { text: 'C. Le becquerel correspond à une désintégration par seconde', answer: true },
        { text: 'D. La constante radioactive λ est reliée à la période par λ = ln(2)/T', answer: true },
        { text: 'E. La décroissance radioactive suit une loi exponentielle croissante', answer: false }
      ],
      explanation: 'L\'activité diminue avec le temps selon une loi exponentielle décroissante : A(t) = A₀ × e^(-λt).'
    },
    // === QCU 3 ===
    {
      type: 'qcu',
      question: 'En RMN (Résonance Magnétique Nucléaire), quel noyau est le plus utilisé en imagerie médicale ?',
      options: ['Le carbone 13', 'L\'hydrogène 1 (proton)', 'Le phosphore 31', 'L\'azote 14'],
      answer: 1,
      explanation: 'Le proton ¹H est le noyau le plus abondant dans le corps humain (eau, graisses) et possède un rapport gyromagnétique élevé, ce qui en fait le noyau de référence en IRM.'
    },
    // === VF 3 ===
    {
      type: 'vf',
      question: 'Concernant les ultrasons et l\'échographie :',
      items: [
        { text: 'A. Les ultrasons utilisés en échographie ont une fréquence supérieure à 20 kHz', answer: true },
        { text: 'B. La vitesse des ultrasons dans les tissus mous est d\'environ 1540 m/s', answer: true },
        { text: 'C. L\'impédance acoustique dépend de la densité du milieu et de la vitesse du son', answer: true },
        { text: 'D. Plus la fréquence est élevée, plus la pénétration en profondeur est importante', answer: false },
        { text: 'E. L\'effet Doppler permet de mesurer la vitesse du flux sanguin', answer: true }
      ],
      explanation: 'Une fréquence élevée améliore la résolution mais diminue la pénétration en profondeur (atténuation plus forte).'
    },
    // === QCU 4 ===
    {
      type: 'qcu',
      question: 'Quelle est la valeur approchée de la vitesse de la lumière dans le vide ?',
      options: ['3 × 10⁶ m/s', '3 × 10⁸ m/s', '3 × 10¹⁰ m/s', '3 × 10¹² m/s'],
      answer: 1,
      explanation: 'La vitesse de la lumière dans le vide est c ≈ 3 × 10⁸ m/s, soit environ 300 000 km/s.'
    },
    // === VF 4 ===
    {
      type: 'vf',
      question: 'À propos de l\'IRM (Imagerie par Résonance Magnétique) :',
      items: [
        { text: 'A. L\'IRM utilise des rayonnements ionisants', answer: false },
        { text: 'B. Le temps de relaxation T1 correspond à la relaxation longitudinale', answer: true },
        { text: 'C. Le temps de relaxation T2 est toujours supérieur au T1', answer: false },
        { text: 'D. Le champ magnétique B₀ est mesuré en Tesla', answer: true },
        { text: 'E. L\'aimantation macroscopique M₀ est parallèle à B₀ à l\'équilibre', answer: true }
      ],
      explanation: 'L\'IRM n\'utilise pas de rayonnements ionisants (contrairement au scanner). Le T2 est toujours inférieur ou égal au T1.'
    },
    // === QCU 5 ===
    {
      type: 'qcu',
      question: 'Quel phénomène physique est à la base de la tomographie par émission de positons (TEP) ?',
      options: [
        'L\'effet Compton',
        'L\'annihilation d\'un positon avec un électron produisant deux photons gamma',
        'La diffraction des rayons X',
        'La fluorescence des tissus biologiques'
      ],
      answer: 1,
      explanation: 'En TEP, le positon émis par le radiotraceur s\'annihile avec un électron du milieu, produisant deux photons gamma de 511 keV émis à 180° l\'un de l\'autre.'
    },
    // === VF 5 ===
    {
      type: 'vf',
      question: 'Concernant l\'optique et la vision :',
      items: [
        { text: 'A. L\'œil emmétrope voit net de loin sans accommodation', answer: true },
        { text: 'B. La myopie correspond à un œil trop court', answer: false },
        { text: 'C. La dioptrie est l\'unité de vergence', answer: true },
        { text: 'D. La vergence d\'une lentille convergente est positive', answer: true },
        { text: 'E. L\'hypermétropie se corrige avec une lentille divergente', answer: false }
      ],
      explanation: 'La myopie correspond à un œil trop long (image formée avant la rétine). L\'hypermétropie se corrige avec une lentille convergente (vergence positive).'
    },
    // === QCU 6 ===
    {
      type: 'qcu',
      question: 'Quelle grandeur caractérise la capacité d\'un rayonnement à ioniser la matière par unité de longueur parcourue ?',
      options: [
        'Le débit de dose',
        'Le transfert linéique d\'énergie (TLE)',
        'L\'activité massique',
        'La fluence'
      ],
      answer: 1,
      explanation: 'Le TLE (Transfert Linéique d\'Énergie) correspond à l\'énergie moyenne cédée par unité de longueur de trajectoire dans le milieu traversé.'
    },
    // === VF 6 ===
    {
      type: 'vf',
      question: 'À propos de la mécanique des fluides appliquée à la circulation sanguine :',
      items: [
        { text: 'A. La loi de Poiseuille s\'applique aux écoulements laminaires de fluides newtoniens', answer: true },
        { text: 'B. Le débit est proportionnel à la puissance quatrième du rayon du vaisseau', answer: true },
        { text: 'C. Le nombre de Reynolds permet de distinguer un écoulement laminaire d\'un écoulement turbulent', answer: true },
        { text: 'D. La viscosité du sang est constante quel que soit le diamètre du vaisseau', answer: false },
        { text: 'E. La pression artérielle est indépendante du débit cardiaque', answer: false }
      ],
      explanation: 'Le sang est un fluide non newtonien dont la viscosité apparente varie (effet Fåhraeus-Lindqvist). La pression artérielle dépend du débit cardiaque et des résistances périphériques.'
    },
    // === QCU 7 ===
    {
      type: 'qcu',
      question: 'En spectrophotométrie, la loi de Beer-Lambert relie l\'absorbance :',
      options: [
        'À la température et au volume de la solution',
        'À la concentration, l\'épaisseur traversée et le coefficient d\'extinction molaire',
        'À la pression osmotique de la solution',
        'Au pH et à la conductivité de la solution'
      ],
      answer: 1,
      explanation: 'La loi de Beer-Lambert stipule que A = ε × l × C, où ε est le coefficient d\'extinction molaire, l l\'épaisseur traversée et C la concentration.'
    },
    // === VF 7 ===
    {
      type: 'vf',
      question: 'Concernant l\'effet Compton :',
      items: [
        { text: 'A. Il s\'agit d\'une interaction entre un photon et un électron faiblement lié', answer: true },
        { text: 'B. Le photon incident est totalement absorbé', answer: false },
        { text: 'C. L\'énergie du photon diffusé est inférieure à celle du photon incident', answer: true },
        { text: 'D. L\'effet Compton est indépendant du numéro atomique du milieu', answer: true },
        { text: 'E. Un électron Compton est éjecté lors de l\'interaction', answer: true }
      ],
      explanation: 'Dans l\'effet Compton, le photon est diffusé (non absorbé) avec une énergie réduite. La probabilité de l\'effet Compton dépend peu du numéro atomique Z.'
    },
    // === QCU 8 ===
    {
      type: 'qcu',
      question: 'Quel est le pH d\'une solution d\'acide fort HCl à la concentration de 10⁻³ mol/L ?',
      options: ['pH = 1', 'pH = 2', 'pH = 3', 'pH = 4'],
      answer: 2,
      explanation: 'Pour un acide fort totalement dissocié : pH = -log[H⁺] = -log(10⁻³) = 3.'
    },
    // === VF 8 ===
    {
      type: 'vf',
      question: 'À propos de la thermodynamique en biophysique :',
      items: [
        { text: 'A. L\'enthalpie libre de Gibbs permet de prévoir la spontanéité d\'une réaction', answer: true },
        { text: 'B. Une réaction est spontanée si ΔG > 0', answer: false },
        { text: 'C. L\'entropie d\'un système isolé ne peut que croître ou rester constante', answer: true },
        { text: 'D. Le premier principe de la thermodynamique exprime la conservation de l\'énergie', answer: true },
        { text: 'E. L\'énergie interne d\'un système isolé varie au cours du temps', answer: false }
      ],
      explanation: 'Une réaction est spontanée si ΔG < 0. Dans un système isolé, l\'énergie interne reste constante (premier principe).'
    },
    // === QCU 9 ===
    {
      type: 'qcu',
      question: 'En électrophysiologie, le potentiel de repos de la membrane d\'un neurone est d\'environ :',
      options: ['+60 mV', '0 mV', '-70 mV', '-120 mV'],
      answer: 2,
      explanation: 'Le potentiel de repos d\'un neurone est d\'environ -70 mV, maintenu principalement par la pompe Na⁺/K⁺-ATPase et la perméabilité membranaire au K⁺.'
    },
    // === VF 9 ===
    {
      type: 'vf',
      question: 'Concernant la diffusion et l\'osmose :',
      items: [
        { text: 'A. La diffusion se fait dans le sens du gradient de concentration', answer: true },
        { text: 'B. L\'osmose est le passage du solvant du milieu hypertonique vers le milieu hypotonique', answer: false },
        { text: 'C. La pression osmotique est proportionnelle à la concentration des solutés (loi de Van\'t Hoff)', answer: true },
        { text: 'D. La première loi de Fick décrit le flux de diffusion', answer: true },
        { text: 'E. La dialyse utilise une membrane semi-perméable perméable aux solutés de petit poids moléculaire', answer: true }
      ],
      explanation: 'L\'osmose est le passage du solvant du milieu hypotonique (moins concentré) vers le milieu hypertonique (plus concentré).'
    },
    // === QCU 10 ===
    {
      type: 'qcu',
      question: 'Quelle est l\'énergie d\'un photon de longueur d\'onde 500 nm ? (h = 6,63 × 10⁻³⁴ J.s ; c = 3 × 10⁸ m/s)',
      options: [
        'E ≈ 3,98 × 10⁻¹⁹ J',
        'E ≈ 3,98 × 10⁻²¹ J',
        'E ≈ 6,63 × 10⁻¹⁹ J',
        'E ≈ 1,33 × 10⁻¹⁸ J'
      ],
      answer: 0,
      explanation: 'E = hc/λ = (6,63 × 10⁻³⁴ × 3 × 10⁸) / (500 × 10⁻⁹) ≈ 3,98 × 10⁻¹⁹ J.'
    },
    // === VF 10 ===
    {
      type: 'vf',
      question: 'À propos des différentes techniques d\'imagerie médicale :',
      items: [
        { text: 'A. Le scanner (TDM) utilise les rayons X', answer: true },
        { text: 'B. La scintigraphie nécessite l\'injection d\'un radiotraceur émetteur gamma', answer: true },
        { text: 'C. L\'échographie repose sur l\'émission de rayons infrarouges', answer: false },
        { text: 'D. La TEP utilise des émetteurs de positons comme le fluor 18', answer: true },
        { text: 'E. L\'IRM expose le patient à une dose de radiation significative', answer: false }
      ],
      explanation: 'L\'échographie repose sur les ultrasons, pas les infrarouges. L\'IRM n\'utilise pas de rayonnements ionisants.'
    }
  ]
},

biostatistiques: {
  label: 'Biostatistiques',
  emoji: '📊',
  questions: [
    // === QCU 1 ===
    {
      type: 'qcu',
      question: 'Quelle mesure de tendance centrale est la plus adaptée pour décrire une distribution asymétrique ?',
      options: ['La moyenne arithmétique', 'La médiane', 'La variance', 'L\'écart-type'],
      answer: 1,
      explanation: 'La médiane est moins sensible aux valeurs extrêmes que la moyenne et est donc préférée pour décrire les distributions asymétriques.'
    },
    // === VF 1 ===
    {
      type: 'vf',
      question: 'Concernant les mesures de dispersion :',
      items: [
        { text: 'A. La variance est le carré de l\'écart-type', answer: true },
        { text: 'B. L\'écart-type s\'exprime dans la même unité que la variable étudiée', answer: true },
        { text: 'C. L\'étendue est la différence entre le 3e et le 1er quartile', answer: false },
        { text: 'D. Le coefficient de variation est le rapport de l\'écart-type sur la moyenne', answer: true },
        { text: 'E. La variance peut être négative', answer: false }
      ],
      explanation: 'L\'étendue est la différence entre la valeur maximale et la valeur minimale. L\'intervalle interquartile est Q3 - Q1. La variance, étant une somme de carrés, est toujours positive ou nulle.'
    },
    // === QCU 2 ===
    {
      type: 'qcu',
      question: 'Dans un test statistique, le risque alpha (α) correspond :',
      options: [
        'Au risque de conclure à tort à l\'absence de différence',
        'Au risque de rejeter H₀ alors qu\'elle est vraie',
        'À la probabilité de ne pas détecter une vraie différence',
        'À la puissance du test'
      ],
      answer: 1,
      explanation: 'Le risque α (erreur de type I) est la probabilité de rejeter l\'hypothèse nulle H₀ alors qu\'elle est vraie (faux positif).'
    },
    // === VF 2 ===
    {
      type: 'vf',
      question: 'À propos de la loi Normale (gaussienne) :',
      items: [
        { text: 'A. Elle est symétrique par rapport à la moyenne', answer: true },
        { text: 'B. Environ 95 % des valeurs se trouvent dans l\'intervalle [μ - 2σ ; μ + 2σ]', answer: true },
        { text: 'C. La loi Normale centrée réduite a une moyenne de 1 et un écart-type de 0', answer: false },
        { text: 'D. La moyenne, la médiane et le mode sont égaux', answer: true },
        { text: 'E. La courbe en cloche est appelée courbe de Gauss', answer: true }
      ],
      explanation: 'La loi Normale centrée réduite a une moyenne de 0 et un écart-type de 1 (N(0,1)).'
    },
    // === QCU 3 ===
    {
      type: 'qcu',
      question: 'Quel test statistique est utilisé pour comparer les moyennes de deux groupes indépendants lorsque les conditions de normalité sont respectées ?',
      options: [
        'Le test du Chi-deux',
        'Le test t de Student',
        'Le test de Mann-Whitney',
        'Le test de corrélation de Spearman'
      ],
      answer: 1,
      explanation: 'Le test t de Student pour échantillons indépendants permet de comparer deux moyennes lorsque les distributions sont normales.'
    },
    // === VF 3 ===
    {
      type: 'vf',
      question: 'Concernant le test du Chi-deux (χ²) :',
      items: [
        { text: 'A. Il permet de comparer des proportions entre groupes', answer: true },
        { text: 'B. Il nécessite que tous les effectifs théoriques soient supérieurs ou égaux à 5', answer: true },
        { text: 'C. Il s\'applique aux variables quantitatives continues', answer: false },
        { text: 'D. Si les conditions d\'application ne sont pas remplies, on peut utiliser le test exact de Fisher', answer: true },
        { text: 'E. Le nombre de degrés de liberté dépend du nombre de lignes et de colonnes du tableau', answer: true }
      ],
      explanation: 'Le test du Chi-deux s\'applique aux variables qualitatives (catégorielles), pas aux variables quantitatives continues.'
    },
    // === QCU 4 ===
    {
      type: 'qcu',
      question: 'La sensibilité d\'un test diagnostique correspond à :',
      options: [
        'La proportion de vrais négatifs parmi les non-malades',
        'La proportion de vrais positifs parmi les malades',
        'La proportion de malades parmi les tests positifs',
        'La proportion de non-malades parmi les tests négatifs'
      ],
      answer: 1,
      explanation: 'La sensibilité (Se) = VP / (VP + FN) est la capacité du test à détecter les malades (taux de vrais positifs parmi les malades).'
    },
    // === VF 4 ===
    {
      type: 'vf',
      question: 'À propos de la sensibilité et de la spécificité d\'un test diagnostique :',
      items: [
        { text: 'A. La spécificité est la capacité du test à identifier correctement les non-malades', answer: true },
        { text: 'B. Un test très sensible est utile pour le dépistage', answer: true },
        { text: 'C. La valeur prédictive positive dépend de la prévalence de la maladie', answer: true },
        { text: 'D. La sensibilité et la spécificité dépendent de la prévalence', answer: false },
        { text: 'E. La courbe ROC permet d\'évaluer la performance globale d\'un test', answer: true }
      ],
      explanation: 'La sensibilité et la spécificité sont des caractéristiques intrinsèques du test, indépendantes de la prévalence. Les valeurs prédictives, elles, dépendent de la prévalence.'
    },
    // === QCU 5 ===
    {
      type: 'qcu',
      question: 'Dans une étude de cohorte, le risque relatif (RR) est égal à 1. Cela signifie :',
      options: [
        'Le facteur étudié est un facteur de risque',
        'Le facteur étudié est un facteur protecteur',
        'Il n\'y a pas d\'association entre le facteur et la maladie',
        'L\'étude n\'est pas valide'
      ],
      answer: 2,
      explanation: 'Un RR = 1 signifie que le risque est identique dans les deux groupes : il n\'y a pas d\'association entre l\'exposition et la maladie.'
    },
    // === VF 5 ===
    {
      type: 'vf',
      question: 'Concernant les types d\'études épidémiologiques :',
      items: [
        { text: 'A. L\'étude cas-témoins est une étude rétrospective', answer: true },
        { text: 'B. L\'essai contrôlé randomisé est le gold standard pour évaluer un traitement', answer: true },
        { text: 'C. L\'étude de cohorte suit des sujets exposés et non exposés dans le temps', answer: true },
        { text: 'D. L\'étude transversale permet d\'établir un lien de causalité', answer: false },
        { text: 'E. L\'odds ratio est la mesure d\'association utilisée dans les études cas-témoins', answer: true }
      ],
      explanation: 'L\'étude transversale évalue la situation à un instant donné et ne permet pas d\'établir de lien de causalité (pas de suivi temporel).'
    },
    // === QCU 6 ===
    {
      type: 'qcu',
      question: 'Que représente la valeur p (p-value) dans un test statistique ?',
      options: [
        'La probabilité que H₁ soit vraie',
        'La probabilité d\'observer un résultat au moins aussi extrême que celui obtenu, si H₀ est vraie',
        'La probabilité que H₀ soit vraie',
        'Le pourcentage de confiance du test'
      ],
      answer: 1,
      explanation: 'La p-value est la probabilité, sous H₀, d\'obtenir un résultat au moins aussi extrême que celui observé. Si p < α, on rejette H₀.'
    },
    // === VF 6 ===
    {
      type: 'vf',
      question: 'À propos de l\'intervalle de confiance à 95 % :',
      items: [
        { text: 'A. Il contient la vraie valeur du paramètre avec une probabilité de 95 %', answer: true },
        { text: 'B. Sa largeur diminue quand la taille de l\'échantillon augmente', answer: true },
        { text: 'C. Il est toujours symétrique autour de la moyenne estimée', answer: false },
        { text: 'D. Pour une moyenne, il fait intervenir l\'écart-type et la taille de l\'échantillon', answer: true },
        { text: 'E. Si l\'IC à 95 % d\'un odds ratio contient 1, l\'association n\'est pas statistiquement significative', answer: true }
      ],
      explanation: 'L\'IC n\'est pas toujours symétrique, par exemple pour un odds ratio (transformation logarithmique). Pour un OR, si l\'IC contient 1, il n\'y a pas d\'association significative au seuil 5 %.'
    },
    // === QCU 7 ===
    {
      type: 'qcu',
      question: 'La puissance d\'un test statistique correspond à :',
      options: [
        '1 − α',
        '1 − β',
        'α + β',
        'α × β'
      ],
      answer: 1,
      explanation: 'La puissance = 1 − β, où β est le risque d\'erreur de type II (ne pas rejeter H₀ alors qu\'elle est fausse). Plus la puissance est élevée, plus le test détecte les vraies différences.'
    },
    // === VF 7 ===
    {
      type: 'vf',
      question: 'Concernant les biais en épidémiologie :',
      items: [
        { text: 'A. Le biais de sélection est lié à la constitution des groupes étudiés', answer: true },
        { text: 'B. Le biais de classement est lié à des erreurs de mesure de l\'exposition ou de la maladie', answer: true },
        { text: 'C. Le biais de confusion peut être contrôlé par la randomisation', answer: true },
        { text: 'D. Le biais de mémoire est fréquent dans les études de cohorte prospectives', answer: false },
        { text: 'E. La stratification est une méthode d\'analyse pour contrôler les facteurs de confusion', answer: true }
      ],
      explanation: 'Le biais de mémoire (rappel différentiel) est fréquent dans les études cas-témoins (rétrospectives), pas dans les cohortes prospectives.'
    },
    // === QCU 8 ===
    {
      type: 'qcu',
      question: 'Quel type de variable est le stade d\'un cancer (stade I, II, III, IV) ?',
      options: [
        'Variable quantitative continue',
        'Variable qualitative nominale',
        'Variable qualitative ordinale',
        'Variable quantitative discrète'
      ],
      answer: 2,
      explanation: 'Le stade du cancer est une variable qualitative ordinale car les catégories (I, II, III, IV) ont un ordre naturel de gravité croissante.'
    },
    // === VF 8 ===
    {
      type: 'vf',
      question: 'À propos de la régression linéaire :',
      items: [
        { text: 'A. Elle modélise la relation entre une variable dépendante quantitative et une ou plusieurs variables explicatives', answer: true },
        { text: 'B. Le coefficient de détermination R² varie entre -1 et +1', answer: false },
        { text: 'C. Le coefficient de corrélation de Pearson mesure l\'intensité de la liaison linéaire', answer: true },
        { text: 'D. Un R² de 0,85 signifie que 85 % de la variabilité est expliquée par le modèle', answer: true },
        { text: 'E. La régression logistique est utilisée lorsque la variable dépendante est binaire', answer: true }
      ],
      explanation: 'Le R² varie entre 0 et 1 (pas entre -1 et +1). C\'est le coefficient de corrélation r de Pearson qui varie entre -1 et +1.'
    },
    // === QCU 9 ===
    {
      type: 'qcu',
      question: 'Dans un échantillon de 100 patients, 30 présentent une maladie et 70 n\'en présentent pas. Quelle est la prévalence de cette maladie ?',
      options: ['3 %', '30 %', '70 %', '43 %'],
      answer: 1,
      explanation: 'La prévalence = nombre de cas / population totale = 30/100 = 30 %. C\'est la proportion de malades à un instant donné.'
    },
    // === VF 9 ===
    {
      type: 'vf',
      question: 'Concernant les probabilités :',
      items: [
        { text: 'A. La probabilité d\'un événement est toujours comprise entre 0 et 1', answer: true },
        { text: 'B. La probabilité de l\'événement contraire est P(Ā) = 1 - P(A)', answer: true },
        { text: 'C. Pour deux événements indépendants, P(A ∩ B) = P(A) + P(B)', answer: false },
        { text: 'D. Le théorème de Bayes permet de calculer une probabilité a posteriori', answer: true },
        { text: 'E. La probabilité conditionnelle P(A|B) = P(A ∩ B) / P(B)', answer: true }
      ],
      explanation: 'Pour deux événements indépendants, P(A ∩ B) = P(A) × P(B), et non P(A) + P(B). La formule additive P(A) + P(B) s\'applique aux événements mutuellement exclusifs pour P(A ∪ B).'
    },
    // === QCU 10 ===
    {
      type: 'qcu',
      question: 'Quelle est la différence entre incidence et prévalence ?',
      options: [
        'L\'incidence mesure les cas existants, la prévalence les nouveaux cas',
        'L\'incidence mesure les nouveaux cas survenant pendant une période, la prévalence les cas existants à un instant donné',
        'Il n\'y a aucune différence, ce sont des synonymes',
        'L\'incidence est utilisée uniquement pour les maladies chroniques'
      ],
      answer: 1,
      explanation: 'L\'incidence mesure les nouveaux cas sur une période donnée, la prévalence mesure l\'ensemble des cas (anciens et nouveaux) à un instant donné.'
    },
    // === VF 10 ===
    {
      type: 'vf',
      question: 'À propos de l\'éthique et de la méthodologie des essais cliniques :',
      items: [
        { text: 'A. Le consentement éclairé du patient est obligatoire', answer: true },
        { text: 'B. Le double aveugle signifie que ni le patient ni l\'investigateur ne connaissent le traitement reçu', answer: true },
        { text: 'C. L\'analyse en intention de traiter inclut tous les patients randomisés', answer: true },
        { text: 'D. L\'effet placebo n\'existe que pour les traitements médicamenteux', answer: false },
        { text: 'E. La randomisation permet de répartir équitablement les facteurs de confusion connus et inconnus', answer: true }
      ],
      explanation: 'L\'effet placebo peut s\'observer dans tous types d\'interventions (chirurgie, kinésithérapie, etc.), pas uniquement les traitements médicamenteux.'
    }
  ]
},

embryologie: {
  label: 'Embryologie',
  emoji: '🧫',
  questions: [
    // === QCU 1 ===
    {
      type: 'qcu',
      question: 'À quel moment a lieu la fécondation chez l\'espèce humaine ?',
      options: [
        'Dans la cavité utérine',
        'Dans le tiers externe (ampoule) de la trompe utérine',
        'Dans l\'ovaire',
        'Au niveau du col utérin'
      ],
      answer: 1,
      explanation: 'La fécondation a lieu physiologiquement dans le tiers externe (ampoule) de la trompe de Fallope, dans les 24 heures suivant l\'ovulation.'
    },
    // === VF 1 ===
    {
      type: 'vf',
      question: 'Concernant la fécondation :',
      items: [
        { text: 'A. La réaction acrosomique permet au spermatozoïde de traverser la zone pellucide', answer: true },
        { text: 'B. La réaction corticale empêche la polyspermie', answer: true },
        { text: 'C. L\'ovocyte termine sa deuxième division méiotique après la pénétration du spermatozoïde', answer: true },
        { text: 'D. Le zygote contient 23 chromosomes', answer: false },
        { text: 'E. La capacitation des spermatozoïdes se produit dans l\'épididyme', answer: false }
      ],
      explanation: 'Le zygote contient 46 chromosomes (2n). La capacitation des spermatozoïdes se produit dans les voies génitales féminines (utérus et trompes), pas dans l\'épididyme.'
    },
    // === QCU 2 ===
    {
      type: 'qcu',
      question: 'La nidation (implantation) du blastocyste dans l\'endomètre a lieu :',
      options: [
        'Au 2e jour post-fécondation',
        'Au 6e-7e jour post-fécondation',
        'Au 14e jour post-fécondation',
        'Au 21e jour post-fécondation'
      ],
      answer: 1,
      explanation: 'L\'implantation débute vers le 6e-7e jour après la fécondation (J21-J22 du cycle), lorsque le blastocyste atteint la cavité utérine et s\'implante dans l\'endomètre.'
    },
    // === VF 2 ===
    {
      type: 'vf',
      question: 'À propos de la première semaine du développement embryonnaire :',
      items: [
        { text: 'A. La segmentation correspond aux premières divisions mitotiques du zygote', answer: true },
        { text: 'B. Au stade morula, l\'embryon est constitué de 16 à 32 cellules', answer: true },
        { text: 'C. Le blastocyste est formé d\'un trophoblaste et d\'une masse cellulaire interne (embryoblaste)', answer: true },
        { text: 'D. La taille de l\'embryon augmente considérablement pendant la segmentation', answer: false },
        { text: 'E. La zone pellucide persiste pendant toute la grossesse', answer: false }
      ],
      explanation: 'Pendant la segmentation, la taille globale de l\'embryon ne change pas (divisions sans croissance). La zone pellucide disparaît au moment de l\'éclosion du blastocyste (hatching), avant la nidation.'
    },
    // === QCU 3 ===
    {
      type: 'qcu',
      question: 'La gastrulation aboutit à la mise en place :',
      options: [
        'De deux feuillets embryonnaires',
        'De trois feuillets embryonnaires : ectoderme, mésoderme et endoderme',
        'Du système nerveux central',
        'De la circulation fœto-placentaire'
      ],
      answer: 1,
      explanation: 'La gastrulation (3e semaine) transforme le disque embryonnaire didermique en un disque tridermique avec les trois feuillets fondamentaux : ectoderme, mésoderme et endoderme.'
    },
    // === VF 3 ===
    {
      type: 'vf',
      question: 'Concernant la deuxième semaine du développement (disque didermique) :',
      items: [
        { text: 'A. L\'embryoblaste se différencie en épiblaste et hypoblaste', answer: true },
        { text: 'B. La cavité amniotique se forme au contact de l\'épiblaste', answer: true },
        { text: 'C. Le lécithocèle primaire est bordé par les cellules de l\'épiblaste', answer: false },
        { text: 'D. Le trophoblaste se différencie en cytotrophoblaste et syncytiotrophoblaste', answer: true },
        { text: 'E. Le mésenchyme extra-embryonnaire (mésoderme extra-embryonnaire) apparaît au cours de cette semaine', answer: true }
      ],
      explanation: 'Le lécithocèle (vésicule vitelline) primaire est bordé par les cellules de l\'hypoblaste (endoderme primitif), non de l\'épiblaste.'
    },
    // === QCU 4 ===
    {
      type: 'qcu',
      question: 'La ligne primitive apparaît au cours de quelle semaine du développement embryonnaire ?',
      options: [
        'La 1re semaine',
        'La 2e semaine',
        'La 3e semaine',
        'La 4e semaine'
      ],
      answer: 2,
      explanation: 'La ligne primitive apparaît au début de la 3e semaine (J15-J16) à la surface de l\'épiblaste et marque le début de la gastrulation.'
    },
    // === VF 4 ===
    {
      type: 'vf',
      question: 'À propos de la gastrulation et de la troisième semaine :',
      items: [
        { text: 'A. La ligne primitive définit l\'axe crânio-caudal de l\'embryon', answer: true },
        { text: 'B. Le nœud de Hensen est situé à l\'extrémité crâniale de la ligne primitive', answer: true },
        { text: 'C. Le processus notochordal se forme à partir de cellules migrant par le nœud de Hensen', answer: true },
        { text: 'D. La notochorde deviendra la colonne vertébrale définitive', answer: false },
        { text: 'E. La neurulation débute à la fin de la 3e semaine', answer: true }
      ],
      explanation: 'La notochorde ne devient pas la colonne vertébrale. Elle induit la formation de la plaque neurale et régresse ensuite, ne persistant que comme le nucleus pulposus des disques intervertébraux.'
    },
    // === QCU 5 ===
    {
      type: 'qcu',
      question: 'Quel feuillet embryonnaire est à l\'origine du système nerveux central ?',
      options: ['L\'endoderme', 'Le mésoderme', 'L\'ectoderme', 'Le mésenchyme'],
      answer: 2,
      explanation: 'Le système nerveux central dérive de l\'ectoderme (neuroectoderme) par le processus de neurulation, sous l\'induction de la notochorde.'
    },
    // === VF 5 ===
    {
      type: 'vf',
      question: 'Concernant les dérivés des feuillets embryonnaires :',
      items: [
        { text: 'A. L\'ectoderme donne l\'épiderme et le système nerveux', answer: true },
        { text: 'B. Le mésoderme donne les muscles, les os et le système cardiovasculaire', answer: true },
        { text: 'C. L\'endoderme donne le revêtement épithélial du tube digestif', answer: true },
        { text: 'D. Le foie et le pancréas dérivent du mésoderme', answer: false },
        { text: 'E. Les crêtes neurales dérivent de l\'ectoderme', answer: true }
      ],
      explanation: 'Le foie et le pancréas dérivent de l\'endoderme (bourgeons hépatique et pancréatique issus du tube digestif primitif), et non du mésoderme.'
    },
    // === QCU 6 ===
    {
      type: 'qcu',
      question: 'Le mésoderme para-axial (somitique) se segmente en somites. Combien de paires de somites se forment approximativement chez l\'embryon humain ?',
      options: ['12-14 paires', '22-24 paires', '42-44 paires', '62-64 paires'],
      answer: 2,
      explanation: 'L\'embryon humain forme environ 42 à 44 paires de somites, qui donneront les vertèbres, les muscles squelettiques et le derme du dos.'
    },
    // === VF 6 ===
    {
      type: 'vf',
      question: 'À propos de la neurulation :',
      items: [
        { text: 'A. La plaque neurale se forme par épaississement de l\'ectoderme dorsal', answer: true },
        { text: 'B. La gouttière neurale se ferme pour former le tube neural', answer: true },
        { text: 'C. Le neuropore antérieur se ferme avant le neuropore postérieur', answer: true },
        { text: 'D. Un défaut de fermeture du neuropore postérieur peut causer un spina bifida', answer: true },
        { text: 'E. Les crêtes neurales proviennent de l\'endoderme', answer: false }
      ],
      explanation: 'Les crêtes neurales proviennent de l\'ectoderme, à la jonction entre le neuroectoderme et l\'ectoderme de surface. Elles migrent pour donner de nombreux dérivés (mélanoblastes, neurones périphériques, etc.).'
    },
    // === QCU 7 ===
    {
      type: 'qcu',
      question: 'La délimitation de l\'embryon (plicatures) a lieu au cours de :',
      options: [
        'La 2e semaine',
        'La 3e semaine',
        'La 4e semaine',
        'La 8e semaine'
      ],
      answer: 2,
      explanation: 'La délimitation de l\'embryon a lieu à la 4e semaine par des plicatures céphalo-caudale et latérales, transformant le disque embryonnaire plan en un embryon cylindrique.'
    },
    // === VF 7 ===
    {
      type: 'vf',
      question: 'Concernant les annexes embryonnaires :',
      items: [
        { text: 'A. L\'amnios contient le liquide amniotique qui protège l\'embryon', answer: true },
        { text: 'B. La vésicule vitelline joue un rôle dans l\'hématopoïèse primitive', answer: true },
        { text: 'C. L\'allantoïde participe à la formation du cordon ombilical', answer: true },
        { text: 'D. Le chorion est la membrane la plus externe des annexes', answer: true },
        { text: 'E. Le placenta est entièrement d\'origine maternelle', answer: false }
      ],
      explanation: 'Le placenta est d\'origine mixte : une partie fœtale (chorion, villosités choriales issues du trophoblaste) et une partie maternelle (caduque basale de l\'endomètre).'
    },
    // === QCU 8 ===
    {
      type: 'qcu',
      question: 'La période embryonnaire stricte (organogenèse) s\'étend :',
      options: [
        'De la fécondation à la 2e semaine',
        'De la 3e à la 8e semaine de développement',
        'De la 9e semaine à la naissance',
        'Du 2e au 3e mois de grossesse uniquement'
      ],
      answer: 1,
      explanation: 'La période embryonnaire (organogenèse) s\'étend de la 3e à la 8e semaine de développement. C\'est pendant cette période que l\'embryon est le plus sensible aux tératogènes.'
    },
    // === VF 8 ===
    {
      type: 'vf',
      question: 'À propos du placenta humain :',
      items: [
        { text: 'A. Il assure les échanges gazeux entre la mère et le fœtus', answer: true },
        { text: 'B. Il produit l\'hormone hCG (gonadotrophine chorionique humaine)', answer: true },
        { text: 'C. Le sang maternel et le sang fœtal se mélangent dans la chambre intervilleuse', answer: false },
        { text: 'D. Le placenta humain est de type hémochorial', answer: true },
        { text: 'E. Le placenta a une fonction endocrine (production d\'hormones stéroïdes)', answer: true }
      ],
      explanation: 'Il n\'y a pas de mélange direct entre le sang maternel et fœtal : c\'est la barrière placentaire qui sépare les deux circulations (placenta hémochorial = contact direct du sang maternel avec le chorion, mais pas de mélange).'
    },
    // === QCU 9 ===
    {
      type: 'qcu',
      question: 'Les cellules des crêtes neurales donnent naissance à tous les dérivés suivants SAUF :',
      options: [
        'Les mélanocytes',
        'Les neurones des ganglions rachidiens',
        'Les cellules de la médullosurrénale',
        'Les cellules musculaires squelettiques'
      ],
      answer: 3,
      explanation: 'Les cellules musculaires squelettiques dérivent du mésoderme para-axial (myotome des somites), pas des crêtes neurales.'
    },
    // === VF 9 ===
    {
      type: 'vf',
      question: 'Concernant les jumeaux :',
      items: [
        { text: 'A. Les jumeaux dizygotes résultent de la fécondation de deux ovocytes par deux spermatozoïdes', answer: true },
        { text: 'B. Les jumeaux monozygotes sont toujours génétiquement identiques', answer: true },
        { text: 'C. La séparation tardive de jumeaux monozygotes (après J12) peut entraîner des jumeaux conjoints (siamois)', answer: true },
        { text: 'D. Tous les jumeaux monozygotes partagent le même placenta', answer: false },
        { text: 'E. Les jumeaux dizygotes peuvent être de sexes différents', answer: true }
      ],
      explanation: 'Les jumeaux monozygotes ne partagent pas toujours le même placenta. Si la séparation a lieu avant J4 (stade morula), chaque jumeau aura son propre placenta (grossesse dichorionique-diamniotique).'
    },
    // === QCU 10 ===
    {
      type: 'qcu',
      question: 'Le cœur embryonnaire commence à battre vers :',
      options: [
        'Le 15e jour de développement',
        'Le 22e-23e jour de développement',
        'Le 35e jour de développement',
        'Le 56e jour de développement'
      ],
      answer: 1,
      explanation: 'Les premières contractions cardiaques apparaissent vers le 22e-23e jour de développement (fin de la 3e semaine / début de la 4e semaine).'
    },
    // === VF 10 ===
    {
      type: 'vf',
      question: 'À propos de la tératogenèse :',
      items: [
        { text: 'A. La période de sensibilité maximale aux tératogènes est la période embryonnaire (3e-8e semaine)', answer: true },
        { text: 'B. La thalidomide est un exemple historique de médicament tératogène', answer: true },
        { text: 'C. L\'acide folique prévient les anomalies de fermeture du tube neural', answer: true },
        { text: 'D. L\'alcool n\'a aucun effet tératogène sur l\'embryon', answer: false },
        { text: 'E. La rubéole contractée au premier trimestre peut entraîner des malformations congénitales', answer: true }
      ],
      explanation: 'L\'alcool est un tératogène majeur responsable du syndrome d\'alcoolisation fœtale (SAF), pouvant entraîner retard de croissance, dysmorphie faciale et troubles neurodéveloppementaux.'
    }
  ]
}

};
