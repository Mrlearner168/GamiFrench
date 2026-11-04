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
        title: 'Places & Directions',
        type: 'directions',
        icon: '🗺️',
        description:
          'Use prepositions and directions to explain where things are.',

        subLessons: [
          {
            id: 'm3-l4-prepositions',
            title: 'In, On, Under & Directions',
            description:
              'Say where objects are and give simple directions around a home.',
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
      'Master routines, hobbies, shopping, dining out, transportation, and weather forecast comprehension.',

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
              'Name activities like reading, music, sports, cooking and photography.',
          },
        ],
      },

      {
        id: 'm4-topic-2',
        title: 'Colors, Clothes & Shopping',
        type: 'shopping',
        icon: '🛍️',
        description:
          'Name colors and clothes, ask prices, and shop politely.',

        subLessons: [
          {
            id: 'm4-l2-shopping',
            title: 'Shopping & Prices',
            description:
              'Ask where to find things, how much they cost, and how to bargain.',
          },
        ],
      },

      {
        id: 'm4-topic-3',
        title: 'Food, Café & Restaurant',
        type: 'food',
        icon: '🥐',
        description:
          'Order at cafés and restaurants and ask for the bill.',

        subLessons: [
          {
            id: 'm4-l3-dining-out',
            title: 'Ordering Food & Dining Out',
            description:
              'Book a table, read a menu, order politely, and compliment the meal.',
          },
        ],
      },

      {
        id: 'm4-topic-4',
        title: 'Transport & Getting Around',
        type: 'transport',
        icon: '🚌',
        description:
          'Buy tickets, validate them, ask directions, and get off at stops.',

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
              'Describe sunshine, rain, seasons, and link weather to plans.',
          },
        ],
      },
    ],
  },

  {
    id: 'module-5',
    title: 'Travel, Health & Real-Life Situations',
    flag: '🇨🇲',
    level: 'A2',
    description:
      'Handle airport procedures, hotel bookings, health symptoms, doctor appointments, and urgent emergencies.',

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
              'Order starters, mains and desserts, and ask for advice.',
          },

          {
            id: 'm5-l5-numbers-prices',
            title: 'Numbers & Prices',
            description:
              'Count to 100 and understand euros, centimes and totals.',
          },
        ],
      },
    ],
  },

  {
    id: 'module-6',
    title: 'Education, Work & Technology',
    flag: '🇧🇪',
    level: 'A2',
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
              'Say where you work, your hours, meetings and holidays.',
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
              'Tell what you did and what you will do with easy markers.',
          },

          {
            id: 'm6-l5-instructions',
            title: 'Instructions & Directions',
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
    level: 'B1',
    description:
      'Engage with news stories, environmental issues, express nuanced opinions, and form hypotheses.',

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
              'Name media, react to a story, and understand headlines.',
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
          'Express nuanced opinions and build balanced arguments.',

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
              'Weigh advantages and drawbacks and conclude with confidence.',
          },
        ],
      },
    ],
  },

  {
    id: 'module-8',
    title: 'French Culture & Professional Communication',
    flag: '🇲🇨',
    level: 'B1',
    description:
      'Francophone arts, music, traditions, storytelling, career objectives, and professional interview simulations.',

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
              'Talk about your path, training, internships and motivation.',
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
    level: 'B2',
    description:
      'Corporate strategy, finance, marketing, contract negotiations, and executive presentations.',

        lessons: [
      {
        id: 'm9-topic-1',
        title: 'Business & Finance',
        type: 'business',
        icon: '📊',
        description:
          'Discuss companies, results, budgets and negotiations.',

        subLessons: [
          {
            id: 'm9-l1-business',
            title: 'Companies & Strategy',
            description:
              'Talk about revenue, growth, profit and markets.',
          },

          {
            id: 'm9-l2-marketing-finance',
            title: 'Marketing, Finance & Negotiation',
            description:
              'Budgets, targets, investments and closing deals.',
          },
        ],
      },

      {
        id: 'm9-topic-2',
        title: 'Innovation & Presentations',
        type: 'innovation',
        icon: '🚀',
        description:
          'Pitch ideas, launch products and present results like a leader.',

        subLessons: [
          {
            id: 'm9-l3-innovation',
            title: 'Innovation & Technology in Business',
            description:
              'Startups, new products and competitive value.',
          },

          {
            id: 'm9-l4-presentation',
            title: 'Business Presentations & Reports',
            description:
              'Open, present figures, contrast trends and close well.',
          },
        ],
      },
    ],
  },

  {
    id: 'module-10',
    title: 'Advanced French: Global Society & Debate',
    flag: '🇫🇷',
    level: 'B2',
    description:
      'Globalization, ethical debates, media bias analysis, rhetoric, and complete mastery evaluation.',

        lessons: [
      {
        id: 'm10-topic-1',
        title: 'Global Society & Ethics',
        type: 'society',
        icon: '🌍',
        description:
          'Debate globalization, sustainability and ethical questions.',

        subLessons: [
          {
            id: 'm10-l1-globalization',
            title: 'Globalization & Global Issues',
            description:
              'Discuss a connected world, inequality and sustainability.',
          },

          {
            id: 'm10-l2-ethics',
            title: 'Ethics & Debating Values',
            description:
              'Express doubt, conviction and values with nuance.',
          },
        ],
      },

      {
        id: 'm10-topic-2',
        title: 'Media Analysis & Mastery',
        type: 'media',
        icon: '🔎',
        description:
          'Analyse bias, argue with connectors, and master French.',

        subLessons: [
          {
            id: 'm10-l3-media-analysis',
            title: 'Analysing Media & Bias',
            description:
              'Facts vs opinions, reliable sources and social media.',
          },

          {
            id: 'm10-l4-mastery',
            title: 'Final Mastery Challenge',
            description:
              'Structure and deliver a complete advanced argument.',
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