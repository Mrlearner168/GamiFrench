/*
 * MODULE 10 — Quiz content (A2 the world, values, media & final review).
 * Every question only uses words taught on that sub-lesson's learn cards
 * (src/data/learning/module10.js) or in earlier modules. Same shape per quiz:
 * multiple choice, true/false, "complete" multiple choice, listening and a
 * sentence builder (60 points).
 */
export const quizContent = {
  'm10-l1-globalization': [
    {
      id: 'q1',
      question: 'What does "la mondialisation" mean?',
      choices: ['globalization', 'the climate', 'the planet', 'a culture'],
      answer: 'globalization',
      explanation: 'La mondialisation is built on monde (world): globalization.',
    },
    {
      id: 'q2',
      type: 'true-false',
      question: '"Le Canada est plus grand que la France" means "Canada is bigger than France."',
      answer: 'True',
      explanation: 'plus + adjective + que = more … than: plus grand que = bigger than.',
    },
    {
      id: 'q3',
      question: 'Complete: Il ___ protéger la planète. (We must protect the planet.)',
      choices: ['faut', 'est', 'a', 'change'],
      answer: 'faut',
      explanation: 'Il faut + infinitive = we must / it is necessary to.',
    },
    {
      id: 'q4',
      type: 'listening',
      audioText: 'Il y a des pays riches et des pays pauvres.',
      question: 'Listen. What does the speaker say?',
      choices: [
        'There are rich countries and poor countries.',
        'All countries are rich.',
        'Rich countries are big.',
        'There are no poor countries.',
      ],
      answer: 'There are rich countries and poor countries.',
      explanation: 'riche = rich, pauvre = poor; des pays = (some) countries.',
    },
    {
      id: 'q5',
      type: 'sentence-builder',
      question: 'Build: "Globalization changes the world."',
      words: ['La', 'mondialisation', 'change', 'le', 'monde', 'planète', 'pays'],
      answer: ['La', 'mondialisation', 'change', 'le', 'monde'],
      explanation: 'Subject + verb + object: La mondialisation change le monde.',
    },
  ],

  'm10-l2-ethics': [
    {
      id: 'q1',
      question: 'Which phrase means "In my opinion…"?',
      choices: ['À mon avis…', 'Je suis d’accord.', 'parce que', 'C’est injuste.'],
      answer: 'À mon avis…',
      explanation: 'À mon avis = in my opinion; je pense que = I think that.',
    },
    {
      id: 'q2',
      type: 'true-false',
      question: '"Je ne suis pas d’accord" means "I agree."',
      answer: 'False',
      explanation: 'Ne … pas makes it negative: je ne suis pas d’accord = I disagree.',
    },
    {
      id: 'q3',
      question: 'Complete: J’aide les autres ___ c’est juste. (because)',
      choices: ['parce que', 'mais', 'd’accord', 'le respect'],
      answer: 'parce que',
      explanation: 'Parce que = because: it gives the reason.',
    },
    {
      id: 'q4',
      type: 'listening',
      audioText: 'Je pense que le respect est très important.',
      question: 'Listen. What does the speaker think?',
      choices: [
        'Respect is very important.',
        'Respect is difficult.',
        'Helping others is unfair.',
        'Nothing is important.',
      ],
      answer: 'Respect is very important.',
      explanation: 'Je pense que = I think that; le respect = respect.',
    },
    {
      id: 'q5',
      type: 'sentence-builder',
      question: 'Build: "In my opinion, it is fair."',
      words: ['À', 'mon', 'avis', 'c’est', 'juste', 'injuste', 'pense'],
      answer: ['À', 'mon', 'avis', 'c’est', 'juste'],
      explanation: 'À mon avis, c’est juste. (Injuste = unfair.)',
    },
  ],

  'm10-l3-media-analysis': [
    {
      id: 'q1',
      question: 'What are "les réseaux sociaux"?',
      choices: ['social media', 'the newspaper', 'the news', 'an article'],
      answer: 'social media',
      explanation: 'Les réseaux sociaux = social media; les informations = the news.',
    },
    {
      id: 'q2',
      type: 'true-false',
      question: '"Cette information est fausse" means "This information is true."',
      answer: 'False',
      explanation: 'Fausse (feminine of faux) = false; true is vrai / vraie.',
    },
    {
      id: 'q3',
      question: 'Complete: Hier, j’___ lu un article. (Yesterday, I read an article.)',
      choices: ['ai', 'suis', 'vais', 'as'],
      answer: 'ai',
      explanation: 'Passé composé = avoir + past participle: j’ai lu.',
    },
    {
      id: 'q4',
      type: 'listening',
      audioText: 'Je regarde les informations le soir.',
      question: 'Listen. What does the speaker do in the evening?',
      choices: [
        'Watches the news',
        'Reads the newspaper',
        'Uses social media',
        'Writes an article',
      ],
      answer: 'Watches the news',
      explanation: 'Je regarde les informations = I watch the news.',
    },
    {
      id: 'q5',
      type: 'sentence-builder',
      question: 'Build: "It is a fact, not an opinion."',
      words: ['C’est', 'un', 'fait', 'pas', 'une', 'opinion', 'vrai', 'source'],
      answer: ['C’est', 'un', 'fait', 'pas', 'une', 'opinion'],
      explanation: 'C’est un fait, pas une opinion: pas = not.',
    },
  ],

  'm10-l4-mastery': [
    {
      id: 'q1',
      question: 'Which sentence talks about the past?',
      choices: [
        'J’ai appris le français.',
        'Je vais voyager.',
        'Je m’appelle Sam.',
        'Je suis sympa et curieux.',
      ],
      answer: 'J’ai appris le français.',
      explanation: 'Passé composé: j’ai + appris. Je vais voyager is the future.',
    },
    {
      id: 'q2',
      type: 'true-false',
      question: '"Je vais voyager" talks about the future.',
      answer: 'True',
      explanation: 'Futur proche: je vais + infinitive = I am going to….',
    },
    {
      id: 'q3',
      question: 'Complete: D’abord je travaille, ___ je mange, enfin je dors. (then)',
      choices: ['ensuite', 'parce que', 'mais', 'd’abord'],
      answer: 'ensuite',
      explanation: 'd’abord = first, ensuite = then, enfin = finally.',
    },
    {
      id: 'q4',
      type: 'listening',
      audioText: 'Je m’appelle Sam et j’ai vingt ans.',
      question: 'Listen. What does the speaker say?',
      choices: [
        'My name is Sam and I am twenty.',
        'My name is Sam and I am ten.',
        'His name is Sam and he is twenty.',
        'My name is Sam and I live in France.',
      ],
      answer: 'My name is Sam and I am twenty.',
      explanation: 'Je m’appelle = my name is; j’ai vingt ans = I am twenty.',
    },
    {
      id: 'q5',
      type: 'sentence-builder',
      question: 'Build: "Next year, I am going to travel."',
      words: ['L’année', 'prochaine', 'je', 'vais', 'voyager', 'ai', 'visité'],
      answer: ['L’année', 'prochaine', 'je', 'vais', 'voyager'],
      explanation: 'Futur proche: je vais + voyager. J’ai visité is the past.',
    },
  ],
};
