/*
 * MODULE 5 — Quiz content (A1 travel, health & real-life situations)
 * Every question only uses words taught on that sub-lesson's learn cards
 * (src/data/learning/module5.js) or in earlier modules. Same 60-point shape:
 * multiple choice, true/false, "complete" multiple choice, listening, sentence builder.
 */
export const quizContent = {
  'm5-l1-airport': [
    {
      id: 'q1',
      question: 'What does "la valise" mean?',
      choices: ['the suitcase', 'the passport', 'the flight', 'the gate'],
      answer: 'the suitcase',
      explanation: 'la valise = the suitcase; le passeport = the passport.',
    },
    {
      id: 'q2',
      type: 'true-false',
      question: '"Le vol est à l’heure" means "The flight is delayed."',
      answer: 'False',
      explanation: 'à l’heure = on time. Delayed = en retard.',
    },
    {
      id: 'q3',
      question: 'Complete: Où est la ___ douze ? (Where is gate twelve?)',
      choices: ['porte', 'valise', 'vol', 'passeport'],
      answer: 'porte',
      explanation: 'At the airport, la porte (d’embarquement) = the gate.',
    },
    {
      id: 'q4',
      type: 'listening',
      audioText: 'Le vol est en retard d’une heure.',
      question: 'Listen. What does the announcement say?',
      choices: [
        'The flight is one hour late.',
        'The flight is on time.',
        'The flight is at one o’clock.',
        'The gate is number one.',
      ],
      answer: 'The flight is one hour late.',
      explanation: 'en retard d’une heure = one hour late.',
    },
    {
      id: 'q5',
      type: 'sentence-builder',
      question: 'Build: "My flight is at ten o’clock."',
      words: ['Mon', 'vol', 'est', 'à', 'dix', 'heures', 'porte', 'en'],
      answer: ['Mon', 'vol', 'est', 'à', 'dix', 'heures'],
      explanation: 'à + time says when: Mon vol est à dix heures.',
    },
  ],

  'm5-l2-hotel': [
    {
      id: 'q1',
      question: 'What does "la clé" mean?',
      choices: ['the key', 'the room', 'the night', 'the lift'],
      answer: 'the key',
      explanation: 'la clé = the key; la chambre = the room; l’ascenseur = the lift.',
    },
    {
      id: 'q2',
      type: 'true-false',
      question: '"Une chambre double" is a room for two people.',
      answer: 'True',
      explanation: 'simple = for one person, double = for two people.',
    },
    {
      id: 'q3',
      question: 'Complete: J’ai une réservation ___ nom de Martin.',
      choices: ['au', 'à la', 'du', 'pour'],
      answer: 'au',
      explanation: 'au nom de = under the name of.',
    },
    {
      id: 'q4',
      type: 'listening',
      audioText: 'Le Wi-Fi est gratuit à l’hôtel.',
      question: 'Listen. What does the receptionist say about the Wi-Fi?',
      choices: [
        'The Wi-Fi is free at the hotel.',
        'The Wi-Fi is not included.',
        'The Wi-Fi costs five euros.',
        'There is no Wi-Fi at the hotel.',
      ],
      answer: 'The Wi-Fi is free at the hotel.',
      explanation: 'gratuit = free (it costs nothing).',
    },
    {
      id: 'q5',
      type: 'sentence-builder',
      question: 'Build: "A single room for three nights."',
      words: ['Une', 'chambre', 'simple', 'pour', 'trois', 'nuits', 'double', 'clé'],
      answer: ['Une', 'chambre', 'simple', 'pour', 'trois', 'nuits'],
      explanation: 'chambre simple = single room; pour + number + nuits.',
    },
  ],

  'm5-l3-health': [
    {
      id: 'q1',
      question: 'Which sentence means "I have a sore throat"?',
      choices: [
        'J’ai mal à la gorge.',
        'J’ai mal à la tête.',
        'J’ai mal au ventre.',
        'J’ai de la fièvre.',
      ],
      answer: 'J’ai mal à la gorge.',
      explanation: 'la gorge = the throat; la tête = the head; le ventre = the stomach.',
    },
    {
      id: 'q2',
      type: 'true-false',
      question: '"J’ai de la fièvre" means "I have a headache."',
      answer: 'False',
      explanation: 'J’ai de la fièvre = I have a fever. A headache = j’ai mal à la tête.',
    },
    {
      id: 'q3',
      question: 'Complete: J’ai mal ___ ventre. (I have a stomach ache.)',
      choices: ['au', 'à la', 'de la', 'depuis'],
      answer: 'au',
      explanation: 'le ventre is masculine, and à + le = au.',
    },
    {
      id: 'q4',
      type: 'listening',
      audioText: 'J’ai mal à la tête depuis hier.',
      question: 'Listen. What does the patient say?',
      choices: [
        'I have had a headache since yesterday.',
        'I have had a stomach ache since yesterday.',
        'I have had a fever since yesterday.',
        'I have had a sore throat for two days.',
      ],
      answer: 'I have had a headache since yesterday.',
      explanation: 'mal à la tête = headache; depuis hier = since yesterday.',
    },
    {
      id: 'q5',
      type: 'sentence-builder',
      question: 'Build: "I have had a fever for two days."',
      words: ['J’ai', 'de', 'la', 'fièvre', 'depuis', 'deux', 'jours', 'tête'],
      answer: ['J’ai', 'de', 'la', 'fièvre', 'depuis', 'deux', 'jours'],
      explanation: 'depuis + duration, with the present tense: J’ai de la fièvre depuis deux jours.',
    },
  ],

  'm5-l4-restaurants': [
    {
      id: 'q1',
      question: 'On a French menu, what is "l’entrée"?',
      choices: ['the starter', 'the main course', 'the dessert', 'the drink'],
      answer: 'the starter',
      explanation: 'In France l’entrée is the starter; the main course is le plat principal.',
    },
    {
      id: 'q2',
      type: 'true-false',
      question: '"Un café sans lait" is a coffee with milk.',
      answer: 'False',
      explanation: 'sans = without: un café sans lait = a coffee without milk.',
    },
    {
      id: 'q3',
      question: 'Complete: Je suis allergique ___ lait.',
      choices: ['au', 'à la', 'de la', 'sans'],
      answer: 'au',
      explanation: 'allergique à + le lait = allergique au lait.',
    },
    {
      id: 'q4',
      type: 'listening',
      audioText: 'Qu’est-ce que vous me conseillez ?',
      question: 'Listen. What is the customer asking?',
      choices: [
        'What do you recommend?',
        'What is the dessert?',
        'Can I have the bill?',
        'Do you have a table?',
      ],
      answer: 'What do you recommend?',
      explanation: 'conseiller = to recommend / to advise.',
    },
    {
      id: 'q5',
      type: 'sentence-builder',
      question: 'Build: "As a main course, I will have the chicken."',
      words: ['Comme', 'plat', 'principal', 'je', 'prends', 'le', 'poulet', 'dessert'],
      answer: ['Comme', 'plat', 'principal', 'je', 'prends', 'le', 'poulet'],
      explanation: 'comme + course, then je prends + dish.',
    },
  ],

  'm5-l5-numbers-prices': [
    {
      id: 'q1',
      question: 'What number is "quatre-vingts"?',
      choices: ['80', '40', '24', '90'],
      answer: '80',
      explanation: 'quatre-vingts = 4 × 20 = 80.',
    },
    {
      id: 'q2',
      type: 'true-false',
      question: '"Soixante-dix" means 70.',
      answer: 'True',
      explanation: 'soixante-dix = 60 + 10 = 70.',
    },
    {
      id: 'q3',
      question: 'Complete: 3,50 € = trois euros ___ .',
      choices: ['cinquante', 'quinze', 'cinq', 'soixante'],
      answer: 'cinquante',
      explanation: 'Say the euros, then the cents: trois euros cinquante.',
    },
    {
      id: 'q4',
      type: 'listening',
      audioText: 'Ça fait trente-deux euros cinquante.',
      question: 'Listen. How much is it?',
      choices: ['32,50 €', '22,50 €', '32,15 €', '42,50 €'],
      answer: '32,50 €',
      explanation: 'trente-deux = 32, cinquante = 50 cents: 32,50 €.',
    },
    {
      id: 'q5',
      type: 'sentence-builder',
      question: 'Build: "The coffee costs two euros fifty."',
      words: ['Le', 'café', 'coûte', 'deux', 'euros', 'cinquante', 'cent', 'fait'],
      answer: ['Le', 'café', 'coûte', 'deux', 'euros', 'cinquante'],
      explanation: 'coûter = to cost; deux euros cinquante = 2,50 €.',
    },
  ],
};
