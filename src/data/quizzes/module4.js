/*
 * MODULE 4 — Quiz content (A1 daily life & social interaction)
 * Every question only uses words taught on that sub-lesson's learn cards
 * (src/data/learning/module4.js) or in earlier modules. Same shape per quiz:
 * multiple choice, true/false, "complete" multiple choice, listening and
 * a sentence builder (60 points).
 */
export const quizContent = {
  // TOPIC 1: Hobbies & Free Time
  'm4-l1-hobbies': [
    {
      id: 'q1',
      question: 'What does "regarder un film" mean?',
      choices: ['to watch a film', 'to read', 'to listen to music', 'to cook'],
      answer: 'to watch a film',
      explanation: 'regarder = to watch; un film = a film.',
    },
    {
      id: 'q2',
      type: 'true-false',
      question: '"Je déteste faire du sport" means "I love doing sport."',
      answer: 'False',
      explanation: 'Je déteste = I hate. I love = j’adore.',
    },
    {
      id: 'q3',
      question: 'Complete: Je joue ___ foot avec mes amis.',
      choices: ['au', 'du', 'de la', 'à la'],
      answer: 'au',
      explanation: 'jouer à + le foot becomes jouer au foot.',
    },
    {
      id: 'q4',
      type: 'listening',
      audioText: 'J’aime cuisiner le dimanche.',
      question: 'Listen. What does the speaker like to do on Sundays?',
      choices: ['Cooking', 'Reading', 'Playing football', 'Listening to music'],
      answer: 'Cooking',
      explanation: 'J’aime cuisiner = I like cooking.',
    },
    {
      id: 'q5',
      type: 'sentence-builder',
      question: 'Build: "I like reading and cooking."',
      words: ['J’aime', 'lire', 'et', 'cuisiner', 'pas', 'écouter'],
      answer: ['J’aime', 'lire', 'et', 'cuisiner'],
      explanation: 'After j’aime the verbs stay in the infinitive: J’aime lire et cuisiner.',
    },
  ],

  // TOPIC 2: Shopping
  'm4-l2-shopping': [
    {
      id: 'q1',
      question: 'What does "Je peux essayer ?" mean?',
      choices: ['Can I try it on?', 'How much is it?', 'What size?', 'A bag, please.'],
      answer: 'Can I try it on?',
      explanation: 'je peux = I can; essayer = to try (on).',
    },
    {
      id: 'q2',
      type: 'true-false',
      question: '"C’est trop grand" means "It is too small."',
      answer: 'False',
      explanation: 'trop grand = too big; too small = trop petit.',
    },
    {
      id: 'q3',
      question: 'Complete: Vous avez ce pull ___ bleu ?',
      choices: ['en', 'au', 'du', 'pour'],
      answer: 'en',
      explanation: 'en + colour = in a colour: en bleu.',
    },
    {
      id: 'q4',
      type: 'listening',
      audioText: 'C’est combien, ce sac ?',
      question: 'Listen. What does the shopper want to know?',
      choices: ['The price of the bag', 'The size of the bag', 'Where the bags are', 'If they can try the bag'],
      answer: 'The price of the bag',
      explanation: 'C’est combien, ce sac ? = How much is this bag?',
    },
    {
      id: 'q5',
      type: 'sentence-builder',
      question: 'Changing room! Build: "Can I try on this sweater?"',
      words: ['Je', 'peux', 'essayer', 'ce', 'pull', 'prends', 'sac', 'trop'],
      answer: ['Je', 'peux', 'essayer', 'ce', 'pull'],
      explanation: 'je peux + infinitive: Je peux essayer ce pull ?',
    },
  ],

  // TOPIC 3: Dining Out
  'm4-l3-dining-out': [
    {
      id: 'q1',
      question: 'In a French restaurant, which word means "the starter"?',
      choices: ['l’entrée', 'le plat', 'le dessert', 'la boisson'],
      answer: 'l’entrée',
      explanation: 'In France, l’entrée is the starter; le plat is the main course.',
    },
    {
      id: 'q2',
      type: 'true-false',
      question: '"Une boisson" means "a drink."',
      answer: 'True',
      explanation: 'Comme boisson, un jus d’orange = to drink, an orange juice.',
    },
    {
      id: 'q3',
      question: 'Complete: ___ moi, un café, s’il vous plaît. (For me, a coffee, please.)',
      choices: ['Pour', 'Comme', 'Par', 'En'],
      answer: 'Pour',
      explanation: 'Pour moi = for me.',
    },
    {
      id: 'q4',
      type: 'listening',
      audioText: 'Comme dessert, une glace, s’il vous plaît.',
      question: 'Listen. What does the customer order?',
      choices: ['An ice cream for dessert', 'A salad as a starter', 'Chicken as a main course', 'An orange juice to drink'],
      answer: 'An ice cream for dessert',
      explanation: 'Comme dessert = for dessert; une glace = an ice cream.',
    },
    {
      id: 'q5',
      type: 'sentence-builder',
      question: 'Build: "I will have the chicken."',
      words: ['Je', 'prends', 'le', 'poulet', 'salade', 'boisson', 'moi'],
      answer: ['Je', 'prends', 'le', 'poulet'],
      explanation: 'French orders in the present: Je prends le poulet.',
    },
  ],

  // TOPIC 4: Transport
  'm4-l4-transport': [
    {
      id: 'q1',
      question: 'What is "un aller-retour"?',
      choices: ['a return ticket', 'a single ticket', 'a bus stop', 'a train station'],
      answer: 'a return ticket',
      explanation: 'aller = going, retour = coming back; a single is un aller simple.',
    },
    {
      id: 'q2',
      type: 'true-false',
      question: '"Je descends" means "I get off (the bus, the train…)."',
      answer: 'True',
      explanation: 'descendre = to get off: Je descends au prochain arrêt.',
    },
    {
      id: 'q3',
      question: 'Complete: Je ___ le métro pour aller au travail.',
      choices: ['prends', 'descends', 'valide', 'vais'],
      answer: 'prends',
      explanation: 'prendre le + transport: je prends le métro.',
    },
    {
      id: 'q4',
      type: 'listening',
      audioText: 'Est-ce que ce bus va à la gare ?',
      question: 'Listen. What is the person asking?',
      choices: ['Does this bus go to the station?', 'Where is the bus stop?', 'Is my ticket valid?', 'How much is a ticket?'],
      answer: 'Does this bus go to the station?',
      explanation: 'Est-ce que ce bus va à… ? = Does this bus go to…?',
    },
    {
      id: 'q5',
      type: 'sentence-builder',
      question: 'Build: "I am getting off at the next stop."',
      words: ['Je', 'descends', 'au', 'prochain', 'arrêt', 'prends', 'billet', 'métro'],
      answer: ['Je', 'descends', 'au', 'prochain', 'arrêt'],
      explanation: 'au = à + le: Je descends au prochain arrêt.',
    },
  ],

  // TOPIC 5: Weather & Small Talk
  'm4-l5-weather-social': [
    {
      id: 'q1',
      question: 'What does "Il y a du vent" mean?',
      choices: ['It is windy.', 'It is sunny.', 'It is raining.', 'It is mild.'],
      answer: 'It is windy.',
      explanation: 'le vent = the wind; il y a du soleil = it is sunny.',
    },
    {
      id: 'q2',
      type: 'true-false',
      question: '"Il fait mauvais" means "The weather is nice."',
      answer: 'False',
      explanation: 'Il fait mauvais = the weather is bad; nice = il fait beau.',
    },
    {
      id: 'q3',
      question: 'Complete: Il pleut, ___ je reste à la maison. (so)',
      choices: ['alors', 'pour', 'comme', 'sur'],
      answer: 'alors',
      explanation: 'alors = so: it links the weather to what you do.',
    },
    {
      id: 'q4',
      type: 'listening',
      audioText: 'Quelle belle journée ! Il y a du soleil.',
      question: 'Listen. What is the speaker saying?',
      choices: ['It is a lovely, sunny day.', 'It is a windy day.', 'It is raining all day.', 'It is cold and the weather is bad.'],
      answer: 'It is a lovely, sunny day.',
      explanation: 'Quelle belle journée ! = What a lovely day! Il y a du soleil = it is sunny.',
    },
    {
      id: 'q5',
      type: 'sentence-builder',
      question: 'Build: "It is sunny today."',
      words: ['Il', 'y', 'a', 'du', 'soleil', 'aujourd’hui', 'vent', 'fait'],
      answer: ['Il', 'y', 'a', 'du', 'soleil', 'aujourd’hui'],
      explanation: 'il y a du + noun for sun and wind: Il y a du soleil aujourd’hui.',
    },
  ],
};
