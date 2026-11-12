/*
 * MODULE 8 — Quiz content (A1+/A2 culture & professional communication)
 * Every question only uses words taught on that sub-lesson's learn cards
 * (src/data/learning/module8.js). Same shape in every quiz: multiple choice,
 * true/false, "complete the sentence" multiple choice, listening and a
 * sentence builder (60 points).
 */
export const quizContent = {
  // ---- TOPIC 1: Culture & Traditions ----
  'm8-l1-culture': [
    {
      id: 'q1',
      question: 'Which sentence means "I love French films!"?',
      choices: [
        'J’adore les films français !',
        'J’ai vu un film français.',
        'Je te recommande ce film.',
        'Je regarde un film français.',
      ],
      answer: 'J’adore les films français !',
      explanation: 'J’adore = I love; j’ai vu = I saw; je regarde = I am watching.',
    },
    {
      id: 'q2',
      type: 'true-false',
      question: '"J’aime" is stronger than "J’adore."',
      answer: 'False',
      explanation: 'J’adore (I love) is stronger than j’aime (I like).',
    },
    {
      id: 'q3',
      question: 'Complete: Hier, j’ai ___ un film français. (I watched)',
      choices: ['vu', 'aime', 'recommande', 'regarde'],
      answer: 'vu',
      explanation: 'Passé composé: j’ai + vu (from voir) = I saw / I watched.',
    },
    {
      id: 'q4',
      type: 'listening',
      audioText: 'J’ai adoré le concert.',
      question: 'Listen. What does the speaker say?',
      choices: [
        'I loved the concert.',
        'I like concerts.',
        'I am going to the concert.',
        'I recommend the concert.',
      ],
      answer: 'I loved the concert.',
      explanation: 'J’ai adoré = I loved (passé composé of adorer).',
    },
    {
      id: 'q5',
      type: 'sentence-builder',
      question: 'Share a favourite! Build: "I recommend this film (to you)."',
      words: ['Je', 'te', 'recommande', 'ce', 'film', 'musée', 'vu'],
      answer: ['Je', 'te', 'recommande', 'ce', 'film'],
      explanation: 'Je + te + recommande + ce film: te = to you.',
    },
  ],

  'm8-l2-traditions': [
    {
      id: 'q1',
      question: 'Look up at the sky! What happens on le 14 juillet?',
      choices: ['Fireworks for Bastille Day', 'Eating king cake', 'Christmas dinner', 'New Year wishes'],
      answer: 'Fireworks for Bastille Day',
      explanation: 'Le 14 juillet, il y a des feux d’artifice: France’s national day.',
    },
    {
      id: 'q2',
      type: 'true-false',
      question: '"Noël" means "New Year."',
      answer: 'False',
      explanation: 'Noël = Christmas; New Year = le Nouvel An.',
    },
    {
      id: 'q3',
      question: 'Complete: En janvier, on mange la galette des ___.',
      choices: ['rois', 'feux', 'Noël', 'famille'],
      answer: 'rois',
      explanation: 'La galette des rois = king cake, eaten in January.',
    },
    {
      id: 'q4',
      type: 'listening',
      audioText: 'On fête Noël en famille.',
      question: 'Listen. What does the speaker say?',
      choices: [
        'We celebrate Christmas with the family.',
        'We celebrate New Year with the family.',
        'We eat king cake in January.',
        'There are fireworks on July 14.',
      ],
      answer: 'We celebrate Christmas with the family.',
      explanation: 'On fête = we celebrate; en famille = with the family.',
    },
    {
      id: 'q5',
      type: 'sentence-builder',
      question: 'Invite your neighbours! Build: "Come and celebrate with us!"',
      words: ['Venez', 'fêter', 'avec', 'nous', 'on', 'Noël'],
      answer: ['Venez', 'fêter', 'avec', 'nous'],
      explanation: 'Venez (vous form) + fêter + avec nous: a polite invitation.',
    },
  ],

  // ---- TOPIC 2: Professional Communication ----
  'm8-l3-career': [
    {
      id: 'q1',
      question: 'What is "un stage"?',
      choices: ['an internship', 'a stage show', 'a salary', 'a diploma'],
      answer: 'an internship',
      explanation: 'Un stage = an internship, work experience in a company.',
    },
    {
      id: 'q2',
      type: 'true-false',
      question: '"Je vais travailler à Paris" talks about a future plan.',
      answer: 'True',
      explanation: 'Futur proche: je vais + infinitive = I am going to…',
    },
    {
      id: 'q3',
      question: 'Complete: Je ___ être ingénieur. (I would like to be)',
      choices: ['voudrais', 'suis', 'fais', 'étudie'],
      answer: 'voudrais',
      explanation: 'Je voudrais + infinitive = I would like to…',
    },
    {
      id: 'q4',
      type: 'listening',
      audioText: 'Je fais une formation en marketing.',
      question: 'Listen. What does the speaker say?',
      choices: [
        'I am doing a training course in marketing.',
        'I did an internship in marketing.',
        'I would like to work in marketing.',
        'I study computer science.',
      ],
      answer: 'I am doing a training course in marketing.',
      explanation: 'Je fais une formation = I am doing a training course.',
    },
    {
      id: 'q5',
      type: 'sentence-builder',
      question: 'Boost your CV! Build: "I did an internship in a company."',
      words: ['J’ai', 'fait', 'un', 'stage', 'dans', 'une', 'entreprise', 'vais'],
      answer: ['J’ai', 'fait', 'un', 'stage', 'dans', 'une', 'entreprise'],
      explanation: 'J’ai fait (passé composé of faire) + un stage + dans une entreprise.',
    },
  ],

  'm8-l4-interview': [
    {
      id: 'q1',
      question: 'The interviewer smiles and says "Parlez-moi de vous." What do they want?',
      choices: ['Tell me about yourself', 'Speak more slowly', 'Write me an email', 'Come back tomorrow'],
      answer: 'Tell me about yourself',
      explanation: 'Parlez-moi de vous = Tell me about yourself, the classic first question.',
    },
    {
      id: 'q2',
      type: 'true-false',
      question: '"Cordialement" is used to open a professional email.',
      answer: 'False',
      explanation: 'Cordialement closes an email; Madame, Monsieur, opens it.',
    },
    {
      id: 'q3',
      question: 'Complete: Merci pour votre ___. (Thank you for your time.)',
      choices: ['temps', 'entreprise', 'français', 'demain'],
      answer: 'temps',
      explanation: 'Merci pour votre temps = Thank you for your time.',
    },
    {
      id: 'q4',
      type: 'listening',
      audioText: 'Je voudrais travailler dans votre entreprise.',
      question: 'Listen. What does the speaker say?',
      choices: [
        'I would like to work in your company.',
        'I worked in your company.',
        'I have a job interview tomorrow.',
        'I speak French and English.',
      ],
      answer: 'I would like to work in your company.',
      explanation: 'Je voudrais travailler = I would like to work; votre = your.',
    },
    {
      id: 'q5',
      type: 'sentence-builder',
      question: 'Big day ahead! Build: "I have a job interview tomorrow."',
      words: ['J’ai', 'un', 'entretien', 'd’embauche', 'demain', 'hier', 'temps'],
      answer: ['J’ai', 'un', 'entretien', 'd’embauche', 'demain'],
      explanation: 'J’ai + un entretien d’embauche + demain (tomorrow).',
    },
  ],
};
