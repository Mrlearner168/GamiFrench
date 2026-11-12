export const quizContent = {
  // TOPIC 1: Alphabet & Vowels
  'm1-l1-alphabet': [
    {
      id: 'q1',
      question: 'How do you say the French letter "A"?',
      choices: ['ay', 'ah', 'ee', 'oh'],
      answer: 'ah',
      explanation: 'French A is an open "ah", as in "father".',
    },
    {
      id: 'q2',
      question: 'Which letter is called "bay" in French?',
      choices: ['A', 'B', 'C', 'D'],
      answer: 'B',
      explanation: 'B = "bay", C = "say", D = "day".',
    },
    {
      id: 'q3',
      type: 'true-false',
      question: 'In French, G is said "zhay" and J is said "zhee".',
      answer: 'True',
      explanation: 'G and J are swapped compared with English: G = zhay, J = zhee.',
    },
    {
      id: 'q4',
      question: 'How do you say the French letter "D"?',
      choices: ['dee', 'day', 'dah', 'doo'],
      answer: 'day',
      explanation: 'D is "day", like B "bay" and C "say".',
    },
    {
      id: 'q5',
      type: 'sentence-builder',
      question: 'You hear "ah – bay – say". Tap the letters in that order.',
      words: ['A', 'B', 'C', 'G', 'J', 'E'],
      answer: ['A', 'B', 'C'],
      explanation: 'ah = A, bay = B, say = C.',
    },
  ],

  'm1-l2-vowels': [
    {
      id: 'q1',
      question: 'Which word has the French "u" sound (say "ee" with rounded lips)?',
      choices: ['tu', 'vous', 'ici', 'photo'],
      answer: 'tu',
      explanation: 'tu has the French u. vous has "ou", which sounds like English "oo".',
    },
    {
      id: 'q2',
      question: 'What sound does "é" make in "café"?',
      choices: ['ah', 'ay', 'ee', 'oh'],
      answer: 'ay',
      explanation: 'é (accent aigu) is a crisp "ay".',
    },
    {
      id: 'q3',
      question: 'Which pair has the same "eh" sound?',
      choices: ['mère / fête', 'café / mère', 'ici / tu', 'vous / tu'],
      answer: 'mère / fête',
      explanation: 'è and ê both sound "eh", as in "bed".',
    },
    {
      id: 'q4',
      type: 'true-false',
      question: 'The cedilla in "ça" makes the C sound like "k".',
      answer: 'False',
      explanation: 'ç is always a soft "s": ça = "sa".',
    },
    {
      id: 'q5',
      question: 'Which word sounds like "voo"?',
      choices: ['vous', 'tu', 'ici', 'photo'],
      answer: 'vous',
      explanation: 'ou = "oo", so vous = "voo".',
    },
  ],

  // TOPIC 2: Greetings
  'm1-l3-greetings': [
    {
      id: 'q1',
      question: 'What does "Bonjour" mean?',
      choices: ['Good night', 'Hello / Good morning', 'Goodbye', 'Please'],
      answer: 'Hello / Good morning',
      explanation: 'Bonjour is the polite daytime greeting.',
    },
    {
      id: 'q2',
      question: 'It is 8 p.m. and you walk into a shop. What do you say?',
      choices: ['Bonjour', 'Bonsoir', 'Salut', 'Au revoir'],
      answer: 'Bonsoir',
      explanation: 'Bonsoir from about 6 p.m. Salut is too casual for a shop.',
    },
    {
      id: 'q3',
      question: 'How do you politely say "please" to a shopkeeper?',
      choices: ['S\'il vous plaît', 'Merci', 'Salut', 'Au revoir'],
      answer: 'S\'il vous plaît',
      explanation: 'S\'il vous plaît is the polite "please".',
    },
    {
      id: 'q4',
      type: 'true-false',
      question: '"Salut" is a good way to greet your teacher.',
      answer: 'False',
      explanation: 'Salut is informal, for friends and family. Say "Bonjour, Madame / Monsieur".',
    },
    {
      id: 'q5',
      type: 'sentence-builder',
      question: 'Build: "Thank you very much, goodbye!"',
      words: ['Merci', 'beaucoup', 'au', 'revoir', 'bonsoir', 'salut'],
      answer: ['Merci', 'beaucoup', 'au', 'revoir'],
      explanation: 'Merci beaucoup = thank you very much; au revoir = goodbye.',
    },
  ],

  'm1-l4-how-are-you': [
    {
      id: 'q1',
      question: 'How do you ask a friend "How are you?"',
      choices: ['Comment ça va ?', 'Comment allez-vous ?', 'Et vous ?', 'Au revoir.'],
      answer: 'Comment ça va ?',
      explanation: 'Comment ça va ? is informal. Comment allez-vous ? is the formal version.',
    },
    {
      id: 'q2',
      question: 'Your teacher asks "Comment allez-vous ?". What is the best answer?',
      choices: [
        'Ça va bien, merci. Et vous ?',
        'Ça va bien, merci. Et toi ?',
        'Salut !',
        'Au revoir.',
      ],
      answer: 'Ça va bien, merci. Et vous ?',
      explanation: 'Answer a vous question with "et vous ?", not "et toi ?".',
    },
    {
      id: 'q3',
      question: 'What does "Comme ci, comme ça" mean?',
      choices: ['Very well', 'Not well', 'So-so', 'Thank you'],
      answer: 'So-so',
      explanation: 'Comme ci, comme ça = so-so, neither good nor bad.',
    },
    {
      id: 'q4',
      type: 'true-false',
      question: '"Ça ne va pas" means "I am not doing well."',
      answer: 'True',
      explanation: 'ne … pas makes the answer negative.',
    },
    {
      id: 'q5',
      type: 'sentence-builder',
      question: 'To a friend, build: "I am doing well, thank you. And you?"',
      words: ['Ça', 'va', 'bien', 'merci', 'et', 'toi', 'vous', 'pas'],
      answer: ['Ça', 'va', 'bien', 'merci', 'et', 'toi'],
      explanation: 'With a friend: "Ça va bien, merci. Et toi ?"',
    },
  ],

  // TOPIC 3: Numbers
  'm1-l5-numbers-0-10': [
    {
      id: 'q1',
      question: 'What number is "trois"?',
      choices: ['2', '3', '4', '5'],
      answer: '3',
      explanation: 'un (1), deux (2), trois (3).',
    },
    {
      id: 'q2',
      question: 'How do you say "7" in French?',
      choices: ['six', 'sept', 'huit', 'neuf'],
      answer: 'sept',
      explanation: 'six (6), sept (7), huit (8), neuf (9). The p of sept is silent.',
    },
    {
      id: 'q3',
      question: 'The price tag says "Dix euros". How much is it?',
      choices: ['2 euros', '6 euros', '9 euros', '10 euros'],
      answer: '10 euros',
      explanation: 'dix = 10. Before a vowel it sounds "deez": dix euros.',
    },
    {
      id: 'q4',
      type: 'true-false',
      question: '"Quatre" is the number 4.',
      answer: 'True',
      explanation: 'quatre (4), cinq (5), six (6).',
    },
    {
      id: 'q5',
      type: 'sentence-builder',
      question: 'Count down from 3 to 0.',
      words: ['zéro', 'un', 'deux', 'trois', 'dix', 'six'],
      answer: ['trois', 'deux', 'un', 'zéro'],
      explanation: 'trois (3), deux (2), un (1), zéro (0).',
    },
  ],

  'm1-l6-numbers-11-20': [
    {
      id: 'q1',
      question: 'What number is "quinze"?',
      choices: ['14', '15', '16', '50'],
      answer: '15',
      explanation: 'quatorze (14), quinze (15), seize (16).',
    },
    {
      id: 'q2',
      question: 'How do you say "12" in French?',
      choices: ['deux', 'douze', 'treize', 'vingt'],
      answer: 'douze',
      explanation: 'onze (11), douze (12), treize (13).',
    },
    {
      id: 'q3',
      question: 'Which one is 19?',
      choices: ['dix-sept', 'dix-huit', 'dix-neuf', 'neuf'],
      answer: 'dix-neuf',
      explanation: '19 = dix + neuf: dix-neuf.',
    },
    {
      id: 'q4',
      type: 'true-false',
      question: 'In "vingt" on its own, you pronounce the "gt".',
      answer: 'False',
      explanation: 'vingt alone is "van". The t is only heard before a vowel: vingt ans.',
    },
    {
      id: 'q5',
      type: 'sentence-builder',
      question: 'Build: "I am sixteen years old."',
      words: ['J\'ai', 'seize', 'ans', 'Je', 'suis', 'six'],
      answer: ['J\'ai', 'seize', 'ans'],
      explanation: 'Age uses avoir: J\'ai seize ans.',
    },
  ],

  // TOPIC 4: Identity
  'm1-l7-name-identity': [
    {
      id: 'q1',
      question: 'How do you say "My name is…" in French?',
      choices: ['Je suis…', 'Je m\'appelle…', 'Moi, c\'est…', 'Enchanté…'],
      answer: 'Je m\'appelle…',
      explanation: 'Je m\'appelle… is the standard way. Moi, c\'est… is the casual "I\'m…".',
    },
    {
      id: 'q2',
      question: 'You meet your new teacher. How do you ask his name?',
      choices: [
        'Comment vous appelez-vous ?',
        'Comment tu t\'appelles ?',
        'Comment ça va ?',
        'Et toi ?',
      ],
      answer: 'Comment vous appelez-vous ?',
      explanation: 'Use the vous form with a teacher.',
    },
    {
      id: 'q3',
      question: 'Léa writes "Nice to meet you". Which spelling is correct?',
      choices: ['Enchanté', 'Enchantée', 'Enchantés', 'Enchanter'],
      answer: 'Enchantée',
      explanation: 'A woman writes enchantée, with an extra -e. It sounds the same.',
    },
    {
      id: 'q4',
      type: 'true-false',
      question: '"Moi, c\'est Marc" is a casual way to say "I\'m Marc."',
      answer: 'True',
      explanation: 'Moi, c\'est… is a relaxed way to give your name.',
    },
    {
      id: 'q5',
      type: 'sentence-builder',
      question: 'Build: "Hello, my name is Léa."',
      words: ['Bonjour', 'je', 'm\'appelle', 'Léa', 'suis', 'c\'est'],
      answer: ['Bonjour', 'je', 'm\'appelle', 'Léa'],
      explanation: 'Bonjour, je m\'appelle Léa.',
    },
  ],

  'm1-l8-age-nationality': [
    {
      id: 'q1',
      question: 'Which verb do you use to give your age in French?',
      choices: ['être (to be)', 'avoir (to have)', 'venir (to come)', 's\'appeler (to be called)'],
      answer: 'avoir (to have)',
      explanation: 'In French you "have" your age: j\'ai vingt ans.',
    },
    {
      id: 'q2',
      question: 'A girl from Canada says…',
      choices: [
        'Je suis canadien.',
        'Je suis canadienne.',
        'Je suis Canada.',
        'J\'ai canadienne.',
      ],
      answer: 'Je suis canadienne.',
      explanation: '-ien becomes -ienne in the feminine.',
    },
    {
      id: 'q3',
      question: 'How do you say "I come from Canada"?',
      choices: [
        'Je viens du Canada.',
        'Je viens de Canada.',
        'Je viens le Canada.',
        'J\'ai du Canada.',
      ],
      answer: 'Je viens du Canada.',
      explanation: 'Canada is masculine, so de + le becomes du: je viens du Canada.',
    },
    {
      id: 'q4',
      type: 'true-false',
      question: '"Je suis vingt ans" is correct French.',
      answer: 'False',
      explanation: 'Age uses avoir: J\'ai vingt ans.',
    },
    {
      id: 'q5',
      type: 'sentence-builder',
      question: 'Build: "How old are you?" (informal)',
      words: ['Quel', 'âge', 'as-tu', 'es-tu', 'ans', 'où'],
      answer: ['Quel', 'âge', 'as-tu'],
      explanation: 'Quel âge as-tu ? uses avoir (tu as), never être.',
    },
  ],

  // TOPIC 5: Sentence Building
  'm1-l9-basic-sentence-building': [
    {
      id: 'q1',
      question: 'Which subject pronoun means "I" in French?',
      choices: ['Je', 'Tu', 'Il', 'Elle'],
      answer: 'Je',
    },
    {
      id: 'q2',
      question: 'When does "Je" contract into "J\'"?',
      choices: [
        'Before a consonant',
        'Before a vowel or silent H',
        'At the end of a sentence',
        'When asking a question',
      ],
      answer: 'Before a vowel or silent H',
    },
    {
      id: 'q3',
      question: 'What is the correct translation of "He is French"?',
      choices: ['Il est français.', 'Il a français.', 'Il suis français.', 'Il m\'appelle français.'],
      answer: 'Il est français.',
    },
    {
      id: 'q4',
      question: 'What is the standard word order in basic French declarative sentences?',
      choices: [
        'Verb + Subject + Object',
        'Subject + Verb + Object',
        'Object + Subject + Verb',
        'Verb + Object + Subject',
      ],
      answer: 'Subject + Verb + Object',
    },
    {
      id: 'q5',
      question: 'What does "C\'est..." mean in English?',
      choices: ['I have...', 'It is / This is...', 'You are...', 'Where is...'],
      answer: 'It is / This is...',
    },
  ],

  // TOPIC 6: Conversation
  'm1-l10-first-conversation': [
    {
      id: 'q1',
      question: 'Which is a polite, formal greeting to start a dialogue?',
      choices: [
        'Salut, ça va ?',
        'Bonjour, comment allez-vous ?',
        'Au revoir !',
        'De rien !',
      ],
      answer: 'Bonjour, comment allez-vous ?',
    },
    {
      id: 'q2',
      question: 'In a dialogue, what does "Et toi ?" accomplish?',
      choices: [
        'Ends the conversation',
        'Asks the same question back to your conversational partner',
        'Says goodbye',
        'Asks for clarification',
      ],
      answer: 'Asks the same question back to your conversational partner',
    },
    {
      id: 'q3',
      question: 'What does "Bonne journée !" mean?',
      choices: ['Good evening!', 'Have a good day!', 'Good night!', 'Welcome!'],
      answer: 'Have a good day!',
    },
    {
      id: 'q4',
      question: 'Which phrase means "See you soon"?',
      choices: ['À bientôt', 'Enchanté', 'Merci beaucoup', 'S\'il vous plaît'],
      answer: 'À bientôt',
    },
    {
      id: 'q5',
      question: 'If someone says "Je m\'appelle Paul, et vous ?", how should you reply formally?',
      choices: [
        'Ça va bien.',
        'Moi, je m\'appelle Marie.',
        'J\'ai 20 ans.',
        'Au revoir.',
      ],
      answer: 'Moi, je m\'appelle Marie.',
    },
  ],

  // TOPIC 7: Final Challenge
  'm1-l11-final-challenge': [
    {
      id: 'q1',
      question: 'Select the correct sentence for "Hello everyone, my name is Alex."',
      choices: [
        'Bonjour tout le monde, je m\'appelle Alex.',
        'Bonsoir tout le monde, j\'ai Alex.',
        'Salut tout le monde, je suis de Alex.',
        'Au revoir tout le monde, c\'est Alex.',
      ],
      answer: 'Bonjour tout le monde, je m\'appelle Alex.',
    },
    {
      id: 'q2',
      question: 'Which option correctly translates "I am 18 years old"?',
      choices: [
        'Je suis dix-huit ans.',
        'J\'ai dix-huit ans.',
        'Je m\'appelle dix-huit ans.',
        'Je viens de dix-huit ans.',
      ],
      answer: 'J\'ai dix-huit ans.',
    },
    {
      id: 'q3',
      question: 'How do you say "Please" formally?',
      choices: ['De rien', 'S\'il vous plaît', 'Merci', 'Pardon'],
      answer: 'S\'il vous plaît',
    },
    {
      id: 'q4',
      question: 'What does "Je comprends" mean?',
      choices: ['I am ready', 'I understand', 'I agree', 'I don\'t know'],
      answer: 'I understand',
    },
    {
      id: 'q5',
      question: 'Which response best concludes a polite introductory conversation?',
      choices: [
        'Bonjour !',
        'Comment ça va ?',
        'Merci et au revoir !',
        'Zéro.',
      ],
      answer: 'Merci et au revoir !',
    },
  ],
};