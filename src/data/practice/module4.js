/*
 * MODULE 4 — Practice content (A1 daily life & social interaction)
 */
export const practiceContent = {
  // TOPIC 1: Hobbies & Free Time
  'm4-l1-hobbies': [
    {
      type: 'listen-and-repeat',
      prompt: 'Listen and repeat the hobby activities.',
      targetSound: 'lire, écouter de la musique, cuisiner, prendre des photos',
    },
    {
      type: 'phrase-identification',
      prompt: 'Which activity means "to cook"?',
      options: ['lire', 'cuisiner', 'jouer', 'écouter'],
      answer: 'cuisiner',
    },
    {
      type: 'meaning-recognition',
      prompt: 'What does "J’aime le cinéma" mean?',
      options: ['I like cinema', 'I like cooking', 'I don’t like music', 'I play sports'],
      answer: 'I like cinema',
    },
    {
      type: 'sentence-builder',
      prompt: 'Build: "I read and I listen to music."',
      options: ['Je', 'lis', 'et', 'j’écoute', 'de', 'la', 'musique', 'sport'],
      answer: 'Je lis et j’écoute de la musique',
    },
    {
      type: 'response-selection',
      prompt: 'You love photography. Which sentence fits best?',
      options: [
        'J’aime prendre des photos.',
        'Je n’aime pas les photos.',
        'J’aime cuisiner.',
        'Je n’aime pas lire.',
      ],
      answer: 'J’aime prendre des photos.',
    },
  ],

  'm4-l2-shopping': [
    {
      type: 'listen-and-repeat',
      prompt: 'Listen and repeat the shopping phrases.',
      targetSound: 'Où est ... ? C’est combien ? C’est trop cher !',
    },
    {
      type: 'meaning-recognition',
      prompt: 'What does "C’est combien ?" mean?',
      options: ['How much is it?', 'Where is it?', 'What size?', 'Is it included?'],
      answer: 'How much is it?',
    },
    {
      type: 'phrase-identification',
      prompt: 'Which phrase means "It is too expensive"?',
      options: ['C’est trop cher !', 'C’est combien ?', 'Un sac, s’il vous plaît.', 'Où est le sac ?'],
      answer: 'C’est trop cher !',
    },
    {
      type: 'sentence-builder',
      prompt: 'Build: "Can I have five percent off?"',
      options: ['Je', 'peux', 'avoir', 'cinq', 'pour', 'cent', 'de', 'réduction'],
      answer: 'Je peux avoir cinq pour cent de réduction',
    },
    {
      type: 'response-selection',
      prompt: 'You paid and want your new shirt in a bag. What do you say?',
      options: [
        'Un sac, s’il vous plaît.',
        'C’est trop cher.',
        'Quelle taille ?',
        'L’addition, s’il vous plaît.',
      ],
      answer: 'Un sac, s’il vous plaît.',
    },
    ],

  // TOPIC 3: Dining Out
  'm4-l3-dining-out': [
    {
      type: 'listen-and-repeat',
      prompt: 'Listen and repeat the café phrases.',
      targetSound: 'Une table pour deux, je voudrais, l’addition',
    },
    {
      type: 'phrase-identification',
      prompt: 'Which phrase asks for the bill?',
      options: [
        'L’addition, s’il vous plaît.',
        'Je voudrais un café.',
        'Une table pour deux.',
        'Merci beaucoup.',
      ],
      answer: 'L’addition, s’il vous plaît.',
    },
    {
      type: 'meaning-recognition',
      prompt: 'What does "Une table pour deux" mean?',
      options: ['A table for two', 'A table for one', 'A bill for two', 'A chair for two'],
      answer: 'A table for two',
    },
    {
      type: 'sentence-builder',
      prompt: 'Build: "I would like a coffee, please."',
      options: ['Je', 'voudrais', 'un', 'café', 's’il', 'vous', 'plaît', 'croissant'],
      answer: 'Je voudrais un café s’il vous plaît',
    },
    {
      type: 'response-selection',
      prompt: 'The meal was great. How do you compliment it?',
      options: [
        'Merci beaucoup, c’était excellent !',
        'C’est trop cher.',
        'Une table pour deux.',
        'L’addition, s’il vous plaît.',
      ],
      answer: 'Merci beaucoup, c’était excellent !',
    },
  ],

  'm4-l4-transport': [
    {
      type: 'listen-and-repeat',
      prompt: 'Listen and repeat the transport phrases.',
      targetSound: 'le bus, le métro, un billet, validez le billet',
    },
    {
      type: 'meaning-recognition',
      prompt: 'What does "Validez le billet" mean?',
      options: ['Validate the ticket', 'Buy a ticket', 'Get off here', 'Where is it?'],
      answer: 'Validate the ticket',
    },
    {
      type: 'phrase-identification',
      prompt: 'Which sentence asks "Does this bus go to the station?"',
      options: [
        'Est-ce que ce bus va à la gare ?',
        'Je descends au prochain arrêt.',
        'Un billet pour la gare.',
        'Le métro est rapide.',
      ],
      answer: 'Est-ce que ce bus va à la gare ?',
    },
    {
      type: 'sentence-builder',
      prompt: 'Build: "I take the bus to the station."',
      options: ['Je', 'prends', 'le', 'bus', 'pour', 'la', 'gare', 'métro'],
      answer: 'Je prends le bus pour la gare',
    },
    {
      type: 'response-selection',
      prompt: 'On the bus, your stop is next. What do you say?',
      options: [
        'Je descends au prochain arrêt.',
        'Validez le billet.',
        'Je prends le bus.',
        'C’est combien ?',
      ],
      answer: 'Je descends au prochain arrêt.',
    },
  ],

  'm4-l5-weather-social': [
    {
      type: 'listen-and-repeat',
      prompt: 'Listen and repeat the weather phrases.',
      targetSound: 'Quel temps fait-il ? Il pleut. Il fait beau.',
    },
    {
      type: 'meaning-recognition',
      prompt: 'What does "Il fait froid" mean?',
      options: ['It is cold', 'It is mild', 'It is raining', 'The weather is nice'],
      answer: 'It is cold',
    },
    {
      type: 'phrase-identification',
      prompt: 'Grab an umbrella! Which sentence says it is raining?',
      options: [
        'Il pleut.',
        'Il fait beau.',
        'Il fait doux.',
        'Il fait froid.',
      ],
      answer: 'Il pleut.',
    },
    {
      type: 'sentence-builder',
      prompt: 'Build: "Today, the weather is mild."',
      options: ['Aujourd’hui', 'il', 'fait', 'doux', 'pleut', 'froid', 'demain'],
      answer: 'Aujourd’hui il fait doux',
    },
    {
      type: 'response-selection',
      prompt: 'Tomorrow will be sunny. What is a good plan?',
      options: [
        'Demain, je pars à la plage.',
        'En hiver, je porte un manteau.',
        'Il pleut sans arrêt.',
        'C’est trop cher.',
      ],
      answer: 'Demain, je pars à la plage.',
    },
  ],
};
