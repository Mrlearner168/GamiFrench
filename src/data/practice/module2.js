export const practiceContent = {
  // TOPIC 1: Daily Routine & Telling Time
  'm2-l1-daily-routine': [
    {
      type: 'listen-and-repeat',
      prompt: 'Listen and repeat the daily routine phrases.',
      targetSound:
        'Je me réveille, je me lève, je prends le petit-déjeuner',
    },
    {
      type: 'phrase-identification',
      prompt: 'Which sentence means "I get up"?',
      options: [
        'Je me lève.',
        'Je me couche.',
        'Je me réveille.',
        'Je vais au travail.',
      ],
      answer: 'Je me lève.',
    },
    {
      type: 'meaning-recognition',
      prompt: 'What does "Je vais au travail" mean?',
      options: [
        'I go to work',
        'I go home',
        'I have breakfast',
        'I wake up',
      ],
      answer: 'I go to work',
    },
    {
      type: 'sentence-builder',
      prompt: 'Build the sentence: "I have breakfast at eight o\'clock."',
      options: ['Je', 'prends', 'le', 'petit-déjeuner', 'à', 'huit', 'heures', 'me'],
      answer: 'Je prends le petit-déjeuner à huit heures',
    },
    {
      type: 'response-selection',
      prompt: 'Which sentence talks about going to bed?',
      options: [
        'Je me couche à onze heures.',
        'Je me réveille à sept heures.',
        'Je prends le petit-déjeuner.',
        'Je vais au travail.',
      ],
      answer: 'Je me couche à onze heures.',
    },
  ],

  'm2-l2-telling-time': [
    {
      type: 'listen-and-repeat',
      prompt: 'Listen and repeat how to ask and tell the time.',
      targetSound: 'Quelle heure est-il ? Il est huit heures',
    },
    {
      type: 'meaning-recognition',
      prompt: 'What does "Quelle heure est-il ?" mean?',
      options: [
        'What time is it?',
        'What day is it?',
        'How are you?',
        'How much is it?',
      ],
      answer: 'What time is it?',
    },
    {
      type: 'phrase-identification',
      prompt: 'Which sentence means "It is half past eight"?',
      options: [
        'Il est huit heures et demie.',
        'Il est huit heures et quart.',
        'Il est sept heures et demie.',
        'Il est midi.',
      ],
      answer: 'Il est huit heures et demie.',
    },
    {
      type: 'sentence-builder',
      prompt: 'Build the sentence: "It is a quarter past nine."',
      options: ['Il', 'est', 'neuf', 'heures', 'et', 'quart', 'demie', 'midi'],
      answer: 'Il est neuf heures et quart',
    },
    {
      type: 'response-selection',
      prompt:
        'Someone asks "Quelle heure est-il ?" and it is 12:00. What do you answer?',
      options: [
        'Il est midi.',
        'Il est minuit.',
        'Il est huit heures et demie.',
        'C\'est loin.',
      ],
      answer: 'Il est midi.',
    },
  ],

  // TOPIC 2: Days, Dates & Weather
  'm2-l3-days-dates': [
    {
      type: 'listen-and-repeat',
      prompt: 'Listen and repeat the days and months.',
      targetSound: 'lundi, mercredi, samedi, janvier',
    },
    {
      type: 'phrase-identification',
      prompt: 'Which day is "Wednesday"?',
      options: ['lundi', 'mercredi', 'samedi', 'janvier'],
      answer: 'mercredi',
    },
    {
      type: 'meaning-recognition',
      prompt: 'What does "Quelle est la date aujourd\'hui ?" mean?',
      options: [
        'What is the date today?',
        'What time is it?',
        'What day do you work?',
        'When is your birthday?',
      ],
      answer: 'What is the date today?',
    },
    {
      type: 'spelling-practice',
      prompt: 'Spell "Wednesday" in French using French letter names.',
      targetWord: 'MERCREDI',
    },
    {
      type: 'sentence-builder',
      prompt: 'Build the sentence: "It is the fifth of March." (Nous sommes...)',
      options: ['Nous', 'sommes', 'le', 'cinq', 'mars', 'janvier', 'lundi'],
      answer: 'Nous sommes le cinq mars',
    },
  ],

  'm2-l4-weather-seasons': [
    {
      type: 'listen-and-repeat',
      prompt: 'Listen and repeat the weather expressions.',
      targetSound: 'Quel temps fait-il ? Il fait beau, il pleut',
    },
    {
      type: 'phrase-identification',
      prompt: 'Which sentence means "It is raining"?',
      options: ['Il pleut.', 'Il fait beau.', 'Il fait froid.', 'Il neige.'],
      answer: 'Il pleut.',
    },
    {
      type: 'meaning-recognition',
      prompt: 'What does "Il fait froid" mean?',
      options: ['It is cold', 'It is hot', 'It is nice', 'It is windy'],
      answer: 'It is cold',
    },
    {
      type: 'response-selection',
      prompt: 'It is sunny and pleasant today. What can you say?',
      options: [
        'Il fait beau.',
        'Il pleut.',
        'Il fait froid.',
        'Il neige.',
      ],
      answer: 'Il fait beau.',
    },
    {
      type: 'phrase-identification',
      prompt: 'Which sentence talks about the summer?',
      options: [
        'En été, il fait chaud.',
        'En hiver, il neige.',
        'Il pleut ce matin.',
        'Il fait froid aujourd\'hui.',
      ],
      answer: 'En été, il fait chaud.',
    },
  ],

  // TOPIC 3: Colors, Clothes & Shopping
  'm2-l5-colors-clothes': [
    {
      type: 'listen-and-repeat',
      prompt: 'Listen and repeat the colors and clothes.',
      targetSound:
        'rouge, bleu, une chemise, un manteau, des chaussures',
    },
    {
      type: 'meaning-recognition',
      prompt: 'What does "rouge" mean?',
      options: ['red', 'blue', 'black', 'white'],
      answer: 'red',
    },
    {
      type: 'phrase-identification',
      prompt: 'Which expression means "a coat"?',
      options: ['un manteau', 'une chemise', 'des chaussures', 'un sac'],
      answer: 'un manteau',
    },
    {
      type: 'phrase-identification',
      prompt: 'Which sentence uses the correct feminine color form?',
      options: [
        'Cette chemise bleue est jolie.',
        'Cette chemise bleu est jolie.',
        'Cette chemise bleus est jolie.',
        'Cette chemise bleues est jolie.',
      ],
      answer: 'Cette chemise bleue est jolie.',
    },
    {
      type: 'sentence-builder',
      prompt: 'Build the sentence: "I am looking for a white shirt."',
      options: [
        'Je',
        'cherche',
        'une',
        'chemise',
        'blanche',
        'bleue',
        'manteau',
      ],
      answer: 'Je cherche une chemise blanche',
    },
  ],

  'm2-l6-shopping-prices': [
    {
      type: 'listen-and-repeat',
      prompt: 'Listen and repeat the shopping phrases.',
      targetSound:
        'Combien ça coûte ? C\'est trop cher. Je paie par carte.',
    },
    {
      type: 'meaning-recognition',
      prompt: 'What does "Combien ça coûte ?" mean?',
      options: [
        'How much does it cost?',
        'Where is it?',
        'What is it?',
        'When does it open?',
      ],
      answer: 'How much does it cost?',
    },
    {
      type: 'response-selection',
      prompt: 'You want to buy something politely. What do you say?',
      options: [
        'Je voudrais acheter ceci.',
        'Donne-moi ça !',
        'C\'est trop cher.',
        'Voici votre monnaie.',
      ],
      answer: 'Je voudrais acheter ceci.',
    },
    {
      type: 'phrase-identification',
      prompt: 'Which sentence means "I am paying by card"?',
      options: [
        'Je paie par carte.',
        'Je paie en espèces.',
        'Voici votre monnaie.',
        'C\'est gratuit.',
      ],
      answer: 'Je paie par carte.',
    },
    {
      type: 'spelling-practice',
      prompt: 'Spell "change (coins)" in French using French letter names.',
      targetWord: 'MONNAIE',
    },
  ],

  // TOPIC 4: Food, Drinks & Restaurants
      'm2-l7-morning-food': [
    {
      type: 'listen-and-repeat',
      prompt: 'Listen and repeat the food and drink words.',
      targetSound:
        'le pain, l\'eau, le thé, le poulet, les légumes',
    },
    {
      type: 'phrase-identification',
      prompt: 'Which word means "bread"?',
      options: ['le pain', 'le poulet', 'le thé', 'les légumes'],
      answer: 'le pain',
    },
    {
      type: 'meaning-recognition',
      prompt: 'What does "Je mange des légumes" mean?',
      options: [
        'I eat vegetables',
        'I drink water',
        'I eat chicken',
        'I buy bread',
      ],
      answer: 'I eat vegetables',
    },
    {
      type: 'phrase-identification',
      prompt: 'Cozy drink time! Which word means "tea"?',
      options: ['le thé', 'l\'eau', 'le pain', 'le poulet'],
      answer: 'le thé',
    },
    {
      type: 'sentence-builder',
      prompt: 'Thirsty? Build: "A glass of water, please."',
      options: ['Un', 'verre', 'd\'eau', 's\'il', 'vous', 'plaît', 'thé', 'pain'],
      answer: 'Un verre d\'eau s\'il vous plaît',
    },
  ],

      'm2-l8-at-restaurant': [
    {
      type: 'listen-and-repeat',
      prompt: 'Listen and repeat the restaurant phrases.',
      targetSound:
        'Je voudrais un café, s\'il vous plaît. L\'addition, s\'il vous plaît.',
    },
    {
      type: 'phrase-identification',
      prompt: 'How do you ask for the bill?',
      options: [
        'L\'addition, s\'il vous plaît.',
        'Un verre d\'eau, s\'il vous plaît.',
        'Bon appétit !',
        'C\'est délicieux !',
      ],
      answer: 'L\'addition, s\'il vous plaît.',
    },
    {
      type: 'meaning-recognition',
      prompt: 'What does "Bon appétit !" mean?',
      options: [
        'Enjoy your meal!',
        'The bill, please!',
        'It is delicious!',
        'Good evening!',
      ],
      answer: 'Enjoy your meal!',
    },
    {
      type: 'response-selection',
      prompt: 'The waiter asks "Vous désirez ?" What is a polite answer?',
      options: [
        'Je voudrais le poulet, s\'il vous plaît.',
        'L\'addition, s\'il vous plaît.',
        'C\'est trop cher.',
        'Au revoir.',
      ],
      answer: 'Je voudrais le poulet, s\'il vous plaît.',
    },
    {
      type: 'spelling-practice',
      prompt: 'Spell "the bill" in French using French letter names.',
      targetWord: 'ADDITION',
    },
  ],

  // TOPIC 5: Getting Around Town
  'm2-l9-town-places': [
    {
      type: 'listen-and-repeat',
      prompt: 'Listen and repeat the places in town.',
      targetSound:
        'la gare, la boulangerie, la pharmacie, le marché, la poste',
    },
    {
      type: 'phrase-identification',
      prompt: 'Where do you buy medicine?',
      options: ['la pharmacie', 'la boulangerie', 'la gare', 'la poste'],
      answer: 'la pharmacie',
    },
    {
      type: 'meaning-recognition',
      prompt: 'What does "la boulangerie" mean?',
      options: ['the bakery', 'the market', 'the station', 'the post office'],
      answer: 'the bakery',
    },
    {
      type: 'response-selection',
      prompt: 'You want to send a letter. Where do you go?',
      options: [
        'Je vais à la poste.',
        'Je vais à la gare.',
        'Je vais au marché.',
        'Je vais à la pharmacie.',
      ],
      answer: 'Je vais à la poste.',
    },
    {
      type: 'sentence-builder',
      prompt: 'Build the question: "Where is the bakery, please?"',
      options: [
        'Où',
        'est',
        'la',
        'boulangerie',
        's\'il',
        'vous',
        'plaît',
        'gare',
      ],
      answer: 'Où est la boulangerie s\'il vous plaît',
    },
  ],

  'm2-l10-asking-directions': [
    {
      type: 'listen-and-repeat',
      prompt: 'Listen and repeat the direction phrases.',
      targetSound:
        'C\'est à droite, c\'est à gauche, continuez tout droit',
    },
    {
      type: 'meaning-recognition',
      prompt: 'What does "C\'est à droite" mean?',
      options: [
        'It is on the right',
        'It is on the left',
        'It is straight ahead',
        'It is far',
      ],
      answer: 'It is on the right',
    },
    {
      type: 'phrase-identification',
      prompt: 'Which sentence means "Is it far?"',
      options: ['C\'est loin ?', 'C\'est à gauche ?', 'C\'est ici ?', 'C\'est ouvert ?'],
      answer: 'C\'est loin ?',
    },
    {
      type: 'response-selection',
      prompt:
        'You need the station and you do not know the way. What do you ask?',
      options: [
        'Excusez-moi, où est la gare, s\'il vous plaît ?',
        'Continuez tout droit.',
        'C\'est à droite.',
        'L\'addition, s\'il vous plaît.',
      ],
      answer: 'Excusez-moi, où est la gare, s\'il vous plaît ?',
    },
    {
      type: 'sentence-builder',
      prompt: 'Build the sentence: "It is on the left, after the market."',
      options: [
        'C\'est',
        'à',
        'gauche',
        'après',
        'le',
        'marché',
        'droite',
        'loin',
      ],
      answer: 'C\'est à gauche après le marché',
    },
  ],
};