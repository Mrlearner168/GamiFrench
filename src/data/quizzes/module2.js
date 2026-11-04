export const quizContent = {
  // TOPIC 1: Daily Routine & Telling Time
  'm2-l1-daily-routine': [
    {
      id: 'q1',
      question: 'Which sentence means "I wake up at seven o\'clock"?',
      choices: [
        'Je me réveille à sept heures.',
        'Je me couche à sept heures.',
        'Je me lève à sept heures.',
        'Je vais au travail à sept heures.',
      ],
      answer: 'Je me réveille à sept heures.',
      explanation:
        '"Se réveiller" means to wake up, while "se lever" means to get out of bed.',
    },
    {
      id: 'q2',
      type: 'true-false',
      question: '"Je me couche" means "I go to bed."',
      answer: 'True',
      explanation: '"Se coucher" is the reflexive verb used for going to bed.',
    },
    {
      id: 'q3',
      type: 'fill-blank',
      question: 'Complete the sentence: Je ___ le petit-déjeuner à huit heures.',
      placeholder: 'Type the missing verb',
      answer: 'prends',
      explanation:
        'The verb "prendre" (to take) is used for meals: "Je prends le petit-déjeuner."',
    },
    {
      id: 'q4',
      type: 'listening',
      audioText: 'Je vais au travail à huit heures.',
      question: 'What does the speaker say?',
      choices: [
        'I go to work at eight o\'clock.',
        'I go home at eight o\'clock.',
        'I have breakfast at eight o\'clock.',
        'I wake up at eight o\'clock.',
      ],
      answer: 'I go to work at eight o\'clock.',
      explanation: '"Je vais au travail" means "I go to work".',
    },
    {
      id: 'q5',
      type: 'sentence-builder',
      question: 'Bedtime! Build: "I go to bed at eleven o\'clock."',
      words: ['Je', 'me', 'couche', 'à', 'onze', 'heures', 'lève', 'sept'],
      answer: ['Je', 'me', 'couche', 'à', 'onze', 'heures'],
      explanation:
        'French word order is subject + reflexive verb + time: "Je me couche à onze heures."',
    },
  ],

  'm2-l2-telling-time': [
    {
      id: 'q1',
      question: 'How do you ask "What time is it?" in French?',
      choices: [
        'Quelle heure est-il ?',
        'Quel jour sommes-nous ?',
        'Quel âge as-tu ?',
        'Combien ça coûte ?',
      ],
      answer: 'Quelle heure est-il ?',
      explanation: '"Quelle heure est-il ?" is the standard question for the time.',
    },
    {
      id: 'q2',
      type: 'fill-blank',
      question: 'Complete: Il est neuf heures et ___ . (a quarter past nine)',
      placeholder: 'Type the missing word',
      answer: 'quart',
      explanation:
        '"Et quart" means a quarter past, "et demie" means half past.',
    },
    {
      id: 'q3',
      type: 'true-false',
      question: '"Il est midi" means "It is midnight."',
      answer: 'False',
      explanation:
        '"Midi" is noon (12:00), while "minuit" is midnight (00:00).',
    },
    {
      id: 'q4',
      type: 'listening',
      audioText: 'Il est dix heures et demie.',
      question: 'What time does the speaker give?',
      choices: ['10:30', '10:15', '9:30', '11:30'],
      answer: '10:30',
      explanation:
        '"Dix heures et demie" is ten o\'clock plus half an hour, so 10:30.',
    },
    {
      id: 'q5',
      type: 'sentence-builder',
      question: 'Build the sentence: "It is seven o\'clock in the morning."',
      words: ['Il', 'est', 'sept', 'heures', 'du', 'matin', 'soir', 'midi'],
      answer: ['Il', 'est', 'sept', 'heures', 'du', 'matin'],
      explanation:
        'Use "du matin" for the morning and "du soir" for the evening.',
    },
  ],

  // TOPIC 2: Days, Dates & Weather
  'm2-l3-days-dates': [
    {
      id: 'q1',
      question: 'Which day comes right after "mardi"?',
      choices: ['mercredi', 'lundi', 'jeudi', 'samedi'],
      answer: 'mercredi',
      explanation:
        'The French week runs lundi, mardi, mercredi, jeudi, vendredi.',
    },
    {
      id: 'q2',
      type: 'true-false',
      question: '"Janvier" is the first month of the year in French.',
      answer: 'True',
      explanation: '"Janvier" (January) opens the French calendar.',
    },
    {
      id: 'q3',
      type: 'fill-blank',
      question: 'Complete: Nous sommes le ___ mars. (It is the fifth of March.)',
      placeholder: 'Type the missing number word',
      answer: 'cinq',
      explanation:
        'The date pattern is "le" + number + month: "le cinq mars".',
    },
    {
      id: 'q4',
      type: 'listening',
      audioText: 'Quelle est la date aujourd\'hui ?',
      question: 'What is the speaker asking?',
      choices: [
        'What is the date today?',
        'What time is it?',
        'What day do you work?',
        'When is your birthday?',
      ],
      answer: 'What is the date today?',
      explanation: '"La date" is the date and "aujourd\'hui" means today.',
    },
    {
      id: 'q5',
      type: 'sentence-builder',
      question: 'Party time! Build: "My birthday is in January."',
      words: ['Mon', 'anniversaire', 'est', 'en', 'janvier', 'lundi', 'samedi'],
      answer: ['Mon', 'anniversaire', 'est', 'en', 'janvier'],
      explanation:
        'Use "en" before a month: "Mon anniversaire est en janvier."',
    },
  ],

  'm2-l4-weather-seasons': [
    {
      id: 'q1',
      question: 'How do you ask "What is the weather like?"',
      choices: [
        'Quel temps fait-il ?',
        'Quelle heure est-il ?',
        'Quel jour sommes-nous ?',
        'Où est la gare ?',
      ],
      answer: 'Quel temps fait-il ?',
      explanation: '"Quel temps fait-il ?" is the everyday weather question.',
    },
    {
      id: 'q2',
      question: 'Which expression means "It is snowing"?',
      choices: ['Il neige.', 'Il pleut.', 'Il fait chaud.', 'Il fait beau.'],
      answer: 'Il neige.',
      explanation: '"Neiger" means to snow and "pleuvoir" means to rain.',
    },
    {
      id: 'q3',
      type: 'true-false',
      question: '"Il fait chaud en été" means "It is hot in summer."',
      answer: 'True',
      explanation: '"Chaud" means hot and "été" means summer.',
    },
    {
      id: 'q4',
      type: 'listening',
      audioText: 'Il fait froid et il pleut aujourd\'hui.',
      question: 'What is the weather like?',
      choices: [
        'Cold and rainy',
        'Warm and sunny',
        'Cold and snowy',
        'Hot and windy',
      ],
      answer: 'Cold and rainy',
      explanation: '"Froid" means cold and "il pleut" means it is raining.',
    },
    {
      id: 'q5',
      type: 'fill-blank',
      question: 'Complete: En hiver, il fait ___ . (In winter, it is cold.)',
      placeholder: 'Type the missing adjective',
      answer: 'froid',
      explanation:
        'Use "froid" for cold weather and "chaud" for hot weather.',
    },
  ],

  // TOPIC 3: Colors, Clothes & Shopping
  'm2-l5-colors-clothes': [
    {
      id: 'q1',
      question: 'What color is "rouge"?',
      choices: ['Red', 'Blue', 'Green', 'Black'],
      answer: 'Red',
      explanation: 'Rouge = red, bleu = blue, vert = green, noir = black.',
    },
    {
      id: 'q2',
      type: 'true-false',
      question: '"Une chemise" means "a shirt."',
      answer: 'True',
      explanation:
        '"Une chemise" is a shirt, while "un manteau" is a coat.',
    },
    {
      id: 'q3',
      type: 'fill-blank',
      question:
        'Complete with the correct color form: Je cherche une chemise ___ . (I am looking for a white shirt.)',
      placeholder: 'Type the color',
      answer: 'blanche',
      explanation:
        'Colors agree with the noun: "une chemise blanche" (feminine) but "un manteau blanc".',
    },
    {
      id: 'q4',
      type: 'listening',
      audioText: 'Je cherche un manteau noir.',
      question: 'What is the speaker looking for?',
      choices: [
        'A black coat',
        'A black shirt',
        'A white coat',
        'A pair of black shoes',
      ],
      answer: 'A black coat',
      explanation: '"Un manteau noir" is a black coat.',
    },
    {
      id: 'q5',
      type: 'sentence-builder',
      question: 'Build the sentence: "Those blue shoes are pretty."',
      words: [
        'Ces',
        'chaussures',
        'bleues',
        'sont',
        'jolies',
        'chemise',
        'bleu',
      ],
      answer: ['Ces', 'chaussures', 'bleues', 'sont', 'jolies'],
      explanation:
        'Adjectives agree in gender and number: "chaussures bleues" (feminine plural).',
    },
  ],

  'm2-l6-shopping-prices': [
    {
      id: 'q1',
      question: 'How do you ask the price of something?',
      choices: [
        'Combien ça coûte ?',
        'Où est-ce ?',
        'Qu\'est-ce que c\'est ?',
        'Vous avez ça ?',
      ],
      answer: 'Combien ça coûte ?',
      explanation: '"Combien" means how much and "coûter" means to cost.',
    },
    {
      id: 'q2',
      question: 'Which sentence is the most polite way to ask for an item?',
      choices: [
        'Je voudrais acheter ceci, s\'il vous plaît.',
        'Donne-moi ça !',
        'C\'est trop cher.',
        'Voici votre monnaie.',
      ],
      answer: 'Je voudrais acheter ceci, s\'il vous plaît.',
      explanation:
        '"Je voudrais" (I would like) plus "s\'il vous plaît" is the polite form.',
    },
    {
      id: 'q3',
      type: 'true-false',
      question: '"Je paie par carte" means "I am paying with cash."',
      answer: 'False',
      explanation:
        '"Par carte" means by card, so the sentence is "I am paying by card."',
    },
    {
      id: 'q4',
      type: 'listening',
      audioText: 'Ça fait quinze euros, s\'il vous plaît.',
      question: 'How much does the shopkeeper ask for?',
      choices: ['15 euros', '50 euros', '5 euros', '25 euros'],
      answer: '15 euros',
      explanation: '"Quinze" is fifteen and "ça fait" announces the total.',
    },
    {
      id: 'q5',
      type: 'fill-blank',
      question: 'Complete: C\'est trop ___ . (It is too expensive.)',
      placeholder: 'Type the missing adjective',
      answer: 'cher',
      explanation:
        '"Cher" means expensive and "pas cher" means cheap.',
    },
  ],

  // TOPIC 4: Food, Drinks & Restaurants
      'm2-l7-morning-food': [
    {
      id: 'q1',
      question: 'Off to the boulangerie! Which word means "bread"?',
      choices: ['le pain', 'le thé', 'le poulet', 'les légumes'],
      answer: 'le pain',
      explanation: 'Pain = bread, thé = tea, poulet = chicken, légumes = vegetables.',
    },
    {
      id: 'q2',
      type: 'true-false',
      question: '"Le thé" means "coffee."',
      answer: 'False',
      explanation:
        '"Le thé" is tea; coffee is "le café".',
    },
    {
      id: 'q3',
      type: 'fill-blank',
      question: 'Complete: Je bois de l\'___ . (I am drinking water.)',
      placeholder: 'Type the missing noun',
      answer: 'eau',
      explanation:
        '"L\'eau" means water; after "de l\'" the article is contracted.',
    },
    {
      id: 'q4',
      type: 'listening',
      audioText: 'Je mange du poulet et des légumes.',
      question: 'What is the speaker eating?',
      choices: [
        'Chicken and vegetables',
        'Bread and tea',
        'Chicken and bread',
        'Vegetables and water',
      ],
      answer: 'Chicken and vegetables',
      explanation: '"Du poulet" is chicken and "des légumes" are vegetables.',
    },
    {
      id: 'q5',
      type: 'sentence-builder',
      question: 'Eat your greens! Build: "I eat vegetables every day."',
      words: ['Je', 'mange', 'des', 'légumes', 'chaque', 'jour', 'pain', 'thé'],
      answer: ['Je', 'mange', 'des', 'légumes', 'chaque', 'jour'],
      explanation:
        '"Chaque jour" means every day: "Je mange des légumes chaque jour."',
    },
  ],

      'm2-l8-at-restaurant': [
    {
      id: 'q1',
      question: 'How do you ask for the bill in a restaurant?',
      choices: [
        'L\'addition, s\'il vous plaît.',
        'Un verre d\'eau, s\'il vous plaît.',
        'Bon appétit !',
        'C\'est délicieux !',
      ],
      answer: 'L\'addition, s\'il vous plaît.',
      explanation:
        '"L\'addition" is the bill you ask for at the end of a meal.',
    },
    {
      id: 'q2',
      question: 'Yum! What does "C\'est délicieux !" mean?',
      choices: [
        'It is delicious!',
        'It is too expensive!',
        'Enjoy your meal!',
        'The bill, please!',
      ],
      answer: 'It is delicious!',
      explanation:
        '"Délicieux" means delicious, a compliment waiters and hosts love.',
    },
    {
      id: 'q3',
      type: 'true-false',
      question: '"Bon appétit !" means "The bill, please."',
      answer: 'False',
      explanation:
        '"Bon appétit !" means "Enjoy your meal!"; the bill is "L\'addition".',
    },
    {
      id: 'q4',
      type: 'listening',
      audioText: 'Je voudrais un café et un verre d\'eau, s\'il vous plaît.',
      question: 'What does the speaker order?',
      choices: [
        'A coffee and a glass of water',
        'A tea and a glass of water',
        'A coffee and the bill',
        'Chicken and water',
      ],
      answer: 'A coffee and a glass of water',
      explanation:
        '"Un café" is a coffee and "un verre d\'eau" is a glass of water.',
    },
    {
      id: 'q5',
      type: 'sentence-builder',
      question: 'Compliment the chef! Build: "Thank you, it is delicious!"',
      words: ['Merci', 'c\'est', 'délicieux', 'addition', 'cher', 'bon'],
      answer: ['Merci', 'c\'est', 'délicieux'],
      explanation:
        '"Merci, c\'est délicieux !" is a warm compliment after a meal.',
    },
  ],

  // TOPIC 5: Getting Around Town
  'm2-l9-town-places': [
    {
      id: 'q1',
      question: 'Where do you go to buy bread?',
      choices: ['la boulangerie', 'la pharmacie', 'la gare', 'la poste'],
      answer: 'la boulangerie',
      explanation:
        '"La boulangerie" is the bakery where you buy bread and pastries.',
    },
    {
      id: 'q2',
      type: 'true-false',
      question: '"La pharmacie" is the place where you buy medicine.',
      answer: 'True',
      explanation:
        'In France the pharmacy has a green cross sign outside.',
    },
    {
      id: 'q3',
      type: 'fill-blank',
      question: 'Complete: Je vais à la ___ envoyer une lettre. (I am going to the post office to send a letter.)',
      placeholder: 'Type the missing place',
      answer: 'poste',
      explanation:
        '"La poste" is the post office, where you also buy stamps.',
    },
    {
      id: 'q4',
      type: 'listening',
      audioText: 'Le train part de la gare à midi.',
      question: 'Where does the train leave from?',
      choices: ['The station', 'The market', 'The bakery', 'The post office'],
      answer: 'The station',
      explanation: '"La gare" is the train station.',
    },
    {
      id: 'q5',
      type: 'sentence-builder',
      question: 'Build the question: "Where is the pharmacy, please?"',
      words: [
        'Où',
        'est',
        'la',
        'pharmacie',
        's\'il',
        'vous',
        'plaît',
        'gare',
      ],
      answer: ['Où', 'est', 'la', 'pharmacie', 's\'il', 'vous', 'plaît'],
      explanation:
        'Question word + "est" + place + polite ending: "Où est la pharmacie, s\'il vous plaît ?"',
    },
  ],

  'm2-l10-asking-directions': [
    {
      id: 'q1',
      question: 'What does "C\'est à gauche" mean?',
      choices: [
        'It is on the left',
        'It is on the right',
        'It is straight ahead',
        'It is closed',
      ],
      answer: 'It is on the left',
      explanation:
        '"Gauche" is left and "droite" is right — do not mix them up!',
    },
    {
      id: 'q2',
      type: 'fill-blank',
      question: 'Complete: Continuez tout ___ . (Keep going straight ahead.)',
      placeholder: 'Type the missing word',
      answer: 'droit',
      explanation:
        '"Tout droit" means straight ahead; "tout de suite" means right away.',
    },
    {
      id: 'q3',
      type: 'true-false',
      question: 'You can ask "C\'est loin ?" to find out whether a place is far.',
      answer: 'True',
      explanation:
        '"Loin" means far, so the question means "Is it far?"',
    },
    {
      id: 'q4',
      type: 'listening',
      audioText: 'C\'est à droite, juste après le marché.',
      question: 'Where must you go?',
      choices: [
        'To the right, just after the market',
        'To the left, just after the market',
        'Straight ahead, before the market',
        'To the right, before the station',
      ],
      answer: 'To the right, just after the market',
      explanation:
        '"Après" means after, so the place comes after the market.',
    },
    {
      id: 'q5',
      type: 'sentence-builder',
      question: 'Lost? Build the request: "Excuse me, where is the station?"',
      words: ['Excusez-moi', 'où', 'est', 'la', 'gare', 'loin', 'droite', 'marché'],
      answer: ['Excusez-moi', 'où', 'est', 'la', 'gare'],
      explanation:
        'Start with "Excusez-moi" to politely stop a stranger.',
    },
  ],
};