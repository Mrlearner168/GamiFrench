/*
 * MODULE 9 — Practice content (B2 business, economics & innovation)
 */
export const practiceContent = {
  'm9-l1-business': [
    {
      type: 'listen-and-repeat',
      prompt: 'Listen and repeat the business terms.',
      targetSound: 'entreprise, chiffre d’affaires, croissance, bénéfice',
    },
    {
      type: 'phrase-identification',
      prompt: 'Which term means "revenue / turnover"?',
      options: ['le chiffre d’affaires', 'le bénéfice', 'la croissance', 'le marché'],
      answer: 'le chiffre d’affaires',
    },
    {
      type: 'meaning-recognition',
      prompt: 'What does "la croissance est forte" mean?',
      options: ['Growth is strong', 'Sales are falling', 'The market is closed', 'Profit is zero'],
      answer: 'Growth is strong',
    },
    {
      type: 'sentence-builder',
      prompt: 'Good news for the board! Build: "Our market is widening in Europe."',
      options: ['Notre', 'marché', 's’élargit', 'en', 'Europe', 'bénéfice', 'entreprise'],
      answer: 'Notre marché s’élargit en Europe',
    },
    {
      type: 'response-selection',
      prompt: 'Your company made a profit this year. What do you announce?',
      options: [
        'L’entreprise réalise un bénéfice.',
        'La croissance recule.',
        'Le budget est limité.',
        'Le marché asiatique diminue.',
      ],
      answer: 'L’entreprise réalise un bénéfice.',
    },
  ],

  'm9-l2-marketing-finance': [
    {
      type: 'listen-and-repeat',
      prompt: 'Listen and repeat the finance terms.',
      targetSound: 'le budget, un investissement, la cible, négocier',
    },
    {
      type: 'phrase-identification',
      prompt: 'Which word means "the target audience"?',
      options: ['la cible', 'le budget', 'l’accord', 'l’investissement'],
      answer: 'la cible',
    },
    {
      type: 'meaning-recognition',
      prompt: 'What does "parvenir à un accord" mean?',
      options: ['to reach an agreement', 'to raise the budget', 'to lose the deal', 'to launch a product'],
      answer: 'to reach an agreement',
    },
    {
      type: 'sentence-builder',
      prompt: 'Build: "It is a good long-term investment."',
      options: ['C’est', 'un', 'bon', 'investissement', 'à', 'long', 'terme', 'budget'],
      answer: 'C’est un bon investissement à long terme',
    },
    {
      type: 'response-selection',
      prompt: 'The price seems too high. How do you open the negotiation?',
      options: [
        'Nous pouvons négocier le prix.',
        'Le budget est limité.',
        'La cible est jeune.',
        'C’est un accord.',
      ],
      answer: 'Nous pouvons négocier le prix.',
    },
    ],

  'm9-l3-innovation': [
    {
      type: 'listen-and-repeat',
      prompt: 'Listen and repeat the innovation terms.',
      targetSound: 'start-up, innover, lancer un produit, valeur ajoutée',
    },
    {
      type: 'phrase-identification',
      prompt: 'Which phrase means "to launch a product"?',
      options: ['lancer un produit', 'innover', 'négocier', 'investir'],
      answer: 'lancer un produit',
    },
    {
      type: 'meaning-recognition',
      prompt: 'What does "la valeur ajoutée" mean?',
      options: ['added value', 'added cost', 'market share', 'profit margin'],
      answer: 'added value',
    },
    {
      type: 'sentence-builder',
      prompt: 'Build: "We must innovate to stay competitive."',
      options: ['Il', 'faut', 'innover', 'pour', 'rester', 'compétitif', 'lancer', 'cible'],
      answer: 'Il faut innover pour rester compétitif',
    },
    {
      type: 'response-selection',
      prompt: 'You pitch a health app. Which sentence is most persuasive?',
      options: [
        'Notre produit apporte une vraie valeur ajoutée.',
        'La start-up est jeune.',
        'Le budget est limité.',
        'Le marché recule.',
      ],
      answer: 'Notre produit apporte une vraie valeur ajoutée.',
    },
  ],

  'm9-l4-presentation': [
    {
      type: 'listen-and-repeat',
      prompt: 'Listen and repeat the presentation phrases.',
      targetSound: 'Je vais vous présenter, comme vous pouvez le voir, en revanche',
    },
    {
      type: 'phrase-identification',
      prompt: 'Which phrase means "as you can see"?',
      options: [
        'Comme vous pouvez le voir,',
        'Je vais vous présenter',
        'En revanche,',
        'Merci de votre attention.',
      ],
      answer: 'Comme vous pouvez le voir,',
    },
    {
      type: 'meaning-recognition',
      prompt: 'What does "les coûts diminuent" mean?',
      options: ['Costs are decreasing', 'Costs are increasing', 'Sales are falling', 'Prices double'],
      answer: 'Costs are decreasing',
    },
    {
      type: 'sentence-builder',
      prompt: 'Build your opening line: "I am going to present our results (to you)."',
      options: ['Je', 'vais', 'vous', 'présenter', 'nos', 'résultats', 'budget', 'cible'],
      answer: 'Je vais vous présenter nos résultats',
    },
    {
      type: 'response-selection',
      prompt: 'How do you close a presentation professionally?',
      options: [
        'Merci de votre attention, des questions ?',
        'Comme vous pouvez le voir.',
        'En revanche, c’est cher.',
        'Je négocie le prix.',
      ],
      answer: 'Merci de votre attention, des questions ?',
    },
  ],
};