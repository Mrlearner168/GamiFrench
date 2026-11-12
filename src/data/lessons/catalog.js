export const lessonCatalog = [
  {
    id: 'module-1',
    title: 'French Foundations ',
    flag: '🇫🇷',
    level: 'Pre-A1 (Absolute Beginner)',
    description:
      'Build a strong foundation in French through pronunciation, essential expressions, numbers, identity, and simple everyday sentences.',

    lessons: [
      {
        id: 'm1-topic-1',
        title: 'French Alphabet & Pronunciation',
        type: 'pronunciation',
        icon: '🔤',
        description:
          'Learn the French alphabet and essential pronunciation patterns.',

        subLessons: [
          {
            id: 'm1-l1-alphabet',
            title: 'French Alphabet & Letter Sounds',
            description:
              'Learn the 26 letters of the French alphabet and understand how French letter names differ from English.',
          },

          {
            id: 'm1-l2-vowels',
            title: 'French Vowels & Essential Sounds',
            description:
              'Learn the basic French vowel sounds and pronunciation patterns used throughout beginner French.',
          },
        ],
      },

      {
        id: 'm1-topic-2',
        title: 'Greetings & Polite Expressions',
        type: 'conversation',
        icon: '👋',
        description:
          'Learn the essential expressions used when meeting and speaking with people.',

        subLessons: [
          {
            id: 'm1-l3-greetings',
            title: 'Greetings & Polite Expressions',
            description:
              'Learn common French greetings and polite expressions used in everyday conversations.',
          },

          {
            id: 'm1-l4-how-are-you',
            title: 'How Are You? Basic Responses',
            description:
              'Learn how to ask how someone is and respond with simple expressions about your condition or mood.',
          },
        ],
      },

      {
        id: 'm1-topic-3',
        title: 'French Numbers',
        type: 'numbers',
        icon: '🔢',
        description:
          'Learn French numbers and use them in simple everyday situations.',

        subLessons: [
          {
            id: 'm1-l5-numbers-0-10',
            title: 'Numbers 0–10',
            description:
              'Learn the first French numbers and practice using them in simple situations.',
          },

          {
            id: 'm1-l6-numbers-11-20',
            title: 'Numbers 11–20',
            description:
              'Continue counting in French and practice recognizing numbers from eleven to twenty.',
          },
        ],
      },

      {
        id: 'm1-topic-4',
        title: 'Introducing Yourself',
        type: 'identity',
        icon: '🙋',
        description:
          'Learn how to introduce yourself and share basic personal information in French.',

        subLessons: [
          {
            id: 'm1-l7-name-identity',
            title: 'Introducing Yourself',
            description:
              'Learn how to say your name and introduce yourself using simple French sentences.',
          },

          {
            id: 'm1-l8-age-nationality',
            title: 'Age, Nationality & Where You Are From',
            description:
              'Learn how to talk about your age, nationality, and country of origin.',
          },
        ],
      },
//
      //{
      //  id: 'm1-topic-5',
      //  title: 'Building French Sentences',
      //  type: 'grammar',
      //  icon: '🧩',
      //  description:
      //    'Combine the French words and expressions you have learned to create simple meaningful sentences.',
//
      //  subLessons: [
      //    {
      //      id: 'm1-l9-basic-sentence-building',
      //      title: 'Build Your First French Sentences',
      //      description:
      //        'Combine words and expressions to create your first meaningful French sentences.',
      //    },
      //  ],
      //},
//
      //{
      //  id: 'm1-topic-6',
      //  title: 'First French Conversation',
      //  type: 'conversation',
      //  icon: '💬',
      //  description:
      //    'Put everything from Module 1 together in a short real-life conversation.',
//
      //  subLessons: [
      //    {
      //      id: 'm1-l10-first-conversation',
      //      title: 'Your First French Conversation',
      //      description:
      //        'Use greetings, introductions, numbers, and personal information in a short conversation.',
      //    },
      //  ],
      //},

      //{
      //  id: 'm1-topic-7',
      //  title: 'Module 1 Final Challenge',
      //  type: 'challenge',
      //  icon: '🏆',
      //  description:
      //    'Complete a practical French challenge using the skills learned throughout Module 1.',
//
      //  isFinalChallenge: true,
//
      //  subLessons: [
      //    {
      //      id: 'm1-l11-final-challenge',
      //      title: 'Module 1 Final Challenge',
      //      description:
      //        'Test your pronunciation, greetings, numbers, personal information, sentence building, and conversation skills.',
      //    },
      //  ],
      //},
    ],
  },

  {
    id: 'module-2',
    title: 'Everyday French',
    flag: '🇲🇦',
    level: 'A1',
    description:
      'Navigate daily routines, tell time, track calendar dates, identify colors, order food, and give town directions.',

    lessons: [
      {
        id: 'm2-topic-1',
        title: 'Daily Routine & Telling Time',
        type: 'routine',
        icon: '☀️',
        description:
          'Talk about your everyday routine and tell the time in real-life situations.',

        subLessons: [
          {
            id: 'm2-l1-daily-routine',
            title: 'My Daily Routine',
            description:
              'Describe what you do every day, from waking up to going to bed.',
          },

          {
            id: 'm2-l2-telling-time',
            title: 'Telling Time',
            description:
              'Ask for the time and say the time for meetings and appointments.',
          },
        ],
      },

      {
        id: 'm2-topic-2',
        title: 'Days, Dates & Weather',
        type: 'calendar',
        icon: '📅',
        description:
          'Say the days, months, and today’s date, and chat happily about the weather.',

        subLessons: [
          {
            id: 'm2-l3-days-dates',
            title: 'Days, Months & Dates',
            description:
              'Say the day, the month, and the full date for plans and tickets.',
          },

          {
            id: 'm2-l4-weather-seasons',
            title: 'Weather & Seasons',
            description:
              'Describe sunshine, rain, cold, and the four seasons in daily life.',
          },
        ],
      },

      {
        id: 'm2-topic-3',
        title: 'Colors, Clothes & Shopping',
        type: 'shopping',
        icon: '🛍️',
        description:
          'Describe colors and clothes, ask prices, and shop politely with confidence.',

        subLessons: [
          {
            id: 'm2-l5-colors-clothes',
            title: 'Colors & Clothes',
            description:
              'Name colors and everyday clothes when you shop or get dressed.',
          },

          {
            id: 'm2-l6-shopping-prices',
            title: 'Shopping & Prices',
            description:
              'Ask the price, react politely, and pay by card or in cash.',
          },
        ],
      },

      {
        id: 'm2-topic-4',
        title: 'Food, Café & Restaurant',
        type: 'food',
        icon: '🥐',
        description:
          'Order breakfast, lunch, and dinner happily at cafés and restaurants.',

        subLessons: [
          {
            id: 'm2-l7-morning-food',
            title: 'Breakfast & Everyday Food',
            description:
              'Talk about morning food and order drinks and snacks at a café.',
          },

          {
            id: 'm2-l8-at-restaurant',
            title: 'At the Restaurant',
            description:
              'Read a menu, order politely, and ask for the bill with a smile.',
          },
        ],
      },

      {
        id: 'm2-topic-5',
        title: 'Getting Around Town',
        type: 'directions',
        icon: '🗺️',
        description:
          'Find bakeries, stations, and markets, and ask for directions politely.',

        subLessons: [
          {
            id: 'm2-l9-town-places',
            title: 'Places in Town',
            description:
              'Name the station, bakery, pharmacy, market, and post office.',
          },

          {
            id: 'm2-l10-asking-directions',
            title: 'Asking for Directions',
            description:
              'Ask where places are and understand left, right, and straight ahead.',
          },
        ],
      },
    ],
  },

  {
    id: 'module-3',
    title: 'Family, Home & People',
    flag: '🇨🇮',
    level: 'A1',
    description:
      'Describe physical attributes, personality, family trees, living spaces, and positions.',

        lessons: [
      {
        id: 'm3-topic-1',
        title: 'Family Members',
        type: 'family',
        icon: '👨‍👩‍👧',
        description:
          'Name immediate family and describe family relationships.',

        subLessons: [
          {
            id: 'm3-l1-family',
            title: 'Family Members',
            description:
              'Learn and share the people who make up your family.',
          },
        ],
      },

      {
        id: 'm3-topic-2',
        title: 'Describing People',
        type: 'description',
        icon: '🙋',
        description:
          'Talk about looks, personality traits, and how someone seems.',

        subLessons: [
          {
            id: 'm3-l2-describing-people',
            title: 'Describing People & Personality',
            description:
              'Use simple words to describe how someone looks and who they are.',
          },
        ],
      },

      {
        id: 'm3-topic-3',
        title: 'My Home',
        type: 'home',
        icon: '🏠',
        description:
          'Name rooms, talk about where you live, and give your address.',

        subLessons: [
          {
            id: 'm3-l3-my-home',
            title: 'My Home & Where I Live',
            description:
              'Describe your home, your street, and the rooms inside.',
          },
        ],
      },

      {
        id: 'm3-topic-4',
        title: 'Where Things Are',
        type: 'directions',
        icon: '🗺️',
        description:
          'Use prepositions of place to explain where things are.',

        subLessons: [
          {
            id: 'm3-l4-prepositions',
            title: 'In, On, Under & Next To',
            description:
              'Say where objects are in a room: in, on, under, in front of, behind, next to, between.',
          },
        ],
      },
    ],
  },

  {
    id: 'module-4',
    title: 'Daily Life & Social Interaction',
    flag: '🇮🇹',
    level: 'A1',
    description:
      'Talk about hobbies, shop for clothes, order a meal, use public transport and make small talk.',

        lessons: [
      {
        id: 'm4-topic-1',
        title: 'Hobbies & Free Time',
        type: 'hobbies',
        icon: '🎨',
        description:
          'Talk about what you like, dislike, and love to do when you are free.',

        subLessons: [
          {
            id: 'm4-l1-hobbies',
            title: 'Hobbies & Free Time',
            description:
              'Name activities like reading, music, films, sport and cooking, and say what you love or hate.',
          },
        ],
      },

      {
        id: 'm4-topic-2',
        title: 'Clothes Shopping',
        type: 'shopping',
        icon: '🛍️',
        description:
          'Ask for sizes and colours, try clothes on, and buy what you like.',

        subLessons: [
          {
            id: 'm4-l2-shopping',
            title: 'Shopping for Clothes',
            description:
              'Ask for a size or colour, try things on, ask the price and say "Je le prends".',
          },
        ],
      },

      {
        id: 'm4-topic-3',
        title: 'Food, Café & Restaurant',
        type: 'food',
        icon: '🥐',
        description:
          'Order a full meal: starter, main course, dessert and a drink.',

        subLessons: [
          {
            id: 'm4-l3-dining-out',
            title: 'Ordering a Meal',
            description:
              'Name the parts of a meal and order with je prends, comme and pour moi.',
          },
        ],
      },

      {
        id: 'm4-topic-4',
        title: 'Transport & Getting Around',
        type: 'transport',
        icon: '🚌',
        description:
          'Buy and validate tickets, ask where a bus goes, and get off at your stop.',

        subLessons: [
          {
            id: 'm4-l4-transport',
            title: 'Getting Around by Transport',
            description:
              'Use the bus, metro, or train and ask where lines go.',
          },
        ],
      },

      {
        id: 'm4-topic-5',
        title: 'Weather & Small Talk',
        type: 'weather',
        icon: '☀️',
        description:
          'Comment on the weather and keep cheerful small talk going.',

        subLessons: [
          {
            id: 'm4-l5-weather-social',
            title: 'Weather & Small Talk',
            description:
              'Talk about sun, wind and bad weather, make small talk and link weather to plans.',
          },
        ],
      },
    ],
  },

  {
    id: 'module-5',
    title: 'Travel, Health & Real-Life Situations',
    flag: '🇨🇲',
    level: 'A1',
    description:
      'Find your gate, check in at a hotel, say where it hurts, order safely and pay in euros.',

        lessons: [
      {
        id: 'm5-topic-1',
        title: 'Travel & Hotels',
        type: 'travel',
        icon: '✈️',
        description:
          'Navigate airports, hotels and stays with confident everyday phrases.',

        subLessons: [
          {
            id: 'm5-l1-airport',
            title: 'At the Airport',
            description:
              'Check in, find your gate and handle delays calmly.',
          },

          {
            id: 'm5-l2-hotel',
            title: 'Hotel Check-In',
            description:
              'Give your reservation, choose a room and ask about amenities.',
          },
        ],
      },

      {
        id: 'm5-topic-2',
        title: 'Health & Emergencies',
        type: 'health',
        icon: '🩺',
        description:
          'Describe symptoms, get medicine and call for help when it matters.',

        subLessons: [
          {
            id: 'm5-l3-health',
            title: 'At the Doctor & Health',
            description:
              'Say where it hurts, since when, and understand instructions.',
          },
        ],
      },

      {
        id: 'm5-topic-3',
        title: 'Menus & Money',
        type: 'food',
        icon: '🍽️',
        description:
          'Read menus, order safely with allergies, and handle prices.',

        subLessons: [
          {
            id: 'm5-l4-restaurants',
            title: 'Restaurants & Menu Reading',
            description:
              'Read the menu, order each course, ask for advice and mention allergies.',
          },

          {
            id: 'm5-l5-numbers-prices',
            title: 'Numbers & Prices',
            description:
              'Count from 30 to 100 and say prices in euros and cents.',
          },
        ],
      },
    ],
  },

  {
    id: 'module-6',
    title: 'Education, Work & Technology',
    flag: '🇧🇪',
    level: 'A1+',
    description:
      'Workplace communication, schedules, technical terms, digital devices, instructions, and past/future tenses.',

        lessons: [
      {
        id: 'm6-topic-1',
        title: 'Work & School',
        type: 'work',
        icon: '💼',
        description:
          'Talk about your job, your studies, and your daily schedule.',

        subLessons: [
          {
            id: 'm6-l1-workplace',
            title: 'At Work',
            description:
              'Say what job you do, where you work and your working hours.',
          },

          {
            id: 'm6-l2-school',
            title: 'School & Studies',
            description:
              'Name classes, homework and exams like a real student.',
          },
        ],
      },

      {
        id: 'm6-topic-2',
        title: 'Technology',
        type: 'technology',
        icon: '💻',
        description:
          'Handle devices, batteries, Wi-Fi passwords and small breakdowns.',

        subLessons: [
          {
            id: 'm6-l3-technology',
            title: 'Phones, Computers & Internet',
            description:
              'Talk about devices, charging, passwords and tech problems.',
          },
        ],
      },

      {
        id: 'm6-topic-3',
        title: 'Time & Instructions',
        type: 'grammar',
        icon: '🧩',
        description:
          'Use past and future, and give or follow clear instructions.',

        subLessons: [
          {
            id: 'm6-l4-past-future',
            title: 'Yesterday & Tomorrow',
            description:
              'Say what you did (j\'ai travaillé) and what you are going to do (je vais travailler).',
          },

          {
            id: 'm6-l5-instructions',
            title: 'Instructions at Work',
            description:
              'Follow steps, ask someone to repeat, and confirm politely.',
          },
        ],
      },
    ],
  },

  {
    id: 'module-7',
    title: 'Media, Society & Opinions',
    flag: '🇨🇭',
    level: 'A1+',
    description:
      'Talk about the news and the environment, give simple opinions, and agree or disagree.',

        lessons: [
      {
        id: 'm7-topic-1',
        title: 'News & Environment',
        type: 'media',
        icon: '📰',
        description:
          'Understand news vocabulary and talk about green habits.',

        subLessons: [
          {
            id: 'm7-l1-news',
            title: 'Talking About the News',
            description:
              'Name media, say what you read or watch, and react to a story.',
          },

          {
            id: 'm7-l2-environment',
            title: 'Environment & Planet',
            description:
              'Discuss pollution, recycling and eco-friendly choices.',
          },
        ],
      },

      {
        id: 'm7-topic-2',
        title: 'Opinions & Debate',
        type: 'opinion',
        icon: '💬',
        description:
          'Give simple opinions, agree or disagree, and compare pros and cons.',

        subLessons: [
          {
            id: 'm7-l3-opinions',
            title: 'Giving Your Opinion',
            description:
              'Agree, disagree, give reasons and ask others back.',
          },

          {
            id: 'm7-l4-debate',
            title: 'Agreeing, Disagreeing & Debating',
            description:
              'Accept a point, add "mais", name an advantage or a problem, and conclude.',
          },
        ],
      },
    ],
  },

  {
    id: 'module-8',
    title: 'French Culture & Professional Communication',
    flag: '🇲🇨',
    level: 'A2',
    description:
      'Francophone arts, music and traditions, then your studies, career plans and polite job-interview French.',

        lessons: [
      {
        id: 'm8-topic-1',
        title: 'Culture & Traditions',
        type: 'culture',
        icon: '🎨',
        description:
          'Enjoy francophone arts, music, films and celebrations.',

        subLessons: [
          {
            id: 'm8-l1-culture',
            title: 'Francophone Culture & Arts',
            description:
              'Talk about concerts, films and famous cultural events.',
          },

          {
            id: 'm8-l2-traditions',
            title: 'Traditions & Celebrations',
            description:
              'Describe national days, family feasts and sweet traditions.',
          },
        ],
      },

      {
        id: 'm8-topic-2',
        title: 'Professional Communication',
        type: 'career',
        icon: '🤝',
        description:
          'Present your goals and shine in interviews and emails.',

        subLessons: [
          {
            id: 'm8-l3-career',
            title: 'Career Goals & Studies',
            description:
              'Talk about jobs, your studies, training, internships and plans.',
          },

          {
            id: 'm8-l4-interview',
            title: 'Professional Interviews & Emails',
            description:
              'Introduce yourself, answer questions and close politely.',
          },
        ],
      },
    ],
  },

  {
    id: 'module-9',
    title: 'Business, Economics & Innovation',
    flag: '🇱🇺',
    level: 'A2',
    description:
      'Simple business French: companies and customers, prices and money, new ideas and a short presentation.',

        lessons: [
      {
        id: 'm9-topic-1',
        title: 'Business & Money',
        type: 'business',
        icon: '📊',
        description:
          'Talk about companies, customers, prices and advertising.',

        subLessons: [
          {
            id: 'm9-l1-business',
            title: 'Companies & Customers',
            description:
              'Companies, customers, products, buying, selling and meetings.',
          },

          {
            id: 'm9-l2-marketing-finance',
            title: 'Marketing & Money',
            description:
              'Prices, money, advertising, going up or down, and comparing.',
          },
        ],
      },

      {
        id: 'm9-topic-2',
        title: 'Innovation & Presentations',
        type: 'innovation',
        icon: '🚀',
        description:
          'Share new ideas, launch products and give a short presentation.',

        subLessons: [
          {
            id: 'm9-l3-innovation',
            title: 'Ideas & New Products',
            description:
              'Ideas, projects, startups, il faut and the futur proche.',
          },

          {
            id: 'm9-l4-presentation',
            title: 'A Short Presentation',
            description:
              'Open, order your talk, show sales results and close politely.',
          },
        ],
      },
    ],
  },

  {
    id: 'module-10',
    title: 'The World & Final Review',
    flag: '🇫🇷',
    level: 'A2',
    description:
      'The world, values and the media in simple French, then a final review of the whole course.',

        lessons: [
      {
        id: 'm10-topic-1',
        title: 'The World & Values',
        type: 'society',
        icon: '🌍',
        description:
          'Talk about the world, compare countries and give opinions about values.',

        subLessons: [
          {
            id: 'm10-l1-globalization',
            title: 'The World & Globalization',
            description:
              'Countries, cultures, the planet, and comparing with plus / moins … que.',
          },

          {
            id: 'm10-l2-ethics',
            title: 'Values & Opinions',
            description:
              'Je pense que, à mon avis, parce que, agreeing and disagreeing.',
          },
        ],
      },

      {
        id: 'm10-topic-2',
        title: 'Media & Final Review',
        type: 'media',
        icon: '🔎',
        description:
          'Talk about the news and review everything you learned.',

        subLessons: [
          {
            id: 'm10-l3-media-analysis',
            title: 'The News & Social Media',
            description:
              'The news, true or false, facts vs opinions, and j\'ai lu / j\'ai regardé.',
          },

          {
            id: 'm10-l4-mastery',
            title: 'Final Mastery Challenge',
            description:
              'Introduce yourself, your past and your plans, and give a reason with parce que.',
          },
        ],
      },
    ],
  },
];
//COUNTRY → MODULE
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
//GET DEFAULT MODULE
export const getDefaultModuleId = (countryName = 'Canada') => {
  const normalizedCountry = Array.isArray(countryName)
    ? countryName[0]
    : countryName;

  return (
    COUNTRY_MODULE_MAP[normalizedCountry] ||
    'module-1'
  );
};

//GET COUNTRY FOR MODULE (inverse of the map above)
export const getCountryForModule = (moduleId) => {
  const resolvedModuleId = Array.isArray(moduleId)
    ? moduleId[0]
    : moduleId;

  const entry = Object.entries(COUNTRY_MODULE_MAP).find(
    ([, countryModuleId]) => countryModuleId === resolvedModuleId
  );

  return entry ? entry[0] : 'Canada';
};

export const getCountryTopics = (
  countryName = 'Canada',
  moduleId
) => {
  const normalizedCountry = Array.isArray(countryName)
    ? countryName[0]
    : countryName;

  const resolvedModuleId = Array.isArray(moduleId)
    ? moduleId[0]
    : moduleId ||
      getDefaultModuleId(normalizedCountry);

  const module =
    lessonCatalog.find(
      (entry) => entry.id === resolvedModuleId
    ) || lessonCatalog[0];

  return module?.lessons ?? [];
};
//GET MODULE LABEL
export const getModuleLabel = (
  countryName = 'Canada',
  moduleId
) => {
  const normalizedCountry = Array.isArray(countryName)
    ? countryName[0]
    : countryName;

  const resolvedModuleId = Array.isArray(moduleId)
    ? moduleId[0]
    : moduleId ||
      getDefaultModuleId(normalizedCountry);

  const module = lessonCatalog.find(
    (entry) => entry.id === resolvedModuleId
  );

  return module
    ? `${normalizedCountry} • ${module.title}`
    : normalizedCountry;
};

//helper function
export const findSubLessonById = (subLessonId) => {
  for (const module of lessonCatalog) {
    for (let lessonIndex = 0; lessonIndex < (module.lessons ?? []).length; lessonIndex++) {
      const lesson = module.lessons[lessonIndex];

      for (
        let subLessonIndex = 0;
        subLessonIndex < (lesson.subLessons ?? []).length;
        subLessonIndex++
      ) {
        const subLesson = lesson.subLessons[subLessonIndex];

        if (subLesson.id === subLessonId) {
          return {
            module,
            lesson,
            subLesson,
            lessonIndex,
            subLessonIndex,
          };
        }
      }
    }
  }

  return null;
};