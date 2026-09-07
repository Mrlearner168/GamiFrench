
export const lessonCatalog = [
  {
    id: 'module-1',
    title: 'French Foundations',
    flag: '🇫🇷',
    level: 'Pre-A1 / A0',
    description:
      'Build a strong foundation in French through pronunciation, essential expressions, numbers, identity, and simple everyday sentences.',
    
    lessons: [
    
      // =========================================================
      // LESSON 1
      // =========================================================
      {
        id: 'm1-l1-alphabet',
        title: 'French Alphabet & Letter Sounds',
        type: 'pronunciation',
        icon: '🔤',
        description:
          'Learn the 26 letters of the French alphabet and understand how French letter names differ from English.',
      
        learningGoals: [
          'Recognize all 26 French letters',
          'Pronounce common French letter names',
          'Distinguish French letter sounds from English',
          'Spell simple French words aloud',
          'Recognize letters when hearing them spoken'
        ],
      
        items: [
          {
            id: 'letter-a',
            french: 'A',
            english: 'Letter A',
            pronunciation: 'ah',
            example: 'ami',
            exampleEnglish: 'friend',
            examplePronunciation: 'ah-mee',
            usage: 'The letter A is pronounced approximately like the "a" in father.'
          },
          {
            id: 'letter-b',
            french: 'B',
            english: 'Letter B',
            pronunciation: 'bay',
            example: 'bonjour',
            exampleEnglish: 'hello',
            examplePronunciation: 'bohn-zhoor',
            usage: 'The French name of B is pronounced "bay".'
          },
          {
            id: 'letter-c',
            french: 'C',
            english: 'Letter C',
            pronunciation: 'say',
            example: 'café',
            exampleEnglish: 'coffee',
            examplePronunciation: 'ka-fay',
            usage: 'The French name of C is pronounced "say".'
          },
          {
            id: 'letter-d',
            french: 'D',
            english: 'Letter D',
            pronunciation: 'day',
            example: 'deux',
            exampleEnglish: 'two',
            examplePronunciation: 'duh',
            usage: 'The French name of D is pronounced "day".'
          },
          //{
          //  id: 'letter-e',
          //  french: 'E',
          //  english: 'Letter E',
          //  pronunciation: 'uh',
          //  example: 'école',
          //  exampleEnglish: 'school',
          //  examplePronunciation: 'ay-kohl',
          //  usage: 'The letter E has several sounds depending on the word and accent.'
          //}
        ],
      
        practice: [
          {
            type: 'listen-and-repeat',
            prompt: 'Listen and repeat each French letter.',
            targetSound: 'A, B, C, D, E'
          },
          {
            type: 'sound-identification',
            prompt: 'Which French letter is pronounced "bay"?',
            options: ['A', 'B', 'C', 'D'],
            answer: 'B'
          },
          {
            type: 'letter-recognition',
            prompt: 'Which letter do you hear?',
            audioKey: 'letter_c',
            options: ['A', 'B', 'C', 'D'],
            answer: 'C'
          },
          {
            type: 'spelling-practice',
            prompt: 'Spell "café" using French letter names.',
            targetWord: 'CAFÉ'
          }
        ],
      
        speaking: {
          target: 'A, B, C, D, E',
          translation: 'Letters A through E',
          pronunciation: 'ah, bay, say, day, uh'
        },
      
        quiz: [
          {
            id: 'q1',
            question: 'How is the French letter "A" pronounced?',
            choices: ['ay', 'ah', 'ee', 'oh'],
            answer: 'ah'
          },
          {
            id: 'q2',
            question: 'Which French letter is pronounced "bay"?',
            choices: ['A', 'B', 'C', 'D'],
            answer: 'B'
          },
          {
            id: 'q3',
            question: 'Which French letter is pronounced "say"?',
            choices: ['A', 'B', 'C', 'D'],
            answer: 'C'
          }
        ]
      },
    
      // =========================================================
      // LESSON 2
      // =========================================================
      {
        id: 'm1-l2-vowels',
        title: 'French Vowels & Essential Sounds',
        type: 'pronunciation',
        icon: '🗣️',
        description:
          'Learn the basic French vowel sounds and pronunciation patterns that appear throughout beginner French.',
      
        learningGoals: [
          'Recognize French vowel sounds',
          'Practice a, e, i, o, and u',
          'Understand accented vowels',
          'Recognize é, è, ê, and ç',
          'Improve pronunciation before learning longer sentences'
        ],
      
        items: [
          {
            id: 'sound-a',
            french: 'a',
            english: 'a sound',
            pronunciation: 'ah',
            example: 'salut',
            exampleEnglish: 'hi',
            examplePronunciation: 'sah-loo',
            usage: 'Often pronounced like "ah".'
          },
          {
            id: 'sound-i',
            french: 'i',
            english: 'i sound',
            pronunciation: 'ee',
            example: 'ici',
            exampleEnglish: 'here',
            examplePronunciation: 'ee-see',
            usage: 'Usually pronounced like "ee".'
          },
          {
            id: 'sound-o',
            french: 'o',
            english: 'o sound',
            pronunciation: 'oh',
            example: 'orange',
            exampleEnglish: 'orange',
            examplePronunciation: 'oh-rah(n)zh',
            usage: 'Often pronounced like "oh".'
          },
          {
            id: 'sound-u',
            french: 'u',
            english: 'French u sound',
            pronunciation: 'French u',
            example: 'tu',
            exampleEnglish: 'you',
            examplePronunciation: 'French u',
            usage: 'This sound differs from the English "oo" sound.'
          },
          {
            id: 'sound-e-accent',
            french: 'é',
            english: 'e with acute accent',
            pronunciation: 'ay',
            example: 'café',
            exampleEnglish: 'coffee',
            examplePronunciation: 'ka-fay',
            usage: 'Often pronounced like "ay".'
          },
          {
            id: 'sound-c-cedilla',
            french: 'ç',
            english: 'c with cedilla',
            pronunciation: 's',
            example: 'français',
            exampleEnglish: 'French',
            examplePronunciation: 'frahn-say',
            usage: 'The cedilla makes c sound like "s".'
          }
        ],
      
        practice: [
          {
            type: 'listen-and-repeat',
            prompt: 'Repeat the five basic French vowel sounds.',
            targetSound: 'A, E, I, O, U'
          },
          {
            type: 'sound-comparison',
            prompt: 'Compare the French "u" with the English "oo" sound.',
            audioPair: ['fr_u', 'eng_oo']
          },
          {
            type: 'accent-recognition',
            prompt: 'Identify the accented French letter.',
            options: ['e', 'é', 'a', 'i'],
            answer: 'é'
          },
          {
            type: 'sound-identification',
            prompt: 'Which letter combination produces an "s" sound?',
            options: ['C', 'Ç', 'K', 'G'],
            answer: 'Ç'
          }
        ],
      
        speaking: {
          target: 'A, E, I, O, U',
          translation: 'French vowel sounds',
          pronunciation: 'ah, uh, ee, oh, French u'
        },
      
        quiz: [
          {
            id: 'q1',
            question: 'Which French vowel is commonly pronounced "ee"?',
            choices: ['A', 'E', 'I', 'O'],
            answer: 'I'
          },
          {
            id: 'q2',
            question: 'What sound does "é" commonly represent?',
            choices: ['ah', 'ay', 'ee', 'oh'],
            answer: 'ay'
          },
          {
            id: 'q3',
            question: 'What does the cedilla in "ç" do?',
            choices: [
              'Makes C sound like S',
              'Makes C silent',
              'Makes C sound like K',
              'Makes C sound like G'
            ],
            answer: 'Makes C sound like S'
          }
        ]
      },
    
      // =========================================================
      // LESSON 3
      // =========================================================
      {
        id: 'm1-l3-greetings',
        title: 'Greetings & Polite Expressions',
        type: 'conversation',
        icon: '👋',
        description:
          'Learn the essential greetings and polite expressions used when meeting and speaking with people.',
      
        learningGoals: [
          'Say hello and goodbye',
          'Distinguish formal and informal greetings',
          'Say please and thank you',
          'Apologize and get someone’s attention politely',
          'Use greetings in short conversations'
        ],
      
        items: [
          {
            id: 'bonjour',
            french: 'Bonjour',
            english: 'Hello / Good morning',
            pronunciation: 'bohn-zhoor',
            example: 'Bonjour, Madame.',
            exampleEnglish: 'Hello, Madam.',
            examplePronunciation: 'bohn-zhoor, mah-dam',
            usage: 'Standard polite greeting.'
          },
         // {
         //   id: 'salut',
         //   french: 'Salut',
         //   english: 'Hi / Bye',
         //   pronunciation: 'sah-loo',
         //   example: 'Salut, Paul !',
         //   exampleEnglish: 'Hi, Paul!',
         //   examplePronunciation: 'sah-loo, pohl',
         //   usage: 'Informal greeting used with friends and people you know well.'
         // },
         // {
         //   id: 'bonsoir',
         //   french: 'Bonsoir',
         //   english: 'Good evening',
         //   pronunciation: 'bohn-swahr',
         //   example: 'Bonsoir, Monsieur.',
         //   exampleEnglish: 'Good evening, sir.',
         //   examplePronunciation: 'bohn-swahr, muh-syuh',
         //   usage: 'Used when greeting someone in the evening.'
         // },
         // {
         //   id: 'au-revoir',
         //   french: 'Au revoir',
         //   english: 'Goodbye',
         //   pronunciation: 'oh ruh-vwahr',
         //   example: 'Au revoir, à demain.',
         //   exampleEnglish: 'Goodbye, see you tomorrow.',
         //   examplePronunciation: 'oh ruh-vwahr, ah duh-man',
         //   usage: 'Common way to say goodbye.'
         // },
         // {
         //   id: 'merci',
         //   french: 'Merci',
         //   english: 'Thank you',
         //   pronunciation: 'mehr-see',
         //   example: 'Merci beaucoup.',
         //   exampleEnglish: 'Thank you very much.',
         //   examplePronunciation: 'mehr-see boh-koo',
         //   usage: 'Used to express thanks.'
         // },
         // {
         //   id: 's-il-vous-plait',
         //   french: "S'il vous plaît",
         //   english: 'Please',
         //   pronunciation: 'seel voo pleh',
         //   example: "Un café, s'il vous plaît.",
         //   exampleEnglish: 'A coffee, please.',
         //   examplePronunciation: 'uhn ka-fay, seel voo pleh',
         //   usage: 'Polite way to make a request.'
         // }
        ],
      
        practice: [
          {
            type: 'word-matching',
            pairs: [
              { french: 'Bonjour', english: 'Hello' },
             // { french: 'Merci', english: 'Thank you' },
             // { french: 'Au revoir', english: 'Goodbye' },
             // { french: 'S’il vous plaît', english: 'Please' }
            ]
          },
          {
            type: 'conversation-choice',
            prompt: 'You meet your teacher in the morning. What should you say?',
            choices: ['Salut !', 'Bonjour !', 'Au revoir !'],
            answer: 'Bonjour !'
          },
          {
            type: 'conversation-choice',
            prompt: 'Your friend arrives. Which informal greeting fits?',
            choices: ['Bonsoir', 'Salut', 'Au revoir'],
            answer: 'Salut'
          },
          {
            type: 'listen-and-repeat',
            prompt: 'Repeat the complete polite greeting.',
            targetSound: 'Bonjour, merci, s’il vous plaît.'
          }
        ],
      
        speaking: {
          target: 'Bonjour, merci beaucoup.',
          translation: 'Hello, thank you very much.',
          pronunciation: 'bohn-zhoor, mehr-see boh-koo'
        },
      
        quiz: [
          {
            id: 'q1',
            question: 'Which greeting is commonly used with friends?',
            choices: ['Bonjour', 'Salut', 'Bonsoir', 'Au revoir'],
            answer: 'Salut'
          },
          {
            id: 'q2',
            question: 'What does "Merci" mean?',
            choices: ['Hello', 'Goodbye', 'Thank you', 'Please'],
            answer: 'Thank you'
          },
          {
            id: 'q3',
            question: 'Which expression means "Please"?',
            choices: [
              'Merci',
              'Bonjour',
              "S'il vous plaît",
              'Au revoir'
            ],
            answer: "S'il vous plaît"
          }
        ]
      },
    
      // =========================================================
      // LESSON 4
      // =========================================================
      {
        id: 'm1-l4-how-are-you',
        title: 'How Are You? Basic Responses',
        type: 'conversation',
        icon: '😊',
        description:
          'Learn how to ask how someone is and respond with simple expressions about your condition or mood.',
      
        learningGoals: [
          'Ask someone how they are',
          'Use formal and informal forms',
          'Say that you are well',
          'Express basic positive and negative feelings',
          'Maintain a short greeting conversation'
        ],
      
        items: [
          {
            id: 'comment-ca-va',
            french: 'Comment ça va ?',
            english: 'How are you?',
            pronunciation: 'koh-mahn sah vah',
            example: 'Bonjour ! Comment ça va ?',
            exampleEnglish: 'Hello! How are you?',
            examplePronunciation: 'bohn-zhoor, koh-mahn sah vah',
            usage: 'Common everyday expression.'
          },
          {
            id: 'ca-va',
            french: 'Ça va.',
            english: 'I’m fine / It’s okay.',
            pronunciation: 'sah vah',
            example: 'Ça va bien.',
            exampleEnglish: 'I am doing well.',
            examplePronunciation: 'sah vah byan',
            usage: 'Common response to "Comment ça va ?".'
          },
          {
            id: 'tres-bien',
            french: 'Très bien.',
            english: 'Very well.',
            pronunciation: 'treh byan',
            example: 'Merci, très bien.',
            exampleEnglish: 'Thank you, very well.',
            examplePronunciation: 'mehr-see, treh byan',
            usage: 'Positive response.'
          },
          {
            id: 'comme-ci-comme-ca',
            french: 'Comme ci, comme ça.',
            english: 'So-so.',
            pronunciation: 'kohm see kohm sah',
            example: 'Ça va ? — Comme ci, comme ça.',
            exampleEnglish: 'How are you? — So-so.',
            examplePronunciation: 'sah vah, kohm see kohm sah',
            usage: 'Used when you feel neither particularly good nor bad.'
          }
        ],
      
        practice: [
          {
            type: 'conversation-choice',
            prompt: 'Someone asks "Comment ça va ?" How do you say you are doing well?',
            choices: ['Ça va bien.', 'Au revoir.', 'Merci beaucoup.'],
            answer: 'Ça va bien.'
          },
          {
            type: 'dialogue-completion',
            prompt: 'Bonjour ! Comment ça va ?',
            choices: ['Ça va bien.', 'Bonsoir.', 'Je m’appelle.'],
            answer: 'Ça va bien.'
          },
          {
            type: 'listen-and-repeat',
            prompt: 'Practice the complete exchange.',
            targetSound: 'Comment ça va ? — Ça va bien, merci.'
          }
        ],
      
        speaking: {
          target: 'Bonjour ! Comment ça va ? Ça va bien, merci.',
          translation: 'Hello! How are you? I am doing well, thank you.',
          pronunciation:
            'bohn-zhoor, koh-mahn sah vah, sah vah byan mehr-see'
        },
      
        quiz: [
          {
            id: 'q1',
            question: 'What does "Comment ça va ?" mean?',
            choices: ['What is your name?', 'How are you?', 'Where are you from?', 'How old are you?'],
            answer: 'How are you?'
          },
          {
            id: 'q2',
            question: 'How do you say "Very well"?',
            choices: ['Très bien', 'Au revoir', 'Salut', 'Merci'],
            answer: 'Très bien'
          }
        ]
      },
    
      // =========================================================
      // LESSON 5
      // =========================================================
      {
        id: 'm1-l5-numbers-0-10',
        title: 'Numbers 0–10',
        type: 'numbers',
        icon: '🔢',
        description:
          'Learn the first French numbers and use them in simple everyday situations.',
      
        learningGoals: [
          'Count from 0 to 10',
          'Recognize numbers when spoken',
          'Match French numbers with digits',
          'Use numbers in simple expressions',
          'Practice pronunciation through repetition'
        ],
      
        items: [
          {
            id: 'zero',
            french: 'zéro',
            english: 'zero',
            pronunciation: 'zay-roh',
            example: 'zéro',
            exampleEnglish: 'zero',
            examplePronunciation: 'zay-roh'
          },
          {
            id: 'un',
            french: 'un',
            english: 'one',
            pronunciation: 'uhn',
            example: 'un café',
            exampleEnglish: 'one coffee',
            examplePronunciation: 'uhn ka-fay'
          },
          {
            id: 'deux',
            french: 'deux',
            english: 'two',
            pronunciation: 'duh',
            example: 'deux cafés',
            exampleEnglish: 'two coffees',
            examplePronunciation: 'duh ka-fay'
          },
          {
            id: 'trois',
            french: 'trois',
            english: 'three',
            pronunciation: 'trwah',
            example: 'trois amis',
            exampleEnglish: 'three friends',
            examplePronunciation: 'trwah zah-mee'
          },
          {
            id: 'quatre',
            french: 'quatre',
            english: 'four',
            pronunciation: 'katr',
            example: 'quatre livres',
            exampleEnglish: 'four books',
            examplePronunciation: 'katr leevr'
          },
          {
            id: 'cinq',
            french: 'cinq',
            english: 'five',
            pronunciation: 'sank',
            example: 'cinq euros',
            exampleEnglish: 'five euros',
            examplePronunciation: 'sank uh-roh'
          },
          {
            id: 'six',
            french: 'six',
            english: 'six',
            pronunciation: 'sees',
            example: 'six personnes',
            exampleEnglish: 'six people',
            examplePronunciation: 'sees pair-sohn'
          },
          {
            id: 'sept',
            french: 'sept',
            english: 'seven',
            pronunciation: 'set',
            example: 'sept jours',
            exampleEnglish: 'seven days',
            examplePronunciation: 'set zhoor'
          },
          {
            id: 'huit',
            french: 'huit',
            english: 'eight',
            pronunciation: 'weet',
            example: 'huit ans',
            exampleEnglish: 'eight years',
            examplePronunciation: 'weet ahn'
          },
          {
            id: 'neuf',
            french: 'neuf',
            english: 'nine',
            pronunciation: 'nurf',
            example: 'neuf livres',
            exampleEnglish: 'nine books',
            examplePronunciation: 'nurf leevr'
          },
          {
            id: 'dix',
            french: 'dix',
            english: 'ten',
            pronunciation: 'dees',
            example: 'dix euros',
            exampleEnglish: 'ten euros',
            examplePronunciation: 'dees uh-roh'
          }
        ],
      
        practice: [
          {
            type: 'number-recognition',
            targetNumber: 5,
            choices: ['Trois', 'Cinq', 'Sept', 'Dix'],
            answer: 'Cinq'
          },
          {
            type: 'listen-to-number',
            audioKey: 'num_7',
            answer: 7
          },
          {
            type: 'number-sequence',
            sequence: ['Un', 'Deux', '___', 'Quatre'],
            answer: 'Trois'
          },
          {
            type: 'counting-challenge',
            prompt: 'Count from zero to ten in French.',
            targetSequence:
              'zéro, un, deux, trois, quatre, cinq, six, sept, huit, neuf, dix'
          }
        ],
      
        speaking: {
          target: 'Un, deux, trois, quatre, cinq.',
          translation: 'One, two, three, four, five.',
          pronunciation: 'uhn, duh, trwah, katr, sank'
        },
      
        quiz: [
          {
            id: 'q1',
            question: 'What does "deux" mean?',
            choices: ['One', 'Two', 'Three', 'Four'],
            answer: 'Two'
          },
          {
            id: 'q2',
            question: 'What is the French word for five?',
            choices: ['quatre', 'cinq', 'six', 'sept'],
            answer: 'cinq'
          },
          {
            id: 'q3',
            question: 'What does "dix" mean?',
            choices: ['Eight', 'Nine', 'Ten', 'Seven'],
            answer: 'Ten'
          }
        ]
      },
    
      // =========================================================
      // LESSON 6
      // =========================================================
      {
        id: 'm1-l6-numbers-11-20',
        title: 'Numbers 11–20',
        type: 'numbers',
        icon: '🔢',
        description:
          'Continue counting in French and practice recognizing numbers from eleven to twenty.',
      
        learningGoals: [
          'Count from 11 to 20',
          'Recognize spoken numbers',
          'Read numbers in written French',
          'Use numbers in simple real-world contexts',
          'Build confidence with French number patterns'
        ],
      
        items: [
          {
            id: 'onze',
            french: 'onze',
            english: 'eleven',
            pronunciation: 'onz',
            example: 'onze',
            exampleEnglish: 'eleven',
            examplePronunciation: 'onz'
          },
          {
            id: 'douze',
            french: 'douze',
            english: 'twelve',
            pronunciation: 'dooz',
            example: 'douze',
            exampleEnglish: 'twelve',
            examplePronunciation: 'dooz'
          },
          {
            id: 'treize',
            french: 'treize',
            english: 'thirteen',
            pronunciation: 'trez',
            example: 'treize',
            exampleEnglish: 'thirteen',
            examplePronunciation: 'trez'
          },
          {
            id: 'quatorze',
            french: 'quatorze',
            english: 'fourteen',
            pronunciation: 'ka-torz',
            example: 'quatorze',
            exampleEnglish: 'fourteen',
            examplePronunciation: 'ka-torz'
          },
          {
            id: 'quinze',
            french: 'quinze',
            english: 'fifteen',
            pronunciation: 'kanz',
            example: 'quinze',
            exampleEnglish: 'fifteen',
            examplePronunciation: 'kanz'
          },
          {
            id: 'seize',
            french: 'seize',
            english: 'sixteen',
            pronunciation: 'sez',
            example: 'seize',
            exampleEnglish: 'sixteen',
            examplePronunciation: 'sez'
          },
          {
            id: 'dix-sept',
            french: 'dix-sept',
            english: 'seventeen',
            pronunciation: 'dees-set',
            example: 'dix-sept',
            exampleEnglish: 'seventeen',
            examplePronunciation: 'dees-set'
          },
          {
            id: 'dix-huit',
            french: 'dix-huit',
            english: 'eighteen',
            pronunciation: 'deez-weet',
            example: 'dix-huit',
            exampleEnglish: 'eighteen',
            examplePronunciation: 'deez-weet'
          },
          {
            id: 'dix-neuf',
            french: 'dix-neuf',
            english: 'nineteen',
            pronunciation: 'deez-nurf',
            example: 'dix-neuf',
            exampleEnglish: 'nineteen',
            examplePronunciation: 'deez-nurf'
          },
          {
            id: 'vingt',
            french: 'vingt',
            english: 'twenty',
            pronunciation: 'van',
            example: 'vingt euros',
            exampleEnglish: 'twenty euros',
            examplePronunciation: 'van uh-roh'
          }
        ],
      
        practice: [
          {
            type: 'number-recognition',
            targetNumber: 15,
            choices: ['quatorze', 'quinze', 'seize', 'dix-sept'],
            answer: 'quinze'
          },
          {
            type: 'listen-to-number',
            audioKey: 'num_18',
            answer: 18
          },
          {
            type: 'number-sequence',
            sequence: ['dix-sept', 'dix-huit', '___', 'vingt'],
            answer: 'dix-neuf'
          },
          {
            type: 'number-speed-round',
            prompt: 'Say 11–20 aloud in French.',
            targetSequence:
              'onze, douze, treize, quatorze, quinze, seize, dix-sept, dix-huit, dix-neuf, vingt'
          }
        ],
      
        speaking: {
          target: 'Dix, quinze, vingt.',
          translation: 'Ten, fifteen, twenty.',
          pronunciation: 'dees, kanz, van'
        },
      
        quiz: [
          {
            id: 'q1',
            question: 'What does "onze" mean?',
            choices: ['Ten', 'Eleven', 'Twelve', 'Thirteen'],
            answer: 'Eleven'
          },
          {
            id: 'q2',
            question: 'What does "quinze" mean?',
            choices: ['Fourteen', 'Fifteen', 'Sixteen', 'Seventeen'],
            answer: 'Fifteen'
          },
          {
            id: 'q3',
            question: 'What is the French word for twenty?',
            choices: ['dix', 'dix-neuf', 'vingt', 'douze'],
            answer: 'vingt'
          }
        ]
      },
    
      // =========================================================
      // LESSON 7
      // =========================================================
      {
        id: 'm1-l7-name-identity',
        title: 'Introducing Yourself',
        type: 'conversation',
        icon: '🙋',
        description:
          'Learn how to say your name and introduce yourself using simple French sentences.',
      
        learningGoals: [
          'Say your name',
          'Ask someone’s name',
          'Use "Je m’appelle"',
          'Understand basic personal introductions',
          'Create a short self-introduction'
        ],
      
        items: [
          {
            id: 'je-m-appelle',
            french: "Je m'appelle",
            english: 'My name is',
            pronunciation: 'zhuh mah-pel',
            example: "Je m'appelle Marie.",
            exampleEnglish: 'My name is Marie.',
            examplePronunciation: 'zhuh mah-pel mah-ree',
            usage: 'Common way to introduce your name.'
          },
          {
            id: 'comment-tu-t-appelles',
            french: "Comment tu t'appelles ?",
            english: 'What is your name?',
            pronunciation: 'koh-mahn too tah-pel',
            example: "Bonjour ! Comment tu t'appelles ?",
            exampleEnglish: 'Hello! What is your name?',
            examplePronunciation: 'bohn-zhoor, koh-mahn too tah-pel',
            usage: 'Informal form.'
          },
          {
            id: 'je-suis',
            french: 'Je suis',
            english: 'I am',
            pronunciation: 'zhuh swee',
            example: 'Je suis étudiant.',
            exampleEnglish: 'I am a student.',
            examplePronunciation: 'zhuh swee ay-too-dyahn',
            usage: 'Used to identify yourself or describe yourself.'
          }
        ],
      
        practice: [
          {
            type: 'sentence-builder',
            prompt: 'Build the sentence: My name is Alex.',
            words: ['Je', "m'appelle", 'Alex'],
            answer: "Je m'appelle Alex."
          },
          {
            type: 'conversation-choice',
            prompt: 'Someone asks "Comment tu t’appelles ?" What should you answer?',
            choices: [
              "Je m'appelle Alex.",
              'Je vais bien.',
              'Au revoir.'
            ],
            answer: "Je m'appelle Alex."
          },
          {
            type: 'roleplay',
            scenario: 'Meet a new classmate and introduce yourself.',
            targetSentence: "Bonjour ! Je m'appelle Alex."
          }
        ],
      
        speaking: {
          target: "Bonjour ! Je m'appelle Alex.",
          translation: 'Hello! My name is Alex.',
          pronunciation: 'bohn-zhoor, zhuh mah-pel ah-leks'
        },
      
        quiz: [
          {
            id: 'q1',
            question: 'What does "Je m’appelle" mean?',
            choices: ['I am', 'My name is', 'I have', 'I live'],
            answer: 'My name is'
          },
          {
            id: 'q2',
            question: 'How do you ask someone’s name informally?',
            choices: [
              "Comment tu t'appelles ?",
              'Comment ça va ?',
              'Où habites-tu ?',
              'Quel âge as-tu ?'
            ],
            answer: "Comment tu t'appelles ?"
          }
        ]
      },
    
      // =========================================================
      // LESSON 8
      // =========================================================
      {
        id: 'm1-l8-age-nationality',
        title: 'Age, Nationality & Where You Are From',
        type: 'identity',
        icon: '🌍',
        description:
          'Learn to talk about your age, nationality, and country of origin using simple French structures.',
      
        learningGoals: [
          'Say your age correctly',
          'Ask someone’s age',
          'Say where you are from',
          'Identify basic nationalities',
          'Combine several personal details into one introduction'
        ],
      
        items: [
          {
            id: 'j-ai-age',
            french: "J'ai ... ans",
            english: 'I am ... years old',
            pronunciation: 'zhay ... ahn',
            example: "J'ai vingt ans.",
            exampleEnglish: 'I am twenty years old.',
            examplePronunciation: 'zhay van ahn',
            usage: 'French expresses age with avoir, meaning "to have".'
          },
          {
            id: 'quel-age-as-tu',
            french: 'Quel âge as-tu ?',
            english: 'How old are you?',
            pronunciation: 'kel ahzh ah too',
            example: 'Quel âge as-tu ?',
            exampleEnglish: 'How old are you?',
            examplePronunciation: 'kel ahzh ah too',
            usage: 'Informal way to ask someone’s age.'
          },
          {
            id: 'je-viens-de',
            french: 'Je viens de',
            english: 'I am from',
            pronunciation: 'zhuh vee-ehn duh',
            example: 'Je viens du Canada.',
            exampleEnglish: 'I am from Canada.',
            examplePronunciation: 'zhuh vee-ehn doo kah-nah-dah',
            usage: 'Used to state your origin.'
          },
          {
            id: 'je-suis-canadien',
            french: 'Je suis canadien / canadienne',
            english: 'I am Canadian',
            pronunciation: 'zhuh swee kah-nah-dyen',
            example: 'Je suis canadien.',
            exampleEnglish: 'I am Canadian.',
            examplePronunciation: 'zhuh swee kah-nah-dyen',
            usage: 'Nationality adjective changes according to gender.'
          }
        ],
      
        practice: [
          {
            type: 'sentence-builder',
            prompt: 'Build: I am 20 years old.',
            words: ['J’ai', 'vingt', 'ans'],
            answer: "J'ai vingt ans."
          },
          {
            type: 'conversation-choice',
            prompt: 'How do you say "I am from Canada"?',
            choices: [
              'Je suis Canada.',
              'Je viens du Canada.',
              'J’ai Canada.',
              'Je Canada.'
            ],
            answer: 'Je viens du Canada.'
          },
          {
            type: 'profile-builder',
            prompt: 'Create a short profile with your name, age, and country.',
            targetSentence:
              "Je m'appelle Alex. J'ai vingt ans. Je viens du Canada."
          }
        ],
      
        speaking: {
          target:
            "Je m'appelle Alex. J'ai vingt ans. Je viens du Canada.",
          translation:
            'My name is Alex. I am twenty years old. I am from Canada.',
          pronunciation:
            'zhuh mah-pel ah-leks, zhay van ahn, zhuh vee-ehn doo kah-nah-dah'
        },
      
        quiz: [
          {
            id: 'q1',
            question: 'How do you correctly say "I am 20 years old"?',
            choices: [
              'Je suis 20 ans.',
              "J'ai 20 ans.",
              'Je fais 20 ans.',
              "Je m'appelle 20 ans."
            ],
            answer: "J'ai 20 ans."
          },
          {
            id: 'q2',
            question: 'What does "Je viens du Canada" mean?',
            choices: [
              'I live in Canada.',
              'I am from Canada.',
              'I am going to Canada.',
              'I like Canada.'
            ],
            answer: 'I am from Canada.'
          }
        ]
      },
    
      // =========================================================
      // LESSON 9
      // =========================================================
      {
        id: 'm1-l9-basic-sentence-building',
        title: 'Build Your First French Sentences',
        type: 'grammar',
        icon: '🧩',
        description:
          'Combine the French words and expressions you have learned to create simple meaningful sentences.',
      
        learningGoals: [
          'Understand basic French sentence order',
          'Use subject + verb structures',
          'Combine familiar vocabulary',
          'Create simple statements',
          'Understand the difference between French and English sentence patterns'
        ],
      
        items: [
          {
            id: 'je-suis-etudiant',
            french: 'Je suis étudiant.',
            english: 'I am a student.',
            pronunciation: 'zhuh swee ay-too-dyahn',
            example: 'Je suis étudiant.',
            exampleEnglish: 'I am a student.',
            examplePronunciation: 'zhuh swee ay-too-dyahn',
            usage: 'Subject + verb + description.'
          },
          {
            id: 'je-m-appelle-alex',
            french: "Je m'appelle Alex.",
            english: 'My name is Alex.',
            pronunciation: 'zhuh mah-pel ah-leks',
            example: "Je m'appelle Alex.",
            exampleEnglish: 'My name is Alex.',
            examplePronunciation: 'zhuh mah-pel ah-leks',
            usage: 'Basic self-introduction.'
          },
          {
            id: 'j-ai-vingt-ans',
            french: "J'ai vingt ans.",
            english: 'I am twenty years old.',
            pronunciation: 'zhay van ahn',
            example: "J'ai vingt ans.",
            exampleEnglish: 'I am twenty years old.',
            examplePronunciation: 'zhay van ahn',
            usage: 'French uses avoir when expressing age.'
          },
          {
            id: 'je-viens-du-canada',
            french: 'Je viens du Canada.',
            english: 'I am from Canada.',
            pronunciation: 'zhuh vee-ehn doo kah-nah-dah',
            example: 'Je viens du Canada.',
            exampleEnglish: 'I am from Canada.',
            examplePronunciation: 'zhuh vee-ehn doo kah-nah-dah',
            usage: 'Basic expression of origin.'
          }
        ],
      
        practice: [
          {
            type: 'sentence-builder',
            prompt: 'Build: I am a student.',
            words: ['Je', 'suis', 'étudiant'],
            answer: 'Je suis étudiant.'
          },
          {
            type: 'sentence-builder',
            prompt: 'Build: My name is Alex.',
            words: ['Je', "m'appelle", 'Alex'],
            answer: "Je m'appelle Alex."
          },
          {
            type: 'sentence-builder',
            prompt: 'Build: I am from Canada.',
            words: ['Je', 'viens', 'du', 'Canada'],
            answer: 'Je viens du Canada.'
          },
          {
            type: 'translation',
            prompt: 'Translate "I am twenty years old."',
            answer: "J'ai vingt ans."
          }
        ],
      
        speaking: {
          target:
            "Je m'appelle Alex. Je suis étudiant. J'ai vingt ans.",
          translation:
            'My name is Alex. I am a student. I am twenty years old.',
          pronunciation:
            'zhuh mah-pel ah-leks, zhuh swee ay-too-dyahn, zhay van ahn'
        },
      
        quiz: [
          {
            id: 'q1',
            question: 'Which sentence means "I am a student"?',
            choices: [
              'Je suis étudiant.',
              "J'ai étudiant.",
              'Je viens étudiant.',
              "Je m'appelle étudiant."
            ],
            answer: 'Je suis étudiant.'
          },
          {
            id: 'q2',
            question: 'Which sentence means "I am twenty years old"?',
            choices: [
              'Je suis vingt ans.',
              "J'ai vingt ans.",
              'Je viens vingt ans.',
              'Je fais vingt ans.'
            ],
            answer: "J'ai vingt ans."
          },
          {
            id: 'q3',
            question: 'Which sentence means "I am from Canada"?',
            choices: [
              'Je suis du Canada.',
              'Je viens du Canada.',
              'J’ai du Canada.',
              'Je fais du Canada.'
            ],
            answer: 'Je viens du Canada.'
          }
        ]
      },
    
      // =========================================================
      // LESSON 10
      // =========================================================
      {
        id: 'm1-l10-first-conversation',
        title: 'Your First French Conversation',
        type: 'conversation',
        icon: '💬',
        description:
          'Use everything from Module 1 in a short real-life conversation from greeting to personal introduction.',
      
        learningGoals: [
          'Start a basic conversation',
          'Greet another person appropriately',
          'Ask and answer simple personal questions',
          'Use numbers and age naturally',
          'Introduce yourself without relying on English'
        ],
      
        items: [
          {
            id: 'conversation-1',
            french: 'Bonjour !',
            english: 'Hello!',
            pronunciation: 'bohn-zhoor',
            example: 'Bonjour !',
            exampleEnglish: 'Hello!',
            examplePronunciation: 'bohn-zhoor',
            usage: 'Begin a polite conversation.'
          },
          {
            id: 'conversation-2',
            french: "Je m'appelle Alex.",
            english: 'My name is Alex.',
            pronunciation: 'zhuh mah-pel ah-leks',
            example: "Je m'appelle Alex.",
            exampleEnglish: 'My name is Alex.',
            examplePronunciation: 'zhuh mah-pel ah-leks',
            usage: 'Introduce your name.'
          },
          {
            id: 'conversation-3',
            french: "J'ai vingt ans.",
            english: 'I am twenty years old.',
            pronunciation: 'zhay van ahn',
            example: "J'ai vingt ans.",
            exampleEnglish: 'I am twenty years old.',
            examplePronunciation: 'zhay van ahn',
            usage: 'State your age.'
          },
          {
            id: 'conversation-4',
            french: 'Je viens du Canada.',
            english: 'I am from Canada.',
            pronunciation: 'zhuh vee-ehn doo kah-nah-dah',
            example: 'Je viens du Canada.',
            exampleEnglish: 'I am from Canada.',
            examplePronunciation: 'zhuh vee-ehn doo kah-nah-dah',
            usage: 'State your country of origin.'
          },
          {
            id: 'conversation-5',
            french: 'Enchanté !',
            english: 'Nice to meet you!',
            pronunciation: 'ahn-shahn-tay',
            example: 'Enchanté !',
            exampleEnglish: 'Nice to meet you!',
            examplePronunciation: 'ahn-shahn-tay',
            usage: 'Used when meeting someone for the first time.'
          }
        ],
      
        practice: [
          {
            type: 'conversation-simulation',
            scenario:
              'You meet a new French-speaking classmate for the first time.',
            steps: [
              'Say hello',
              'Say your name',
              'Ask their name',
              'Ask how they are',
              'Say your age',
              'Say where you are from',
              'Say nice to meet you'
            ]
          },
          {
            type: 'roleplay',
            scenario:
              'Introduce yourself to a new colleague in a French-speaking environment.',
            targetSentence:
              "Bonjour ! Je m'appelle Alex. J'ai vingt ans. Je viens du Canada. Enchanté !"
          },
          {
            type: 'speaking-challenge',
            prompt:
              'Speak your complete introduction without reading the English translation.',
            target:
              "Bonjour ! Je m'appelle Alex. J'ai vingt ans. Je viens du Canada."
          }
        ],
      
        speaking: {
          target:
            "Bonjour ! Je m'appelle Alex. J'ai vingt ans. Je viens du Canada. Enchanté !",
          translation:
            'Hello! My name is Alex. I am twenty years old. I am from Canada. Nice to meet you!',
          pronunciation:
            'bohn-zhoor, zhuh mah-pel ah-leks, zhay van ahn, zhuh vee-ehn doo kah-nah-dah, ahn-shahn-tay'
        },
      
        quiz: [
          {
            id: 'q1',
            question: 'What should you say when meeting someone politely?',
            choices: ['Bonjour', 'Au revoir', 'Bonne nuit', 'Merci'],
            answer: 'Bonjour'
          },
          {
            id: 'q2',
            question: 'How do you say "My name is Alex"?',
            choices: [
              "Je suis Alex.",
              "J'ai Alex.",
              "Je m'appelle Alex.",
              'Je viens Alex.'
            ],
            answer: "Je m'appelle Alex."
          },
          {
            id: 'q3',
            question: 'How do you say "I am 20 years old"?',
            choices: [
              'Je suis vingt ans.',
              "J'ai vingt ans.",
              'Je viens vingt ans.',
              'Je fais vingt.'
            ],
            answer: "J'ai vingt ans."
          },
          {
            id: 'q4',
            question: 'How do you say "I am from Canada"?',
            choices: [
              'Je suis Canada.',
              'Je viens du Canada.',
              'J’ai Canada.',
              'Je Canada.'
            ],
            answer: 'Je viens du Canada.'
          }
        ]
      },
    
      // =========================================================
      // FINAL CHALLENGE
      // =========================================================
      {
        id: 'm1-l11-final-challenge',
        title: 'Module 1 Final Challenge',
        type: 'challenge',
        icon: '🏆',
        description:
          'Complete a practical French challenge using pronunciation, greetings, numbers, personal information, and basic conversation.',
      
        learningGoals: [
          'Demonstrate Pre-A1 French fundamentals',
          'Recognize essential French vocabulary',
          'Build simple French sentences',
          'Respond to basic questions',
          'Complete a short conversation in French'
        ],
      
        items: [
          {
            id: 'challenge-greeting',
            french: 'Bonjour !',
            english: 'Hello!',
            pronunciation: 'bohn-zhoor'
          },
          {
            id: 'challenge-name',
            french: "Je m'appelle Alex.",
            english: 'My name is Alex.',
            pronunciation: 'zhuh mah-pel ah-leks'
          },
          {
            id: 'challenge-age',
            french: "J'ai vingt ans.",
            english: 'I am twenty years old.',
            pronunciation: 'zhay van ahn'
          },
          {
            id: 'challenge-origin',
            french: 'Je viens du Canada.',
            english: 'I am from Canada.',
            pronunciation: 'zhuh vee-ehn doo kah-nah-dah'
          }
        ],
      
        practice: [
          {
            type: 'listening-challenge',
            prompt:
              'Listen to a French introduction and identify the speaker’s name, age, and country.'
          },
          {
            type: 'sentence-builder',
            prompt: 'Build a complete self-introduction.',
            words: [
              'Bonjour',
              "Je m'appelle",
              'Alex',
              "J'ai",
              'vingt',
              'ans',
              'Je viens',
              'du Canada'
            ],
            answer:
              "Bonjour ! Je m'appelle Alex. J'ai vingt ans. Je viens du Canada."
          },
          {
            type: 'conversation-simulation',
            scenario:
              'You meet a French-speaking person for the first time. Complete the conversation without English.'
          },
          {
            type: 'speaking-challenge',
            prompt:
              'Give your complete introduction aloud. Focus on pronunciation and natural pauses.',
            target:
              "Bonjour ! Je m'appelle Alex. J'ai vingt ans. Je viens du Canada. Enchanté !"
          }
        ],
      
        speaking: {
          target:
            "Bonjour ! Je m'appelle Alex. J'ai vingt ans. Je viens du Canada. Enchanté !",
          translation:
            'Hello! My name is Alex. I am twenty years old. I am from Canada. Nice to meet you!',
          pronunciation:
            'bohn-zhoor, zhuh mah-pel ah-leks, zhay van ahn, zhuh vee-ehn doo kah-nah-dah, ahn-shahn-tay'
        },
      
        quiz: [
          {
            id: 'q-final-1',
            question: 'Which sentence correctly states your age?',
            choices: [
              'Je suis vingt ans.',
              "J'ai vingt ans.",
              'Je m’appelle vingt ans.',
              'Je viens vingt ans.'
            ],
            answer: "J'ai vingt ans."
          },
          {
            id: 'q-final-2',
            question: 'Which expression means "I am from Canada"?',
            choices: [
              'Je suis Canada.',
              'Je viens du Canada.',
              'J’ai Canada.',
              'Je vais Canada.'
            ],
            answer: 'Je viens du Canada.'
          },
          {
            id: 'q-final-3',
            question: 'Which greeting is appropriate in a formal situation?',
            choices: ['Salut', 'Bonjour', 'Tchao', 'À plus'],
            answer: 'Bonjour'
          },
          {
            id: 'q-final-4',
            question: 'What does "Enchanté" mean?',
            choices: [
              'Goodbye',
              'Thank you',
              'Nice to meet you',
              'How are you?'
            ],
            answer: 'Nice to meet you'
          }
        ]
      }
    ]
  },
  {
    id: 'module-2',
    title: 'Everyday French',
    flag: '🇲🇦',
    level: 'A0',
    description: 'Navigate daily routines, tell time, track calendar dates, identify colors, order food, and give town directions[cite: 1].',
    lessons: [
      {
        id: 'm2-l1-days-of-the-week',
        title: 'Days of the Week',
        type: 'dates-time',
        icon: '📅',
        description: 'Master the seven days of the week, arrange schedules, and talk about weekly routines[cite: 1].',
        learningGoals: [
          'Learn all 7 French days of the week[cite: 1]',
          'Arrange days in chronological order[cite: 1]',
          'Identify spoken days in real conversations[cite: 1]',
          'Talk about your weekly schedule[cite: 1]'
        ],
        items: [
          {
            id: 'day-lundi',
            french: 'Lundi',
            english: 'Monday',
            pronunciation: 'luhn-dee',
            example: 'Lundi, je travaille.',
            exampleEnglish: 'Monday, I work.',
            examplePronunciation: 'luhn-dee, zhuh trah-vay',
            usage: 'Days of the week are not capitalized in French unless starting a sentence.'
          },
          {
            id: 'day-samedi',
            french: 'Samedi',
            english: 'Saturday',
            pronunciation: 'sahm-dee',
            example: 'Samedi, c\'est le week-end !',
            exampleEnglish: 'Saturday is the weekend!',
            examplePronunciation: 'sahm-dee, seh luh week-end',
            usage: 'Used for weekend planning.'
          }
        ],
        practice: [
          {
            type: 'arrange-in-order',
            prompt: 'Arrange these days starting from Monday:',
            scrambled: ['Mercredi', 'Lundi', 'Mardi'],
            correctOrder: ['Lundi', 'Mardi', 'Mercredi']
          },
          {
            type: 'listen-and-identify',
            audioKey: 'day_vendredi',
            prompt: 'Which day did you hear?',
            options: ['Vendredi', 'Jeudi', 'Dimanche'],
            answer: 'Vendredi'
          },
          {
            type: 'talk-about-week',
            prompt: 'Complete the routine statement: "___ je fais du sport." (On Sunday...)',
            options: ['Dimanche', 'Mardi', 'Jeudi'],
            answer: 'Dimanche'
          }
        ],
        speaking: {
          target: 'Aujourd\'hui, c\'est lundi.',
          translation: 'Today is Monday.',
          pronunciation: 'oh-zhoor-dwee, seh luhn-dee'
        },
        quiz: [
          {
            id: 'q1',
            question: 'Which day comes immediately after "Jeudi"?',
            choices: ['Mercredi', 'Vendredi', 'Samedi', 'Mardi'],
            answer: 'Vendredi'
          }
        ]
      },
      {
        id: 'm2-l2-months-dates',
        title: 'Months & Dates',
        type: 'dates-time',
        icon: '🗓️',
        description: 'Learn the 12 months, associate seasons, construct dates, and practice birthday phrasing[cite: 1].',
        learningGoals: [
          'Recognize all 12 French months[cite: 1]',
          'Match months to their respective seasons[cite: 1]',
          'Build complete date structures (day + number + month)[cite: 1]',
          'Express your birthday in French[cite: 1]'
        ],
        items: [
          {
            id: 'month-janvier',
            french: 'Janvier',
            english: 'January',
            pronunciation: 'zhahn-vyay',
            example: 'Mon anniversaire est en janvier.',
            exampleEnglish: 'My birthday is in January.',
            examplePronunciation: 'mohn ah-nee-vehr-sehr ay ahn zhahn-vyay',
            usage: 'Use "en" before a month to say "in [month]".'
          }
        ],
        practice: [
          {
            type: 'calendar-activity',
            prompt: 'Select the correct format for July 14th:',
            options: ['Le 14 juillet', 'Juillet 14', 'Le 14 de juillet'],
            answer: 'Le 14 juillet'
          },
          {
            type: 'match-month-season',
            pairs: [
              { month: 'Décembre', season: 'L\'hiver' },
              { month: 'Juillet', season: 'L\'été' }
            ]
          },
          {
            type: 'birthday-practice',
            prompt: 'How do you say "My birthday is May 10th"?',
            options: ['Mon anniversaire est le 10 mai.', 'J\'ai dix mai.', 'Je suis né le mai 10.'],
            answer: 'Mon anniversaire est le 10 mai.'
          }
        ],
        speaking: {
          target: 'Mon anniversaire est le quinze mars.',
          translation: 'My birthday is March 15th.',
          pronunciation: 'mohn ah-nee-vehr-sehr ay luh kanz marss'
        },
        quiz: [
          {
            id: 'q1',
            question: 'How do you structure a date in French?',
            choices: ['Month + Day', 'Le + Day Number + Month', 'Day Number + Le + Month', 'Le + Month + Day Number'],
            answer: 'Le + Day Number + Month'
          }
        ]
      },
      {
        id: 'm2-l3-telling-time',
        title: 'Telling Time',
        type: 'dates-time',
        icon: '⏰',
        description: 'Read analog clocks, ask for the time, and follow daily schedule hours[cite: 1].',
        learningGoals: [
          'Ask "Quelle heure est-il ?" correctly[cite: 1]',
          'Read digital and analog clocks in French[cite: 1]',
          'Distinguish AM/PM equivalents (du matin / de l\'après-midi / du soir)[cite: 1]'
        ],
        items: [
          {
            id: 'item-time-1',
            french: 'Il est midi',
            english: 'It is noon',
            pronunciation: 'eel ay mee-dee',
            example: 'Il est midi, l\'heure du déjeuner.',
            exampleEnglish: 'It is noon, lunch time.',
            examplePronunciation: 'eel ay mee-dee, luhr dyoo day-zhuh-nay',
            usage: 'Used specifically for 12:00 PM.'
          }
        ],
        practice: [
          {
            type: 'clock-activity',
            timeDisplay: '08:00',
            choices: ['Il est huit heures', 'Il est dix heures', 'Il est minuit'],
            answer: 'Il est huit heures'
          },
          {
            type: 'listen-to-time',
            audioKey: 'time_14h30',
            answer: '14:30'
          },
          {
            type: 'schedule-activity',
            event: 'Train Departure: 15h00',
            prompt: 'When does the train leave?',
            answer: 'Trois heures de l\'après-midi'
          }
        ],
        speaking: {
          target: 'Quelle heure est-il ?',
          translation: 'What time is it?',
          pronunciation: 'kel uhr ay-teel'
        },
        quiz: [
          {
            id: 'q1',
            question: 'How do you say "It is midnight" in French?',
            choices: ['Il est midi', 'Il est minuit', 'Il est soir', 'Il est nuit'],
            answer: 'Il est minuit'
          }
        ]
      },
      {
        id: 'm2-l4-colors',
        title: 'Colors',
        type: 'vocabulary',
        icon: '🎨',
        description: 'Identify basic colors, describe everyday items, and master gender/number agreements[cite: 1].',
        learningGoals: [
          'Learn basic color terms in French[cite: 1]',
          'Recognize colors through listening prompts[cite: 1]',
          'Apply adjective gender agreement rules to colors[cite: 1]'
        ],
        items: [
          {
            id: 'color-rouge',
            french: 'Rouge',
            english: 'Red',
            pronunciation: 'roozh',
            example: 'Une pomme rouge.',
            exampleEnglish: 'A red apple.',
            examplePronunciation: 'oon puhm roozh',
            usage: 'Stays the same in masculine and feminine singular forms.'
          },
          {
            id: 'color-blanc',
            french: 'Blanc / Blanche',
            english: 'White',
            pronunciation: 'blahn / blahnsh',
            example: 'Un livre blanc, une maison blanche.',
            exampleEnglish: 'A white book, a white house.',
            examplePronunciation: 'uhn leevr blahn, oon meh-zohn blahnsh',
            usage: 'Changes to "blanche" for feminine nouns.'
          }
        ],
        practice: [
          {
            type: 'picture-matching',
            imageTarget: 'blue_car',
            options: ['Une voiture bleue', 'Une voiture rouge', 'Une voiture verte'],
            answer: 'Une voiture bleue'
          },
          {
            type: 'gender-agreement-check',
            prompt: 'Choose the right color form for "une chemise" (a shirt - feminine):',
            options: ['vert', 'verte', 'verts'],
            answer: 'verte'
          },
          {
            type: 'listening-recognition',
            audioKey: 'color_noir',
            options: ['Black', 'Yellow', 'Green'],
            answer: 'Black'
          }
        ],
        speaking: {
          target: 'Le ciel est bleu aujourd\'hui.',
          translation: 'The sky is blue today.',
          pronunciation: 'luh syel ay bluh oh-zhoor-dwee'
        },
        quiz: [
          {
            id: 'q1',
            question: 'What is the feminine form of "noir"?',
            choices: ['Noire', 'Noires', 'Noir', 'Noirot'],
            answer: 'Noire'
          }
        ]
      },
      {
        id: 'm2-l5-food-drinks',
        title: 'Food & Drinks',
        type: 'food',
        icon: '🥖',
        description: 'Order food, describe ingredients, build custom meals, and practice café role-plays[cite: 1].',
        learningGoals: [
          'Identify common food and drink vocabulary[cite: 1]',
          'Match French dishes to English descriptions[cite: 1]',
          'Build a complete café order[cite: 1]',
          'Simulate a restaurant interaction with a server[cite: 1]'
        ],
        items: [
          {
            id: 'item-croissant',
            french: 'Un croissant',
            english: 'A croissant',
            pronunciation: 'uhn krwah-sahn',
            example: 'Un croissant et un café, s\'il vous plaît.',
            exampleEnglish: 'A croissant and a coffee, please.',
            examplePronunciation: 'uhn krwah-sahn ay uhn kah-fay, seel voo pleh',
            usage: 'Classic French breakfast pastry.'
          }
        ],
        practice: [
          {
            type: 'menu-activity',
            prompt: 'Pick a breakfast item from the menu:',
            menuOptions: ['Un croissant', 'Une salade', 'Un steak'],
            answer: 'Un croissant'
          },
          {
            type: 'select-food',
            category: 'Beverages',
            options: ['L\'eau', 'Le pain', 'Le fromage'],
            answer: 'L\'eau'
          },
          {
            type: 'build-order',
            targetItems: ['Café', 'Eau'],
            userSelection: ['Café', 'Eau']
          },
          {
            type: 'restaurant-roleplay',
            prompt: 'Server: Vous désirez ? You reply:',
            options: ['Je voudrais un café.', 'Au revoir !', 'Je m\'appelle Jean.'],
            answer: 'Je voudrais un café.'
          }
        ],
        speaking: {
          target: 'Je voudrais un croissant, s\'il vous plaît.',
          translation: 'I would like a croissant, please.',
          pronunciation: 'zhuh voo-dreh uhn krwah-sahn, seel voo pleh'
        },
        quiz: [
          {
            id: 'q1',
            question: 'What is the French word for "water"?',
            choices: ['Le lait', 'L\'eau', 'Le jus', 'Le vin'],
            answer: 'L\'eau'
          }
        ]
      },
      {
        id: 'm2-l6-classroom-french',
        title: 'Classroom French',
        type: 'conversation',
        icon: '🏫',
        description: 'Understand teacher instructions, identify objects, and ask for help or repetition[cite: 1].',
        learningGoals: [
          'Recognize classroom tools and items[cite: 1]',
          'Follow instructions spoken by teachers[cite: 1]',
          'Ask someone to repeat or clarify in French[cite: 1]'
        ],
        items: [
          {
            id: 'class-stylo',
            french: 'Un stylo',
            english: 'A pen',
            pronunciation: 'uhn stee-loh',
            example: 'J\'ai un stylo bleu.',
            exampleEnglish: 'I have a blue pen.',
            examplePronunciation: 'zhay uhn stee-loh bluh',
            usage: 'Masculine object noun.'
          },
          {
            id: 'class-repeat',
            french: 'Répétez, s\'il vous plaît',
            english: 'Please repeat',
            pronunciation: 'ray-pay-tay, seel voo pleh',
            example: 'Je ne comprends pas. Répétez, s\'il vous plaît.',
            exampleEnglish: 'I don\'t understand. Please repeat.',
            examplePronunciation: 'zhuh nuh kohn-prahn pah. ray-pay-tay, seel voo pleh',
            usage: 'Essential polite phrase when learning.'
          }
        ],
        practice: [
          {
            type: 'picture-matching',
            imageKey: 'object_stylo',
            options: ['Un stylo', 'Un livre', 'Une chaise'],
            answer: 'Un stylo'
          },
          {
            type: 'conversation-choice',
            prompt: 'You didn\'t hear what the teacher said. What do you ask?',
            choices: ['Répétez, s\'il vous plaît.', 'Merci beaucoup.', 'Au revoir !'],
            answer: 'Répétez, s\'il vous plaît.'
          },
          {
            type: 'listening-instructions',
            audioKey: 'instruction_ecoutez',
            options: ['Listen', 'Write', 'Open your book'],
            answer: 'Listen'
          }
        ],
        speaking: {
          target: 'Comment dit-on "book" en français ?',
          translation: 'How do you say "book" in French?',
          pronunciation: 'koh-mahn dee-tohn book ahn frahn-seh'
        },
        quiz: [
          {
            id: 'q1',
            question: 'How do you politely ask for help in class?',
            choices: ['Pouvez-vous m\'aider ?', 'Je m\'appelle Paul', 'Il fait beau', 'De rien'],
            answer: 'Pouvez-vous m\'aider ?'
          }
        ]
      },
      {
        id: 'm2-l7-everyday-objects',
        title: 'Everyday Objects',
        type: 'vocabulary',
        icon: '🎒',
        description: 'Identify personal, school, and household items around your daily space[cite: 1].',
        learningGoals: [
          'Identify personal belongings (keys, phone, bag)[cite: 1]',
          'Distinguish household items[cite: 1]',
          'Match gendered articles (un/une) with common objects[cite: 1]'
        ],
        items: [
          {
            id: 'obj-clefs',
            french: 'Les clés',
            english: 'The keys',
            pronunciation: 'lay klay',
            example: 'Où sont mes clés ?',
            exampleEnglish: 'Where are my keys?',
            examplePronunciation: 'oo soh mah klay',
            usage: 'Feminine plural noun.'
          },
          {
            id: 'obj-telephone',
            french: 'Le téléphone',
            english: 'The phone',
            pronunciation: 'luh tay-lay-fohn',
            example: 'Voici mon téléphone.',
            exampleEnglish: 'Here is my phone.',
            examplePronunciation: 'vwah-see mohn tay-lay-fohn',
            usage: 'Masculine singular noun.'
          }
        ],
        practice: [
          {
            type: 'flashcards',
            cards: [
              { front: 'Le téléphone', back: 'The phone' },
              { front: 'Les clés', back: 'The keys' },
              { front: 'Le sac', back: 'The bag' }
            ]
          },
          {
            type: 'word-matching',
            pairs: [
              { french: 'Le sac', english: 'The bag' },
              { french: 'La table', english: 'The table' }
            ]
          }
        ],
        speaking: {
          target: 'Où est mon téléphone ?',
          translation: 'Where is my phone?',
          pronunciation: 'oo ay mohn tay-lay-fohn'
        },
        quiz: [
          {
            id: 'q1',
            question: 'Which article pairs correctly with "sac" (bag)?',
            choices: ['Un', 'Une', 'Des', 'De la'],
            answer: 'Un'
          }
        ]
      },
      {
        id: 'm2-l8-places-around-town',
        title: 'Places Around Town',
        type: 'vocabulary',
        icon: '🏬',
        description: 'Locate essential urban places such as schools, banks, stores, and hospitals[cite: 1].',
        learningGoals: [
          'Name primary buildings and places in a French city[cite: 1]',
          'Associate activities with their corresponding locations[cite: 1]'
        ],
        items: [
          {
            id: 'place-banque',
            french: 'La banque',
            english: 'The bank',
            pronunciation: 'lah bahnk',
            example: 'Je vais à la banque.',
            exampleEnglish: 'I am going to the bank.',
            examplePronunciation: 'zhuh vay ah lah bahnk',
            usage: 'Feminine noun.'
          },
          {
            id: 'place-hopital',
            french: 'L\'hôpital',
            english: 'The hospital',
            pronunciation: 'loh-pee-tahl',
            example: 'L\'hôpital est près d\'ici.',
            exampleEnglish: 'The hospital is near here.',
            examplePronunciation: 'loh-pee-tahl ay preh dee-see',
            usage: 'Starts with silent "h", uses L\' article.'
          }
        ],
        practice: [
          {
            type: 'picture-matching',
            imageKey: 'place_restaurant',
            options: ['Le restaurant', 'La banque', 'L\'école'],
            answer: 'Le restaurant'
          },
          {
            type: 'association-activity',
            prompt: 'Where do you go to buy bread?',
            options: ['La boulangerie', 'L\'hôpital', 'La banque'],
            answer: 'La boulangerie'
          }
        ],
        speaking: {
          target: 'Je vais au magasin.',
          translation: 'I am going to the store.',
          pronunciation: 'zhuh vay oh mah-gah-zahn'
        },
        quiz: [
          {
            id: 'q1',
            question: 'Where do you go when you are sick?',
            choices: ['L\'hôpital', 'La boulangerie', 'La banque', 'Le parc'],
            answer: 'L\'hôpital'
          }
        ]
      },
      {
        id: 'm2-l9-basic-requests',
        title: 'Basic Requests',
        type: 'conversation',
        icon: '🤝',
        description: 'Ask politely for items and assistance using courteous phrasing[cite: 1].',
        learningGoals: [
          'Use "s\'il vous plaît" and "s\'il te plaît" appropriately[cite: 1]',
          'Formulate simple requests with "Je voudrais..."[cite: 1]',
          'Ask politely for immediate help[cite: 1]'
        ],
        items: [
          {
            id: 'req-voudrais',
            french: 'Je voudrais...',
            english: 'I would like...',
            pronunciation: 'zhuh voo-dreh',
            example: 'Je voudrais de l\'eau, s\'il vous plaît.',
            exampleEnglish: 'I would like water, please.',
            examplePronunciation: 'zhuh voo-dreh duh loh, seel voo pleh',
            usage: 'Polite conditional form for requests.'
          }
        ],
        practice: [
          {
            type: 'complete-dialogue',
            context: 'At a store counter',
            dialogue: 'Client: Bonjour! ___ une carte postale, s\'il vous plaît.',
            options: ['Je voudrais', 'Je m\'appelle', 'J\'habite'],
            answer: 'Je voudrais'
          },
          {
            type: 'role-play',
            prompt: 'Ask someone politely to help you carry a box.',
            options: ['Pouvez-vous m\'aider, s\'il vous plaît ?', 'Avoir de l\'aide.', 'Merci beaucoup !'],
            answer: 'Pouvez-vous m\'aider, s\'il vous plaît ?'
          }
        ],
        speaking: {
          target: 'Pouvez-vous m\'aider, s\'il vous plaît ?',
          translation: 'Can you help me, please?',
          pronunciation: 'poo-vay voo meh-day, seel voo pleh'
        },
        quiz: [
          {
            id: 'q1',
            question: 'What is the most polite way to ask for a coffee?',
            choices: ['Je voudrais un café, s\'il vous plaît', 'Donne un café', 'Un café maintenant', 'Café !'],
            answer: 'Je voudrais un café, s\'il vous plaît'
          }
        ]
      },
      {
        id: 'm2-l10-basic-directions',
        title: 'Basic Directions',
        type: 'directions',
        icon: '🗺️',
        description: 'Navigate maps, understand directional cues, and guide others[cite: 1].',
        learningGoals: [
          'Understand orientation terms (à gauche, à droite, tout droit)[cite: 1]',
          'Comprehend positional relative phrases (près de, loin de, devant)[cite: 1]',
          'Follow interactive map paths[cite: 1]',
          'Participate in direction-focused dialogues[cite: 1]'
        ],
        items: [
          {
            id: 'dir-gauche',
            french: 'À gauche',
            english: 'To the left',
            pronunciation: 'ah gohsh',
            example: 'Tournez à gauche après la banque.',
            exampleEnglish: 'Turn left after the bank.',
            examplePronunciation: 'toor-nay ah gohsh ah-preh lah bahnk',
            usage: 'Directional spatial indicator.'
          },
          {
            id: 'dir-droite',
            french: 'À droite',
            english: 'To the right',
            pronunciation: 'ah drwaht',
            example: 'Prenez la première rue à droite.',
            exampleEnglish: 'Take the first street on the right.',
            examplePronunciation: 'pruh-nay lah pruh-myehr roo ah drwaht',
            usage: 'Directional spatial indicator.'
          }
        ],
        practice: [
          {
            type: 'interactive-map',
            instruction: 'Turn right at the bakery and go straight',
            mapTargetNode: 'node_right_bakery_straight'
          },
          {
            type: 'follow-instructions',
            sequence: ['Go straight', 'Turn left', 'The station is on your right'],
            frenchSteps: ['Allez tout droit', 'Tournez à gauche', 'La gare est à droite']
          },
          {
            type: 'give-directions',
            prompt: 'Where is the museum?',
            options: ['C\'est tout droit, puis à gauche.', 'Je voudrais un croissant.', 'Il est midi.'],
            answer: 'C\'est tout droit, puis à gauche.'
          }
        ],
        speaking: {
          target: 'Où est la gare, s\'il vous plaît ?',
          translation: 'Where is the train station, please?',
          pronunciation: 'oo ay lah gahr, seel voo pleh'
        },
        quiz: [
          {
            id: 'q1',
            question: 'What does "tout droit" mean?',
            choices: ['Turn left', 'Turn right', 'Straight ahead', 'Behind'],
            answer: 'Straight ahead'
          }
        ]
      },
      {
        id: 'm2-l11-final-challenge',
        title: 'Module 2 Final Challenge',
        type: 'speaking',
        icon: '🏆',
        description: 'Test your mastery across time, food, directions, and conversational situations in everyday French[cite: 1].',
        learningGoals: [
          'Complete time-reading and scheduling prompts[cite: 1]',
          'Demonstrate competence ordering in food scenarios[cite: 1]',
          'Navigate simulated town map directions[cite: 1]',
          'Engage in a complete everyday conversation simulation[cite: 1]'
        ],
        items: [],
        practice: [
          {
            type: 'time-challenge',
            prompt: 'Listen to the schedule and select the arrival time:',
            audioKey: 'time_challenge_18h45',
            answer: '18:45'
          },
          {
            type: 'food-challenge',
            prompt: 'Order a complete breakfast with drink and pastry:',
            choices: ['Un café et un croissant, s\'il vous plaît', 'Un stylo et une table', 'Bonjour à lundi'],
            answer: 'Un café et un croissant, s\'il vous plaît'
          },
          {
            type: 'direction-challenge',
            instruction: 'Guide the traveler to the bank on the map grid',
            correctPath: ['straight', 'left', 'right']
          },
          {
            type: 'everyday-conversation',
            scenario: 'Ask for the time, order coffee, and ask where the train station is.'
          }
        ],
        speaking: {
          target: 'Bonjour, il est quelle heure ? Je cherche la gare, s\'il vous plaît.',
          translation: 'Hello, what time is it? I am looking for the train station, please.',
          pronunciation: 'bohn-zhoor, eel ay kel uhr? zhuh shehrsh lah gahr, seel voo pleh'
        },
        quiz: [
          {
            id: 'q-m2-final',
            question: 'Which combination includes a greeting, a request, and politeness?',
            choices: [
              'Bonjour, je voudrais de l\'eau, s\'il vous plaît.',
              'Merci, au revoir, rouge.',
              'Lundi, mardi, minuit.',
              'Gare, banque, hôpital.'
            ],
            answer: 'Bonjour, je voudrais de l\'eau, s\'il vous plaît.'
          }
        ]
      }
    ]
  },
  {
    id: 'module-3',
    title: 'Family, Home & People',
    flag: '🇨🇮',
    level: 'A1',
    description: 'Describe physical attributes, personality, family trees, living spaces, and positions.',
    lessons: [
      {
        id: 'm3-l1-family',
        title: 'Family Members',
        type: 'vocabulary',
        icon: '👨‍👩‍👧',
        description: 'Identify family relationships and build interactive family trees.',
        learningGoals: [
          'Name core family relatives',
          'Describe family connections using possessive adjectives'
        ],
        items: [
          {
            id: 'fam-mere',
            french: 'La mère',
            english: 'The mother',
            pronunciation: 'lah mehr',
            example: 'Ma mère est très gentille.',
            exampleEnglish: 'My mother is very kind.',
            examplePronunciation: 'mah mehr ay treh zhahn-teey',
            usage: 'Feminine noun for mother.'
          }
        ],
        practice: [
          {
            type: 'picture-matching',
            imageKey: 'family_tree_node_father',
            options: ['Le père', 'La sœur', 'Le frère'],
            answer: 'Le père'
          },
          {
            type: 'flashcards',
            cards: [
              { front: 'Le frère', back: 'The brother' },
              { front: 'La sœur', back: 'The sister' }
            ]
          }
        ],
        speaking: {
          target: 'Voici ma famille.',
          translation: 'Here is my family.',
          pronunciation: 'vwah-see mah fah-meey'
        },
        quiz: [
          {
            id: 'q1',
            question: 'What is the French word for "Sister"?',
            choices: ['La mère', 'La sœur', 'La fille', 'La tante'],
            answer: 'La sœur'
          }
        ]
      },
      {
        id: 'm3-l8-describing-people',
        title: 'Describing People',
        type: 'grammar',
        icon: '👤',
        description: 'Grammar rules for gender agreements and descriptive adjectives with Être.',
        learningGoals: [
          'Match masculine/feminine adjective endings',
          'Construct descriptive sentences using "être + adjective"'
        ],
        items: [
          {
            id: 'adj-grand',
            french: 'Grand / Grande',
            english: 'Tall / Big',
            pronunciation: 'grahn / grahnd',
            example: 'Il est grand. Elle est grande.',
            exampleEnglish: 'He is tall. She is tall.',
            examplePronunciation: 'eel ay grahn. el ay grahnd',
            usage: 'Add -e for feminine form.'
          }
        ],
        practice: [
          {
            type: 'simple-explanation',
            rule: 'Adjectives in French must match the gender and number of the noun.'
          },
          {
            type: 'example-comparison',
            examples: [
              { gender: 'Masculine', sentence: 'Il est petit.' },
              { gender: 'Feminine', sentence: 'Elle est petite.' }
            ]
          },
          {
            type: 'sentence-builder',
            words: ['Elle', 'est', 'intelligente.'],
            correctOrder: 'Elle est intelligente.'
          },
          {
            type: 'fill-the-gap',
            sentence: 'Marie est ___ (grand).',
            options: ['grand', 'grande', 'grands'],
            answer: 'grande'
          },
          {
            type: 'error-correction',
            incorrect: 'Il est grande.',
            corrected: 'Il est grand.'
          }
        ],
        speaking: {
          target: 'Mon frère est intelligent et sympa.',
          translation: 'My brother is intelligent and nice.',
          pronunciation: 'mohn frehr ay ahn-teh-lee-zhahn ay sahmn-pah'
        },
        quiz: [
          {
            id: 'q1',
            question: 'Select the correct feminine form of "petit":',
            choices: ['petit', 'petite', 'petits', 'petites'],
            answer: 'petite'
          }
        ]
      }
    ]
  },
  {
    id: 'module-4',
    title: 'Daily Life & Social Interaction',
    flag: '🇮🇹',
    level: 'A1',
    description: 'Master routines, hobbies, shopping, dining out, transportation, and weather forecast comprehension.',
    lessons: [
      {
        id: 'm4-l5-restaurants',
        title: 'Restaurants',
        type: 'food',
        icon: '🍽️',
        description: 'Read complete menus, ask for the check, and handle restaurant dialogues.',
        learningGoals: [
          'Read French menu sections (Entrées, Plats, Desserts)',
          'Request the check ("L\'addition, s\'il vous plaît")',
          'Role-play ordering meals with waiter'
        ],
        items: [
          {
            id: 'rest-addition',
            french: 'L\'addition',
            english: 'The bill / check',
            pronunciation: 'lah-dee-syohn',
            example: 'L\'addition, s\'il vous plaît.',
            exampleEnglish: 'The check, please.',
            examplePronunciation: 'lah-dee-syohn, seel voo pleh',
            usage: 'Requested at the end of a meal.'
          }
        ],
        practice: [
          {
            type: 'menu-activity',
            menu: {
              entrées: ['Soupe à l\'oignon'],
              plats: ['Poulet rôti', 'Steak frites'],
              desserts: ['Mousse au chocolat']
            }
          },
          {
            type: 'restaurant-roleplay',
            dialogueStage: 'paying_the_bill',
            prompt: 'Ask the waiter for the bill.',
            options: ['L\'addition, s\'il vous plaît.', 'Où sont les toilettes ?', 'Le menu, s\'il vous plaît.'],
            answer: 'L\'addition, s\'il vous plaît.'
          }
        ],
        speaking: {
          target: 'Une table pour deux personnes, s\'il vous plaît.',
          translation: 'A table for two people, please.',
          pronunciation: 'oon tahbl poor deux pehr-sun, seel voo pleh'
        },
        quiz: [
          {
            id: 'q1',
            question: 'What do you ask when you are ready to pay at a restaurant?',
            choices: ['Le menu, s\'il vous plaît', 'L\'addition, s\'il vous plaît', 'Bonjour Monsieur', 'Merci beaucoup'],
            answer: 'L\'addition, s\'il vous plaît'
          }
        ]
      }
    ]
  },
  {
    id: 'module-5',
    title: 'Travel, Health & Real-Life Situations',
    flag: '🇨🇲',
    level: 'A2',
    description: 'Handle airport procedures, hotel bookings, health symptoms, doctor appointments, and urgent emergencies.',
    lessons: [
      {
        id: 'm5-l7-health-symptoms',
        title: 'Health & Symptoms',
        type: 'conversation',
        icon: '🩺',
        description: 'Express physical distress, describe pain areas, and speak with healthcare professionals.',
        learningGoals: [
          'Use "Avoir mal à..." to describe pain',
          'Identify body parts',
          'Communicate symptoms to a pharmacist or doctor'
        ],
        items: [
          {
            id: 'health-headache',
            french: 'J\'ai mal à la tête',
            english: 'I have a headache',
            pronunciation: 'zhay mahl ah lah teht',
            example: 'J\'ai mal à la tête depuis ce matin.',
            exampleEnglish: 'I have had a headache since this morning.',
            examplePronunciation: 'zhay mahl ah lah teht duh-pwee suh mah-tahn',
            usage: 'Standard expression for head pain.'
          }
        ],
        practice: [
          {
            type: 'word-matching',
            pairs: [
              { french: 'La tête', english: 'Head' },
              { french: 'Le ventre', english: 'Stomach' },
              { french: 'La gorge', english: 'Throat' }
            ]
          },
          {
            type: 'role-play',
            scenario: 'Doctor Consultation',
            prompt: 'The doctor asks: "Où avez-vous mal ?"',
            options: ['J\'ai mal au ventre.', 'Je voudrais un billet.', 'Il est dix heures.'],
            answer: 'J\'ai mal au ventre.'
          }
        ],
        speaking: {
          target: 'J\'ai de la fièvre et j\'ai mal à la gorge.',
          translation: 'I have a fever and a sore throat.',
          pronunciation: 'zhay duh lah fyehrv ay zhay mahl ah lah gohrzh'
        },
        quiz: [
          {
            id: 'q1',
            question: 'How do you say "My stomach hurts"?',
            choices: ['J\'ai mal à la tête', 'J\'ai mal au ventre', 'J\'ai mal au pied', 'J\'ai mal aux yeux'],
            answer: 'J\'ai mal au ventre'
          }
        ]
      }
    ]
  },
  {
    id: 'module-6',
    title: 'Education, Work & Technology',
    flag: '🇧🇪',
    level: 'A2',
    description: 'Workplace communication, schedules, technical terms, digital devices, instructions, and past/future tenses.',
    lessons: [
      {
        id: 'm6-l11-past-future',
        title: 'Past & Future Experiences',
        type: 'grammar',
        icon: '⏳',
        description: 'Grammar review of Passé Composé, Imparfait, and Futur Simple over time lines.',
        learningGoals: [
          'Differentiate completed past actions from descriptions',
          'Construct sentences in Passé Composé and Futur Simple'
        ],
        items: [
          {
            id: 'gram-passe-compose',
            french: 'J\'ai visité Paris',
            english: 'I visited Paris',
            pronunciation: 'zhay vee-zee-tay pah-ree',
            example: 'Hier, j\'ai visité le Musée du Louvre.',
            exampleEnglish: 'Yesterday, I visited the Louvre Museum.',
            examplePronunciation: 'yehr, zhay vee-zee-tay luh myoo-zay dyoo loovr',
            usage: 'Passé composé for completed past events.'
          }
        ],
        practice: [
          {
            type: 'timeline-activity',
            events: [
              { time: 'Yesterday', tense: 'Passé Composé', phrase: 'J\'ai mangé' },
              { time: 'Tomorrow', tense: 'Futur Simple', phrase: 'Je mangerai' }
            ]
          },
          {
            type: 'fill-the-gap',
            sentence: 'Demain, je ___ (partir) à Lyon.',
            options: ['suis parti', 'partirai', 'partais'],
            answer: 'partirai'
          }
        ],
        speaking: {
          target: 'L\'année prochaine, j\'irai en France.',
          translation: 'Next year, I will go to France.',
          pronunciation: 'lah-nay proh-shehn, zhee-ray ahn frahns'
        },
        quiz: [
          {
            id: 'q1',
            question: 'Which sentence is written in the future tense?',
            choices: ['J\'ai mangé une pomme', 'Je mange une pomme', 'Je mangerai une pomme', 'Je mangeais une pomme'],
            answer: 'Je mangerai une pomme'
          }
        ]
      }
    ]
  },
  {
    id: 'module-7',
    title: 'Media, Society & Opinions',
    flag: '🇨🇭',
    level: 'B1',
    description: 'Engage with news stories, environmental issues, express nuanced opinions, and form hypotheses.',
    lessons: [
      {
        id: 'm7-l12-debate-challenge',
        title: 'Module 7 Debate Challenge: Environmental Issues',
        type: 'b1-b2-debate',
        icon: '⚖️',
        description: 'Read conflicting perspectives, analyze societal issues, form an argument, and debate in French.',
        learningGoals: [
          'Comprehend key viewpoints in complex socio-environmental news',
          'Utilize opinion triggers (À mon avis, Je pense que)',
          'Construct counterarguments and defend positions'
        ],
        items: [
          {
            id: 'phrase-opinion',
            french: 'À mon avis',
            english: 'In my opinion',
            pronunciation: 'ah mohn ah-vee',
            example: 'À mon avis, il faut protéger la planète.',
            exampleEnglish: 'In my opinion, we must protect the planet.',
            examplePronunciation: 'ah mohn ah-vee, eel foh proh-tay-zhay lah plah-neht',
            usage: 'Introduces personal perspective.'
          }
        ],
        practice: [
          {
            type: 'understand-topic',
            articleHeadline: 'Faut-il interdire les voitures en centre-ville ?'
          },
          {
            type: 'argument-identification',
            arguments: [
              { text: 'Réduction de la pollution', side: 'Pro' },
              { text: 'Difficulté de déplacement pour les commerçants', side: 'Con' }
            ]
          },
          {
            type: 'defend-opinion',
            prompt: 'Defend public transit expansion over private vehicles:',
            options: [
              'Je pense que les transports en commun réduisent l\'empreinte carbone.',
              'Je préfère manger au restaurant.'
            ],
            answer: 'Je pense que les transports en commun réduisent l\'empreinte carbone.'
          },
          {
            type: 'counterargument',
            prompt: 'Counter the statement: "Cycling is impossible in winter."',
            response: 'Cependant, de nombreuses villes nordiques ont des pistes cyclables déneigées.'
          }
        ],
        speaking: {
          target: 'Je suis d\'accord avec cette idée parce que c\'est écologique.',
          translation: 'I agree with this idea because it is eco-friendly.',
          pronunciation: 'zhuh swee dah-kor ah-vek set ee-day por-kuh seh say-koh-loh-zheek'
        },
        quiz: [
          {
            id: 'q1',
            question: 'Which phrase is best used to politely disagree?',
            choices: ['Je suis totalement d\'accord', 'Je ne partage pas tout à fait cet avis', 'C\'est exact', 'Absolument'],
            answer: 'Je ne partage pas tout à fait cet avis'
          }
        ]
      }
    ]
  },
  {
    id: 'module-8',
    title: 'French Culture & Professional Communication',
    flag: '🇲🇨',
    level: 'B1',
    description: 'Francophone arts, music, traditions, storytelling, career objectives, and professional interview simulations.',
    lessons: [
      {
        id: 'm8-l9-job-interviews',
        title: 'Job Interviews',
        type: 'conversation',
        icon: '💼',
        description: 'Master formal interviewing etiquette, present accomplishments, and respond to recruiter questions.',
        learningGoals: [
          'Answer common interview queries formally',
          'Describe professional experience and competencies'
        ],
        items: [
          {
            id: 'item-competence',
            french: 'Mes compétences',
            english: 'My skills / competencies',
            pronunciation: 'may kohn-pay-tahns',
            example: 'Mes compétences incluent la gestion de projet.',
            exampleEnglish: 'My skills include project management.',
            examplePronunciation: 'may kohn-pay-tahns ahn-klyood lah zhes-tyohn duh proh-zheh',
            usage: 'Professional self-assessment phrasing.'
          }
        ],
        practice: [
          {
            type: 'interview-simulation',
            prompt: 'Recruiter: "Pourquoi voulez-vous ce poste ?"',
            options: [
              'Je souhaite mettre mes compétences au service de votre entreprise.',
              'Parce que j\'aime voyager.'
            ],
            answer: 'Je souhaite mettre mes compétences au service de votre entreprise.'
          }
        ],
        speaking: {
          target: 'J\'ai trois ans d\'expérience dans ce domaine.',
          translation: 'I have three years of experience in this field.',
          pronunciation: 'zhay trwah zahn dex-pay-ryahs dahn suh doh-mehn'
        },
        quiz: [
          {
            id: 'q1',
            question: 'How do you state "my strengths" in a professional interview?',
            choices: ['Mes points forts', 'Mes problèmes', 'Mes loisirs', 'Mes fautes'],
            answer: 'Mes points forts'
          }
        ]
      }
    ]
  },
  {
    id: 'module-9',
    title: 'Business, Economics & Innovation',
    flag: '🇱🇺',
    level: 'B2',
    description: 'Corporate strategy, finance, marketing, contract negotiations, and executive presentations.',
    lessons: [
      {
        id: 'm9-l9-negotiation',
        title: 'Negotiation',
        type: 'b1-b2-debate',
        icon: '🤝',
        description: 'Propose trade-offs, navigate counter-proposals, and achieve formal business compromises.',
        learningGoals: [
          'Use diplomatic conditional verbs to propose deals',
          'Negotiate contract terms and pricing structures'
        ],
        items: [
          {
            id: 'neg-compromis',
            french: 'Trouver un compromis',
            english: 'To find a compromise',
            pronunciation: 'troo-vay uhn kohn-proh-mee',
            example: 'Nous devons trouver un compromis acceptable.',
            exampleEnglish: 'We must find an acceptable compromise.',
            examplePronunciation: 'noo duh-vohn troo-vay uhn kohn-proh-mee ak-sep-tahbl',
            usage: 'Key outcome phrase in commercial deals.'
          }
        ],
        practice: [
          {
            type: 'negotiation-simulation',
            scenario: 'Vendor requests 10% price increase',
            userActionOptions: [
              'Propose a longer contract term in exchange for keeping current pricing',
              'Accept immediately without discussion'
            ],
            recommendedChoice: 'Propose a longer contract term in exchange for keeping current pricing'
          }
        ],
        speaking: {
          target: 'Si vous augmentez le volume, nous pourrons réduire le prix unitaire.',
          translation: 'If you increase the volume, we can lower the unit price.',
          pronunciation: 'see voo zohg-mahn-tay luh voh-lyoom, noo poor-ohn ray-dweer luh pree yoo-nee-tehr'
        },
        quiz: [
          {
            id: 'q1',
            question: 'Which expression means "a win-win agreement"?',
            choices: ['Un accord gagnant-gagnant', 'Un refus catégorique', 'Une perte financière', 'Une rupture de contrat'],
            answer: 'Un accord gagnant-gagnant'
          }
        ]
      }
    ]
  },
  {
    id: 'module-10',
    title: 'Advanced French: Global Society & Debate',
    flag: '🇫🇷',
    level: 'B2',
    description: 'Globalization, ethical debates, media bias analysis, rhetoric, and complete mastery evaluation.',
    lessons: [
      {
        id: 'm10-l11-debate',
        title: 'Debate: Global Ethical Issues',
        type: 'b1-b2-debate',
        icon: '🎙️',
        description: 'Defend stance, analyze subtle media bias, counter live arguments, and deliver persuasive arguments.',
        learningGoals: [
          'Formulate cohesive arguments on complex socio-ethical themes',
          'Identify media slant and implicit viewpoints',
          'Participate in dynamic debate simulations'
        ],
        items: [
          {
            id: 'adv-argument',
            french: 'Un argument convaincant',
            english: 'A convincing argument',
            pronunciation: 'uhn ar-gyoo-mahn kohn-vahn-kahn',
            example: 'Vous présentez un argument convaincant.',
            exampleEnglish: 'You present a convincing argument.',
            examplePronunciation: 'voo pray-zahn-tay uhn ar-gyoo-mahn kohn-vahn-kahn',
            usage: 'Used during formal discourse.'
          }
        ],
        practice: [
          {
            type: 'viewpoint-analysis',
            text: 'Editorial excerpt on AI in global labor markets'
          },
          {
            type: 'debate-simulation',
            topic: 'Should global technology platforms be regulated by international law?',
            steps: ['Present Claim', 'Provide Supporting Data', 'Refute Counter-claim']
          }
        ],
        speaking: {
          target: 'Bien que votre point de vue soit compréhensible, la réalité économique exige une autre approche.',
          translation: 'Although your point of view is understandable, economic reality demands another approach.',
          pronunciation: 'byahn kuh vohtr pwahn duh vyoo swah kohn-pray-nahn-bl, lah ray-ah-lee-tay ay-koh-noh-meek ek-seaz oon ohtr ah-prosh'
        },
        quiz: [
          {
            id: 'q1',
            question: 'What is the purpose of a counterargument in formal debate?',
            choices: ['To agree with the opponent', 'To directly address and refute the opposing claim', 'To change the subject', 'To state a simple fact'],
            answer: 'To directly address and refute the opposing claim'
          }
        ]
      },
      {
        id: 'm10-l12-final-mastery',
        title: 'Final French Mastery Challenge',
        type: 'b1-b2-debate',
        icon: '🏆',
        description: 'Comprehensive B2 assessment encompassing listening, reading, advanced grammar, argumentation, and debate.',
        learningGoals: [
          'Validate complete B2 proficiency',
          'Earn the B2 French Mastery Certificate'
        ],
        items: [],
        practice: [
          {
            type: 'mastery-exam',
            sections: ['Listening', 'Reading', 'Vocabulary', 'Grammar', 'Speaking', 'Writing', 'Argumentation', 'Debate']
          }
        ],
        speaking: {
          target: 'J\'ai atteint la maîtrise de la langue française au niveau B2 !',
          translation: 'I have achieved mastery of the French language at the B2 level!',
          pronunciation: 'zhay ah-tahn lah meh-treez duh lah lahng frahn-sehz oh nee-voh bay-deux'
        },
        quiz: [
          {
            id: 'q-mastery-1',
            question: 'Which connector is used to express a concession in advanced French?',
            choices: ['Bien que', 'Parce que', 'Car', 'Donc'],
            answer: 'Bien que'
          }
        ]
      }
    ]
  }
];

const COUNTRY_MODULE_MAP = {
  Canada: 'module-1',
  Morocco: 'module-2',
  'Ivory Coast': 'module-3',
  Italy: 'module-4',
  Cameroon: 'module-5',
  Belgium: 'module-6',
  Switzerland: 'module-7',
  Monaco: 'module-8',
  Luxembourg: 'module-9',
  France: 'module-10',
};

export const getDefaultModuleId = (countryName = 'Canada') => {
  const normalizedCountry = Array.isArray(countryName) ? countryName[0] : countryName;
  return COUNTRY_MODULE_MAP[normalizedCountry] || 'module-1';
};

export const getCountryTopics = (countryName = 'Canada', moduleId) => {
  const normalizedCountry = Array.isArray(countryName) ? countryName[0] : countryName;
  const resolvedModuleId = Array.isArray(moduleId) ? moduleId[0] : moduleId || getDefaultModuleId(normalizedCountry);
  const module = lessonCatalog.find((entry) => entry.id === resolvedModuleId) || lessonCatalog[0];

  return (module?.lessons ?? []).map((lesson) => {
    if (Array.isArray(lesson.subLessons) && lesson.subLessons.length) {
      return lesson;
    }

    const subLesson = {
      ...lesson,
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      items: Array.isArray(lesson.items) ? lesson.items : [],
      practice: Array.isArray(lesson.practice) ? lesson.practice : [],
      quiz: Array.isArray(lesson.quiz) ? lesson.quiz : [],
      speaking: lesson.speaking ?? null,
    };

    return {
      ...lesson,
      subLessons: [subLesson],
    };
  });
};

export const getModuleLabel = (countryName = 'Canada', moduleId) => {
  const normalizedCountry = Array.isArray(countryName) ? countryName[0] : countryName;
  const resolvedModuleId = Array.isArray(moduleId) ? moduleId[0] : moduleId || getDefaultModuleId(normalizedCountry);
  const module = lessonCatalog.find((entry) => entry.id === resolvedModuleId);

  return module ? `${normalizedCountry} • ${module.title}` : normalizedCountry;
};