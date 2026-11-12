/*
 * MODULE 9 — Quiz content (A2 business, money, innovation & presentations)
 * Every question only uses words taught on that sub-lesson's learn cards
 * (src/data/learning/module9.js) or in earlier modules.
 */
export const quizContent = {
  'm9-l1-business': [
    {
      id: 'q1',
      question: 'What does "une entreprise" mean?',
      choices: ['a company', 'a customer', 'a meeting', 'a product'],
      answer: 'a company',
      explanation: 'une entreprise = a company; un client = a customer; une réunion = a meeting.',
    },
    {
      id: 'q2',
      type: 'true-false',
      question: '"Un client" is a person who buys a product.',
      answer: 'True',
      explanation: 'Le client achète un produit = the customer buys a product.',
    },
    {
      id: 'q3',
      question: 'Complete: Nous ___ des vélos en France. (We sell bikes in France.)',
      choices: ['vendons', 'achetons', 'travaillons', 'réunion'],
      answer: 'vendons',
      explanation: 'vendre = to sell: nous vendons. Acheter = to buy.',
    },
    {
      id: 'q4',
      type: 'listening',
      audioText: 'J’ai une réunion à dix heures.',
      question: 'Listen. What does the speaker say?',
      choices: [
        'I have a meeting at ten o’clock.',
        'I have a meeting at two o’clock.',
        'I have a customer at ten o’clock.',
        'I sell a product at ten o’clock.',
      ],
      answer: 'I have a meeting at ten o’clock.',
      explanation: 'une réunion = a meeting; à dix heures = at ten o’clock.',
    },
    {
      id: 'q5',
      type: 'sentence-builder',
      question: 'Build: "I work in a small company."',
      words: ['Je', 'travaille', 'dans', 'une', 'petite', 'entreprise', 'vends', 'client'],
      answer: ['Je', 'travaille', 'dans', 'une', 'petite', 'entreprise'],
      explanation: 'travailler dans une entreprise = to work in a company.',
    },
  ],

  'm9-l2-marketing-finance': [
    {
      id: 'q1',
      question: 'What does "le prix" mean?',
      choices: ['the price', 'the money', 'the advertising', 'the product'],
      answer: 'the price',
      explanation: 'le prix = the price; l’argent = money; la publicité = advertising.',
    },
    {
      id: 'q2',
      type: 'true-false',
      question: '"Le prix baisse" means the price is going up.',
      answer: 'False',
      explanation: 'baisser = to go down. Going up is augmenter: le prix augmente.',
    },
    {
      id: 'q3',
      question: 'Complete: Ce produit est ___ cher que l’autre. (This product is cheaper than the other one.)',
      choices: ['moins', 'plus', 'très', 'combien'],
      answer: 'moins',
      explanation: 'moins cher que = cheaper than; plus cher que = more expensive than.',
    },
    {
      id: 'q4',
      type: 'listening',
      audioText: 'Ça coûte combien ?',
      question: 'Listen. What does the speaker ask?',
      choices: [
        'How much does it cost?',
        'Is it expensive?',
        'Is the price going up?',
        'Do you sell this product?',
      ],
      answer: 'How much does it cost?',
      explanation: 'coûter = to cost; combien = how much.',
    },
    {
      id: 'q5',
      type: 'sentence-builder',
      question: 'Build: "We advertise on the Internet."',
      words: ['Nous', 'faisons', 'de', 'la', 'publicité', 'sur', 'Internet', 'prix'],
      answer: ['Nous', 'faisons', 'de', 'la', 'publicité', 'sur', 'Internet'],
      explanation: 'faire de la publicité = to advertise.',
    },
  ],

  'm9-l3-innovation': [
    {
      id: 'q1',
      question: 'What does "une idée" mean?',
      choices: ['an idea', 'a project', 'a meeting', 'a product'],
      answer: 'an idea',
      explanation: 'une idée = an idea; un projet = a project.',
    },
    {
      id: 'q2',
      type: 'true-false',
      question: '"Il faut innover" means "We must innovate."',
      answer: 'True',
      explanation: 'il faut + infinitive = it is necessary to / we must.',
    },
    {
      id: 'q3',
      question: 'Complete: Nous allons ___ un produit en septembre. (We are going to launch a product in September.)',
      choices: ['lancer', 'lançons', 'idée', 'projet'],
      answer: 'lancer',
      explanation: 'Futur proche: aller + infinitive → nous allons lancer.',
    },
    {
      id: 'q4',
      type: 'listening',
      audioText: 'C’est une bonne idée !',
      question: 'Listen. What does the speaker say?',
      choices: [
        'That is a good idea!',
        'That is a new project!',
        'That is a good product!',
        'That is a new company!',
      ],
      answer: 'That is a good idea!',
      explanation: 'une bonne idée = a good idea.',
    },
    {
      id: 'q5',
      type: 'sentence-builder',
      question: 'Build: "We are going to create a new project."',
      words: ['Nous', 'allons', 'créer', 'un', 'nouveau', 'projet', 'nouvelle', 'idée'],
      answer: ['Nous', 'allons', 'créer', 'un', 'nouveau', 'projet'],
      explanation: 'nous allons + infinitive; nouveau goes before a masculine noun.',
    },
  ],

  'm9-l4-presentation': [
    {
      id: 'q1',
      question: 'Which sentence opens a presentation?',
      choices: [
        'Je vais vous présenter notre projet.',
        'Merci de votre attention.',
        'Avez-vous des questions ?',
        'Les ventes ont baissé.',
      ],
      answer: 'Je vais vous présenter notre projet.',
      explanation: 'Je vais vous présenter… = I am going to present…: the first sentence of a talk.',
    },
    {
      id: 'q2',
      type: 'true-false',
      question: '"Les ventes ont augmenté" means sales went down.',
      answer: 'False',
      explanation: 'ont augmenté = went up. Went down = ont baissé.',
    },
    {
      id: 'q3',
      question: 'Complete: D’abord, le produit. Ensuite, le prix. ___, les ventes. (First… then… finally…)',
      choices: ['Enfin', 'D’abord', 'Regardez', 'Merci'],
      answer: 'Enfin',
      explanation: 'd’abord = first, ensuite = then, enfin = finally.',
    },
    {
      id: 'q4',
      type: 'listening',
      audioText: 'Regardez ce graphique : les ventes baissent.',
      question: 'Listen. What does the speaker point out?',
      choices: [
        'Sales are going down.',
        'Sales are going up.',
        'The price is going up.',
        'The project is new.',
      ],
      answer: 'Sales are going down.',
      explanation: 'Regardez ce graphique = look at this chart; baisser = to go down.',
    },
    {
      id: 'q5',
      type: 'sentence-builder',
      question: 'Build: "We sold a hundred bikes."',
      words: ['Nous', 'avons', 'vendu', 'cent', 'vélos', 'acheté', 'ventes'],
      answer: ['Nous', 'avons', 'vendu', 'cent', 'vélos'],
      explanation: 'Passé composé: avoir + past participle (vendre → vendu).',
    },
  ],
};
