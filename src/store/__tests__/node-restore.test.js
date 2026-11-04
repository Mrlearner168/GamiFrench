/*
 * A finished map stop must stay finished after a reinstall / cleared data:
 * the device starts empty, and one `GET /progress` payload has to bring back
 * both halves of "done" - the completed lessons AND the final-quiz result.
 */
const mockMemory = new Map();
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async (key) => (mockMemory.has(key) ? mockMemory.get(key) : null)),
  setItemAsync: jest.fn(async (key, value) => {
    mockMemory.set(key, value);
  }),
  deleteItemAsync: jest.fn(async (key) => {
    mockMemory.delete(key);
  }),
}));

import {
  applyServerProgress,
  loadModuleQuizResults,
  saveModuleQuizResult,
  setLessonProgressScope,
} from '@/store/lesson-progress';

let scope = 0;
beforeEach(() => {
  mockMemory.clear();
  // A new learner id drops every in-memory cache, like a fresh install.
  scope += 1;
  setLessonProgressScope(`learner-${scope}`);
});

test('final-quiz results come back from /progress on a fresh install', async () => {
  await applyServerProgress({ content: [], lessons: [], assessments: { 'module-1': 85, 'placement-module-1': 40 } });

  const results = await loadModuleQuizResults();
  expect(results['module-1'].percentage).toBe(85);
  expect(results['placement-module-1']).toBeUndefined();
});

test('a lower server result never lowers the score kept on the device', async () => {
  await saveModuleQuizResult('module-2', 92);
  await applyServerProgress({ content: [], lessons: [], assessments: { 'module-2': 60 } });

  expect((await loadModuleQuizResults())['module-2'].percentage).toBe(92);
});
