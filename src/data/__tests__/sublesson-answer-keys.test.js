/*
 * The backend grades sub-lesson quizzes from Backend/services/sublesson_answer_keys.json,
 * which is generated from the quiz files below. This test fails whenever a quiz
 * was edited without regenerating it:
 *
 *   node scripts/generate-sublesson-answer-keys.js
 */
import fs from 'fs';

import { quizContent as module1 } from '@/data/quizzes/module1';
import { quizContent as module2 } from '@/data/quizzes/module2';
import { quizContent as module3 } from '@/data/quizzes/module3';
import { quizContent as module4 } from '@/data/quizzes/module4';
import { quizContent as module5 } from '@/data/quizzes/module5';
import { quizContent as module6 } from '@/data/quizzes/module6';
import { quizContent as module7 } from '@/data/quizzes/module7';
import { quizContent as module8 } from '@/data/quizzes/module8';
import { quizContent as module9 } from '@/data/quizzes/module9';
import { quizContent as module10 } from '@/data/quizzes/module10';

const {
  GRADED_QUIZ_TYPES,
  OUTPUT_PATH,
  buildAnswerKeys,
  serialize,
} = require('../../../scripts/generate-sublesson-answer-keys');

const quizByModule = {
  'module-1': module1,
  'module-2': module2,
  'module-3': module3,
  'module-4': module4,
  'module-5': module5,
  'module-6': module6,
  'module-7': module7,
  'module-8': module8,
  'module-9': module9,
  'module-10': module10,
};

describe('server sub-lesson answer keys', () => {
  it('are up to date with the quiz files', () => {
    const committed = fs.readFileSync(OUTPUT_PATH, 'utf8').replace(/\r\n/g, '\n');

    // On failure: run `node scripts/generate-sublesson-answer-keys.js`.
    expect(committed).toBe(serialize(buildAnswerKeys(quizByModule)));
  });

  it('cover every graded quiz question the sub-lesson screen shows', () => {
    const { sublessons } = buildAnswerKeys(quizByModule);

    for (const [moduleKey, quizContent] of Object.entries(quizByModule)) {
      for (const [subLessonId, questions] of Object.entries(quizContent)) {
        const shown = questions.filter(
          (question) => !question.type || GRADED_QUIZ_TYPES.includes(question.type)
        );
        expect(sublessons[subLessonId].moduleKey).toBe(moduleKey);
        expect(sublessons[subLessonId].questions.map((question) => question.id)).toEqual(
          shown.map((question) => question.id)
        );
      }
    }
  });

  it('rejects duplicate question ids, which the server could not tell apart', () => {
    expect(() =>
      buildAnswerKeys({
        'module-1': {
          'm1-x': [
            { id: 'q1', choices: ['a'], answer: 'a' },
            { id: 'q1', choices: ['b'], answer: 'b' },
          ],
        },
      })
    ).toThrow(/two questions with id "q1"/);
  });
});
