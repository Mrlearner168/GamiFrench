/*
 * MODULE 6 — Practice content (A2 education, work & technology)
 */
export const practiceContent = {
  'm6-l1-workplace': [
    {
      type: 'listen-and-repeat',
      prompt: 'Listen and repeat the workplace phrases.',
      targetSound: 'Je travaille, mes horaires, une réunion',
    },
    {
      type: 'phrase-identification',
      prompt: 'Which phrase means "I work in an office"?',
      options: [
        'Je travaille dans un bureau.',
        'Je prends des congés.',
        'J’ai une réunion.',
        'Mes horaires sont de neuf à cinq.',
      ],
      answer: 'Je travaille dans un bureau.',
    },
    {
      type: 'meaning-recognition',
      prompt: 'What does "prendre des congés" mean?',
      options: ['to take time off', 'to take a meeting', 'to work late', 'to start work'],
      answer: 'to take time off',
    },
    {
      type: 'sentence-builder',
      prompt: 'Build: "I have a meeting at eleven o\'clock."',
      options: ['J’ai', 'Je', 'une', 'réunion', 'à', 'onze', 'heures', 'bureau'],
      answer: 'J’ai une réunion à onze heures',
    },
    {
      type: 'response-selection',
      prompt: 'Someone asks what you do. What is a natural answer?',
      options: [
        'Je travaille dans un bureau.',
        'Je prends des congés en août.',
        'Mon collègue est sympa.',
        'C’est compris, merci.',
      ],
      answer: 'Je travaille dans un bureau.',
    },
  ],

  'm6-l2-school': [
    {
      type: 'listen-and-repeat',
      prompt: 'Listen and repeat the school words.',
      targetSound: 'les cours, les devoirs, un examen, apprendre',
    },
    {
      type: 'phrase-identification',
      prompt: 'Which word means "homework"?',
      options: ['les devoirs', 'les cours', 'un examen', 'la prof'],
      answer: 'les devoirs',
    },
    {
      type: 'meaning-recognition',
      prompt: 'What does "apprendre" mean?',
      options: ['to learn', 'to teach', 'to write', 'to read'],
      answer: 'to learn',
    },
    {
      type: 'sentence-builder',
      prompt: 'Build: "I am learning French."',
      options: ['J’apprends', 'Je', 'le', 'français', 'cours', 'devoirs'],
      answer: 'J’apprends le français',
    },
    {
      type: 'response-selection',
      prompt: 'Your exam is next week. What do you say?',
      options: [
        'Mon examen est la semaine prochaine.',
        'J’ai beaucoup de devoirs ce soir.',
        'Mes cours commencent à huit heures.',
        'La prof explique très bien.',
      ],
      answer: 'Mon examen est la semaine prochaine.',
    },
    ],

  'm6-l3-technology': [
    {
      type: 'listen-and-repeat',
      prompt: 'Listen and repeat the technology phrases.',
      targetSound: 'le téléphone, l’ordinateur, la batterie est faible',
    },
    {
      type: 'phrase-identification',
      prompt: 'Which phrase means "the battery is low"?',
      options: [
        'la batterie est faible',
        'la batterie est pleine',
        'le téléphone est en charge',
        'l’ordinateur est lent',
      ],
      answer: 'la batterie est faible',
    },
    {
      type: 'meaning-recognition',
      prompt: 'What does "Ça ne marche pas" mean?',
      options: ['It is not working', 'It is fast', 'It is charging', 'It is expensive'],
      answer: 'It is not working',
    },
    {
      type: 'sentence-builder',
      prompt: 'Build: "What is the Wi-Fi password?"',
      options: ['Quel', 'est', 'le', 'mot', 'de', 'passe', 'du', 'Wi-Fi'],
      answer: 'Quel est le mot de passe du Wi-Fi',
    },
    {
      type: 'response-selection',
      prompt: 'Your printer is broken at work. What do you say?',
      options: [
        'L’imprimante ne marche pas.',
        'L’imprimante est en charge.',
        'Le mot de passe est gratuit.',
        'Ma batterie est pleine.',
      ],
      answer: 'L’imprimante ne marche pas.',
    },
  ],

  'm6-l4-past-future': [
    {
      type: 'listen-and-repeat',
      prompt: 'Listen and repeat the time markers.',
      targetSound: 'hier, demain, la semaine prochaine',
    },
    {
      type: 'phrase-identification',
      prompt: 'Which word means "yesterday"?',
      options: ['hier', 'demain', 'aujourd’hui', 'la semaine prochaine'],
      answer: 'hier',
    },
    {
      type: 'meaning-recognition',
      prompt: 'What does "J’ai fini mon rapport" mean?',
      options: ['I finished my report', 'I start my report', 'I read my report', 'I send my report'],
      answer: 'I finished my report',
    },
    {
      type: 'sentence-builder',
      prompt: 'Build: "I am going to learn Spanish."',
      options: ['Je', 'vais', 'apprendre', 'l’espagnol', 'fini', 'hier'],
      answer: 'Je vais apprendre l’espagnol',
    },
    {
      type: 'response-selection',
      prompt: 'Which sentence talks about the future?',
      options: [
        'Demain, je vais à la réunion.',
        'Hier, j’ai travaillé.',
        'J’ai fini mon rapport.',
        'J’ai mangé une pizza.',
      ],
      answer: 'Demain, je vais à la réunion.',
    },
  ],

  'm6-l5-instructions': [
    {
      type: 'listen-and-repeat',
      prompt: 'Listen and repeat the instruction words.',
      targetSound: 'd’abord, ensuite, enfin',
    },
    {
      type: 'phrase-identification',
      prompt: 'Which word means "then / next"?',
      options: ['ensuite', 'd’abord', 'enfin', 'maintenant'],
      answer: 'ensuite',
    },
    {
      type: 'meaning-recognition',
      prompt: 'What does "C’est compris, merci !" mean?',
      options: ['Understood, thank you!', 'Please repeat', 'It is broken', 'I do not know'],
      answer: 'Understood, thank you!',
    },
    {
      type: 'sentence-builder',
      prompt: 'Build: "First, open the file."',
      options: ['D’abord', 'ouvrez', 'le', 'fichier', 'ensuite', 'enfin'],
      answer: 'D’abord ouvrez le fichier',
    },
    {
      type: 'response-selection',
      prompt: 'Someone spoke too fast. What do you ask?',
      options: [
        'Pouvez-vous répéter plus lentement ?',
        'C’est compris, merci !',
        'Ensuite, cliquez sur Envoyer.',
        'Enfin, enregistrez.',
      ],
      answer: 'Pouvez-vous répéter plus lentement ?',
    },
  ],
};