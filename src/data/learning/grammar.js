/*
 * GRAMMAR CONTENT
 *
 * Extra grammar information shown from the "Grammar" button of the Learn
 * stage of a sublesson.
 *
 * Two levels of data are used and then merged together:
 *  - grammarByModule : the grammar scope of a module (rules, tenses and
 *    use cases that apply to every sublesson of that module).
 *  - grammarByTopic  : the focus and the specific rules of one sublesson.
 *
 * getGrammarContent() merges both and also turns the examples of the
 * sublesson learning content into spoken "use cases", so every topic has
 * its own tense forms and real sentences with a sound button.
 */

export const grammarByModule = {
  'module-1': {
    level: 'Pre-A1 (Absolute Beginner)',
    overview: [
      'At this level French is mostly about sounds, greetings, numbers and introducing yourself. Sentences stay short: subject + verb + object.',
      'Learn every new word together with its article (le, la, l\', les) because gender is part of the word in French.',
    ],
    rules: [
      {
        title: 'Subject pronouns are never dropped',
        text: 'English can drop "I" or "it"; French always keeps the pronoun before the verb.',
        french: 'Je suis étudiant.',
      },
      {
        title: 'Articles and gender',
        text: 'Nouns are masculine or feminine. Learn le / la / l\' / les with the noun, not separately.',
        french: 'le café, la gare, l\'ami, les amis',
      },
      {
        title: 'Elision before a vowel',
        text: 'je becomes j\' and le / la become l\' before a vowel or a silent h.',
        french: 'J\'ai un ami.',
      },
    ],
    tenses: [
      {
        name: 'Présent — s\'appeler (to be called)',
        note: 'The tense you use to give your own name.',
        forms: [
          { french: 'je m\'appelle', english: 'my name is / I am called' },
          { french: 'tu t\'appelles', english: 'your name is (informal)' },
          { french: 'il s\'appelle', english: 'his name is' },
          { french: 'elle s\'appelle', english: 'her name is' },
          { french: 'nous nous appelons', english: 'our names are' },
          { french: 'vous vous appelez', english: 'your name is (formal / plural)' },
          { french: 'ils s\'appellent', english: 'their names are' },
        ],
      },
      {
        name: 'Présent — être (to be)',
        note: 'Irregular but essential: used for identity, origin and description.',
        forms: [
          { french: 'je suis', english: 'I am' },
          { french: 'tu es', english: 'you are (informal)' },
          { french: 'il est', english: 'he / it is' },
          { french: 'elle est', english: 'she is' },
          { french: 'nous sommes', english: 'we are' },
          { french: 'vous êtes', english: 'you are (formal / plural)' },
          { french: 'ils sont', english: 'they are' },
        ],
      },
      {
        name: 'Présent — avoir (to have)',
        note: 'Used for age (j\'ai vingt ans) and for many everyday expressions.',
        forms: [
          { french: 'j\'ai', english: 'I have' },
          { french: 'tu as', english: 'you have (informal)' },
          { french: 'il a', english: 'he has' },
          { french: 'elle a', english: 'she has' },
          { french: 'nous avons', english: 'we have' },
          { french: 'vous avez', english: 'you have (formal / plural)' },
          { french: 'ils ont', english: 'they have' },
        ],
      },
    ],
    useCases: [
      {
        situation: 'Meeting someone politely',
        french: 'Bonjour, je m\'appelle Alex. Et vous ?',
        english: 'Hello, my name is Alex. And you?',
      },
      {
        situation: 'Asking how someone is (formal)',
        french: 'Comment allez-vous ?',
        english: 'How are you?',
      },
      {
        situation: 'Saying where you are from',
        french: 'Je viens du Canada.',
        english: 'I come from Canada.',
      },
    ],
  },
  'module-2': {
    level: 'A1 (Beginner)',
    overview: [
      'You now build full daily sentences: routines, time, dates, shopping, food and directions. The présent does most of the work.',
      'Two tools appear constantly: reflexive verbs for the daily routine (je me lève), and polite forms such as je voudrais and s\'il vous plaît.',
    ],
    rules: [
      {
        title: 'Présent of regular -er verbs',
        text: 'Drop -er and add -e, -es, -e, -ons, -ez, -ent. The endings -e, -es and -ent sound exactly the same.',
        french: 'je porte, tu portes, il porte, nous portons, vous portez, ils portent',
      },
      {
        title: 'Polite requests',
        text: 'Use je voudrais (I would like) instead of je veux when ordering or buying.',
        french: 'Je voudrais un café, s\'il vous plaît.',
      },
      {
        title: 'Asking a question',
        text: 'The easiest way: keep normal word order and raise your voice at the end.',
        french: 'Il y a une pharmacie près d\'ici ?',
      },
    ],
    tenses: [
      {
        name: 'Présent — aller (to go)',
        note: 'Je vais au travail, je vais à la gare: where you are going.',
        forms: [
          { french: 'je vais', english: 'I go / I am going' },
          { french: 'tu vas', english: 'you go' },
          { french: 'il va', english: 'he goes' },
          { french: 'nous allons', english: 'we go' },
          { french: 'vous allez', english: 'you go (formal / plural)' },
          { french: 'ils vont', english: 'they go' },
        ],
      },
      {
        name: 'Présent — se lever (to get up)',
        note: 'A reflexive verb, like se réveiller and se coucher.',
        forms: [
          { french: 'je me lève', english: 'I get up' },
          { french: 'tu te lèves', english: 'you get up' },
          { french: 'il se lève', english: 'he gets up' },
          { french: 'nous nous levons', english: 'we get up' },
          { french: 'vous vous levez', english: 'you get up (formal / plural)' },
          { french: 'ils se lèvent', english: 'they get up' },
        ],
      },
      {
        name: 'Présent — prendre (to take)',
        note: 'Used for transport, drinks and food.',
        forms: [
          { french: 'je prends', english: 'I take' },
          { french: 'tu prends', english: 'you take' },
          { french: 'il prend', english: 'he takes' },
          { french: 'nous prenons', english: 'we take' },
          { french: 'vous prenez', english: 'you take (formal / plural)' },
          { french: 'ils prennent', english: 'they take' },
        ],
      },
    ],
    useCases: [
      {
        situation: 'Telling the time',
        french: 'Il est huit heures et demie.',
        english: 'It is half past eight.',
      },
      {
        situation: 'Ordering at a café',
        french: 'Je voudrais un café au lait, s\'il vous plaît.',
        english: 'I would like a coffee with milk, please.',
      },
      {
        situation: 'Asking the way',
        french: 'Excusez-moi, où est la gare, s\'il vous plaît ?',
        english: 'Excuse me, where is the station, please?',
      },
      {
        situation: 'Paying in a shop',
        french: 'Ça fait quinze euros. — Je paie par carte.',
        english: 'That comes to fifteen euros. — I am paying by card.',
      },
    ],
  },
  'module-3': {
    level: 'A1 (Beginner)',
    overview: [
      'This module adds description: family, personality, home and the position of objects.',
      'Adjectives and possessives must agree with the noun, and il y a lets you describe any room.',
    ],
    rules: [
      {
        title: 'Possessive adjectives',
        text: 'They agree with the thing owned, not with the owner: mon / ma / mes, ton / ta / tes, son / sa / ses, notre / nos, votre / vos, leur / leurs.',
        french: 'mon frère, ma sœur, mes parents',
      },
      {
        title: 'Adjective agreement',
        text: 'Add -e for the feminine and -s for the plural. A few short adjectives go before the noun.',
        french: 'un petit garçon, une petite fille, des petits enfants',
      },
      {
        title: 'il y a',
        text: 'Means both "there is" and "there are".',
        french: 'Il y a une table dans la cuisine.',
      },
    ],
    tenses: [
      {
        name: 'Présent — être (to be)',
        note: 'Used to identify and to describe people.',
        forms: [
          { french: 'je suis', english: 'I am' },
          { french: 'tu es', english: 'you are' },
          { french: 'il est', english: 'he is' },
          { french: 'nous sommes', english: 'we are' },
          { french: 'vous êtes', english: 'you are (formal / plural)' },
          { french: 'ils sont', english: 'they are' },
        ],
      },
      {
        name: 'Présent — avoir (to have)',
        note: 'Used for family, features and possessions.',
        forms: [
          { french: 'j\'ai', english: 'I have' },
          { french: 'tu as', english: 'you have' },
          { french: 'elle a', english: 'she has' },
          { french: 'nous avons', english: 'we have' },
          { french: 'vous avez', english: 'you have (formal / plural)' },
          { french: 'ils ont', english: 'they have' },
        ],
      },
      {
        name: 'Présent — habiter (to live)',
        note: 'Regular -er verb used for your home and your town.',
        forms: [
          { french: 'j\'habite', english: 'I live' },
          { french: 'tu habites', english: 'you live' },
          { french: 'il habite', english: 'he lives' },
          { french: 'nous habitons', english: 'we live' },
          { french: 'vous habitez', english: 'you live (formal / plural)' },
          { french: 'ils habitent', english: 'they live' },
        ],
      },
    ],
    useCases: [
      {
        situation: 'Describing your family',
        french: 'J\'ai deux frères et une sœur.',
        english: 'I have two brothers and one sister.',
      },
      {
        situation: 'Describing someone\'s personality',
        french: 'Mon père est très gentil et un peu timide.',
        english: 'My father is very kind and a little shy.',
      },
      {
        situation: 'Describing your home',
        french: 'J\'habite dans un petit appartement au deuxième étage.',
        english: 'I live in a small flat on the second floor.',
      },
      {
        situation: 'Saying where an object is',
        french: 'Le chat est sous la table.',
        english: 'The cat is under the table.',
      },
    ],
  },
  'module-4': {
    level: 'A1 (Beginner)',
    overview: [
      'Daily life and social interaction: hobbies, clothes shopping, ordering a meal, public transport and small talk.',
      'Everything stays in the présent. You build on Module 2 with likes + infinitive, je peux + infinitive, prendre and il y a du for the weather.',
    ],
    rules: [
      {
        title: 'Likes and dislikes + infinitive',
        text: 'aimer / adorer / détester + an infinitive: the second verb does not change.',
        french: 'J\'adore lire. Je déteste faire du sport.',
      },
      {
        title: 'je peux + infinitive',
        text: 'Ask permission politely in a shop or restaurant.',
        french: 'Je peux essayer ? Je peux payer par carte ?',
      },
      {
        title: 'à + le = au',
        text: 'jouer au foot, je descends au prochain arrêt.',
        french: 'Je joue au tennis.',
      },
      {
        title: 'il fait + adjective / il y a du + noun',
        text: 'il fait beau, mauvais, doux; il y a du soleil, du vent.',
        french: 'Il fait doux et il y a du soleil.',
      },
    ],
    tenses: [
      {
        name: 'Présent — aimer (to like)',
        note: 'Regular -er verb, like adorer, détester, cuisiner, regarder and écouter.',
        forms: [
          { french: 'j\'aime', english: 'I like' },
          { french: 'tu aimes', english: 'you like' },
          { french: 'il / elle aime', english: 'he / she likes' },
        ],
      },
      {
        name: 'Présent — prendre (to take / to have)',
        note: 'Used for transport, ordering food and buying: je le prends.',
        forms: [
          { french: 'je prends', english: 'I take / I will have' },
          { french: 'tu prends', english: 'you take' },
        ],
      },
      {
        name: 'Présent — pouvoir (can)',
        note: 'je peux + infinitive asks permission.',
        forms: [
          { french: 'je peux', english: 'I can / may' },
        ],
      },
    ],
    useCases: [
      {
        situation: 'Talking about hobbies',
        french: 'Tu aimes lire ? — Oui, j\'adore !',
        english: 'Do you like reading? — Yes, I love it!',
      },
      {
        situation: 'Trying on clothes',
        french: 'Je peux essayer ce pull ? — C\'est trop petit.',
        english: 'Can I try on this sweater? — It is too small.',
      },
      {
        situation: 'Ordering a meal',
        french: 'Comme plat, je prends le poulet, s\'il vous plaît.',
        english: 'As a main course, I will have the chicken, please.',
      },
      {
        situation: 'Taking the bus',
        french: 'Est-ce que ce bus va à la gare ?',
        english: 'Does this bus go to the station?',
      },
      {
        situation: 'Small talk about the weather',
        french: 'Il fait beau aujourd\'hui, non ? Quelle belle journée !',
        english: 'Nice weather today, isn\'t it? What a lovely day!',
      },
    ],
  },
  'module-5': {
    level: 'A1 (Beginner)',
    overview: [
      'Real-life survival French: the airport, the hotel, the doctor, the restaurant and paying. Everything stays in the présent.',
      'A few short patterns do most of the work: avoir mal à + body part, depuis + time, polite vous questions and commands, and prices in euros.',
    ],
    rules: [
      {
        title: 'avoir mal à + body part',
        text: 'à la + feminine, au (à + le) + masculine.',
        french: 'J\'ai mal à la gorge. J\'ai mal au ventre.',
      },
      {
        title: 'depuis + present tense',
        text: 'Use the present with depuis for something that is still going on.',
        french: 'J\'ai mal à la tête depuis hier.',
      },
      {
        title: 'Numbers 70–99',
        text: 'soixante-dix (60 + 10), quatre-vingts (4 × 20), quatre-vingt-dix (80 + 10).',
        french: 'Ça fait quatre-vingt-quinze euros.',
      },
    ],
    tenses: [
      {
        name: 'Présent — avoir (to have)',
        note: 'For reservations, suitcases and aches: j\'ai une réservation, j\'ai mal à la tête.',
        forms: [
          { french: 'j\'ai', english: 'I have' },
          { french: 'tu as', english: 'you have' },
          { french: 'il / elle a', english: 'he / she has' },
          { french: 'nous avons', english: 'we have' },
          { french: 'vous avez', english: 'you have (formal / plural)' },
          { french: 'ils / elles ont', english: 'they have' },
        ],
      },
      {
        name: 'Présent — être (to be)',
        note: 'For states and descriptions: je suis malade, le vol est en retard.',
        forms: [
          { french: 'je suis', english: 'I am' },
          { french: 'tu es', english: 'you are' },
          { french: 'il / elle est', english: 'he / she / it is' },
          { french: 'nous sommes', english: 'we are' },
          { french: 'vous êtes', english: 'you are (formal / plural)' },
          { french: 'ils / elles sont', english: 'they are' },
        ],
      },
      {
        name: 'Commands with vous (impératif)',
        note: 'No subject, verb ending in -ez: instructions and requests for help.',
        forms: [
          { french: 'Prenez ce médicament.', english: 'Take this medicine.' },
          { french: 'Appelez un médecin !', english: 'Call a doctor!' },
          { french: 'Excusez-moi.', english: 'Excuse me.' },
        ],
      },
    ],
    useCases: [
      {
        situation: 'At the airport',
        french: 'Excusez-moi, où est la porte douze ? Mon vol est à dix heures.',
        english: 'Excuse me, where is gate twelve? My flight is at ten o\'clock.',
      },
      {
        situation: 'At the hotel',
        french: 'J\'ai une réservation au nom de Martin, pour deux nuits.',
        english: 'I have a reservation under the name Martin, for two nights.',
      },
      {
        situation: 'At the doctor',
        french: 'Je suis malade : j\'ai de la fièvre depuis deux jours.',
        english: 'I am sick: I have had a fever for two days.',
      },
      {
        situation: 'At the restaurant',
        french: 'Je suis allergique au lait. Qu\'est-ce que vous me conseillez ?',
        english: 'I am allergic to milk. What do you recommend?',
      },
      {
        situation: 'Paying',
        french: 'Ça fait combien ? — Ça fait trente-deux euros cinquante.',
        english: 'How much is it? — It is thirty-two euros fifty.',
      },
    ],
  },
  'module-6': {
    level: 'A1+ (Late Beginner)',
    overview: [
      'Work, school and technology: your job, your studies, your devices and simple instructions at work.',
      'You keep using the present, and you take your first steps into the past (j\'ai travaillé) and the future (je vais travailler).',
    ],
    rules: [
      {
        title: 'Jobs without an article',
        text: 'After être, say the job directly: je suis professeur, elle est employée.',
        french: 'Je suis étudiant.',
      },
      {
        title: 'ne … pas',
        text: 'ne before the verb, pas after it.',
        french: 'Je ne comprends pas. Ça ne marche pas.',
      },
      {
        title: 'Polite instructions',
        text: 'Use the vous form without vous, and order the steps with d\'abord, ensuite, enfin.',
        french: 'D\'abord, ouvrez le fichier. Ensuite, cliquez ici.',
      },
    ],
    tenses: [
      {
        name: 'Présent — travailler (to work)',
        note: 'Regular -er verb for your job and your schedule.',
        forms: [
          { french: 'je travaille', english: 'I work' },
          { french: 'tu travailles', english: 'you work' },
          { french: 'il travaille', english: 'he works' },
          { french: 'nous travaillons', english: 'we work' },
          { french: 'vous travaillez', english: 'you work (formal / plural)' },
          { french: 'ils travaillent', english: 'they work' },
        ],
      },
      {
        name: 'Passé composé with avoir',
        note: 'What you did: avoir + past participle (travaillé, fini, envoyé).',
        forms: [
          { french: 'j\'ai travaillé', english: 'I worked' },
          { french: 'j\'ai fini', english: 'I finished' },
          { french: 'il a envoyé', english: 'he sent' },
          { french: 'elle a travaillé', english: 'she worked' },
        ],
      },
      {
        name: 'Futur proche — aller + infinitive',
        note: 'What you are going to do: je vais + infinitive.',
        forms: [
          { french: 'je vais travailler', english: 'I am going to work' },
          { french: 'je vais apprendre', english: 'I am going to learn' },
        ],
      },
    ],
    useCases: [
      {
        situation: 'Talking about your job',
        french: 'Je travaille dans un bureau de neuf heures à cinq heures.',
        english: 'I work in an office from nine to five.',
      },
      {
        situation: 'Talking about your studies',
        french: 'J\'apprends le français et j\'ai un examen lundi.',
        english: 'I am learning French and I have an exam on Monday.',
      },
      {
        situation: 'A technical problem',
        french: 'Ma batterie est faible. Vous avez un chargeur ?',
        english: 'My battery is low. Do you have a charger?',
      },
      {
        situation: 'Past and future',
        french: 'Hier, j\'ai fini mes devoirs. Demain, je vais travailler.',
        english: 'Yesterday, I finished my homework. Tomorrow, I am going to work.',
      },
    ],
  },
  'module-7': {
    level: 'A1+ (Late Beginner)',
    overview: [
      'This module uses simple French to talk about the news and the environment, give your opinion and take part in a short debate.',
      'You use c\'est + adjective to react, il faut + infinitive for what we must do, and j\'ai lu / j\'ai vu for things you already read or saw.',
    ],
    rules: [
      {
        title: 'Opinion openers',
        text: 'je pense que + sentence, à mon avis, + sentence. Que becomes qu\' before a vowel.',
        french: 'Je pense que c\'est une bonne idée.',
      },
      {
        title: 'Agree, disagree and give a reason',
        text: 'je suis d\'accord / je ne suis pas d\'accord, then parce que (because) for your reason and mais (but) for the other side.',
        french: 'Je ne suis pas d\'accord parce que c\'est cher.',
      },
      {
        title: 'c\'est + adjective',
        text: 'React and compare with c\'est: the adjective stays masculine (intéressant, triste, pratique, cher, important).',
        french: 'La voiture, c\'est pratique, mais c\'est cher.',
      },
      {
        title: 'il faut + infinitive',
        text: 'Il faut never changes; the next verb stays in the infinitive.',
        french: 'Il faut protéger la planète.',
      },
    ],
    tenses: [
      {
        name: 'Présent — useful je-forms',
        note: 'Habits with media and the environment.',
        forms: [
          { french: 'je lis', english: 'I read' },
          { french: 'je regarde', english: 'I watch' },
          { french: 'j\'écoute', english: 'I listen to' },
          { french: 'je recycle', english: 'I recycle' },
          { french: 'je fais le tri', english: 'I sort the waste' },
          { french: 'je pense', english: 'I think' },
        ],
      },
      {
        name: 'Passé composé with avoir (two common verbs)',
        note: 'j\'ai + past participle: what you already saw or read.',
        forms: [
          { french: 'j\'ai vu', english: 'I saw (voir)' },
          { french: 'j\'ai lu', english: 'I read (lire)' },
        ],
      },
    ],
    useCases: [
      {
        situation: 'Talking about the news',
        french: 'J\'ai vu ça aux infos : c\'est triste.',
        english: 'I saw that on the news: it is sad.',
      },
      {
        situation: 'Describing green habits',
        french: 'Je fais le tri et je vais au travail à vélo.',
        english: 'I sort the waste and I go to work by bike.',
      },
      {
        situation: 'Giving your opinion',
        french: 'À mon avis, il faut recycler parce que c\'est important.',
        english: 'In my opinion, we must recycle because it is important.',
      },
      {
        situation: 'A short debate',
        french: 'C\'est vrai, le bus est lent, mais c\'est pratique.',
        english: 'That is true, the bus is slow, but it is practical.',
      },
    ],
  },
  'module-8': {
    level: 'A2 (Elementary)',
    overview: [
      'Talk about French culture and traditions: say what you like, what you saw and what people do at celebrations.',
      'Then present yourself professionally: your studies, your plans and simple, polite interview and email phrases.',
    ],
    rules: [
      {
        title: 'Likes: j\'aime / j\'adore + article',
        text: 'Keep le / la / les after these verbs. J\'adore is stronger than j\'aime.',
        french: 'J\'aime la musique française. J\'adore les films français.',
      },
      {
        title: 'on = we',
        text: 'In everyday speech, on means "we" and takes the il / elle form of the verb.',
        french: 'On fête Noël en famille.',
      },
      {
        title: 'Politeness: vous, votre and je voudrais',
        text: 'Use the vous form with an interviewer or an employer, and je voudrais + infinitive for a polite wish.',
        french: 'Je voudrais travailler dans votre entreprise.',
      },
    ],
    tenses: [
      {
        name: 'Passé composé with avoir',
        note: 'A finished action: j\'ai + past participle.',
        forms: [
          { french: 'j\'ai vu', english: 'I saw / I watched' },
          { french: 'j\'ai adoré', english: 'I loved' },
          { french: 'j\'ai fait', english: 'I did' },
        ],
      },
      {
        name: 'Futur proche — aller + infinitive',
        note: 'What you are going to do: your plans.',
        forms: [
          { french: 'je vais travailler', english: 'I am going to work' },
          { french: 'je vais faire un stage', english: 'I am going to do an internship' },
        ],
      },
      {
        name: 'Polite wishes — je voudrais',
        note: 'I would like: add an infinitive.',
        forms: [
          { french: 'je voudrais être', english: 'I would like to be' },
          { french: 'je voudrais travailler', english: 'I would like to work' },
        ],
      },
    ],
    useCases: [
      {
        situation: 'Recommending a film to a friend',
        french: 'J\'ai vu un film français. Je te recommande ce film.',
        english: 'I watched a French film. I recommend this film to you.',
      },
      {
        situation: 'Inviting people to a celebration',
        french: 'Le 14 juillet, il y a des feux d\'artifice. Venez fêter avec nous !',
        english: 'On July 14, there are fireworks. Come and celebrate with us!',
      },
      {
        situation: 'Talking about your career plan',
        french: 'Je voudrais être ingénieur. Je vais faire un stage à Paris.',
        english: 'I would like to be an engineer. I am going to do an internship in Paris.',
      },
      {
        situation: 'Ending a job interview',
        french: 'Merci pour votre temps. Au revoir, Madame.',
        english: 'Thank you for your time. Goodbye, madam.',
      },
    ],
  },
  'module-9': {
    level: 'A2 (Elementary)',
    overview: [
      'Simple business French: companies and customers, prices and money, new ideas and a short presentation.',
      'You use the present of vendre and acheter, compare with plus / moins … que, talk about plans with aller + infinitive and give results in the passé composé.',
    ],
    rules: [
      {
        title: 'Comparatives',
        text: 'plus / moins + adjective + que.',
        french: 'Ce produit est plus cher que l\'autre.',
      },
      {
        title: 'il faut + infinitive',
        text: 'Says what is necessary. pour + infinitive says why.',
        french: 'Il faut innover pour aider les clients.',
      },
      {
        title: 'Passé composé with avoir',
        text: 'avoir + past participle: augmenter → augmenté, baisser → baissé, vendre → vendu.',
        french: 'Nous avons vendu cent vélos.',
      },
    ],
    tenses: [
      {
        name: 'Présent — vendre (to sell)',
        note: 'Regular -re verb; the d is silent in the singular.',
        forms: [
          { french: 'je vends', english: 'I sell' },
          { french: 'tu vends', english: 'you sell' },
          { french: 'il vend', english: 'he sells' },
          { french: 'nous vendons', english: 'we sell' },
          { french: 'vous vendez', english: 'you sell (formal / plural)' },
          { french: 'ils vendent', english: 'they sell' },
        ],
      },
      {
        name: 'Futur proche (aller + infinitive)',
        note: 'What is going to happen soon: plans and launches.',
        forms: [
          { french: 'je vais présenter', english: 'I am going to present' },
          { french: 'tu vas créer', english: 'you are going to create' },
          { french: 'elle va lancer', english: 'she is going to launch' },
          { french: 'nous allons lancer', english: 'we are going to launch' },
          { french: 'vous allez acheter', english: 'you are going to buy (formal / plural)' },
          { french: 'ils vont vendre', english: 'they are going to sell' },
        ],
      },
      {
        name: 'Passé composé with avoir',
        note: 'Results: what happened.',
        forms: [
          { french: 'j\'ai vendu', english: 'I sold' },
          { french: 'tu as acheté', english: 'you bought' },
          { french: 'le prix a baissé', english: 'the price went down' },
          { french: 'nous avons vendu', english: 'we sold' },
          { french: 'vous avez lancé', english: 'you launched (formal / plural)' },
          { french: 'les ventes ont augmenté', english: 'sales went up' },
        ],
      },
    ],
    useCases: [
      {
        situation: 'Saying where you work',
        french: 'Je travaille dans une petite entreprise.',
        english: 'I work in a small company.',
      },
      {
        situation: 'Comparing prices',
        french: 'Ce produit est moins cher que l\'autre.',
        english: 'This product is cheaper than the other one.',
      },
      {
        situation: 'Sharing an idea',
        french: 'Nous allons lancer un nouveau produit.',
        english: 'We are going to launch a new product.',
      },
      {
        situation: 'Giving a result in a presentation',
        french: 'Regardez ce graphique : les ventes ont augmenté.',
        english: 'Look at this chart: sales went up.',
      },
    ],
  },
  'module-10': {
    level: 'A2 (Elementary)',
    overview: [
      'Final module: the world, values and the media, said in short, clear sentences.',
      'You compare with plus / moins … que, give opinions with je pense que, à mon avis and parce que, and combine the present, the passé composé and the futur proche to talk about yourself.',
    ],
    rules: [
      {
        title: 'Comparing with plus / moins … que',
        text: 'plus / moins + adjective + que. The adjective agrees with the subject.',
        french: 'La France est plus petite que le Canada.',
      },
      {
        title: 'Opinion and reason',
        text: 'Je pense que / À mon avis + sentence, then parce que for the reason and mais for a contrast.',
        french: 'À mon avis, il faut aider les autres parce que c\'est juste.',
      },
      {
        title: 'il faut + infinitive',
        text: 'Says what we must do. The second verb stays in the infinitive.',
        french: 'Il faut vérifier la source.',
      },
      {
        title: 'Ordering ideas',
        text: 'd\'abord (first), ensuite (then), enfin (finally).',
        french: 'D\'abord je travaille, ensuite je mange, enfin je dors.',
      },
    ],
    tenses: [
      {
        name: 'Passé composé with avoir (what you did)',
        note: 'avoir in the present + past participle.',
        forms: [
          { french: 'j\'ai lu', english: 'I read (past)' },
          { french: 'j\'ai regardé', english: 'I watched' },
          { french: 'j\'ai appris', english: 'I learned' },
          { french: 'j\'ai visité', english: 'I visited' },
        ],
      },
      {
        name: 'Futur proche (what you are going to do)',
        note: 'aller in the present + infinitive.',
        forms: [
          { french: 'je vais voyager', english: 'I am going to travel' },
        ],
      },
    ],
    useCases: [
      {
        situation: 'Talking about the world',
        french: 'La mondialisation change le monde, mais il faut protéger la planète.',
        english: 'Globalization changes the world, but we must protect the planet.',
      },
      {
        situation: 'Giving your opinion',
        french: 'Je pense que le respect est très important.',
        english: 'I think that respect is very important.',
      },
      {
        situation: 'Talking about the news',
        french: 'Hier, j\'ai lu un article, mais il faut vérifier la source.',
        english: 'Yesterday, I read an article, but we must check the source.',
      },
      {
        situation: 'Presenting yourself at the end of the course',
        french: 'Je m\'appelle Sam. J\'ai appris le français, et je vais voyager en France.',
        english: 'My name is Sam. I learned French, and I am going to travel to France.',
      },
    ],
  },
};

export const grammarByTopic = {
  'm1-l1-alphabet': {
    focus: 'The French alphabet uses the same 26 letters as English, but the letters do not have the same names or the same sounds.',
    rules: [
      {
        title: 'Letter names vs sounds',
        text: 'You name a letter (b = "bay", r = "air"), while inside a word the letter keeps its own sound. Watch the pair g = "zhay" / j = "zhee", swapped compared with English.',
        french: 'a, b, c, d, e — g, j, r',
      },
      {
        title: 'Final consonants are usually silent',
        text: 'Many letters at the end of a word are not pronounced, which is why spelling and sound differ so much.',
        french: 'salut, petit, vous',
      },
      {
        title: 'Accents are part of the word',
        text: 'é, è, ê, à, ç change the sound or the meaning and must be written.',
        french: 'café, mère, ça',
      },
    ],
  },
  'm1-l2-vowels': {
    focus: 'French vowels are short and tense; accents change their sound rather than their length.',
    rules: [
      {
        title: 'The vowel u is not "oo"',
        text: 'Say "ee" and round your lips to get the French u; ou is the "oo" sound.',
        french: 'tu, une, tout',
      },
      {
        title: 'Accents guide the sound',
        text: 'é = ay, è / ê = eh, and ç is always a soft "s" sound.',
        french: 'café, mère, fête, ça',
      },
      {
        title: 'The silent e',
        text: 'A final e is usually not pronounced, but it makes the previous consonant sound.',
        french: 'une petite fille',
      },
    ],
  },
  'm1-l3-greetings': {
    focus: 'Greetings change with the level of formality: tu with friends and family, vous with strangers, teachers, shopkeepers and at work.',
    rules: [
      {
        title: 'tu or vous?',
        text: 'Use vous with anyone you do not know well, and with any group of people.',
        french: 'Comment allez-vous ?',
      },
      {
        title: 'Greetings according to the time',
        text: 'Bonjour until about 6 p.m., bonsoir in the evening; salut is informal at any time.',
        french: 'Bonsoir, madame.',
      },
      {
        title: 'Polite add-ons',
        text: 'Madame / Monsieur, s\'il vous plaît and merci make every exchange polite. Salut is for friends only.',
        french: 'Merci beaucoup, au revoir !',
      },
    ],
  },
  'm1-l4-how-are-you': {
    focus: 'Asking and answering "how are you" uses the verb aller, and the reply can range from great to terrible.',
    rules: [
      {
        title: 'Ça va ?',
        text: 'The shortest question; answer with ça va, ça va bien, comme ci comme ça or ça ne va pas.',
        french: 'Ça va ? — Oui, ça va bien.',
      },
      {
        title: 'Match tu / vous',
        text: 'Comment ça va ? with friends, Comment allez-vous ? with people you say vous to.',
        french: 'Comment allez-vous ?',
      },
      {
        title: 'Return the question',
        text: 'Answer, then ask back with the same form: et toi ? to a friend, et vous ? to vous.',
        french: 'Ça va bien, merci. Et vous ?',
      },
    ],
  },
  'm1-l5-numbers-0-10': {
    focus: 'Numbers 0–10 are the base you need for prices, times, phone numbers and dates.',
    rules: [
      {
        title: 'un / une agree with the noun',
        text: '"one" has a masculine and a feminine form.',
        french: 'un café, une table',
      },
      {
        title: 'Numbers come before the noun',
        text: 'From deux upwards the noun takes the plural -s (usually silent).',
        french: 'un café, deux cafés',
      },
      {
        title: 'Linking before a vowel',
        text: 'The final consonant of a number is often linked to a following vowel: x and s sound like z, t is heard.',
        french: 'dix euros (deez), huit amis (weet)',
      },
    ],
  },
  'm1-l6-numbers-11-20': {
    focus: 'The teens follow a clear pattern with a few spelling changes you must memorise.',
    rules: [
      {
        title: '11–16 are words to memorise',
        text: 'onze, douze, treize, quatorze, quinze and seize have no pattern: learn them by heart.',
        french: 'onze, douze, treize, quatorze, quinze, seize',
      },
      {
        title: 'Pattern 17–19',
        text: 'dix-sept, dix-huit, dix-neuf are simply dix + the small number with a hyphen.',
        french: 'dix-sept, dix-huit, dix-neuf',
      },
      {
        title: 'vingt',
        text: 'The gt of vingt is silent, but the t is heard before a vowel.',
        french: 'vingt (van), vingt ans (van-tahn)',
      },
    ],
  },
  'm1-l7-name-identity': {
    focus: 'Introducing yourself combines je m\'appelle with je suis + a noun (je suis étudiant).',
    rules: [
      {
        title: 'je m\'appelle',
        text: 'Reflexive verb s\'appeler: je + m\'appelle means "my name is".',
        french: 'Je m\'appelle Sara.',
      },
      {
        title: 'je suis + noun',
        text: 'No article before a job, a nationality or a status.',
        french: 'Je suis étudiante.',
      },
      {
        title: 'Feminine -e',
        text: 'A woman adds -e in writing: enchantée, étudiante.',
        french: 'Enchantée !',
      },
      {
        title: 'Asking the question back',
        text: 'Et vous ? / Et toi ? returns the question politely.',
        french: 'Et vous, comment vous appelez-vous ?',
      },
    ],
  },
  'm1-l8-age-nationality': {
    focus: 'Age uses avoir (not être) and nationalities change with gender and number.',
    rules: [
      {
        title: 'Age with avoir',
        text: 'J\'ai vingt ans literally means "I have twenty years".',
        french: 'J\'ai vingt ans.',
      },
      {
        title: 'Nationality agreement',
        text: 'Add -e for the feminine (-ien becomes -ienne); nationalities stay lowercase in French.',
        french: 'français / française, canadien / canadienne',
      },
      {
        title: 'Origin: de / du',
        text: 'de with a city or a feminine country, du with a masculine country.',
        french: 'Je viens de Paris. Je viens du Canada.',
      },
    ],
  },
  'm1-l9-basic-sentence-building': {
    focus: 'Basic word order in French is subject + verb + object, with no auxiliary for the present.',
    rules: [
      {
        title: 'Subject + verb + object',
        text: 'Unlike English, the subject pronoun is never dropped.',
        french: 'Je mange une pomme.',
      },
      {
        title: 'Negation with ne... pas',
        text: 'Wrap the verb: ne + verb + pas.',
        french: 'Je ne comprends pas.',
      },
      {
        title: 'Questions',
        text: 'Keep the normal order and add est-ce que at the beginning.',
        french: 'Est-ce que tu parles français ?',
      },
    ],
  },
  'm1-l10-first-conversation': {
    focus: 'A first conversation combines greetings, identity, age and polite questions in a natural turn-taking order.',
    rules: [
      {
        title: 'Give and ask back',
        text: 'Answer first, then bounce the question back with Et vous ? / Et toi ?',
        french: 'Et vous, vous êtes d\'où ?',
      },
      {
        title: 'Keep the same register',
        text: 'Do not mix tu and vous in the same conversation with a new person.',
        french: 'Vous êtes français, n\'est-ce pas ?',
      },
    ],
  },
  'm1-l11-final-challenge': {
    focus: 'Revision topic: pronunciation, greetings, numbers and identity used together in one conversation.',
    rules: [
      {
        title: 'Useful closing phrases',
        text: 'enchanté, ravi de vous rencontrer, bonne journée close an introduction.',
        french: 'Enchanté de vous rencontrer.',
      },
      {
        title: 'Recycle the essentials',
        text: 'You can already use être, avoir, s\'appeler and the numbers 0–20 in one sentence.',
        french: 'J\'ai dix-huit ans et je suis étudiant.',
      },
    ],
  },
  'm2-l1-daily-routine': {
    focus: 'Daily routine uses reflexive verbs (se réveiller, se lever, se coucher) and à + time to say when.',
    rules: [
      {
        title: 'Reflexive verbs',
        text: 'A reflexive pronoun sits between the subject and the verb: je me…, tu te…, il se…',
        french: 'Je me lève. Tu te lèves. Il se couche.',
      },
      {
        title: 'Saying when',
        text: 'à + time, then du matin (in the morning) or du soir (in the evening) if needed.',
        french: 'Je me réveille à sept heures du matin.',
      },
      {
        title: 'Meals use prendre',
        text: 'French "takes" its meals: prendre le petit-déjeuner.',
        french: 'Je prends le petit-déjeuner à huit heures.',
      },
    ],
  },
  'm2-l2-telling-time': {
    focus: 'Telling the time uses il est + hour, with et quart, et demie and moins le quart.',
    rules: [
      {
        title: 'il est + hour',
        text: 'Only une heure is singular; all the other hours take -s.',
        french: 'Il est une heure. Il est trois heures.',
      },
      {
        title: 'Quarter to = the next hour',
        text: 'moins le quart takes away fifteen minutes from the NEXT hour.',
        french: 'Il est dix heures moins le quart. (9:45)',
      },
      {
        title: 'midi and minuit',
        text: 'Noon and midnight have their own words, with no "heures".',
        french: 'Il est midi. Il est minuit.',
      },
    ],
  },
  'm2-l3-days-dates': {
    focus: 'Dates are formed with le + number + month; days and months stay lowercase.',
    rules: [
      {
        title: 'le + number + month',
        text: 'Only the first of the month uses premier; the others use the plain number.',
        french: 'le premier juin, le cinq mars',
      },
      {
        title: 'Lowercase days and months',
        text: 'lundi, mardi, mai, juillet — French does not capitalise them.',
        french: 'Nous sommes le samedi cinq mars.',
      },
      {
        title: 'en + month, le + day',
        text: 'en janvier = in January. le samedi = every Saturday.',
        french: 'Mon anniversaire est en janvier.',
      },
    ],
  },
  'm2-l4-weather-seasons': {
    focus: 'Weather expressions start with il fait (general weather) or il + verb (il pleut, il neige).',
    rules: [
      {
        title: 'il fait + adjective',
        text: 'For general conditions: il fait beau, il fait chaud, il fait froid.',
        french: 'Il fait beau aujourd\'hui.',
      },
      {
        title: 'Rain and snow',
        text: 'They have their own verbs, without fait.',
        french: 'Il pleut. Il neige.',
      },
      {
        title: 'Season prepositions',
        text: 'en été, en automne, en hiver, but au printemps.',
        french: 'Au printemps, il fait beau.',
      },
    ],
  },
  'm2-l5-colors-clothes': {
    focus: 'Colours are adjectives: they come after the noun and agree with it.',
    rules: [
      {
        title: 'After the noun',
        text: 'Unlike English, the colour follows the noun.',
        french: 'un pull rouge, un manteau noir',
      },
      {
        title: 'Colour agreement',
        text: 'Add -e for the feminine and -s for the plural. Blanc is irregular: blanche.',
        french: 'une chemise bleue, une chemise blanche, des chaussures noires',
      },
      {
        title: 'Colours ending in -e',
        text: 'rouge already ends in -e, so the feminine does not change.',
        french: 'un pull rouge, une chemise rouge',
      },
    ],
  },
  'm2-l6-shopping-prices': {
    focus: 'Shopping needs a price question, a polite request and a way to pay.',
    rules: [
      {
        title: 'Asking and hearing the price',
        text: 'Ask Combien ça coûte ? The cashier answers Ça fait + price.',
        french: 'Combien ça coûte ? — Ça fait quinze euros.',
      },
      {
        title: 'Je voudrais, not je veux',
        text: 'je voudrais (I would like) is the polite way to ask for something.',
        french: 'Je voudrais ce pull, s\'il vous plaît.',
      },
      {
        title: 'Paying',
        text: 'par carte = by card, en espèces = in cash.',
        french: 'Je paie par carte.',
      },
    ],
  },
  'm2-l7-morning-food': {
    focus: 'Food uses the partitive articles du, de la, de l\' and des for "some", and le / la / les after aimer.',
    rules: [
      {
        title: 'Partitive articles',
        text: 'du + masculine, de la + feminine, de l\' + vowel, des + plural = "some".',
        french: 'Je mange du pain, de la confiture et des légumes.',
      },
      {
        title: 'Likes and dislikes use le / la / les',
        text: 'After aimer you talk about the thing in general, so use the definite article.',
        french: 'J\'aime le café. Je n\'aime pas le thé.',
      },
      {
        title: 'ne … pas',
        text: 'Wrap the verb with ne … pas; ne becomes n\' before a vowel.',
        french: 'Je n\'aime pas le lait.',
      },
    ],
  },
  'm2-l8-at-restaurant': {
    focus: 'Restaurant French follows a script: ask for a table and the menu, order, compliment, ask for the bill.',
    rules: [
      {
        title: 'Ordering politely',
        text: 'je voudrais + dish, with s\'il vous plaît.',
        french: 'Je voudrais le poulet, s\'il vous plaît.',
      },
      {
        title: 'la carte vs le menu',
        text: 'la carte is the full menu; le menu is a fixed-price set meal.',
        french: 'La carte, s\'il vous plaît.',
      },
      {
        title: 'Asking for the bill',
        text: 'In France the bill is not brought automatically: you ask for it.',
        french: 'L\'addition, s\'il vous plaît.',
      },
    ],
  },
  'm2-l9-town-places': {
    focus: 'Places in town go with à + article to say where you are going: au, à la, à l\'.',
    rules: [
      {
        title: 'à + article',
        text: 'à + le becomes au; à la and à l\' do not change.',
        french: 'Je vais au marché. Je vais à la banque.',
      },
      {
        title: 'il y a',
        text: 'il y a = there is / there are. With a rising voice it becomes a question.',
        french: 'Il y a une pharmacie près d\'ici ?',
      },
    ],
  },
  'm2-l10-asking-directions': {
    focus: 'Directions use the vous imperative (tournez, continuez) plus left, right, straight ahead and landmarks.',
    rules: [
      {
        title: 'Imperative with vous',
        text: 'Drop the subject pronoun to give an instruction.',
        french: 'Tournez à droite. Continuez tout droit.',
      },
      {
        title: 'droite vs tout droit',
        text: 'à droite = to the right; tout droit = straight ahead. Easy to mix up!',
        french: 'Continuez tout droit, puis tournez à gauche.',
      },
      {
        title: 'Landmarks',
        text: 'après = after, devant = in front of.',
        french: 'C\'est à droite, après la banque.',
      },
    ],
  },
  'm3-l1-family': {
    focus: 'Family words are always used with a possessive (mon, ma, mes) that agrees with the noun.',
    rules: [
      {
        title: 'mon / ma / mes',
        text: 'The possessive follows the gender of the family word, not the gender of the person.',
        french: 'mon frère, ma sœur, mes parents',
      },
      {
        title: 'mon before a vowel',
        text: 'mon is used before a vowel even with a feminine noun, to avoid two vowel sounds clashing.',
        french: 'mon amie',
      },
      {
        title: 'ne … pas de',
        text: 'After a negative, un / une become de.',
        french: 'J\'ai un frère. Je n\'ai pas de sœur.',
      },
    ],
  },
  'm3-l2-describing-people': {
    focus: 'Describing people mixes être + adjective with avoir + noun for hair, eyes and age.',
    rules: [
      {
        title: 'être + adjective',
        text: 'The adjective agrees with the person: gentil, gentille, gentils, gentilles.',
        french: 'Elle est très gentille.',
      },
      {
        title: 'avoir + noun for features',
        text: 'il a les yeux verts, elle a les cheveux courts.',
        french: 'Il a les yeux verts.',
      },
    ],
  },
  'm3-l3-my-home': {
    focus: 'Home vocabulary works with habiter (to live) and il y a (there is / there are).',
    rules: [
      {
        title: 'habiter à / en / au',
        text: 'à + city, en + feminine country, au + masculine country.',
        french: 'J\'habite à Lyon, en France.',
      },
      {
        title: 'il y a for rooms',
        text: 'Il y a can be followed by one or several rooms.',
        french: 'Il y a une cuisine et deux chambres.',
      },
    ],
  },
  'm3-l4-prepositions': {
    focus: 'Prepositions of place (sur, sous, dans, devant, derrière, entre, à côté de) answer the question "where is it?".',
    rules: [
      {
        title: 'sur / sous / dans',
        text: 'Three basic positions, plus devant (in front of), derrière (behind) and entre (between).',
        french: 'Le livre est sur la table.',
      },
      {
        title: 'à côté de + du / de la',
        text: 'à côté de ends in de, so de + le becomes du.',
        french: 'à côté du lit, à côté de la porte',
      },
      {
        title: 'Position or direction?',
        text: 'dans describes where something is; à + place describes where you are going.',
        french: 'Je vais à la cuisine.',
      },
    ],
  },
  'm4-l1-hobbies': {
    focus: 'Hobbies use aimer, adorer and détester + infinitive, plus jouer au and faire du.',
    rules: [
      {
        title: 'Likes + infinitive',
        text: 'After j\'aime, j\'adore, je n\'aime pas and je déteste, the second verb stays in the infinitive.',
        french: 'J\'adore cuisiner, mais je déteste faire du sport.',
      },
      {
        title: 'jouer au / faire du',
        text: 'jouer à + le becomes jouer au for a sport or game; faire du sport means to do sport.',
        french: 'Je joue au foot. Je fais du sport.',
      },
      {
        title: 'Tu aimes… ?',
        text: 'Ask a yes/no question by raising your voice at the end of the sentence.',
        french: 'Tu aimes lire ? — Oui, j\'adore !',
      },
    ],
  },
  'm4-l2-shopping': {
    focus: 'Clothes shopping uses vous avez… ?, je peux + infinitive, trop + adjective and je le prends.',
    rules: [
      {
        title: 'en + colour',
        text: 'Ask for an item in another colour with en.',
        french: 'Vous avez ce pull en bleu ?',
      },
      {
        title: 'trop + adjective',
        text: 'trop means too: trop petit, trop grand, trop cher.',
        french: 'Ce pull est trop petit.',
      },
      {
        title: 'Je le prends',
        text: 'le (it) replaces a masculine item and goes before the verb; la for a feminine item.',
        french: 'Il est beau, ce pull. Je le prends !',
      },
    ],
  },
  'm4-l3-dining-out': {
    focus: 'A French meal has l\'entrée, le plat and le dessert; you order in the present with je prends.',
    rules: [
      {
        title: 'Comme + part of the meal',
        text: 'Comme entrée, comme plat, comme dessert, comme boisson = as a starter, main course, dessert, drink.',
        french: 'Comme entrée, je prends une salade.',
      },
      {
        title: 'Ordering in the present',
        text: 'Je prends… means "I\'ll have…"; pour moi… orders for yourself in a group.',
        french: 'Pour moi, le poulet, s\'il vous plaît.',
      },
      {
        title: 'Je peux + infinitive',
        text: 'Ask permission politely with je peux.',
        french: 'Je peux payer par carte ?',
      },
    ],
  },
  'm4-l4-transport': {
    focus: 'Transport uses prendre le + vehicle, est-ce que questions and descendre.',
    rules: [
      {
        title: 'prendre le + transport',
        text: 'je prends le bus, tu prends le métro, je prends le train.',
        french: 'Je prends le bus pour aller à l\'école.',
      },
      {
        title: 'Est-ce que…?',
        text: 'Put est-ce que in front of a sentence to make a yes/no question.',
        french: 'Est-ce que ce bus va à la gare ?',
      },
      {
        title: 'au = à + le',
        text: 'Je descends à + le prochain arrêt becomes je descends au prochain arrêt.',
        french: 'Je descends au prochain arrêt.',
      },
    ],
  },
  'm4-l5-weather-social': {
    focus: 'Weather small talk mixes il fait + adjective with il y a du + noun, and alors links weather to plans.',
    rules: [
      {
        title: 'il fait or il y a du?',
        text: 'il fait + adjective (beau, mauvais, doux); il y a du + noun (soleil, vent).',
        french: 'Il fait doux. Il y a du soleil.',
      },
      {
        title: '…, non ?',
        text: 'Add non ? at the end of a sentence to invite the other person to agree.',
        french: 'Il fait beau aujourd\'hui, non ?',
      },
      {
        title: 'alors = so',
        text: 'alors links the weather to what you do.',
        french: 'Il pleut, alors je reste à la maison.',
      },
    ],
  },
  'm5-l1-airport': {
    focus: 'Airport French uses le vol est + à l\'heure / en retard, à + time, and the polite question Pouvez-vous… ?',
    rules: [
      {
        title: 'On time or late?',
        text: 'Use être + à l\'heure (on time) or en retard (late).',
        french: 'Le vol est à l\'heure. Le vol est en retard.',
      },
      {
        title: 'à + time',
        text: 'Say when your flight leaves with à + the time from Module 2.',
        french: 'Mon vol est à dix heures.',
      },
      {
        title: 'Asking for help politely',
        text: 'Pouvez-vous + verb is the polite vous form: "can you…?".',
        french: 'Pouvez-vous m\'aider, s\'il vous plaît ?',
      },
    ],
  },
  'm5-l2-hotel': {
    focus: 'Hotel check-in uses j\'ai une réservation au nom de…, a room type, pour + nights, and yes/no questions with a rising voice.',
    rules: [
      {
        title: 'au nom de',
        text: 'au nom de = under the name of. Give your family name after it.',
        french: 'J\'ai une réservation au nom de Martin.',
      },
      {
        title: 'pour + number + nuits',
        text: 'une nuit, deux nuits: the plural s is written but silent.',
        french: 'Une chambre double pour deux nuits.',
      },
      {
        title: 'Yes/no questions',
        text: 'Keep normal word order and raise your voice at the end.',
        french: 'Le petit-déjeuner est compris ? Le Wi-Fi est gratuit ?',
      },
    ],
  },
  'm5-l3-health': {
    focus: 'Health French uses avoir mal à + body part, depuis + time with the present tense, and vous instructions.',
    rules: [
      {
        title: 'avoir mal à + body part',
        text: 'à la + feminine (à la tête, à la gorge); à + le = au (au ventre).',
        french: 'J\'ai mal à la tête. J\'ai mal au ventre.',
      },
      {
        title: 'depuis + present tense',
        text: 'For something that started in the past and is still true, French uses the present with depuis.',
        french: 'J\'ai de la fièvre depuis deux jours.',
      },
      {
        title: 'Instructions with vous',
        text: 'Doctors and emergencies use the vous command form: no subject, verb ending in -ez.',
        french: 'Prenez ce médicament. Appelez un médecin !',
      },
    ],
  },
  'm5-l4-restaurants': {
    focus: 'Menu French names each course with comme, mentions allergies with allergique à, and removes ingredients with sans.',
    rules: [
      {
        title: 'comme + course',
        text: 'comme entrée, comme plat principal, comme dessert, comme boisson — then the dish.',
        french: 'Comme plat principal, je prends le poulet.',
      },
      {
        title: 'allergique à / au',
        text: 'à + le = au, as in j\'ai mal au ventre.',
        french: 'Je suis allergique au lait.',
      },
      {
        title: 'sans + noun',
        text: 'sans (without) takes the noun with no article.',
        french: 'Un café sans lait, s\'il vous plaît.',
      },
    ],
  },
  'm5-l5-numbers-prices': {
    focus: 'Prices above 20 need the tens up to cent, the special forms 70, 80 and 90, and the French way of writing euros.',
    rules: [
      {
        title: '70, 80 and 90',
        text: 'soixante-dix = 60 + 10, quatre-vingts = 4 × 20, quatre-vingt-dix = 80 + 10. 71 is soixante et onze.',
        french: 'soixante-quinze, quatre-vingt-cinq, quatre-vingt-dix-neuf',
      },
      {
        title: 'Writing and saying prices',
        text: 'Write a comma: 3,50 €. Say the euros, then the cents, usually without the word centimes.',
        french: 'Le café coûte deux euros cinquante.',
      },
      {
        title: 'The total',
        text: 'Ça fait combien ? asks for the total; the answer is Ça fait + price.',
        french: 'Ça fait combien ? — Ça fait cent euros.',
      },
    ],
  },
  'm6-l1-workplace': {
    focus: 'Talking about your job uses je suis + job and the regular -er verb travailler in the present.',
    rules: [
      {
        title: 'je suis + job (no article)',
        text: 'After être, a job has no article. A woman often adds -e: employé → employée.',
        french: 'Je suis professeur. Elle est employée.',
      },
      {
        title: 'travailler dans / de … à …',
        text: 'dans + place says where you work; de … à … says from what time to what time.',
        french: 'Je travaille dans un bureau de neuf heures à cinq heures.',
      },
    ],
  },
  'm6-l2-school': {
    focus: 'School talk uses apprendre (to learn) and comprendre (to understand), which work like prendre.',
    rules: [
      {
        title: 'j\'apprends / je comprends',
        text: 'Like prendre: j\'apprends, vous apprenez. The final -ds is silent.',
        french: 'J\'apprends le français.',
      },
      {
        title: 'ne … pas',
        text: 'Put ne before the verb and pas after it to say "not".',
        french: 'Je ne comprends pas.',
      },
      {
        title: 'Articles with school words',
        text: 'Subjects take le / la / l\' / les; un cours de + subject names a class.',
        french: 'J\'ai un cours de maths. J\'aime l\'histoire.',
      },
    ],
  },
  'm6-l3-technology': {
    focus: 'Tech French uses short present-tense sentences to name devices, ask for help and describe a problem.',
    rules: [
      {
        title: 'Vous avez … ? / Quel est … ?',
        text: 'Vous avez + noun asks if someone has something; quel est + noun asks for information.',
        french: 'Vous avez un chargeur ? Quel est le mot de passe ?',
      },
      {
        title: 'ne … pas with machines',
        text: 'marcher = to work (for machines); ne … pas goes around the verb.',
        french: 'Mon ordinateur ne marche pas.',
      },
      {
        title: 'mon / ma with devices',
        text: 'ma batterie (feminine), mon portable (masculine), mon ordinateur (before a vowel).',
        french: 'Ma batterie est faible.',
      },
    ],
  },
  'm6-l4-past-future': {
    focus: 'Two new tenses: the passé composé (avoir + past participle) for the past and the futur proche (aller + infinitive) for the future.',
    rules: [
      {
        title: 'Passé composé with avoir',
        text: 'j\'ai / il a + past participle. -er verbs end in -é (travaillé, envoyé); finir → fini.',
        french: 'Hier, j\'ai fini mes devoirs.',
      },
      {
        title: 'Futur proche',
        text: 'je vais + infinitive = what you are going to do.',
        french: 'Demain, je vais travailler.',
      },
      {
        title: 'Time words',
        text: 'hier (past), aujourd\'hui (present), demain and la semaine prochaine (future).',
        french: 'La semaine prochaine, je vais apprendre l\'anglais.',
      },
    ],
  },
  'm6-l5-instructions': {
    focus: 'Polite instructions use the vous form without vous, put in order with d\'abord, ensuite, enfin.',
    rules: [
      {
        title: 'Polite instructions (vous form)',
        text: 'Drop vous: vous ouvrez → Ouvrez, vous cliquez → Cliquez, vous parlez → Parlez.',
        french: 'Ouvrez le fichier, s\'il vous plaît.',
      },
      {
        title: 'd\'abord, ensuite, enfin',
        text: 'first, then, finally: they put the steps in order.',
        french: 'D\'abord, ouvrez le fichier. Ensuite, cliquez ici.',
      },
      {
        title: 'Asking for help',
        text: 'Pouvez-vous répéter ? / plus lentement; confirm with C\'est compris !',
        french: 'Pouvez-vous répéter, s\'il vous plaît ?',
      },
    ],
  },
  'm7-l1-news': {
    focus: 'Talking about the news uses je lis / je regarde / j\'écoute for media, and j\'ai lu / j\'ai vu for what you already saw or read.',
    rules: [
      {
        title: 'Media verbs',
        text: 'lire le journal (to read), regarder la télé (to watch), écouter la radio (to listen to). Écouter needs no extra word for "to".',
        french: 'Je lis le journal. Je regarde les infos. J\'écoute la radio.',
      },
      {
        title: 'Passé composé with avoir',
        text: 'j\'ai + past participle tells what you did: voir → vu, lire → lu. Aux infos = on the news.',
        french: 'J\'ai vu ça aux infos. J\'ai lu les gros titres.',
      },
      {
        title: 'Reacting with c\'est + adjective',
        text: 'After c\'est the adjective stays in the masculine form.',
        french: 'J\'ai lu un article : c\'est intéressant !',
      },
    ],
  },
  'm7-l2-environment': {
    focus: 'Environment talk uses present-tense habits (je recycle, je fais le tri), il faut + infinitive for what we must do, and c\'est bon pour la planète.',
    rules: [
      {
        title: 'Green habits in the present',
        text: 'recycler is a regular -er verb; faire le tri uses faire (je fais).',
        french: 'Je recycle le plastique. Je fais le tri à la maison.',
      },
      {
        title: 'il faut + infinitive',
        text: 'Il faut never changes; the next verb stays in the infinitive. It means "we must / you have to".',
        french: 'Il faut protéger la planète.',
      },
      {
        title: 'beaucoup de and à vélo / à pied',
        text: 'beaucoup de + noun = a lot of (no le / la after de). Use à for vélo and pied, en for voiture and bus.',
        french: 'Il y a beaucoup de pollution. Je vais au travail à vélo.',
      },
    ],
  },
  'm7-l3-opinions': {
    focus: 'Opinions use je pense que or à mon avis, je suis (pas) d\'accord, and parce que to give a reason.',
    rules: [
      {
        title: 'Giving your opinion',
        text: 'je pense que + sentence; à mon avis, + sentence. Que becomes qu\' before a vowel.',
        french: 'Je pense que c\'est une bonne idée. À mon avis, c\'est important.',
      },
      {
        title: 'Agreeing and disagreeing',
        text: 'French uses être: je suis d\'accord. Put ne... pas around suis to disagree.',
        french: 'Je suis d\'accord avec toi. Je ne suis pas d\'accord.',
      },
      {
        title: 'Reasons and questions',
        text: 'parce que = because. Ask back with qu\'est-ce que tu penses (de...) ?',
        french: 'Je recycle parce que c\'est important. Qu\'est-ce que tu penses de cette idée ?',
      },
    ],
  },
  'm7-l4-debate': {
    focus: 'A simple debate accepts a point (c\'est vrai, peut-être), adds the other side with mais, and ends with en conclusion.',
    rules: [
      {
        title: 'Accept, then add mais',
        text: 'C\'est vrai or peut-être accepts the point; mais (but) gives the other side.',
        french: 'C\'est vrai, le bus est lent, mais c\'est pratique.',
      },
      {
        title: 'Advantage and problem',
        text: 'l\'avantage, c\'est... / le problème, c\'est... After c\'est the adjective stays masculine.',
        french: 'L\'avantage du bus, c\'est le prix. La voiture, c\'est cher.',
      },
      {
        title: 'Concluding',
        text: 'En conclusion, + your final opinion.',
        french: 'En conclusion, le vélo est une bonne idée.',
      },
    ],
  },
  'm8-l1-culture': {
    focus: 'Talking about culture uses j\'aime / j\'adore for tastes and the passé composé with avoir for what you saw.',
    rules: [
      {
        title: 'j\'aime and j\'adore + le / la / les',
        text: 'Use the article after these verbs. J\'adore (I love) is stronger than j\'aime (I like). Je becomes j\' before a vowel.',
        french: 'J\'aime la musique française. J\'adore les films français.',
      },
      {
        title: 'Passé composé with avoir',
        text: 'For a finished action: j\'ai + past participle. voir → vu, adorer → adoré.',
        french: 'Hier, j\'ai vu un film français. J\'ai adoré !',
      },
      {
        title: 'Recommending to a friend',
        text: 'Je te recommande + ce / cette + noun. Te = to you (informal).',
        french: 'Je te recommande ce film.',
      },
    ],
  },
  'm8-l2-traditions': {
    focus: 'Describing traditions uses on + present tense for what people usually do, and the vous form to invite.',
    rules: [
      {
        title: 'on = we',
        text: 'In everyday speech, on means "we". It takes the same verb form as il / elle.',
        french: 'On fête Noël en famille. On mange la galette des rois.',
      },
      {
        title: 'il y a',
        text: 'il y a = there is / there are.',
        french: 'Le 14 juillet, il y a des feux d\'artifice.',
      },
      {
        title: 'Inviting with the vous form',
        text: 'Venez + infinitive invites one person politely or several people.',
        french: 'Venez fêter avec nous !',
      },
    ],
  },
  'm8-l3-career': {
    focus: 'Career talk uses je voudrais + infinitive for wishes, the futur proche for plans and j\'ai fait for experience.',
    rules: [
      {
        title: 'Jobs after être: no article',
        text: 'Say il est ingénieur, not il est un ingénieur. Je voudrais être + job.',
        french: 'Mon père est ingénieur. Je voudrais être ingénieur.',
      },
      {
        title: 'Futur proche',
        text: 'aller (je vais) + infinitive = what you are going to do.',
        french: 'L\'année prochaine, je vais travailler à Paris.',
      },
      {
        title: 'Experience with j\'ai fait',
        text: 'j\'ai fait is the passé composé of faire: I did.',
        french: 'J\'ai fait un stage dans une entreprise.',
      },
    ],
  },
  'm8-l4-interview': {
    focus: 'Interviews and professional emails use vous and votre, je voudrais for polite wishes, and fixed openings and closings.',
    rules: [
      {
        title: 'Formal vous',
        text: 'In an interview, use vous and votre (your). The interviewer says Parlez-moi de vous.',
        french: 'Merci pour votre temps.',
      },
      {
        title: 'Polite wishes with je voudrais',
        text: 'je voudrais + infinitive sounds polite and professional.',
        french: 'Je voudrais travailler dans votre entreprise.',
      },
      {
        title: 'Opening and closing an email',
        text: 'Open with Madame, Monsieur, and close with Cordialement, + your name.',
        french: 'Madame, Monsieur, … Cordialement, Léa Martin',
      },
    ],
  },
  'm9-l1-business': {
    focus: 'Business basics use regular verbs in the present: travailler, acheter (-er) and vendre (-re).',
    rules: [
      {
        title: 'vendre (-re verb)',
        text: 'je vends, tu vends, il vend, nous vendons, vous vendez, ils vendent. The d is silent in the singular.',
        french: 'Nous vendons des vélos.',
      },
      {
        title: 'acheter (è in most forms)',
        text: 'j\'achète, il achète, ils achètent, but nous achetons, vous achetez.',
        french: 'Le client achète un produit.',
      },
      {
        title: 'Masculine and feminine people',
        text: 'Add -e for a woman: un employé / une employée, un client / une cliente.',
        french: 'L\'entreprise a vingt employés.',
      },
    ],
  },
  'm9-l2-marketing-finance': {
    focus: 'Talking about money means giving prices, saying prices go up or down, and comparing.',
    rules: [
      {
        title: 'Asking a price',
        text: 'Ça coûte combien ? / Quel est le prix ? Answer with coûter + number + euros.',
        french: 'Ce produit coûte dix euros.',
      },
      {
        title: 'augmenter / baisser',
        text: 'Regular -er verbs: le prix augmente (goes up), le prix baisse (goes down).',
        french: 'Nous baissons le prix.',
      },
      {
        title: 'plus / moins … que',
        text: 'plus or moins + adjective + que compares two things.',
        french: 'Ce produit est moins cher que l\'autre.',
      },
    ],
  },
  'm9-l3-innovation': {
    focus: 'Talking about new ideas uses the futur proche, il faut + infinitive and pour + infinitive.',
    rules: [
      {
        title: 'Futur proche',
        text: 'aller in the present (je vais, nous allons) + infinitive = what is going to happen.',
        french: 'Nous allons lancer un produit.',
      },
      {
        title: 'il faut + infinitive',
        text: 'Says what is necessary: "we must / you have to". il faut never changes.',
        french: 'Il faut écouter les clients.',
      },
      {
        title: 'pour + infinitive',
        text: 'Says why you do something: "(in order) to".',
        french: 'Nous innovons pour aider les clients.',
      },
    ],
  },
  'm9-l4-presentation': {
    focus: 'A short presentation opens with the futur proche, is ordered with d\'abord / ensuite / enfin and gives results in the passé composé.',
    rules: [
      {
        title: 'Ordering your talk',
        text: 'd\'abord (first), ensuite (then), enfin (finally).',
        french: 'D\'abord, le produit. Ensuite, le prix. Enfin, les ventes.',
      },
      {
        title: 'Passé composé with avoir',
        text: 'avoir in the present + past participle: -er → -é (augmenté, baissé), vendre → vendu.',
        french: 'Les ventes ont augmenté.',
      },
    ],
  },
  'm10-l1-globalization': {
    focus: 'Talking about the world uses simple nouns (le monde, les pays, la planète), il faut + infinitive and comparisons with plus / moins … que.',
    rules: [
      {
        title: 'Comparing: plus / moins … que',
        text: 'plus + adjective + que = more … than; moins + adjective + que = less … than. The adjective still agrees with the subject.',
        french: 'La France est plus petite que le Canada.',
      },
      {
        title: 'il faut + infinitive',
        text: 'il faut never changes; the next verb stays in the infinitive. It means "we must / it is necessary to".',
        french: 'Il faut protéger la planète.',
      },
      {
        title: 'Plural nouns and adjectives',
        text: 'Add -s to the adjective in the plural. Pays keeps the same spelling: un pays, des pays.',
        french: 'Il y a des pays riches et des pays pauvres.',
      },
    ],
  },
  'm10-l2-ethics': {
    focus: 'Talking about values means giving an opinion (je pense que, à mon avis), a reason (parce que) and a contrast (mais).',
    rules: [
      {
        title: 'Giving an opinion',
        text: 'Je pense que + full sentence, or À mon avis + comma + full sentence. Que becomes qu\' before a vowel.',
        french: 'Je pense que c\'est important. À mon avis, c\'est juste.',
      },
      {
        title: 'Giving a reason with parce que',
        text: 'parce que = because. It becomes parce qu\' before il / elle.',
        french: 'J\'aide les autres parce que c\'est juste.',
      },
      {
        title: 'Agreeing and disagreeing',
        text: 'être d\'accord = to agree. Put ne … pas around the verb to disagree.',
        french: 'Je suis d\'accord. Je ne suis pas d\'accord.',
      },
    ],
  },
  'm10-l3-media-analysis': {
    focus: 'Talking about the media: name the source, say if it is vrai or faux, and say what you read or watched with the passé composé.',
    rules: [
      {
        title: 'Passé composé with avoir',
        text: 'avoir (present) + past participle. -er verbs end in -é (regarder → regardé); lire → lu.',
        french: 'Hier, j\'ai lu un article. J\'ai regardé les informations.',
      },
      {
        title: 'vrai / faux agree',
        text: 'Feminine forms: vraie, fausse. Information is feminine: une information fausse.',
        french: 'Cette information est fausse.',
      },
      {
        title: 'ce / cet / cette',
        text: 'ce + masculine noun, cet + masculine noun starting with a vowel, cette + feminine noun.',
        french: 'cet article, cette information',
      },
    ],
  },
  'm10-l4-mastery': {
    focus: 'Final review: combine the present, the past (passé composé) and the future (futur proche), linked with d\'abord, ensuite, enfin and parce que.',
    rules: [
      {
        title: 'Three time frames',
        text: 'Present: je m\'appelle. Past: j\'ai + past participle. Future: je vais + infinitive.',
        french: 'J\'ai appris le français et je vais voyager en France.',
      },
      {
        title: 'Ordering ideas',
        text: 'd\'abord = first, ensuite = then, enfin = finally.',
        french: 'D\'abord je travaille, ensuite je mange, enfin je dors.',
      },
      {
        title: 'Opinion + reason',
        text: 'J\'aime / Je pense que … parce que … gives a complete short argument.',
        french: 'J\'aime la France parce que j\'aime la culture.',
      },
    ],
  },
};

const normalizeText = (value) => String(value ?? '').trim();

const pickText = (value) => {
  const text = normalizeText(value);
  return text.length > 0 ? text : null;
};

// Keeps only entries whose key field exists and was not already used.
const uniqueByKey = (entries, keyName) => {
  const seen = new Set();

  return entries.filter((entry) => {
    const key = normalizeText(entry?.[keyName]).toLowerCase();

    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

// Turns the examples of the sublesson learning content into spoken use cases.
const buildUseCasesFromItems = (learningContent) => {
  const items = Array.isArray(learningContent?.items) ? learningContent.items : [];

  return items
    .filter((item) => pickText(item?.example) && pickText(item?.exampleEnglish))
    .slice(0, 5)
    .map((item) => ({
      situation:
        pickText(item?.usage) ?? pickText(item?.english) ?? pickText(item?.french),
      french: item.example,
      english: item.exampleEnglish,
    }));
};

/**
 * Merges the module grammar scope with the grammar notes of one sublesson.
 *
 * @param {string} moduleId module id, e.g. 'module-1'
 * @param {string} subLessonId sublesson id, e.g. 'm1-l3-greetings'
 * @param {object|null} learningContent content of the sublesson (items, goals...)
 * @param {object|null} subLesson catalog entry of the sublesson (title, description...)
 * @returns {object|null} grammar content ready to be displayed, or null
 */
export const getGrammarContent = (
  moduleId,
  subLessonId,
  learningContent = null,
  subLesson = null
) => {
  const moduleGrammar = grammarByModule[moduleId] ?? null;
  const topicGrammar = grammarByTopic[subLessonId] ?? null;

  if (!moduleGrammar && !topicGrammar) {
    return null;
  }

  const moduleRules = Array.isArray(moduleGrammar?.rules) ? moduleGrammar.rules : [];
  const topicRules = Array.isArray(topicGrammar?.rules) ? topicGrammar.rules : [];

  const rules = uniqueByKey([...topicRules, ...moduleRules], 'title')
    .filter((rule) => pickText(rule?.title))
    .map((rule) => ({
      title: rule.title,
      text: pickText(rule.text),
      french: pickText(rule.french),
    }));

  const useCases = uniqueByKey(
    [
      ...(Array.isArray(topicGrammar?.useCases) ? topicGrammar.useCases : []),
      ...(Array.isArray(moduleGrammar?.useCases) ? moduleGrammar.useCases : []),
      ...buildUseCasesFromItems(learningContent),
    ],
    'french'
  )
    .filter((useCase) => pickText(useCase?.french))
    .map((useCase) => ({
      situation: pickText(useCase.situation),
      french: useCase.french,
      english: pickText(useCase.english),
    }));

  const tenseSource = Array.isArray(topicGrammar?.tenses)
    ? topicGrammar.tenses
    : Array.isArray(moduleGrammar?.tenses)
      ? moduleGrammar.tenses
      : [];

  const tenses = uniqueByKey(tenseSource, 'name')
    .filter((tense) => pickText(tense?.name))
    .map((tense) => ({
      name: tense.name,
      note: pickText(tense.note),
      forms: uniqueByKey(
        Array.isArray(tense.forms) ? tense.forms : [],
        'french'
      ).filter((form) => pickText(form?.french)),
    }))
    .filter((tense) => tense.forms.length > 0);

  const overview = [
    ...(Array.isArray(moduleGrammar?.overview) ? moduleGrammar.overview : []),
    ...(Array.isArray(topicGrammar?.overview) ? topicGrammar.overview : []),
  ].map(pickText).filter(Boolean);

  const goals = (Array.isArray(learningContent?.learningGoals)
    ? learningContent.learningGoals
    : []
  ).map(pickText).filter(Boolean);

  return {
    title: pickText(subLesson?.title) ?? pickText(learningContent?.title),
    level: pickText(moduleGrammar?.level),
    focus:
      pickText(topicGrammar?.focus) ??
      pickText(subLesson?.description) ??
      pickText(learningContent?.title),
    overview,
    goals,
    rules,
    tenses,
    useCases,
  };
};

export default getGrammarContent;
