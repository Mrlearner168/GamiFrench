/*
 * MODULE 6 — Quiz content (A1+ education, work & technology)
 * Every question only uses words taught on that sub-lesson's learn cards
 * (src/data/learning/module6.js). Each quiz has the same shape: multiple
 * choice, true/false, "complete the sentence" multiple choice, listening and
 * a sentence builder (60 points).
 */
export const quizContent = {
  'm6-l1-workplace': [
    {
      id: 'q1',
      question: 'What does "une réunion" mean?',
      choices: ['a meeting', 'a colleague', 'an office', 'a teacher'],
      answer: 'a meeting',
      explanation: '"Une réunion" = a meeting at work.',
    },
    {
      id: 'q2',
      type: 'true-false',
      question: 'To say "I am a teacher", you say "Je suis un professeur."',
      answer: 'False',
      explanation: 'No article before a job: "Je suis professeur."',
    },
    {
      id: 'q3',
      question: 'Complete: Je travaille ___ un bureau. (I work in an office.)',
      choices: ['dans', 'de', 'suis', 'est'],
      answer: 'dans',
      explanation: '"Dans un bureau" = in an office.',
    },
    {
      id: 'q4',
      type: 'listening',
      audioText: 'Je travaille de neuf heures à cinq heures.',
      question: 'Listen. What are the working hours?',
      choices: ['9 to 5', '5 to 9', '9 to 11', '11 to 5'],
      answer: '9 to 5',
      explanation: '"De neuf heures à cinq heures" = from nine to five.',
    },
    {
      id: 'q5',
      type: 'sentence-builder',
      question: 'Build: "My colleague is very nice."',
      words: ['Mon', 'collègue', 'est', 'très', 'sympa', 'réunion', 'suis'],
      answer: ['Mon', 'collègue', 'est', 'très', 'sympa'],
      explanation: '"Mon collègue est très sympa."',
    },
  ],

  'm6-l2-school': [
    {
      id: 'q1',
      question: 'What does "les devoirs" mean?',
      choices: ['homework', 'classes', 'exams', 'subjects'],
      answer: 'homework',
      explanation: '"Les devoirs" = homework (always plural).',
    },
    {
      id: 'q2',
      type: 'true-false',
      question: '"Je ne comprends pas" means "I don\'t understand."',
      answer: 'True',
      explanation: 'Ne … pas around "comprends" makes it negative.',
    },
    {
      id: 'q3',
      question: 'Complete: J’apprends le ___. (I am learning French.)',
      choices: ['français', 'cours', 'examen', 'devoirs'],
      answer: 'français',
      explanation: '"Le français" = French, the language.',
    },
    {
      id: 'q4',
      type: 'listening',
      audioText: 'J’ai un cours de maths à huit heures.',
      question: 'Listen. What does the speaker say?',
      choices: [
        'I have a maths class at eight.',
        'I have a maths exam at eight.',
        'I have maths homework at eight.',
        'I have an English class at eight.',
      ],
      answer: 'I have a maths class at eight.',
      explanation: '"Un cours de maths" = a maths class.',
    },
    {
      id: 'q5',
      type: 'sentence-builder',
      question: 'Build: "I have a lot of homework tonight."',
      words: ['J’ai', 'beaucoup', 'de', 'devoirs', 'ce', 'soir', 'examen', 'cours'],
      answer: ['J’ai', 'beaucoup', 'de', 'devoirs', 'ce', 'soir'],
      explanation: '"J’ai beaucoup de devoirs ce soir."',
    },
  ],

  'm6-l3-technology': [
    {
      id: 'q1',
      question: 'What does "Ça ne marche pas" mean?',
      choices: ['It doesn\'t work.', 'It is charging.', 'It is new.', 'It is on the table.'],
      answer: 'It doesn\'t work.',
      explanation: 'Marcher = to work (for machines); ne … pas = not.',
    },
    {
      id: 'q2',
      type: 'true-false',
      question: '"L’ordinateur" means "the phone."',
      answer: 'False',
      explanation: 'L’ordinateur = the computer; le portable = the phone.',
    },
    {
      id: 'q3',
      question: 'Complete: Quel est le ___ de passe du Wi-Fi ?',
      choices: ['mot', 'chargeur', 'message', 'portable'],
      answer: 'mot',
      explanation: '"Le mot de passe" = the password.',
    },
    {
      id: 'q4',
      type: 'listening',
      audioText: 'Vous avez un chargeur, s’il vous plaît ?',
      question: 'Listen. What does the person want?',
      choices: ['A charger', 'The Wi-Fi password', 'A new phone', 'A computer'],
      answer: 'A charger',
      explanation: '"Un chargeur" = a charger.',
    },
    {
      id: 'q5',
      type: 'sentence-builder',
      question: 'Build: "My battery is low."',
      words: ['Ma', 'batterie', 'est', 'faible', 'Mon', 'marche', 'chargeur'],
      answer: ['Ma', 'batterie', 'est', 'faible'],
      explanation: '"Batterie" is feminine, so: "Ma batterie est faible."',
    },
  ],

  'm6-l4-past-future': [
    {
      id: 'q1',
      question: 'Which word means "yesterday"?',
      choices: ['hier', 'demain', 'aujourd’hui', 'la semaine prochaine'],
      answer: 'hier',
      explanation: 'Hier = yesterday; demain = tomorrow.',
    },
    {
      id: 'q2',
      type: 'true-false',
      question: '"Je vais travailler" talks about the past.',
      answer: 'False',
      explanation: 'Je vais + infinitive is the futur proche: "I am going to work."',
    },
    {
      id: 'q3',
      question: 'Complete: Hier, j’ai ___ mes devoirs. (Yesterday, I finished my homework.)',
      choices: ['fini', 'finir', 'vais', 'travaille'],
      answer: 'fini',
      explanation: 'Passé composé: j’ai + past participle (finir → fini).',
    },
    {
      id: 'q4',
      type: 'listening',
      audioText: 'Demain, je vais travailler à la maison.',
      question: 'Listen. What does the speaker say?',
      choices: [
        'Tomorrow, I am going to work at home.',
        'Yesterday, I worked at home.',
        'Today, I am working at home.',
        'Tomorrow, I am going to work at the office.',
      ],
      answer: 'Tomorrow, I am going to work at home.',
      explanation: '"Demain" + "je vais travailler" = the future.',
    },
    {
      id: 'q5',
      type: 'sentence-builder',
      question: 'Build: "Next week, I am going to learn English."',
      words: ['La', 'semaine', 'prochaine', 'je', 'vais', 'apprendre', 'l’anglais', 'hier'],
      answer: ['La', 'semaine', 'prochaine', 'je', 'vais', 'apprendre', 'l’anglais'],
      explanation: 'Futur proche: je vais + infinitive (apprendre).',
    },
  ],

  'm6-l5-instructions': [
    {
      id: 'q1',
      question: 'Which word means "first"?',
      choices: ['d’abord', 'ensuite', 'enfin', 'ici'],
      answer: 'd’abord',
      explanation: 'D’abord = first, ensuite = then, enfin = finally.',
    },
    {
      id: 'q2',
      type: 'true-false',
      question: '"Parlez plus lentement" asks someone to speak more slowly.',
      answer: 'True',
      explanation: 'Parlez = speak; plus lentement = more slowly.',
    },
    {
      id: 'q3',
      question: 'Complete: ___, cliquez sur « Envoyer ». (Finally, click on "Send".)',
      choices: ['Enfin', 'D’abord', 'Ensuite', 'Ici'],
      answer: 'Enfin',
      explanation: 'Enfin = finally, the last step.',
    },
    {
      id: 'q4',
      type: 'listening',
      audioText: 'Pouvez-vous répéter, s’il vous plaît ?',
      question: 'Listen. What does the person ask?',
      choices: [
        'Can you repeat, please?',
        'Can you speak more slowly?',
        'Can you open the file?',
        'Can you click here?',
      ],
      answer: 'Can you repeat, please?',
      explanation: 'Répéter = to repeat.',
    },
    {
      id: 'q5',
      type: 'sentence-builder',
      question: 'Build: "First, open the file."',
      words: ['D’abord', 'ouvrez', 'le', 'fichier', 'cliquez', 'enfin', 'la'],
      answer: ['D’abord', 'ouvrez', 'le', 'fichier'],
      explanation: '"D’abord, ouvrez le fichier." — vous form without vous.',
    },
  ],
};
