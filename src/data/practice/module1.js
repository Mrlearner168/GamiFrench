export const practiceContent = {
  // -------------------------
  // TOPIC 1: Alphabet & Vowels
  // -------------------------
  'm1-l1-alphabet': [
    {
      type: 'listen-and-repeat',
      prompt: 'Listen and repeat each French letter.',
      targetSound: 'A, B, C, D, E',
    },
    {
      type: 'sound-identification',
      prompt: 'Which French letter is pronounced "bay"?',
      options: ['A', 'B', 'C', 'D'],
      answer: 'B',
    },
    {
      type: 'letter-recognition',
      prompt: 'Which letter do you hear?',
      audioKey: 'letter_c',
      options: ['A', 'B', 'C', 'D'],
      answer: 'C',
    },
    {
      type: 'sound-identification',
      prompt: 'Which French letter sounds similar to the English word "say"?',
      options: ['A', 'C', 'S', 'E'],
      answer: 'C',
    },
    {
      type: 'spelling-practice',
      prompt: 'Spell "café" using French letter names.',
      targetWord: 'CAFÉ',
    },
  ],

  'm1-l2-vowels': [
    {
      type: 'listen-and-repeat',
      prompt: 'Repeat the five basic French vowel sounds.',
      targetSound: 'A, E, I, O, U',
    },
    {
      type: 'sound-comparison',
      prompt: 'Compare the French "u" with the English "oo" sound.',
      audioPair: ['fr_u', 'eng_oo'],
    },
    {
      type: 'listen-and-repeat',
      prompt: 'Practice the difference between the standard E and the accented É.',
      targetSound: 'E, É',
    },
    {
      type: 'sound-identification',
      prompt: 'Which word gets a soft "s" sound thanks to the cedilla?',
      options: ['ça', 'café', 'un', 'ici'],
      answer: 'ça',
    },
    {
      type: 'accent-recognition',
      prompt: 'Identify the accented French letter (accent aigu).',
      options: ['e', 'é', 'a', 'i'],
      answer: 'é',
    },
  ],

  // -------------------------
  // TOPIC 2: Greetings
  // -------------------------
  'm1-l3-greetings': [
    {
      type: 'listen-and-repeat',
      prompt: 'Listen and repeat these common French greetings.',
      targetSound: 'Bonjour, Salut, Bonsoir',
    },
    {
      type: 'phrase-identification',
      prompt: 'Which French word means "Hello"?',
      options: ['Bonjour', 'Merci', 'Bonsoir', 'Au revoir'],
      answer: 'Bonjour',
    },
    {
      type: 'phrase-identification',
      prompt: 'Which French expression means "Good evening"?',
      options: ['Salut', 'Bonjour', 'Bonsoir', 'Merci'],
      answer: 'Bonsoir',
    },
    {
      type: 'meaning-recognition',
      prompt: 'What does "Salut" mean?',
      options: ['Hi / Bye', 'Thank you', 'Good evening', 'Goodbye (formal)'],
      answer: 'Hi / Bye',
    },
    {
      type: 'response-selection',
      prompt: 'How do you say "Thank you" in French?',
      options: ['S\'il vous plaît', 'Pardon', 'Merci', 'De rien'],
      answer: 'Merci',
    },
  ],

  'm1-l4-how-are-you': [
    {
      type: 'listen-and-repeat',
      prompt: 'Listen and repeat the French expression for "How are you?"',
      targetSound: 'Comment ça va ?',
    },
    {
      type: 'phrase-identification',
      prompt: 'Which expression means "How are you?"',
      options: [
        'Comment ça va ?',
        'Bonjour',
        'Merci',
        'Au revoir',
      ],
      answer: 'Comment ça va ?',
    },
    {
      type: 'response-selection',
      prompt: 'How do you say "I am fine" in French?',
      options: [
        'Ça va bien.',
        'Bonjour.',
        'Merci beaucoup.',
        'Au revoir.',
      ],
      answer: 'Ça va bien.',
    },
    {
      type: 'meaning-recognition',
      prompt: 'What does "Et toi ?" mean?',
      options: ['And you?', 'How are you?', 'Me too.', 'Thank you.'],
      answer: 'And you?',
    },
    {
      type: 'response-selection',
      prompt: 'Your day is just so-so. How do you answer "Ça va ?"',
      options: [
        'Comme ci, comme ça.',
        'Ça va bien.',
        'Au revoir.',
        'Merci beaucoup.',
      ],
      answer: 'Comme ci, comme ça.',
    },
  ],

  // -------------------------
  // TOPIC 3: Numbers
  // -------------------------
  'm1-l5-numbers-0-10': [
    {
      type: 'listen-and-repeat',
      prompt: 'Listen and repeat these numbers.',
      targetSound: 'Zéro, un, trois, cinq, dix',
    },
    {
      type: 'meaning-recognition',
      prompt: 'Which number is "cinq"?',
      options: ['3', '4', '5', '6'],
      answer: '5',
    },
    {
      type: 'phrase-identification',
      prompt: 'How do you say "zero" in French?',
      options: ['Zéro', 'Dix', 'Deux', 'Un'],
      answer: 'Zéro',
    },
    {
      type: 'phrase-identification',
      prompt: 'Quick maths: what is 5 + 5 in French?',
      options: ['Trois', 'Cinq', 'Dix', 'Un'],
      answer: 'Dix',
    },
    {
      type: 'spelling-practice',
      prompt: 'Spell the number 3 in French.',
      targetWord: 'TROIS',
    },
  ],

  'm1-l6-numbers-11-20': [
    {
      type: 'listen-and-repeat',
      prompt: 'Listen and repeat these numbers.',
      targetSound: 'Onze, quinze, seize, dix-huit, vingt',
    },
    {
      type: 'meaning-recognition',
      prompt: 'Which number is "quinze"?',
      options: ['14', '15', '16', '20'],
      answer: '15',
    },
    {
      type: 'phrase-identification',
      prompt: 'How do you say "twenty" in French?',
      options: ['Douze', 'Seize', 'Dix-neuf', 'Vingt'],
      answer: 'Vingt',
    },
    {
      type: 'phrase-identification',
      prompt: 'Your friend has "onze" cookies. How many is that?',
      options: ['11', '12', '15', '16'],
      answer: '11',
    },
    {
      type: 'spelling-practice',
      prompt: 'Spell the number 16 in French.',
      targetWord: 'SEIZE',
    },
  ],

  // -------------------------
  // TOPIC 4: Identity
  // -------------------------
  'm1-l7-name-identity': [
    {
      type: 'listen-and-repeat',
      prompt: 'Practice introducing yourself.',
      targetSound: 'Je m\'appelle...',
    },
    {
      type: 'listen-and-repeat',
      prompt: 'Practice asking someone their name informally.',
      targetSound: 'Comment tu t\'appelles ?',
    },
    {
      type: 'phrase-identification',
      prompt: 'How do you say "My name is..." in French?',
      options: ['Je suis...', 'Je m\'appelle...', 'Comment ça va ?', 'Enchanté'],
      answer: 'Je m\'appelle...',
    },
    {
      type: 'response-selection',
      prompt: 'If someone asks "Comment tu t\'appelles ?", how do you reply?',
      options: [
        'Ça va bien.',
        'Je m\'appelle Alex.',
        'Bonjour.',
        'Merci.',
      ],
      answer: 'Je m\'appelle Alex.',
    },
    {
      type: 'spelling-practice',
      prompt: 'Spell the French word for "Me / As for me" (used for emphasis, e.g., "___, c\'est Paul").',
      targetWord: 'MOI',
    },
  ],

  'm1-l8-age-nationality': [
    {
      type: 'listen-and-repeat',
      prompt: 'Practice saying your nationality.',
      targetSound: 'Je suis français. / Je suis française.',
    },
    {
      type: 'listen-and-repeat',
      prompt: 'Practice saying where you are from.',
      targetSound: 'Je viens de Montréal.',
    },
    {
      type: 'phrase-identification',
      prompt: 'How do you say "I am 20 years old" in French? (Hint: French uses "I have 20 years").',
      options: [
        'Je suis vingt ans.',
        'J\'ai vingt ans.',
        'J\'aime vingt ans.',
        'Je m\'appelle vingt ans.'
      ],
      answer: 'J\'ai vingt ans.',
    },
    {
      type: 'response-selection',
      prompt: 'If a woman is saying she is French, which form does she use?',
      options: [
        'Je suis français.',
        'Je suis française.',
        'J\'ai français.',
        'Je m\'appelle français.'
      ],
      answer: 'Je suis française.',
    },
    {
      type: 'meaning-recognition',
      prompt: 'What does "D\'où viens-tu ?" mean?',
      options: ['Where are you from?', 'How old are you?', 'What is your name?', 'How are you?'],
      answer: 'Where are you from?',
    },
  ],

  // -------------------------
  // TOPIC 5: Sentence Building
  // -------------------------
  'm1-l9-basic-sentence-building': [
    {
      type: 'sentence-builder',
      prompt: 'Translate: "I am ready." (masculine)',
      options: ['Je', 'suis', 'prêt', 'm\'appelle', 'bien'],
      answer: 'Je suis prêt',
    },
    {
      type: 'sentence-builder',
      prompt: 'Translate: "He is French."',
      options: ['Il', 'est', 'français', 'Je', 'suis'],
      answer: 'Il est français',
    },
    {
      type: 'sentence-builder',
      prompt: 'Translate: "I am 20 years old." (I have 20 years)',
      options: ['J\'ai', 'vingt', 'ans', 'suis', 'Je'],
      answer: 'J\'ai vingt ans',
    },
    {
      type: 'sentence-builder',
      prompt: 'Translate: "And you, how are you?"',
      options: ['Et', 'toi', 'comment', 'ça', 'va', 'suis'],
      answer: 'Et toi comment ça va',
    },
    {
      type: 'phrase-identification',
      prompt: 'Which sentence is grammatically correct?',
      options: [
        'Suis je content.',
        'Je suis content.',
        'Content je suis.',
        'Je content suis.'
      ],
      answer: 'Je suis content.',
    },
  ],

  // -------------------------
  // TOPIC 6: Conversation
  // -------------------------
  'm1-l10-first-conversation': [
    {
      type: 'listen-and-repeat',
      prompt: 'Practice a full introduction.',
      targetSound: 'Bonjour, je m\'appelle Lucas. J\'ai vingt ans.',
    },
    {
      type: 'meaning-recognition',
      prompt: 'In a conversation, what does "Enchanté(e)" mean?',
      options: ['Nice to meet you', 'Goodbye', 'See you soon', 'Please'],
      answer: 'Nice to meet you',
    },
    {
      type: 'response-selection',
      prompt: 'Complete the conversation: "Bonjour ! Comment ça va ?"',
      options: [
        'Je m\'appelle Sarah.',
        'Vingt ans.',
        'Salut ! Ça va bien, et toi ?',
        'Je suis français.'
      ],
      answer: 'Salut ! Ça va bien, et toi ?',
    },
    {
      type: 'response-selection',
      prompt: 'Complete the conversation: "Enchanté, je m\'appelle Thomas. Et toi ?"',
      options: [
        'Moi, c\'est Marie. Enchantée !',
        'J\'ai vingt ans.',
        'Ça va mal.',
        'Trois.'
      ],
      answer: 'Moi, c\'est Marie. Enchantée !',
    },
    {
      type: 'response-selection',
      prompt: 'If someone says "Je viens de Paris. Et toi ?", what is a good reply?',
      options: [
        'Je m\'appelle Thomas.',
        'Moi, je viens de Londres.',
        'J\'ai vingt ans.',
        'Au revoir.'
      ],
      answer: 'Moi, je viens de Londres.',
    },
  ],

  // -------------------------
  // TOPIC 7: Final Challenge
  // -------------------------
  'm1-l11-final-challenge': [
    {
      type: 'meaning-recognition',
      prompt: 'Select the correct translation for "Good evening, my name is Paul."',
      options: [
        'Bonjour, comment ça va Paul.',
        'Bonsoir, je m\'appelle Paul.',
        'Salut, je suis Paul.',
        'Au revoir, Paul.'
      ],
      answer: 'Bonsoir, je m\'appelle Paul.',
    },
    {
      type: 'phrase-identification',
      prompt: 'Match the number: 18',
      options: ['Seize', 'Dix-sept', 'Dix-huit', 'Dix-neuf'],
      answer: 'Dix-huit',
    },
    {
      type: 'sentence-builder',
      prompt: 'Build the greeting: "Hello, how are you?"',
      options: ['Bonjour', 'comment', 'ça', 'va', 'merci', 'bien'],
      answer: 'Bonjour comment ça va',
    },
    {
      type: 'sentence-builder',
      prompt: 'Build the sentence: "I am 25 years old." (25 = vingt-cinq)',
      options: ['J\'ai', 'vingt-cinq', 'ans', 'Je', 'suis', 'm\'appelle'],
      answer: 'J\'ai vingt-cinq ans',
    },
    {
      type: 'response-selection',
      prompt: 'Choose the best way to politely say goodbye.',
      options: [
        'Bonjour.',
        'Comment ça va ?',
        'Merci et au revoir !',
        'Quinze.'
      ],
      answer: 'Merci et au revoir !',
    },
  ]
};