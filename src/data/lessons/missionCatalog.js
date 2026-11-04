import { MISSION_XP, NODE_PASS_PERCENTAGE } from '@/services/scoring';

/** Best score a mission objective's sub-lesson needs. */
export const MISSION_PASS_PERCENTAGE = NODE_PASS_PERCENTAGE;

/*
 * One mission per topic area: together the missions cover EVERY active
 * sub-lesson exactly once, so collecting all of a module's missions means the
 * whole module was learned. Mission numbers are permanent (the server stores
 * claims by number), which is why module 2's later missions are 23-25: they
 * were added after 1-22 shipped. The catalog order, not the number, decides
 * which mission comes next.
 *
 * An objective counts only once its sub-lesson scored MISSION_PASS_PERCENTAGE
 * (80%, the same mark that unlocks the next stop). The server checks the same
 * rule before it pays (Backend/services/gamification_catalog.json, generated
 * from this file by the Jest test src/data/__tests__/gamification-catalog.test.js).
 */
export const missionCatalog = [
  {
    id: 'mission-1',
    moduleId: 'module-1',

    title: 'Your First French Steps',
    description:
      'Learn the French alphabet and the vowel sounds that make French sound French.',

    objectives: [
      { id: 'mission-1-objective-1', title: 'Learn the French alphabet', type: 'subLesson', targetId: 'm1-l1-alphabet' },
      { id: 'mission-1-objective-2', title: 'Master the French vowels', type: 'subLesson', targetId: 'm1-l2-vowels' },
    ],

    rewards: {
      xp: MISSION_XP,
      coins: 20,
    },
  },

  {
    id: 'mission-2',
    moduleId: 'module-1',

    title: 'Speak Politely',
    description:
      'Greet people politely and answer "How are you?".',

    objectives: [
      { id: 'mission-2-objective-1', title: 'Learn greetings and polite expressions', type: 'subLesson', targetId: 'm1-l3-greetings' },
      { id: 'mission-2-objective-2', title: 'Ask and answer how someone is', type: 'subLesson', targetId: 'm1-l4-how-are-you' },
    ],

    rewards: {
      xp: MISSION_XP,
      coins: 25,
    },
  },

  {
    id: 'mission-3',
    moduleId: 'module-1',

    title: 'Count in French',
    description:
      'Learn and practice French numbers from 0 to 20.',

    objectives: [
      { id: 'mission-3-objective-1', title: 'Learn numbers 0-10', type: 'subLesson', targetId: 'm1-l5-numbers-0-10' },
      { id: 'mission-3-objective-2', title: 'Learn numbers 11-20', type: 'subLesson', targetId: 'm1-l6-numbers-11-20' },
    ],

    rewards: {
      xp: MISSION_XP,
      coins: 25,
    },
  },

  {
    id: 'mission-4',
    moduleId: 'module-1',

    title: 'Introduce Yourself',
    description:
      'Say your name, age and nationality.',

    objectives: [
      { id: 'mission-4-objective-1', title: 'Say your name', type: 'subLesson', targetId: 'm1-l7-name-identity' },
      { id: 'mission-4-objective-2', title: 'Talk about your age and nationality', type: 'subLesson', targetId: 'm1-l8-age-nationality' },
    ],

    rewards: {
      xp: MISSION_XP,
      coins: 30,
    },
  },

  {
    id: 'mission-5',
    moduleId: 'module-2',

    title: 'Daily Routines in Morocco',
    description:
      'Describe your day and tell the time.',

    objectives: [
      { id: 'mission-5-objective-1', title: 'Daily routine activities', type: 'subLesson', targetId: 'm2-l1-daily-routine' },
      { id: 'mission-5-objective-2', title: 'Telling the time', type: 'subLesson', targetId: 'm2-l2-telling-time' },
    ],

    rewards: {
      xp: MISSION_XP,
      coins: 30,
    },
  },

  {
    id: 'mission-6',
    moduleId: 'module-2',

    title: 'Days, Dates & Weather',
    description:
      'Talk about days, months, dates, the weather and the seasons.',

    objectives: [
      { id: 'mission-6-objective-1', title: 'Days, months and dates', type: 'subLesson', targetId: 'm2-l3-days-dates' },
      { id: 'mission-6-objective-2', title: 'Weather and seasons', type: 'subLesson', targetId: 'm2-l4-weather-seasons' },
    ],

    rewards: {
      xp: MISSION_XP,
      coins: 30,
    },
  },

  {
    id: 'mission-23',
    moduleId: 'module-2',

    title: 'Souk Shopping',
    description:
      'Name colours and clothes, then shop and ask for prices at the market.',

    objectives: [
      { id: 'mission-23-objective-1', title: 'Colours and clothes', type: 'subLesson', targetId: 'm2-l5-colors-clothes' },
      { id: 'mission-23-objective-2', title: 'Shopping and prices', type: 'subLesson', targetId: 'm2-l6-shopping-prices' },
    ],

    rewards: {
      xp: MISSION_XP,
      coins: 30,
    },
  },

  {
    id: 'mission-24',
    moduleId: 'module-2',

    title: 'Breakfast to Dinner',
    description:
      'Talk about everyday food and order at a restaurant.',

    objectives: [
      { id: 'mission-24-objective-1', title: 'Breakfast and everyday food', type: 'subLesson', targetId: 'm2-l7-morning-food' },
      { id: 'mission-24-objective-2', title: 'At the restaurant', type: 'subLesson', targetId: 'm2-l8-at-restaurant' },
    ],

    rewards: {
      xp: MISSION_XP,
      coins: 30,
    },
  },

  {
    id: 'mission-25',
    moduleId: 'module-2',

    title: 'Find Your Way in the Medina',
    description:
      'Name places in town and ask for directions.',

    objectives: [
      { id: 'mission-25-objective-1', title: 'Places in town', type: 'subLesson', targetId: 'm2-l9-town-places' },
      { id: 'mission-25-objective-2', title: 'Asking for directions', type: 'subLesson', targetId: 'm2-l10-asking-directions' },
    ],

    rewards: {
      xp: MISSION_XP,
      coins: 30,
    },
  },

  {
    id: 'mission-7',
    moduleId: 'module-3',

    title: 'Family & Describing People',
    description:
      'Talk about family members and describe people around you.',

    objectives: [
      { id: 'mission-7-objective-1', title: 'Family vocabulary', type: 'subLesson', targetId: 'm3-l1-family' },
      { id: 'mission-7-objective-2', title: 'Describing people', type: 'subLesson', targetId: 'm3-l2-describing-people' },
    ],

    rewards: {
      xp: MISSION_XP,
      coins: 30,
    },
  },

  {
    id: 'mission-8',
    moduleId: 'module-3',

    title: 'Home & Prepositions',
    description:
      'Describe where you live and use the prepositions of place.',

    objectives: [
      { id: 'mission-8-objective-1', title: 'Talking about home', type: 'subLesson', targetId: 'm3-l3-my-home' },
      { id: 'mission-8-objective-2', title: 'Prepositions of place', type: 'subLesson', targetId: 'm3-l4-prepositions' },
    ],

    rewards: {
      xp: MISSION_XP,
      coins: 30,
    },
  },

  {
    id: 'mission-9',
    moduleId: 'module-4',

    title: 'Free Time & Shopping',
    description:
      'Share your hobbies and shop for what you need.',

    objectives: [
      { id: 'mission-9-objective-1', title: 'Talking about hobbies', type: 'subLesson', targetId: 'm4-l1-hobbies' },
      { id: 'mission-9-objective-2', title: 'Shopping and prices', type: 'subLesson', targetId: 'm4-l2-shopping' },
    ],

    rewards: {
      xp: MISSION_XP,
      coins: 25,
    },
  },

  {
    id: 'mission-10',
    moduleId: 'module-4',

    title: 'Dining, Transport & Small Talk',
    description:
      'Order food, get around by transport and chat about the weather.',

    objectives: [
      { id: 'mission-10-objective-1', title: 'Dining out', type: 'subLesson', targetId: 'm4-l3-dining-out' },
      { id: 'mission-10-objective-2', title: 'Transport', type: 'subLesson', targetId: 'm4-l4-transport' },
      { id: 'mission-10-objective-3', title: 'Weather and small talk', type: 'subLesson', targetId: 'm4-l5-weather-social' },
    ],

    rewards: {
      xp: MISSION_XP,
      coins: 25,
    },
  },

  {
    id: 'mission-11',
    moduleId: 'module-5',

    title: 'Travel to Cameroon',
    description:
      'Navigate the airport and check into a hotel in Cameroon.',

    objectives: [
      { id: 'mission-11-objective-1', title: 'At the airport', type: 'subLesson', targetId: 'm5-l1-airport' },
      { id: 'mission-11-objective-2', title: 'At the hotel', type: 'subLesson', targetId: 'm5-l2-hotel' },
    ],

    rewards: {
      xp: MISSION_XP,
      coins: 30,
    },
  },

  {
    id: 'mission-12',
    moduleId: 'module-5',

    title: 'Health, Menus & Money',
    description:
      'See a doctor, read a menu and handle prices in Cameroon.',

    objectives: [
      { id: 'mission-12-objective-1', title: 'At the doctor', type: 'subLesson', targetId: 'm5-l3-health' },
      { id: 'mission-12-objective-2', title: 'Restaurants and menus', type: 'subLesson', targetId: 'm5-l4-restaurants' },
      { id: 'mission-12-objective-3', title: 'Numbers and prices', type: 'subLesson', targetId: 'm5-l5-numbers-prices' },
    ],

    rewards: {
      xp: MISSION_XP,
      coins: 30,
    },
  },

  {
    id: 'mission-13',
    moduleId: 'module-6',

    title: 'Work, School & Technology',
    description:
      'Talk about work, school and the technology you use in Belgium.',

    objectives: [
      { id: 'mission-13-objective-1', title: 'The workplace', type: 'subLesson', targetId: 'm6-l1-workplace' },
      { id: 'mission-13-objective-2', title: 'At school', type: 'subLesson', targetId: 'm6-l2-school' },
      { id: 'mission-13-objective-3', title: 'Phones, computers and internet', type: 'subLesson', targetId: 'm6-l3-technology' },
    ],

    rewards: {
      xp: MISSION_XP,
      coins: 30,
    },
  },

  {
    id: 'mission-14',
    moduleId: 'module-6',

    title: 'Past, Future & How-tos',
    description:
      'Use past and future tenses and give instructions.',

    objectives: [
      { id: 'mission-14-objective-1', title: 'Past and future', type: 'subLesson', targetId: 'm6-l4-past-future' },
      { id: 'mission-14-objective-2', title: 'Giving instructions', type: 'subLesson', targetId: 'm6-l5-instructions' },
    ],

    rewards: {
      xp: MISSION_XP,
      coins: 30,
    },
  },

  {
    id: 'mission-15',
    moduleId: 'module-7',

    title: 'News & Environment',
    description:
      'Discuss the news and environmental topics in Switzerland.',

    objectives: [
      { id: 'mission-15-objective-1', title: 'Reading the news', type: 'subLesson', targetId: 'm7-l1-news' },
      { id: 'mission-15-objective-2', title: 'Environmental issues', type: 'subLesson', targetId: 'm7-l2-environment' },
    ],

    rewards: {
      xp: MISSION_XP,
      coins: 35,
    },
  },

  {
    id: 'mission-16',
    moduleId: 'module-7',

    title: 'Opinions & Debate',
    description:
      'Express opinions and take part in a structured debate.',

    objectives: [
      { id: 'mission-16-objective-1', title: 'Giving opinions', type: 'subLesson', targetId: 'm7-l3-opinions' },
      { id: 'mission-16-objective-2', title: 'Debating', type: 'subLesson', targetId: 'm7-l4-debate' },
    ],

    rewards: {
      xp: MISSION_XP,
      coins: 35,
    },
  },

  {
    id: 'mission-17',
    moduleId: 'module-8',

    title: 'Monaco Culture',
    description:
      'Explore Monégasque culture, traditions and lifestyle.',

    objectives: [
      { id: 'mission-17-objective-1', title: 'Culture and lifestyle', type: 'subLesson', targetId: 'm8-l1-culture' },
      { id: 'mission-17-objective-2', title: 'Traditions', type: 'subLesson', targetId: 'm8-l2-traditions' },
    ],

    rewards: {
      xp: MISSION_XP,
      coins: 40,
    },
  },

  {
    id: 'mission-18',
    moduleId: 'module-8',

    title: 'Career & Interview',
    description:
      'Talk about careers and prepare for a job interview.',

    objectives: [
      { id: 'mission-18-objective-1', title: 'Career path', type: 'subLesson', targetId: 'm8-l3-career' },
      { id: 'mission-18-objective-2', title: 'The interview', type: 'subLesson', targetId: 'm8-l4-interview' },
    ],

    rewards: {
      xp: MISSION_XP,
      coins: 40,
    },
  },

  {
    id: 'mission-19',
    moduleId: 'module-9',

    title: 'Business & Finance',
    description:
      'Discuss business topics and finance in Luxembourg.',

    objectives: [
      { id: 'mission-19-objective-1', title: 'Business basics', type: 'subLesson', targetId: 'm9-l1-business' },
      { id: 'mission-19-objective-2', title: 'Marketing and finance', type: 'subLesson', targetId: 'm9-l2-marketing-finance' },
    ],

    rewards: {
      xp: MISSION_XP,
      coins: 45,
    },
  },

  {
    id: 'mission-20',
    moduleId: 'module-9',

    title: 'Innovation & Presentations',
    description:
      'Talk about innovation and deliver a short presentation.',

    objectives: [
      { id: 'mission-20-objective-1', title: 'Innovation', type: 'subLesson', targetId: 'm9-l3-innovation' },
      { id: 'mission-20-objective-2', title: 'Presentations', type: 'subLesson', targetId: 'm9-l4-presentation' },
    ],

    rewards: {
      xp: MISSION_XP,
      coins: 45,
    },
  },

  {
    id: 'mission-21',
    moduleId: 'module-10',

    title: 'Globalization & Ethics',
    description:
      'Discuss globalization and ethical questions in modern France.',

    objectives: [
      { id: 'mission-21-objective-1', title: 'Globalization', type: 'subLesson', targetId: 'm10-l1-globalization' },
      { id: 'mission-21-objective-2', title: 'Ethics', type: 'subLesson', targetId: 'm10-l2-ethics' },
    ],

    rewards: {
      xp: MISSION_XP,
      coins: 50,
    },
  },

  {
    id: 'mission-22',
    moduleId: 'module-10',

    title: 'Media Analysis & Final Mastery',
    description:
      'Analyse media, spot bias and master advanced French argumentation.',

    objectives: [
      { id: 'mission-22-objective-1', title: 'Media analysis', type: 'subLesson', targetId: 'm10-l3-media-analysis' },
      { id: 'mission-22-objective-2', title: 'Final mastery challenge', type: 'subLesson', targetId: 'm10-l4-mastery' },
    ],

    rewards: {
      xp: MISSION_XP,
      coins: 50,
    },
  },
];

export const getMissionById = (missionId) => {
  return missionCatalog.find(
    (mission) => mission.id === missionId
  );
};

/**
 * Every mission that belongs to a module, in catalog order.
 */
export const getMissionsByModule = (moduleId) => {
  return missionCatalog.filter(
    (mission) => mission.moduleId === moduleId
  );
};

/**
 * Turn a mission id ("mission-3") into the numeric id the API expects (3).
 * Returns null when the id cannot be parsed.
 */
export const getMissionNumber = (missionId) => {
  const value = Number.parseInt(
    String(missionId ?? '').replace(/\D/g, ''),
    10
  );

  return Number.isNaN(value) ? null : value;
};

/**
 * Inverse of getMissionNumber: 3 -> "mission-3".
 */
export const getMissionKeyFromNumber = (missionNumber) => {
  const value = Number.parseInt(missionNumber, 10);

  return Number.isNaN(value) ? null : `mission-${value}`;
};

/**
 * The mission that follows the given one.
 *
 * Missions are grouped by module, so the next mission is:
 *   1. the following mission in the same module, or
 *   2. the first mission of the next module that has missions defined.
 *
 * Returns null when the whole catalog is finished, which lets the UI show a
 * "stage complete" state instead of routing to a mission that does not exist.
 */
export const getNextMission = (missionId) => {
  const index = missionCatalog.findIndex(
    (mission) => mission.id === missionId
  );

  if (index === -1) return null;

  const currentMission = missionCatalog[index];
  const moduleMissions = getMissionsByModule(
    currentMission.moduleId
  );
  const positionInModule = moduleMissions.findIndex(
    (mission) => mission.id === currentMission.id
  );

  if (
    positionInModule !== -1 &&
    positionInModule + 1 < moduleMissions.length
  ) {
    return moduleMissions[positionInModule + 1];
  }

  return (
    missionCatalog
      .slice(index + 1)
      .find(
        (mission) =>
          mission.moduleId !== currentMission.moduleId
      ) ?? null
  );
};
