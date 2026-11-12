/*
 * MODULE 7 — Quiz content (A1+/A2 media, society & opinions)
 * Every question only uses words taught on that sub-lesson's learn cards
 * (src/data/learning/module7.js). Shape per quiz: multiple choice, true/false,
 * "complete the sentence" multiple choice, listening, sentence builder (60 points).
 */
export const quizContent = {
  // ---- TOPIC 1: News & Environment ----
  'm7-l1-news': [
    {
      id: 'q1',
      question: 'Which word means "the newspaper"?',
      choices: ['le journal', 'la télé', 'la radio', 'les gros titres'],
      answer: 'le journal',
      explanation: 'Le journal = the newspaper; la télé = TV; la radio = the radio.',
    },
    {
      id: 'q2',
      type: 'true-false',
      question: '"Les gros titres" means "the headlines."',
      answer: 'True',
      explanation: 'Literally "the big titles": the headlines.',
    },
    {
      id: 'q3',
      question: 'Complete: Je ___ la télé le soir. (I watch TV in the evening.)',
      choices: ['regarde', 'écoute', 'lis', 'vu'],
      answer: 'regarde',
      explanation: 'Je regarde = I watch; j’écoute = I listen to; je lis = I read.',
    },
    {
      id: 'q4',
      type: 'listening',
      audioText: 'J’ai lu un article sur internet.',
      question: 'Listen. What did the speaker do?',
      choices: [
        'They read an article online.',
        'They watched the news on TV.',
        'They listened to the radio.',
        'They read the newspaper.',
      ],
      answer: 'They read an article online.',
      explanation: 'J’ai lu = I read (past); un article sur internet = an article online.',
    },
    {
      id: 'q5',
      type: 'sentence-builder',
      question: 'Morning routine! Build: "I read the headlines this morning."',
      words: ['J’ai', 'lu', 'les', 'gros', 'titres', 'ce', 'matin', 'vu'],
      answer: ['J’ai', 'lu', 'les', 'gros', 'titres', 'ce', 'matin'],
      explanation: 'Passé composé: j’ai + lu (lire). Vu comes from voir (to see).',
    },
  ],

  'm7-l2-environment': [
    {
      id: 'q1',
      question: 'What does "les déchets" mean?',
      choices: ['waste', 'the planet', 'pollution', 'the bike'],
      answer: 'waste',
      explanation: 'Les déchets = waste / rubbish; la planète = the planet.',
    },
    {
      id: 'q2',
      type: 'true-false',
      question: '"Je vais au travail à pied" means "I go to work by car."',
      answer: 'False',
      explanation: 'À pied = on foot. By car is en voiture.',
    },
    {
      id: 'q3',
      question: 'Complete: Il ___ protéger la planète. (We must protect the planet.)',
      choices: ['faut', 'fait', 'est', 'a'],
      answer: 'faut',
      explanation: 'Il faut + infinitive = we must / you have to.',
    },
    {
      id: 'q4',
      type: 'listening',
      audioText: 'Il y a beaucoup de pollution en ville.',
      question: 'Listen. What is the problem in town?',
      choices: ['A lot of pollution', 'A lot of rubbish', 'A lot of bikes', 'A lot of paper'],
      answer: 'A lot of pollution',
      explanation: 'Beaucoup de pollution = a lot of pollution.',
    },
    {
      id: 'q5',
      type: 'sentence-builder',
      question: 'Green habit! Build: "I sort the waste at home."',
      words: ['Je', 'fais', 'le', 'tri', 'à', 'la', 'maison', 'recycle'],
      answer: ['Je', 'fais', 'le', 'tri', 'à', 'la', 'maison'],
      explanation: 'Faire le tri = to sort the waste: je fais le tri.',
    },
  ],

  // ---- TOPIC 2: Opinions & Debate ----
  'm7-l3-opinions': [
    {
      id: 'q1',
      question: 'How do you say "I think that..."?',
      choices: ['Je pense que...', 'Je suis d’accord.', 'À mon avis,...', 'parce que...'],
      answer: 'Je pense que...',
      explanation: 'Je pense que = I think that; à mon avis = in my opinion.',
    },
    {
      id: 'q2',
      type: 'true-false',
      question: '"Je ne suis pas d’accord" means "I agree."',
      answer: 'False',
      explanation: 'Ne... pas makes it negative: I do not agree.',
    },
    {
      id: 'q3',
      question: 'Complete: Je recycle ___ c’est important. (I recycle because it is important.)',
      choices: ['parce que', 'à mon avis', 'avec', 'pour'],
      answer: 'parce que',
      explanation: 'Parce que = because; it introduces your reason.',
    },
    {
      id: 'q4',
      type: 'listening',
      audioText: 'Qu’est-ce que tu penses de cette idée ?',
      question: 'Listen. What is the speaker doing?',
      choices: ['Asking for your opinion', 'Disagreeing', 'Agreeing', 'Giving a reason'],
      answer: 'Asking for your opinion',
      explanation: 'Qu’est-ce que tu penses ? = What do you think?',
    },
    {
      id: 'q5',
      type: 'sentence-builder',
      question: 'Your friend makes a great point. Build: "I agree with you."',
      words: ['Je', 'suis', 'd’accord', 'avec', 'toi', 'pense', 'pas'],
      answer: ['Je', 'suis', 'd’accord', 'avec', 'toi'],
      explanation: 'French uses être: je suis d’accord avec toi.',
    },
  ],

  'm7-l4-debate': [
    {
      id: 'q1',
      question: 'In a debate, what does "le problème" mean?',
      choices: ['the problem', 'the advantage', 'the conclusion', 'the price'],
      answer: 'the problem',
      explanation: 'Le problème = the problem; l’avantage = the advantage.',
    },
    {
      id: 'q2',
      type: 'true-false',
      question: '"Peut-être, mais..." means "Maybe, but..."',
      answer: 'True',
      explanation: 'Use it to half-agree and keep your own point.',
    },
    {
      id: 'q3',
      question: 'Complete: La voiture, c’est pratique, ___ c’est cher. (… but it is expensive.)',
      choices: ['mais', 'parce que', 'avec', 'en conclusion'],
      answer: 'mais',
      explanation: 'Mais = but; it turns to the other side of the argument.',
    },
    {
      id: 'q4',
      type: 'listening',
      audioText: 'C’est vrai, le bus est lent, mais c’est pratique.',
      question: 'Listen. What does the speaker accept first?',
      choices: ['The bus is slow', 'The bus is expensive', 'The bus is fast', 'The bus is new'],
      answer: 'The bus is slow',
      explanation: 'C’est vrai, le bus est lent = that is true, the bus is slow.',
    },
    {
      id: 'q5',
      type: 'sentence-builder',
      question: 'Compare transport! Build: "The train is fast but expensive."',
      words: ['Le', 'train', 'est', 'rapide', 'mais', 'cher', 'lent', 'vélo'],
      answer: ['Le', 'train', 'est', 'rapide', 'mais', 'cher'],
      explanation: 'Rapide = fast, lent = slow, cher = expensive; mais = but.',
    },
  ],
};
