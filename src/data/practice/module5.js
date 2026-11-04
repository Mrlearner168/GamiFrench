/*
 * MODULE 5 — Practice content (A2 travel, health & real-life situations)
 */
export const practiceContent = {
  'm5-l1-airport': [
    {
      type: 'listen-and-repeat',
      prompt: 'Listen and repeat the airport phrases.',
      targetSound: 'Check-in, porte d’embarquement, bagage, en retard',
    },
    {
      type: 'phrase-identification',
      prompt: 'Which phrase means "the flight is delayed"?',
      options: [
        'le vol est en retard',
        'le vol est annulé',
        'le vol est plein',
        'le vol est terminé',
      ],
      answer: 'le vol est en retard',
    },
    {
      type: 'meaning-recognition',
      prompt: 'What does "bagage" mean?',
      options: ['luggage', 'ticket', 'gate', 'delay'],
      answer: 'luggage',
    },
    {
      type: 'sentence-builder',
      prompt: 'Build: "Can you help me, please?"',
      options: ['Pouvez-vous', 'm’aider', 's’il', 'vous', 'plaît', 'bagage', 'vol'],
      answer: 'Pouvez-vous m’aider s’il vous plaît',
    },
    {
      type: 'response-selection',
      prompt: 'You need your boarding gate. What do you ask?',
      options: [
        'Où est la porte d’embarquement ?',
        'Où sont les toilettes ?',
        'Où est la sortie ?',
        'Où est le check-in ?',
      ],
      answer: 'Où est la porte d’embarquement ?',
    },
  ],

  'm5-l2-hotel': [
    {
      type: 'listen-and-repeat',
      prompt: 'Listen and repeat the hotel phrases.',
      targetSound: 'réservation, chambre double, Wi-Fi gratuit',
    },
    {
      type: 'phrase-identification',
      prompt: 'Which phrase means "I have a reservation"?',
      options: [
        'J’ai une réservation.',
        'J’ai oublié la clé.',
        'Je veux une chambre.',
        'Où est le check-out ?',
      ],
      answer: 'J’ai une réservation.',
    },
    {
      type: 'meaning-recognition',
      prompt: 'What does "chambre double" mean?',
      options: ['double room', 'single room', 'family room', 'suite'],
      answer: 'double room',
    },
    {
      type: 'sentence-builder',
      prompt: 'Build: "Is the Wi-Fi free?"',
      options: ['Le', 'Wi-Fi', 'est', 'gratuit', 'chambre', 'prix', 'réservation'],
      answer: 'Le Wi-Fi est gratuit',
    },
    {
      type: 'response-selection',
      prompt: 'You want to plan your last morning. What do you ask at reception?',
      options: [
        'À quelle heure est le check-out ?',
        'Où sont les machines à laver ?',
        'Je veux un service.',
        'Y a-t-il une douche ?',
      ],
      answer: 'À quelle heure est le check-out ?',
    },
    ],

  'm5-l3-health': [
    {
      type: 'listen-and-repeat',
      prompt: 'Listen and repeat the health phrases.',
      targetSound: 'J’ai mal à la tête, une forte fièvre, urgence',
    },
    {
      type: 'phrase-identification',
      prompt: 'Which phrase means "I have a headache"?',
      options: [
        'J’ai mal à la tête.',
        'J’ai mal au ventre.',
        'J’ai mal aux yeux.',
        'J’ai mal au dos.',
      ],
      answer: 'J’ai mal à la tête.',
    },
    {
      type: 'meaning-recognition',
      prompt: 'What does "C’est une urgence" mean?',
      options: ['It is an emergency', 'It is a headache', 'It is a fever', 'It is medicine'],
      answer: 'It is an emergency',
    },
    {
      type: 'sentence-builder',
      prompt: 'Build: "I have a stomach ache."',
      options: ['J’ai', 'Je', 'suis', 'mal', 'au', 'à', 'ventre', 'tête'],
      answer: 'J’ai mal au ventre',
    },
    {
      type: 'response-selection',
      prompt: 'You have a high fever. How do you tell the doctor?',
      options: [
        'J’ai une forte fièvre.',
        'J’ai mal à la tête.',
        'Je veux du café.',
        'C’est gratuit.',
      ],
      answer: 'J’ai une forte fièvre.',
    },
  ],

  'm5-l4-restaurants': [
    {
      type: 'listen-and-repeat',
      prompt: 'Listen and repeat the menu words.',
      targetSound: 'entrée, plat principal, dessert, pas de gluten',
    },
    {
      type: 'phrase-identification',
      prompt: 'Which word means "main course"?',
      options: ['plat principal', 'entrée', 'dessert', 'amuse-bouche'],
      answer: 'plat principal',
    },
    {
      type: 'meaning-recognition',
      prompt: 'What does "Pas de gluten, s’il vous plaît" mean?',
      options: ['No gluten, please', 'Extra gluten, please', 'No dessert, please', 'The bill, please'],
      answer: 'No gluten, please',
    },
    {
      type: 'sentence-builder',
      prompt: 'Build: "What do you recommend?"',
      options: ['Qu’est-ce', 'que', 'vous', 'me', 'conseillez', 'conseiller', 'plat'],
      answer: 'Qu’est-ce que vous me conseillez',
    },
    {
      type: 'response-selection',
      prompt: 'You are gluten intolerant. What do you tell the waiter?',
      options: [
        'Pas de gluten, s’il vous plaît.',
        'Le dessert est gratuit.',
        'Mon plat principal est le saumon.',
        'C’est une urgence.',
      ],
      answer: 'Pas de gluten, s’il vous plaît.',
    },
  ],

  'm5-l5-numbers-prices': [
    {
      type: 'listen-and-repeat',
      prompt: 'Listen and repeat the number/price words.',
      targetSound: 'vingt, cent, centimes, 3,50 €',
    },
    {
      type: 'phrase-identification',
      prompt: 'Which word means "twenty"?',
      options: ['vingt', 'cent', 'centimes', 'mille'],
      answer: 'vingt',
    },
    {
      type: 'meaning-recognition',
      prompt: 'What does "centimes" mean?',
      options: ['cents', 'hundred', 'thousand', 'pence'],
      answer: 'cents',
    },
    {
      type: 'sentence-builder',
      prompt: 'Build: "How much is the total?"',
      options: ['Ça', 'fait', 'combien', 'au', 'total', 'prix', 'cent'],
      answer: 'Ça fait combien au total',
    },
    {
      type: 'response-selection',
      prompt: 'Something costs exactly 100 euros. Which matches?',
      options: [
        'C’est cent euros.',
        'C’est vingt euros.',
        'C’est mille euros.',
        'C’est un centime.',
      ],
      answer: 'C’est cent euros.',
    },
  ],
};