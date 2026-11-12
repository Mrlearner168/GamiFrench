/*
 * MODULE 3 — Quiz content (A1 family, home & people)
 *
 * Every question only uses words taught on that sub-lesson's learn cards.
 * Each quiz: multiple choice, true/false, "complete the sentence" multiple
 * choice, listening and a sentence builder (60 points).
 */
export const quizContent = {
  'm3-l1-family': [
    {
      id: 'q1',
      question: 'What does "ma mère" mean?',
      choices: ['my mother', 'my father', 'my sister', 'my parents'],
      answer: 'my mother',
      explanation: 'mère = mother, père = father, sœur = sister.',
    },
    {
      id: 'q2',
      type: 'true-false',
      question: 'You say "ma frère" because frère is feminine.',
      answer: 'False',
      explanation: 'frère is masculine: mon frère.',
    },
    {
      id: 'q3',
      question: 'Complete: ___ parents habitent à Montréal.',
      choices: ['Mes', 'Mon', 'Ma', 'Les mes'],
      answer: 'Mes',
      explanation: 'mes is used with every plural noun.',
    },
    {
      id: 'q4',
      type: 'listening',
      audioText: 'Mon frère est médecin.',
      question: 'Listen. What does the brother do?',
      choices: ['He is a doctor', 'He is a teacher', 'He plays football', 'He is a student'],
      answer: 'He is a doctor',
      explanation: 'médecin = doctor.',
    },
    {
      id: 'q5',
      type: 'sentence-builder',
      question: 'Build: "I have a brother and a sister."',
      words: ['J\'ai', 'un', 'frère', 'et', 'une', 'sœur', 'ma', 'mon'],
      answer: ['J\'ai', 'un', 'frère', 'et', 'une', 'sœur'],
      explanation: 'J\'ai un frère et une sœur.',
    },
  ],

  'm3-l2-describing-people': [
    {
      id: 'q1',
      question: 'What does "grand" mean?',
      choices: ['tall', 'short', 'kind', 'shy'],
      answer: 'tall',
      explanation: 'grand = tall; petit = short.',
    },
    {
      id: 'q2',
      type: 'true-false',
      question: 'To describe hair, French uses avoir: "Il a les cheveux bruns."',
      answer: 'True',
      explanation: 'Hair and eyes use avoir: il a les cheveux…, elle a les yeux…',
    },
    {
      id: 'q3',
      question: 'Complete: Ma sœur est très ___ . (very kind)',
      choices: ['gentille', 'gentil', 'gentils', 'gentilles'],
      answer: 'gentille',
      explanation: 'sœur is feminine singular: gentille (double l + e).',
    },
    {
      id: 'q4',
      type: 'listening',
      audioText: 'Il est sportif et très sympa.',
      question: 'Listen. How is the person described?',
      choices: ['Sporty and nice', 'Tall and kind', 'Short and shy', 'Sporty and shy'],
      answer: 'Sporty and nice',
      explanation: 'sportif = sporty; sympa = nice.',
    },
    {
      id: 'q5',
      type: 'sentence-builder',
      question: 'Build: "She has blue eyes."',
      words: ['Elle', 'a', 'les', 'yeux', 'bleus', 'est', 'cheveux'],
      answer: ['Elle', 'a', 'les', 'yeux', 'bleus'],
      explanation: 'avoir + les yeux + color: Elle a les yeux bleus.',
    },
  ],

  'm3-l3-my-home': [
    {
      id: 'q1',
      question: 'Which word means "the bedroom"?',
      choices: ['la chambre', 'la cuisine', 'le salon', 'la salle de bain'],
      answer: 'la chambre',
      explanation: 'la chambre = bedroom; la cuisine = kitchen; le salon = living room.',
    },
    {
      id: 'q2',
      question: 'Complete: J\'___ dans un appartement.',
      choices: ['habite', 'habites', 'suis', 'ai'],
      answer: 'habite',
      explanation: 'j\'habite = I live.',
    },
    {
      id: 'q3',
      type: 'true-false',
      question: 'In France, "le premier étage" is the ground floor.',
      answer: 'False',
      explanation: 'The ground floor is le rez-de-chaussée; le premier étage is one floor up.',
    },
    {
      id: 'q4',
      type: 'listening',
      audioText: 'Ma chambre est au deuxième étage.',
      question: 'Listen. Where is the bedroom?',
      choices: ['On the second floor', 'In the kitchen', 'Next to the bathroom', 'On my street'],
      answer: 'On the second floor',
      explanation: 'au deuxième étage = on the second floor.',
    },
    {
      id: 'q5',
      type: 'sentence-builder',
      question: 'Build: "There is a bakery on my street."',
      words: ['Il', 'y', 'a', 'une', 'boulangerie', 'dans', 'ma', 'rue'],
      answer: ['Il', 'y', 'a', 'une', 'boulangerie', 'dans', 'ma', 'rue'],
      explanation: 'French says "in" my street: dans ma rue.',
    },
  ],

  'm3-l4-prepositions': [
    {
      id: 'q1',
      question: 'What does "derrière" mean?',
      choices: ['behind', 'in front of', 'under', 'next to'],
      answer: 'behind',
      explanation: 'derrière = behind; devant = in front of.',
    },
    {
      id: 'q2',
      type: 'true-false',
      question: '"Le livre est sur la table" means "The book is under the table."',
      answer: 'False',
      explanation: 'sur = on; sous = under.',
    },
    {
      id: 'q3',
      question: 'Complete: La lampe est à côté ___ lit. (next to the bed)',
      choices: ['du', 'de', 'de la', 'des'],
      answer: 'du',
      explanation: 'lit is masculine: de + le = du.',
    },
    {
      id: 'q4',
      type: 'listening',
      audioText: 'Le vélo est derrière la maison.',
      question: 'Listen. Where is the bike?',
      choices: ['Behind the house', 'In front of the house', 'In the house', 'Next to the house'],
      answer: 'Behind the house',
      explanation: 'derrière la maison = behind the house.',
    },
    {
      id: 'q5',
      type: 'sentence-builder',
      question: 'Build: "The cat is under the table."',
      words: ['Le', 'chat', 'est', 'sous', 'la', 'table', 'sur', 'dans'],
      answer: ['Le', 'chat', 'est', 'sous', 'la', 'table'],
      explanation: 'sous = under.',
    },
  ],
};
