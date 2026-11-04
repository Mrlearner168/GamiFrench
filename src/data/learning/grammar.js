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
      'Two extra tools appear constantly: aller + infinitive for the near future, and polite forms such as je voudrais / est-ce que.',
    ],
    rules: [
      {
        title: 'Présent of regular -er verbs',
        text: 'Drop -er and add -e, -es, -e, -ons, -ez, -ent. The endings -e, -es and -ent sound exactly the same.',
        french: 'je parle, tu parles, il parle, nous parlons, vous parlez, ils parlent',
      },
      {
        title: 'Polite requests',
        text: 'Use je voudrais (I would like) instead of je veux when ordering or buying.',
        french: 'Je voudrais un café, s\'il vous plaît.',
      },
      {
        title: 'Asking a question',
        text: 'Keep normal word order with a rising tone, or open the sentence with est-ce que.',
        french: 'Est-ce que vous avez des croissants ?',
      },
    ],
    tenses: [
      {
        name: 'Présent — aller (to go)',
        note: 'Also the auxiliary of the near future.',
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
        name: 'Futur proche — aller + infinitive',
        note: 'The everyday future: something about to happen.',
        forms: [
          { french: 'je vais manger', english: 'I am going to eat' },
          { french: 'tu vas partir', english: 'you are going to leave' },
          { french: 'il va arriver', english: 'he is going to arrive' },
          { french: 'nous allons sortir', english: 'we are going to go out' },
          { french: 'vous allez payer', english: 'you are going to pay' },
          { french: 'ils vont venir', english: 'they are going to come' },
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
        french: 'Est-ce que je peux payer par carte ?',
        english: 'Can I pay by card?',
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
      'Daily life and social interaction: hobbies, shopping, dining out, transport and small talk.',
      'You reuse the présent but add likes and dislikes (aimer, adorer, détester) and polite service phrases.',
    ],
    rules: [
      {
        title: 'Likes and dislikes',
        text: 'aimer / adorer / détester + noun (with the article) or + infinitive.',
        french: 'J\'adore lire le soir.',
      },
      {
        title: 'jouer à / jouer de',
        text: 'jouer à + sport or game, jouer de + musical instrument.',
        french: 'Je joue au tennis, je joue de la guitare.',
      },
      {
        title: 'faire du / de la / de l\'',
        text: 'Used for activities: faire du sport, faire de la photo.',
        french: 'Je fais de la photo.',
      },
    ],
    tenses: [
      {
        name: 'Présent — faire (to do / to make)',
        note: 'Irregular verb used for activities, weather and chores.',
        forms: [
          { french: 'je fais', english: 'I do / I make' },
          { french: 'tu fais', english: 'you do' },
          { french: 'il fait', english: 'he does' },
          { french: 'nous faisons', english: 'we do' },
          { french: 'vous faites', english: 'you do (formal / plural)' },
          { french: 'ils font', english: 'they do' },
        ],
      },
      {
        name: 'Présent — pouvoir (can / to be able to)',
        note: 'Very useful to ask permission or to offer something.',
        forms: [
          { french: 'je peux', english: 'I can' },
          { french: 'tu peux', english: 'you can' },
          { french: 'il peut', english: 'he can' },
          { french: 'nous pouvons', english: 'we can' },
          { french: 'vous pouvez', english: 'you can (formal / plural)' },
          { french: 'ils peuvent', english: 'they can' },
        ],
      },
      {
        name: 'Passé récent — venir de + infinitive',
        note: 'Something that has just happened.',
        forms: [
          { french: 'je viens de manger', english: 'I have just eaten' },
          { french: 'tu viens d\'arriver', english: 'you have just arrived' },
          { french: 'il vient de partir', english: 'he has just left' },
          { french: 'nous venons de finir', english: 'we have just finished' },
          { french: 'vous venez de commander', english: 'you have just ordered' },
          { french: 'ils viennent de sortir', english: 'they have just gone out' },
        ],
      },
    ],
    useCases: [
      {
        situation: 'Talking about hobbies',
        french: 'Le samedi, je joue au football avec mes amis.',
        english: 'On Saturdays I play football with my friends.',
      },
      {
        situation: 'Shopping and prices',
        french: 'Combien ça coûte ? C\'est trop cher pour moi.',
        english: 'How much is it? That is too expensive for me.',
      },
      {
        situation: 'Asking for the bill',
        french: 'L\'addition, s\'il vous plaît.',
        english: 'The bill, please.',
      },
      {
        situation: 'Using public transport',
        french: 'Je prends le bus pour aller au travail.',
        english: 'I take the bus to go to work.',
      },
    ],
  },
  'module-5': {
    level: 'A2 (Elementary)',
    overview: [
      'Real-life situations: airport, hotel, doctor and restaurant. To talk about what happened you need the passé composé.',
      'Health vocabulary pairs with avoir mal à + body part, and depuis + time to say how long something has lasted.',
    ],
    rules: [
      {
        title: 'Passé composé: auxiliary + past participle',
        text: 'Use avoir with most verbs, and être with a small group (aller, venir, arriver, partir, rester, entrer, sortir, monter, descendre, tomber, naître, mourir).',
        french: 'J\'ai réservé une chambre. Je suis arrivé hier.',
      },
      {
        title: 'Agreement with être',
        text: 'With être the past participle agrees with the subject: arrivé / arrivée / arrivés.',
        french: 'Elle est arrivée à midi.',
      },
      {
        title: 'avoir mal à + body part',
        text: 'Say where it hurts: à la tête, au dos, aux dents.',
        french: 'J\'ai mal à la gorge.',
      },
    ],
    tenses: [
      {
        name: 'Passé composé with avoir',
        note: 'The standard past tense for finished actions.',
        forms: [
          { french: 'j\'ai réservé', english: 'I booked' },
          { french: 'tu as payé', english: 'you paid' },
          { french: 'il a perdu', english: 'he lost' },
          { french: 'nous avons visité', english: 'we visited' },
          { french: 'vous avez choisi', english: 'you chose (formal / plural)' },
          { french: 'ils ont attendu', english: 'they waited' },
        ],
      },
      {
        name: 'Passé composé with être',
        note: 'Movement and change-of-state verbs; the participle agrees with the subject.',
        forms: [
          { french: 'je suis allé', english: 'I went' },
          { french: 'tu es parti', english: 'you left' },
          { french: 'elle est restée', english: 'she stayed' },
          { french: 'nous sommes rentrés', english: 'we came back' },
          { french: 'vous êtes arrivés', english: 'you arrived (formal / plural)' },
          { french: 'ils sont venus', english: 'they came' },
        ],
      },
      {
        name: 'Imparfait (background)',
        note: 'Description, habits and situations in the past; also the weather.',
        forms: [
          { french: 'je prenais', english: 'I used to take / I was taking' },
          { french: 'tu attendais', english: 'you were waiting' },
          { french: 'il faisait', english: 'it was (weather)' },
          { french: 'nous étions', english: 'we were' },
          { french: 'vous aviez', english: 'you had' },
          { french: 'ils pouvaient', english: 'they could' },
        ],
      },
    ],
    useCases: [
      {
        situation: 'At the airport',
        french: 'Bonjour, j\'ai un vol pour Montréal à quatorze heures.',
        english: 'Hello, I have a flight to Montreal at 2 p.m.',
      },
      {
        situation: 'At the hotel',
        french: 'J\'ai réservé une chambre double pour deux nuits.',
        english: 'I booked a double room for two nights.',
      },
      {
        situation: 'At the doctor',
        french: 'J\'ai mal à la tête depuis hier.',
        english: 'I have had a headache since yesterday.',
      },
      {
        situation: 'Emergency',
        french: 'J\'ai perdu mon passeport, pouvez-vous m\'aider ?',
        english: 'I lost my passport, can you help me?',
      },
    ],
  },
  'module-6': {
    level: 'A2 (Elementary)',
    overview: [
      'Work, school and technology: schedules, devices and instructions.',
      'This module is where you compare the past with the future (passé composé, imparfait, futur simple) and start giving orders politely.',
    ],
    rules: [
      {
        title: 'Passé composé vs imparfait',
        text: 'Passé composé = finished action; imparfait = description, habit or background in the past.',
        french: 'Je travaillais quand le téléphone a sonné.',
      },
      {
        title: 'Futur simple',
        text: 'Add -ai, -as, -a, -ons, -ez, -ont to the infinitive (or to an irregular stem).',
        french: 'Je travaillerai à distance demain.',
      },
      {
        title: 'Impératif for instructions',
        text: 'Drop the subject pronoun for instructions; at work, use the vous form to stay polite.',
        french: 'Enregistrez le fichier, puis fermez la session.',
      },
    ],
    tenses: [
      {
        name: 'Passé composé (recent actions)',
        note: 'Used for what was done: reports, emails, exams.',
        forms: [
          { french: 'j\'ai envoyé', english: 'I sent' },
          { french: 'tu as terminé', english: 'you finished' },
          { french: 'il a installé', english: 'he installed' },
          { french: 'nous avons étudié', english: 'we studied' },
          { french: 'vous avez réussi', english: 'you passed (formal / plural)' },
          { french: 'ils ont organisé', english: 'they organised' },
        ],
      },
      {
        name: 'Imparfait (habits and background)',
        note: 'Used for routines and descriptions in the past.',
        forms: [
          { french: 'je travaillais', english: 'I used to work' },
          { french: 'tu étudiais', english: 'you were studying' },
          { french: 'il pleuvait', english: 'it was raining' },
          { french: 'nous avions', english: 'we had' },
          { french: 'vous deviez', english: 'you had to' },
          { french: 'ils finissaient', english: 'they were finishing' },
        ],
      },
      {
        name: 'Futur simple (plans)',
        note: 'Used for projects, deadlines and predictions.',
        forms: [
          { french: 'je finirai', english: 'I will finish' },
          { french: 'tu partiras', english: 'you will leave' },
          { french: 'il viendra', english: 'he will come' },
          { french: 'nous aurons', english: 'we will have' },
          { french: 'vous pourrez', english: 'you will be able to' },
          { french: 'ils feront', english: 'they will do' },
        ],
      },
    ],
    useCases: [
      {
        situation: 'Talking about meetings',
        french: 'J\'ai une réunion à onze heures, je vous rappelle après.',
        english: 'I have a meeting at eleven, I will call you back after.',
      },
      {
        situation: 'Deadlines',
        french: 'Je finirai le rapport demain matin.',
        english: 'I will finish the report tomorrow morning.',
      },
      {
        situation: 'A technical problem',
        french: 'Mon portable ne charge plus, il faut changer le câble.',
        english: 'My phone does not charge any more, the cable has to be changed.',
      },
      {
        situation: 'Giving instructions',
        french: 'Appuyez sur le bouton vert, puis attendez deux secondes.',
        english: 'Press the green button, then wait two seconds.',
      },
    ],
  },
  'module-7': {
    level: 'B1 (Intermediate)',
    overview: [
      'You move from describing facts to giving opinions, reacting to news and forming hypotheses.',
      'Conditional sentences with si and the subjonctif after expressions of necessity appear regularly.',
    ],
    rules: [
      {
        title: 'Opinion + indicative / subjunctive',
        text: 'After je pense que and je crois que use the indicative; after je doute que use the subjunctive.',
        french: 'Je pense que c\'est une bonne idée.',
      },
      {
        title: 'Hypothesis with si',
        text: 'si + imparfait → conditionnel présent describes an unreal or unlikely situation.',
        french: 'Si j\'étais maire, je réduirais le trafic.',
      },
      {
        title: 'Connectors for an argument',
        text: 'd\'une part / d\'autre part, cependant, par conséquent structure a balanced opinion.',
        french: 'D\'une part c\'est utile, d\'autre part c\'est cher.',
      },
    ],
    tenses: [
      {
        name: 'Imparfait (context)',
        note: 'Background of a story, description or habit.',
        forms: [
          { french: 'je lisais', english: 'I was reading' },
          { french: 'tu vivais', english: 'you were living' },
          { french: 'il y avait', english: 'there was / there were' },
          { french: 'nous pensions', english: 'we thought' },
          { french: 'vous vouliez', english: 'you wanted' },
          { french: 'ils changeaient', english: 'they were changing' },
        ],
      },
      {
        name: 'Plus-que-parfait (before the past)',
        note: 'avoir / être in the imparfait + past participle.',
        forms: [
          { french: 'j\'avais lu', english: 'I had read' },
          { french: 'tu avais vu', english: 'you had seen' },
          { french: 'elle était partie', english: 'she had left' },
          { french: 'nous avions compris', english: 'we had understood' },
          { french: 'ils avaient fini', english: 'they had finished' },
        ],
      },
      {
        name: 'Conditionnel présent (hypothesis / politeness)',
        note: 'The second half of a si sentence, and the polite form of requests.',
        forms: [
          { french: 'je pourrais', english: 'I could' },
          { french: 'tu devrais', english: 'you should' },
          { french: 'il faudrait', english: 'it would be necessary' },
          { french: 'nous aimerions', english: 'we would like' },
          { french: 'vous auriez', english: 'you would have (formal / plural)' },
          { french: 'ils seraient', english: 'they would be' },
        ],
      },
      {
        name: 'Subjonctif présent (obligation, emotion)',
        note: 'After il faut que, bien que, il est important que...',
        forms: [
          { french: 'que je fasse', english: 'that I do' },
          { french: 'que tu sois', english: 'that you are' },
          { french: 'qu\'il ait', english: 'that he has' },
          { french: 'que nous puissions', english: 'that we can' },
          { french: 'que vous veniez', english: 'that you come' },
          { french: 'qu\'ils aillent', english: 'that they go' },
        ],
      },
    ],
    useCases: [
      {
        situation: 'Reacting to the news',
        french: 'Selon cet article, la pollution a augmenté cette année.',
        english: 'According to this article, pollution has increased this year.',
      },
      {
        situation: 'Giving your opinion',
        french: 'À mon avis, il faut agir maintenant.',
        english: 'In my opinion, we must act now.',
      },
      {
        situation: 'Disagreeing politely',
        french: 'Je comprends votre point de vue, cependant je ne suis pas d\'accord.',
        english: 'I understand your point of view, however I do not agree.',
      },
      {
        situation: 'Making a hypothesis',
        french: 'Si tout le monde recyclait, nous économiserions beaucoup d\'eau.',
        english: 'If everyone recycled, we would save a lot of water.',
      },
    ],
  },
  'module-8': {
    level: 'B1 (Intermediate)',
    overview: [
      'Narrate culture and traditions, then reuse the same tools professionally: polite conditionals, structured emails and interview answers.',
      'You consolidate the past tenses and add the futur simple for plans and projects.',
    ],
    rules: [
      {
        title: 'Politeness with the conditionnel',
        text: 'je voudrais / pourriez-vous / j\'aimerais soften a request in an email or an interview.',
        french: 'Pourriez-vous m\'envoyer les détails ?',
      },
      {
        title: 'Narrating in the past',
        text: 'Combine the passé composé (actions) with the imparfait (background).',
        french: 'J\'ai visité Nice quand j\'étais étudiant.',
      },
      {
        title: 'Formal connectors',
        text: 'Tout d\'abord, ensuite, enfin structure a presentation or an email; cordialement closes it.',
        french: 'Tout d\'abord, je tiens à vous remercier.',
      },
    ],
    tenses: [
      {
        name: 'Passé composé (narration)',
        note: 'The actions of your story or of your experience.',
        forms: [
          { french: 'j\'ai participé', english: 'I took part' },
          { french: 'tu as découvert', english: 'you discovered' },
          { french: 'il a organisé', english: 'he organised' },
          { french: 'nous avons visité', english: 'we visited' },
          { french: 'vous avez appris', english: 'you learnt (formal / plural)' },
          { french: 'ils ont exposé', english: 'they exhibited' },
        ],
      },
      {
        name: 'Imparfait (background)',
        note: 'The setting, the habits and the descriptions.',
        forms: [
          { french: 'c\'était', english: 'it was' },
          { french: 'j\'avais', english: 'I had' },
          { french: 'nous allions', english: 'we used to go' },
          { french: 'les gens chantaient', english: 'people were singing' },
          { french: 'vous connaissiez', english: 'you knew' },
        ],
      },
      {
        name: 'Conditionnel présent (politeness)',
        note: 'The professional register: requests, suggestions, hypotheses.',
        forms: [
          { french: 'je voudrais', english: 'I would like' },
          { french: 'j\'aimerais', english: 'I would love to' },
          { french: 'vous pourriez', english: 'you could (formal)' },
          { french: 'il serait', english: 'it would be' },
          { french: 'nous serions', english: 'we would be' },
        ],
      },
      {
        name: 'Futur simple (plans and projects)',
        note: 'Used for upcoming events and commitments.',
        forms: [
          { french: 'je préparerai', english: 'I will prepare' },
          { french: 'tu recevras', english: 'you will receive' },
          { french: 'elle enverra', english: 'she will send' },
          { french: 'nous organiserons', english: 'we will organise' },
          { french: 'vous viendrez', english: 'you will come (formal / plural)' },
          { french: 'ils participeront', english: 'they will take part' },
        ],
      },
    ],
    useCases: [
      {
        situation: 'Talking about a film',
        french: 'Ce film raconte l\'histoire d\'un artiste qui a vécu à Paris.',
        english: 'This film tells the story of an artist who lived in Paris.',
      },
      {
        situation: 'Describing a tradition',
        french: 'Chaque année, ma famille célèbre la fête avec un grand repas.',
        english: 'Every year my family celebrates the holiday with a big meal.',
      },
      {
        situation: 'Answering in an interview',
        french: 'J\'ai fait un stage de six mois en communication.',
        english: 'I did a six-month internship in communication.',
      },
      {
        situation: 'Writing a professional email',
        french: 'Je vous remercie de votre réponse et je reste à votre disposition.',
        english: 'Thank you for your reply; I remain at your disposal.',
      },
    ],
  },
  'module-9': {
    level: 'B2 (Upper Intermediate)',
    overview: [
      'Business French: strategy, finance, negotiation and presentations. The register is formal and the structures are complex.',
      'The passive voice, the subjonctif and the past conditional let you report figures, make hypotheses and negotiate precisely.',
    ],
    rules: [
      {
        title: 'Voix passive in reports',
        text: 'être + past participle (+ par) is very common in written reports; the participle agrees with the subject.',
        french: 'Le contrat a été signé hier.',
      },
      {
        title: 'Subjonctif after necessity',
        text: 'il faut que, il est indispensable que, je souhaite que + subjonctif.',
        french: 'Il est indispensable que le budget soit validé.',
      },
      {
        title: 'Conditionnel passé (hypotheses and regrets)',
        text: 'avoir / être in the conditionnel + past participle.',
        french: 'Nous aurions gagné du temps.',
      },
    ],
    tenses: [
      {
        name: 'Subjonctif présent (strategy and decisions)',
        note: 'Used after expressions of necessity, wish or doubt.',
        forms: [
          { french: 'que je signe', english: 'that I sign' },
          { french: 'que tu investisses', english: 'that you invest' },
          { french: 'qu\'il soit', english: 'that it is' },
          { french: 'que nous développions', english: 'that we develop' },
          { french: 'que vous fassiez', english: 'that you do (formal / plural)' },
          { french: 'qu\'ils valident', english: 'that they approve' },
        ],
      },
      {
        name: 'Conditionnel passé (what could have been)',
        note: 'Used for regrets, reproaches and unreal past situations.',
        forms: [
          { french: 'j\'aurais investi', english: 'I would have invested' },
          { french: 'tu aurais négocié', english: 'you would have negotiated' },
          { french: 'il aurait signé', english: 'he would have signed' },
          { french: 'nous aurions lancé', english: 'we would have launched' },
          { french: 'vous auriez gagné', english: 'you would have won (formal / plural)' },
          { french: 'ils auraient réduit', english: 'they would have reduced' },
        ],
      },
      {
        name: 'Futur antérieur (completed future)',
        note: 'An action that will be finished before a deadline.',
        forms: [
          { french: 'j\'aurai terminé', english: 'I will have finished' },
          { french: 'tu auras envoyé', english: 'you will have sent' },
          { french: 'il aura présenté', english: 'he will have presented' },
          { french: 'nous aurons analysé', english: 'we will have analysed' },
          { french: 'vous aurez signé', english: 'you will have signed (formal / plural)' },
          { french: 'ils auront livré', english: 'they will have delivered' },
        ],
      },
    ],
    useCases: [
      {
        situation: 'Reporting results',
        french: 'Le chiffre d\'affaires a augmenté de douze pour cent ce trimestre.',
        english: 'Turnover rose by twelve percent this quarter.',
      },
      {
        situation: 'Negotiating',
        french: 'Si vous réduisiez le prix, nous signerions le contrat aujourd\'hui.',
        english: 'If you reduced the price, we would sign the contract today.',
      },
      {
        situation: 'Presenting figures',
        french: 'Comme le montre ce graphique, la demande progresse rapidement.',
        english: 'As this chart shows, demand is growing quickly.',
      },
      {
        situation: 'Taking a decision',
        french: 'Il est essentiel que nous alignions nos objectifs avant le lancement.',
        english: 'It is essential that we align our goals before the launch.',
      },
    ],
  },
  'module-10': {
    level: 'B2 (Advanced)',
    overview: [
      'Final level: global issues, ethics and media analysis. The goal is nuance, rhetoric and precise argumentation.',
      'You master the subjonctif, the past conditional, the gérondif and the connectors that hold an argument together.',
    ],
    rules: [
      {
        title: 'Concession with bien que / quoique',
        text: 'These conjunctions always take the subjunctive, present or past.',
        french: 'Bien que les médias exagèrent, le problème est réel.',
      },
      {
        title: 'Gérondif (en + -ant)',
        text: 'Expresses simultaneity ("while") or manner ("by").',
        french: 'En analysant les sources, on remarque un biais.',
      },
      {
        title: 'Hedging and conviction',
        text: 'il se peut que and je doute que take the subjunctive; il est probable que takes the indicative.',
        french: 'Je doute que cette information soit vérifiée.',
      },
    ],
    tenses: [
      {
        name: 'Subjonctif présent (opinion and nuance)',
        note: 'Used after doubt, necessity and concession.',
        forms: [
          { french: 'que je sois', english: 'that I am' },
          { french: 'qu\'il faille', english: 'that it is necessary' },
          { french: 'que nous agissions', english: 'that we act' },
          { french: 'que vous compreniez', english: 'that you understand (formal / plural)' },
          { french: 'qu\'ils reconnaissent', english: 'that they admit' },
        ],
      },
      {
        name: 'Subjonctif passé (nuanced past)',
        note: 'avoir / être in the subjunctive + past participle.',
        forms: [
          { french: 'qu\'ils aient exagéré', english: 'that they exaggerated' },
          { french: 'que nous ayons compris', english: 'that we understood' },
          { french: 'qu\'elle soit partie', english: 'that she has left' },
          { french: 'que j\'aie réagi', english: 'that I reacted' },
        ],
      },
      {
        name: 'Conditionnel passé (consequences)',
        note: 'Used to judge what should have happened.',
        forms: [
          { french: 'nous aurions dû réagir', english: 'we should have reacted' },
          { french: 'cela aurait changé le résultat', english: 'that would have changed the result' },
          { french: 'ils auraient pu prévenir', english: 'they could have warned us' },
          { french: 'j\'aurais préféré attendre', english: 'I would have preferred to wait' },
        ],
      },
    ],
    useCases: [
      {
        situation: 'Talking about globalisation',
        french: 'La mondialisation crée des opportunités, mais elle creuse aussi les inégalités.',
        english: 'Globalisation creates opportunities, but it also deepens inequalities.',
      },
      {
        situation: 'Discussing ethics',
        french: 'Il est regrettable que certaines entreprises aient caché ces données.',
        english: 'It is regrettable that some companies hid this data.',
      },
      {
        situation: 'Analysing the media',
        french: 'Cette source présente une opinion comme un fait vérifié.',
        english: 'This source presents an opinion as a verified fact.',
      },
      {
        situation: 'Closing an argument',
        french: 'En conclusion, seule une approche collective permettra d\'avancer.',
        english: 'In conclusion, only a collective approach will make progress possible.',
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
        text: 'You name a letter (b = "bay", r = "air"), while inside a word the letter keeps its own sound.',
        french: 'b, c, d — h, i, j',
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
        text: 'é = ay, è / ê = eh, and ç is always a hard s sound.',
        french: 'é, è, ç',
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
        text: 'mademoiselle / monsieur, s\'il vous plaît, merci, excusez-moi make every exchange softer.',
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
        text: 'Comment vas-tu ? with friends, Comment allez-vous ? with vous.',
        french: 'Comment allez-vous ?',
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
        text: 'No hyphen with un, and the noun stays singular after a number of one.',
        french: 'un livre, deux livres',
      },
      {
        title: 'Pronunciation changes',
        text: 'Final consonants of numbers often disappear or link to the next word.',
        french: 'deux, six, dix',
      },
    ],
  },
  'm1-l6-numbers-11-20': {
    focus: 'The teens follow a clear pattern with a few spelling changes you must memorise.',
    rules: [
      {
        title: 'Pattern 17–19',
        text: 'dix-sept, dix-huit, dix-neuf are simply dix + the small number with a hyphen.',
        french: 'dix-sept, dix-huit, dix-neuf',
      },
      {
        title: 'et before un',
        text: '21, 31, 41, 51, 61 add et before un: vingt et un, trente et un.',
        french: 'vingt et un',
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
        french: 'Je suis canadien.',
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
        text: 'Add -e for the feminine and -s for the plural; nationalities stay lowercase in French.',
        french: 'français, française, françaises',
      },
      {
        title: 'Origin: de / du / des',
        text: 'de with a feminine country, du with a masculine country, des with a plural country.',
        french: 'Je viens de France et du Canada.',
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
    focus: 'Daily routine uses reflexive verbs (se réveiller, se laver, se coucher) with time markers like le matin, ensuite, le soir.',
    rules: [
      {
        title: 'Reflexive verbs',
        text: 'The reflexive pronoun changes with the subject: je me réveille, tu te lèves, il se lave.',
        french: 'Je me lève à sept heures.',
      },
      {
        title: 'Time markers',
        text: 'd\'abord, ensuite, puis, enfin and le matin / le soir put the routine in order.',
        french: 'D\'abord je me lave, ensuite je prends le petit-déjeuner.',
      },
    ],
  },
  'm2-l2-telling-time': {
    focus: 'Telling the time uses il est + hour, with et quart, et demie and moins le quart.',
    rules: [
      {
        title: 'il est + hour',
        text: 'Only une heure is singular; all the other hours take -s.',
        french: 'Il est trois heures et quart.',
      },
      {
        title: 'The 24-hour clock',
        text: 'Trains, planes and offices use the 24-hour system.',
        french: 'Le train part à dix-huit heures trente.',
      },
    ],
  },
  'm2-l3-days-dates': {
    focus: 'Dates are formed with le + number + month (+ year); days and months stay lowercase.',
    rules: [
      {
        title: 'No preposition before the date',
        text: 'Use le before the number: le 5 mai. Only the first of the month uses premier.',
        french: 'le premier juin',
      },
      {
        title: 'Lowercase days and months',
        text: 'lundi, mardi, mai, juillet — French does not capitalise them.',
        french: 'le lundi 3 juillet',
      },
    ],
  },
  'm2-l4-weather-seasons': {
    focus: 'Weather expressions start with il fait (temperature, general weather) or il + verb (il pleut, il neige).',
    rules: [
      {
        title: 'il fait + adjective or noun',
        text: 'Temperature and general conditions: il fait chaud, il fait froid, il fait du vent.',
        french: 'Il fait beau aujourd\'hui.',
      },
      {
        title: 'Season prepositions',
        text: 'en été, en automne, en hiver, but au printemps.',
        french: 'Au printemps il pleut souvent.',
      },
    ],
  },
  'm2-l5-colors-clothes': {
    focus: 'Colours are adjectives and must agree with the noun; a few of them never change.',
    rules: [
      {
        title: 'Colour agreement',
        text: 'Add -e for the feminine and -s for the plural.',
        french: 'une chemise bleue, des chaussures noires',
      },
      {
        title: 'Invariable colours',
        text: 'Colours taken from nouns (marron, orange, kaki) stay the same in all forms.',
        french: 'des chaussures marron',
      },
    ],
  },
  'm2-l6-shopping-prices': {
    focus: 'Shopping needs a polite request, a price question and a payment method.',
    rules: [
      {
        title: 'Asking the price',
        text: 'Combien ça coûte ? / Combien coûte cette chemise ? / C\'est combien ?',
        french: 'Combien ça coûte ?',
      },
      {
        title: 'The pronoun en = "of it"',
        text: 'en replaces du / de la / des + noun when the quantity is given.',
        french: 'Je voudrais du pain. J\'en voudrais un kilo.',
      },
      {
        title: 'Reacting',
        text: 'trop cher, pas assez grand, une réduction, une taille.',
        french: 'C\'est trop cher pour moi.',
      },
    ],
  },
  'm2-l7-morning-food': {
    focus: 'Food orders use the partitive articles du, de la, de l\' and des for an unspecified quantity.',
    rules: [
      {
        title: 'Partitive articles',
        text: 'du / de la / de l\' / des = "some".',
        french: 'Je voudrais du fromage et des croissants.',
      },
      {
        title: 'After a negative',
        text: 'The partitive becomes de after ne... pas.',
        french: 'Je ne veux pas de sucre.',
      },
    ],
  },
  'm2-l8-at-restaurant': {
    focus: 'Restaurant French follows a script: réserver, commander, demander l\'addition.',
    rules: [
      {
        title: 'Ordering politely',
        text: 'je voudrais / je prendrai + dish, with s\'il vous plaît.',
        french: 'Je prendrai le poulet, s\'il vous plaît.',
      },
      {
        title: 'Asking for the bill',
        text: 'L\'addition, s\'il vous plaît. / Je peux avoir l\'addition ?',
        french: 'L\'addition, s\'il vous plaît.',
      },
    ],
  },
  'm2-l9-town-places': {
    focus: 'Places in town go with the direction preposition à + article: au, à la, à l\', aux.',
    rules: [
      {
        title: 'à + article',
        text: 'au marché, à la gare, à l\'aéroport, aux toilettes.',
        french: 'Je vais à la pharmacie.',
      },
      {
        title: 'Asking where something is',
        text: 'Où est la banque ? The answer uses c\'est + preposition.',
        french: 'C\'est en face de la poste.',
      },
    ],
  },
  'm2-l10-asking-directions': {
    focus: 'Directions use the imperative (tournez, continuez, prenez) plus ordinal words.',
    rules: [
      {
        title: 'Imperative with vous',
        text: 'Drop the subject pronoun: tournez à droite, continuez tout droit.',
        french: 'Tournez à gauche au feu.',
      },
      {
        title: 'Ordinal + rue',
        text: 'la première rue à droite, la deuxième à gauche.',
        french: 'Prenez la deuxième rue à droite.',
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
        text: 'Three basic positions; combine the others with de + noun: à côté de, en face de, près de.',
        french: 'Le livre est sur la table.',
      },
      {
        title: 'Position or direction?',
        text: 'dans describes where something is; à + place describes where you are going.',
        french: 'Je vais à la cuisine.',
      },
    ],
  },
  'm4-l1-hobbies': {
    focus: 'Hobbies use faire de / jouer à and the verbs aimer, adorer, détester.',
    rules: [
      {
        title: 'jouer à / jouer de',
        text: 'jouer à + sport or game, jouer de + musical instrument.',
        french: 'Je joue au tennis et je joue de la guitare.',
      },
      {
        title: 'faire du / de la / de l\'',
        text: 'faire du sport, faire de la photo, faire de l\'escalade.',
        french: 'Je fais de la photo.',
      },
      {
        title: 'Expressing likes',
        text: 'j\'aime, j\'adore, je n\'aime pas, je déteste + infinitive.',
        french: 'J\'adore lire le soir.',
      },
    ],
  },
  'm4-l2-shopping': {
    focus: 'Shopping dialogue needs polite requests, price questions and basic comparisons.',
    rules: [
      {
        title: 'Auriez-vous... ?',
        text: 'The conditional makes a request much more polite than vous avez... ?',
        french: 'Auriez-vous ce modèle en 40 ?',
      },
      {
        title: 'Comparatives',
        text: 'moins cher que, plus grand que, meilleur que.',
        french: 'Celui-ci est moins cher que l\'autre.',
      },
    ],
  },
  'm4-l3-dining-out': {
    focus: 'Ordering a full meal follows a fixed sequence and uses partitive articles with polite forms.',
    rules: [
      {
        title: 'The menu sequence',
        text: 'l\'entrée, le plat principal, le dessert, la boisson.',
        french: 'Comme entrée, je prendrai la soupe.',
      },
      {
        title: 'Recommending a dish',
        text: 'Je vous recommande / je vous conseille + dish.',
        french: 'Je vous recommande le poisson du jour.',
      },
    ],
  },
  'm4-l4-transport': {
    focus: 'Transport uses prendre + article and the vocabulary of tickets and connections.',
    rules: [
      {
        title: 'prendre le / la',
        text: 'je prends le bus, le métro, la ligne 2, le train.',
        french: 'Je prends le métro tous les jours.',
      },
      {
        title: 'Asking about the itinerary',
        text: 'Est-ce que ça va à la gare ? / Je dois descendre à quel arrêt ?',
        french: 'Je dois descendre à quel arrêt ?',
      },
    ],
  },
  'm4-l5-weather-social': {
    focus: 'Weather small talk links weather expressions to plans with quand, si and donc.',
    rules: [
      {
        title: 'Weather + plan',
        text: 'S\'il fait beau, je sors ; s\'il pleut, je reste à la maison.',
        french: 'S\'il fait beau, nous irons au parc.',
      },
      {
        title: 'Talking about the forecast',
        text: 'Il va pleuvoir, il y aura du vent, les températures montent.',
        french: 'Il va pleuvoir cet après-midi.',
      },
    ],
  },
  'm5-l1-airport': {
    focus: 'Airport French needs the passé composé (j\'ai réservé) and polite conditional requests.',
    rules: [
      {
        title: 'Past participle agreement',
        text: 'With être, the participle agrees with the subject: elle est partie, ils sont partis.',
        french: 'Je suis arrivé à midi.',
      },
      {
        title: 'Departure vocabulary',
        text: 'l\'enregistrement, la porte d\'embarquement, la carte d\'embarquement, un vol retardé.',
        french: 'Le vol est retardé de deux heures.',
      },
    ],
  },
  'm5-l2-hotel': {
    focus: 'Hotel check-in combines the passé composé for the booking with the conditional for requests.',
    rules: [
      {
        title: 'Booking in the past',
        text: 'J\'ai réservé une chambre pour deux nuits, au nom de...',
        french: 'J\'ai réservé au nom de Dupont.',
      },
      {
        title: 'Polite requests',
        text: 'Pourriez-vous + infinitive; Est-ce qu\'il y a + noun.',
        french: 'Pourriez-vous appeler un taxi ?',
      },
    ],
  },
  'm5-l3-health': {
    focus: 'Health French uses avoir mal à and depuis / il y a + duration.',
    rules: [
      {
        title: 'avoir mal à + body part',
        text: 'à la tête, au dos, aux dents, à la gorge.',
        french: 'J\'ai mal au dos.',
      },
      {
        title: 'depuis or il y a?',
        text: 'depuis = "for / since" and the situation is still true; il y a = "ago".',
        french: 'Je tousse depuis trois jours.',
      },
      {
        title: 'Giving advice',
        text: 'Vous devez / il faut + infinitive.',
        french: 'Vous devez vous reposer.',
      },
    ],
  },
  'm5-l4-restaurants': {
    focus: 'Reading a menu needs partitive and definite articles, plus allergy and advice questions.',
    rules: [
      {
        title: 'Talking about allergies',
        text: 'Je suis allergique à / aux + food.',
        french: 'Je suis allergique aux fruits de mer.',
      },
      {
        title: 'Asking for advice',
        text: 'Qu\'est-ce que vous me conseillez ? / Qu\'est-ce qu\'il y a comme plat du jour ?',
        french: 'Qu\'est-ce que vous me conseillez ?',
      },
    ],
  },
  'm5-l5-numbers-prices': {
    focus: 'Prices and totals need the numbers from 70 to 100 and the verbs coûter and faire.',
    rules: [
      {
        title: 'Numbers 70–99',
        text: 'soixante-dix, quatre-vingts, quatre-vingt-dix; 71 is soixante et onze.',
        french: 'quatre-vingt-dix-neuf euros',
      },
      {
        title: 'Talking about money',
        text: 'Ça fait combien ? / Ça fait vingt euros dix.',
        french: 'Ça fait vingt euros.',
      },
    ],
  },
  'm6-l1-workplace': {
    focus: 'Workplace French uses the present for routines and the passé composé for recent actions.',
    rules: [
      {
        title: 'Present for routines',
        text: 'Je travaille dans un bureau, mes horaires sont...',
        french: 'Je travaille dans un bureau.',
      },
      {
        title: 'Passé composé for updates',
        text: 'Used to report what has just been done.',
        french: 'J\'ai envoyé le dossier ce matin.',
      },
    ],
  },
  'm6-l2-school': {
    focus: 'School vocabulary works with suivre / prendre + les cours and uses the imparfait for study habits.',
    rules: [
      {
        title: 'Passé composé vs imparfait',
        text: 'J\'ai réussi l\'examen (event) vs j\'étudiais tous les soirs (habit).',
        french: 'J\'ai réussi mon examen.',
      },
      {
        title: 'Expressing obligation',
        text: 'Je dois + infinitive / il faut + infinitive.',
        french: 'Je dois rendre le devoir lundi.',
      },
    ],
  },
  'm6-l3-technology': {
    focus: 'Tech French uses the present, the pronoun ça for devices and the passive voice for problems.',
    rules: [
      {
        title: 'Passive for technical problems',
        text: 'être + past participle: le fichier a été enregistré, le mot de passe a été oublié.',
        french: 'Le fichier a été enregistré.',
      },
      {
        title: 'Ça / il for devices',
        text: 'Ça ne marche pas, il faut recharger la batterie.',
        french: 'Ça ne marche pas.',
      },
    ],
  },
  'm6-l4-past-future': {
    focus: 'This topic is pure tense work: passé composé, imparfait and futur simple with clear time markers.',
    rules: [
      {
        title: 'Time markers',
        text: 'hier, la semaine dernière (past) / demain, la semaine prochaine (future).',
        french: 'Je partirai demain.',
      },
      {
        title: 'Futur simple endings',
        text: 'Infinitive + -ai, -as, -a, -ons, -ez, -ont.',
        french: 'Je travaillerai à distance.',
      },
    ],
  },
  'm6-l5-instructions': {
    focus: 'Instructions use the imperative with a polite tone, and confirmation phrases to check understanding.',
    rules: [
      {
        title: 'Imperative forms',
        text: 'fais / faites (tu / vous), n\'oubliez pas de...',
        french: 'Ouvrez le fichier.',
      },
      {
        title: 'Confirming',
        text: 'C\'est bien ça ? / Vous pouvez répéter, s\'il vous plaît ?',
        french: 'Vous pouvez répéter, s\'il vous plaît ?',
      },
    ],
  },
  'm7-l1-news': {
    focus: 'News language uses the passé composé for events and the passive voice for headlines.',
    rules: [
      {
        title: 'Passive headlines',
        text: 'être + past participle: une loi a été votée, le rapport a été publié.',
        french: 'La loi a été votée hier.',
      },
      {
        title: 'Reporting verbs',
        text: 'selon + source, d\'après + source, il paraît que...',
        french: 'Selon la radio, la grève continue.',
      },
    ],
  },
  'm7-l2-environment': {
    focus: 'Environment topics need cause and consequence connectors, plus the conditional for solutions.',
    rules: [
      {
        title: 'Cause and consequence',
        text: 'à cause de, grâce à, par conséquent, donc.',
        french: 'Grâce au recyclage, nous gaspillons moins.',
      },
      {
        title: 'Proposing solutions',
        text: 'Si + imparfait → conditionnel présent.',
        french: 'Si nous recyclions plus, la planète irait mieux.',
      },
    ],
  },
  'm7-l3-opinions': {
    focus: 'Opinions need clear structures: je pense que + indicative, je doute que + subjunctive.',
    rules: [
      {
        title: 'Indicative or subjunctive?',
        text: 'Je pense que c\'est vrai (indicatif) vs je doute que ce soit vrai (subjonctif).',
        french: 'Je doute que ce soit vrai.',
      },
      {
        title: 'Justifying your opinion',
        text: 'parce que, car, puisque, c\'est pourquoi.',
        french: 'J\'aime ce journal parce qu\'il est fiable.',
      },
    ],
  },
  'm7-l4-debate': {
    focus: 'Debating needs connectors, agreement and disagreement phrases, and a balanced conclusion.',
    rules: [
      {
        title: 'Agree or disagree',
        text: 'Je suis d\'accord, je suis tout à fait d\'accord, je ne suis pas d\'accord du tout.',
        french: 'Je ne suis pas d\'accord avec cette idée.',
      },
      {
        title: 'Balanced argument',
        text: 'd\'une part... d\'autre part... en conclusion.',
        french: 'D\'une part c\'est utile, d\'autre part c\'est risqué.',
      },
    ],
  },
  'm8-l1-culture': {
    focus: 'Talking about arts and films mixes the passé composé for events with the imparfait for background.',
    rules: [
      {
        title: 'Narrating',
        text: 'Background in the imparfait, action in the passé composé.',
        french: 'J\'étais à Paris quand j\'ai vu le concert.',
      },
      {
        title: 'Recommending culture',
        text: 'Ça vaut le coup, c\'est un incontournable, je vous le conseille.',
        french: 'Ce film vaut vraiment le coup.',
      },
    ],
  },
  'm8-l2-traditions': {
    focus: 'Describing traditions uses the present for habits and chaque année / depuis for repetition.',
    rules: [
      {
        title: 'Present for traditions',
        text: 'Chaque année, nous fêtons le nouvel an en famille.',
        french: 'Chaque année, nous fêtons le nouvel an.',
      },
      {
        title: 'Passive voice',
        text: 'Useful to describe a celebration nobody in particular performs.',
        french: 'La fête est célébrée le 14 juillet.',
      },
    ],
  },
  'm8-l3-career': {
    focus: 'Career talk combines the passé composé for experience with the futur simple and conditional for plans.',
    rules: [
      {
        title: 'Talking about experience',
        text: 'J\'ai fait un stage de six mois / j\'ai travaillé dans...',
        french: 'J\'ai fait un stage en marketing.',
      },
      {
        title: 'Plans and aims',
        text: 'je souhaite + infinitive, j\'aimerais + infinitive, je vais + infinitive.',
        french: 'J\'aimerais travailler à l\'international.',
      },
    ],
  },
  'm8-l4-interview': {
    focus: 'Interviews require formal register: vous, the polite conditional and structured connectors.',
    rules: [
      {
        title: 'Polite conditionals',
        text: 'Pourriez-vous, auriez-vous, je voudrais.',
        french: 'Pourriez-vous m\'en dire plus ?',
      },
      {
        title: 'Structuring an answer',
        text: 'Tout d\'abord..., ensuite..., enfin...',
        french: 'Tout d\'abord, je suis très motivé.',
      },
    ],
  },
  'm9-l1-business': {
    focus: 'Business reporting uses the passive voice and precise quantity expressions.',
    rules: [
      {
        title: 'Passive in reports',
        text: 'Le chiffre d\'affaires a été publié / les coûts ont été réduits.',
        french: 'Les coûts ont été réduits.',
      },
      {
        title: 'Quantities',
        text: 'une augmentation de 10 %, une baisse de 5 %, le double de.',
        french: 'Une hausse de dix pour cent.',
      },
    ],
  },
  'm9-l2-marketing-finance': {
    focus: 'Negotiation relies on the conditional: si + imparfait → conditionnel présent.',
    rules: [
      {
        title: 'Negotiating',
        text: 'A polite condition makes the offer easy to accept.',
        french: 'Si vous baissiez le prix, nous signerions.',
      },
      {
        title: 'Hypotheses about the past',
        text: 'Si + plus-que-parfait → conditionnel passé.',
        french: 'Si nous avions anticipé, nous aurions gagné.',
      },
    ],
  },
  'm9-l3-innovation': {
    focus: 'Talking about innovation needs the present, the passive and the subjunctive after expressions of necessity.',
    rules: [
      {
        title: 'Describing a product',
        text: 'Il s\'agit de..., ce produit permet de..., il est destiné à...',
        french: 'Ce produit permet d\'économiser de l\'énergie.',
      },
      {
        title: 'Necessity + subjunctive',
        text: 'Il est indispensable que / il faut que + subjonctif.',
        french: 'Il est indispensable que nous testions le prototype.',
      },
    ],
  },
  'm9-l4-presentation': {
    focus: 'Presentations use structure markers and the futur antérieur for actions completed before a deadline.',
    rules: [
      {
        title: 'Structuring a presentation',
        text: 'Dans un premier temps..., dans un second temps..., pour conclure...',
        french: 'Dans un premier temps, voici les chiffres.',
      },
      {
        title: 'Futur antérieur',
        text: 'j\'aurai terminé = "I will have finished".',
        french: 'J\'aurai terminé la présentation avant midi.',
      },
    ],
  },
  'm10-l1-globalization': {
    focus: 'Abstract topics need cause and consequence connectors plus the subjunctive for concession.',
    rules: [
      {
        title: 'Concession with bien que',
        text: 'bien que + subjonctif.',
        french: 'Bien que la mondialisation crée des emplois, elle creuse les inégalités.',
      },
      {
        title: 'Cause and consequence',
        text: 'en raison de, par conséquent, ce qui entraîne, d\'où.',
        french: 'Ce qui entraîne une hausse des inégalités.',
      },
    ],
  },
  'm10-l2-ethics': {
    focus: 'Ethics debates mix hedging (il se peut que, je doute que) with clear statements of values.',
    rules: [
      {
        title: 'Hedging',
        text: 'il se peut que + subjonctif; il est probable que + indicatif.',
        french: 'Il se peut que cette décision soit contestée.',
      },
      {
        title: 'Talking about values',
        text: 'des valeurs, un principe, une responsabilité morale.',
        french: 'C\'est une question de responsabilité morale.',
      },
    ],
  },
  'm10-l3-media-analysis': {
    focus: 'Media analysis uses the gérondif and precise reporting verbs to judge sources.',
    rules: [
      {
        title: 'Gérondif',
        text: 'en + participe présent expresses "while" or "by".',
        french: 'En comparant les sources, on voit la différence.',
      },
      {
        title: 'Reporting and nuance',
        text: 'prétendre, affirmer, sous-entendre, nuancer.',
        french: 'L\'article prétend que le chiffre est exact.',
      },
    ],
  },
  'm10-l4-mastery': {
    focus: 'Final revision: build a complete argument with a thesis, evidence, a concession and a conclusion.',
    rules: [
      {
        title: 'Argument structure',
        text: 'thèse, arguments, concession (certes... mais...), conclusion.',
        french: 'Certes, mais les faits sont plus nuancés.',
      },
      {
        title: 'Rhetoric tools',
        text: 'd\'une part... d\'autre part, non seulement... mais aussi, cependant.',
        french: 'Non seulement c\'est utile, mais c\'est aussi nécessaire.',
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
