/*
 * MODULE 3 — Practice content (A1 family, home & people)
 */
export const practiceContent = {
  'm3-l1-family': [
    {
      type: 'listen-and-repeat',
      prompt: 'Listen and repeat the family words.',
      targetSound: 'ma mère, mon père, ma sœur, mon frère',
    },
    {
      type: 'phrase-identification',
      prompt: 'Which word means "my sister"?',
      options: ['ma mère', 'mon père', 'ma sœur', 'mon frère'],
      answer: 'ma sœur',
    },
    {
      type: 'meaning-recognition',
      prompt: 'What does "mon frère" mean?',
      options: ['my brother', 'my father', 'my sister', 'my mother'],
      answer: 'my brother',
    },
    {
      type: 'sentence-builder',
      prompt: 'Build: "My mother is a teacher."',
      options: ['Ma', 'mère', 'est', 'institutrice', 'père', 'frère', 'sœur'],
      answer: 'Ma mère est institutrice',
    },
    {
      type: 'response-selection',
      prompt: 'You introduce your family. Which sentence is correct?',
      options: [
        'J’ai une sœur et un frère.',
        'Je suis une sœur.',
        'Ma mère est mon frère.',
        'Mon père est une sœur.',
      ],
      answer: 'J’ai une sœur et un frère.',
    },
  ],

  'm3-l2-describing-people': [
    {
      type: 'listen-and-repeat',
      prompt: 'Listen and repeat the description words.',
      targetSound: 'grand, petit, sympa, sportif, rusé',
    },
    {
      type: 'phrase-identification',
      prompt: 'Which word means "tall"?',
      options: ['grand', 'petit', 'sympa', 'rusé'],
      answer: 'grand',
    },
    {
      type: 'meaning-recognition',
      prompt: 'What does "sympa" mean?',
      options: ['nice / friendly', 'tall', 'sporty', 'clever'],
      answer: 'nice / friendly',
    },
    {
      type: 'sentence-builder',
      prompt: 'Build: "He is tall and sporty."',
      options: ['Il', 'est', 'grand', 'et', 'sportif', 'petit', 'sympa'],
      answer: 'Il est grand et sportif',
    },
    {
      type: 'response-selection',
      prompt: 'Which sentence describes someone who is both tall and friendly?',
      options: [
        'C’est un garçon grand et sympa.',
        'C’est une fille petite et rusée.',
        'C’est un garçon petit et sympa.',
        'C’est une fille grande et sportive.',
      ],
      answer: 'C’est un garçon grand et sympa.',
    },
  ],

  'm3-l3-my-home': [
    {
      type: 'listen-and-repeat',
      prompt: 'Listen and repeat the home words.',
      targetSound: 'ma chambre, la cuisine, le salon, la salle de bain',
    },
    {
      type: 'phrase-identification',
      prompt: 'Which word means "the kitchen"?',
      options: ['la cuisine', 'le salon', 'la chambre', 'la salle de bain'],
      answer: 'la cuisine',
    },
    {
      type: 'meaning-recognition',
      prompt: 'What does "le salon" mean?',
      options: ['the living room', 'the bedroom', 'the kitchen', 'the bathroom'],
      answer: 'the living room',
    },
    {
      type: 'sentence-builder',
      prompt: 'Build: "The kitchen is big."',
      options: ['La', 'cuisine', 'est', 'grande', 'petite', 'chambre', 'bain'],
      answer: 'La cuisine est grande',
    },
    {
      type: 'response-selection',
      prompt: 'Where do you sleep?',
      options: [
        'Dans ma chambre.',
        'Dans la cuisine.',
        'Dans le salon.',
        'Dans la salle de bain.',
      ],
      answer: 'Dans ma chambre.',
    },
  ],

  'm3-l4-prepositions': [
    {
      type: 'listen-and-repeat',
      prompt: 'Listen and repeat the prepositions.',
      targetSound: 'dans, sur, sous, derrière, entre',
    },
    {
      type: 'phrase-identification',
      prompt: 'Which word means "under"?',
      options: ['sous', 'sur', 'dans', 'derrière'],
      answer: 'sous',
    },
    {
      type: 'meaning-recognition',
      prompt: 'What does "C’est derrière la maison" mean?',
      options: [
        'It is behind the house',
        'It is under the house',
        'It is above the house',
        'It is between the houses',
      ],
      answer: 'It is behind the house',
    },
    {
      type: 'sentence-builder',
      prompt: 'Build: "The cat is under the table."',
      options: ['Le', 'chat', 'est', 'sous', 'la', 'table', 'sur', 'derrière'],
      answer: 'Le chat est sous la table',
    },
    {
      type: 'response-selection',
      prompt: 'The door sits between two windows: La porte est ___ deux fenêtres. Which word fits?',
      options: [
        'entre',
        'sous',
        'sur',
        'dans',
      ],
      answer: 'entre',
    },
  ],
};