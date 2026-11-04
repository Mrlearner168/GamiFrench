
import {
  getCountryTopics,
  getDefaultModuleId,
  getModuleLabel,
  lessonCatalog,
} from './catalog';

import { getGrammarContent } from './../learning/grammar';
import { learningContent as module1Learning } from './../learning/module1';
import { learningContent as module2Learning } from './../learning/module2';
import { learningContent as module3Learning } from './../learning/module3';
import { learningContent as module4Learning } from './../learning/module4';
import { learningContent as module5Learning } from './../learning/module5';
import { learningContent as module6Learning } from './../learning/module6';
import { learningContent as module7Learning } from './../learning/module7';
import { learningContent as module8Learning } from './../learning/module8';
import { learningContent as module9Learning } from './../learning/module9';
import { learningContent as module10Learning } from './../learning/module10';

import { practiceContent as module1Practice } from './../practice/module1';
import { practiceContent as module2Practice } from './../practice/module2';
import { practiceContent as module3Practice } from './../practice/module3';
import { practiceContent as module4Practice } from './../practice/module4';
import { practiceContent as module5Practice } from './../practice/module5';
import { practiceContent as module6Practice } from './../practice/module6';
import { practiceContent as module7Practice } from './../practice/module7';
import { practiceContent as module8Practice } from './../practice/module8';
import { practiceContent as module9Practice } from './../practice/module9';
import { practiceContent as module10Practice } from './../practice/module10';

import { quizContent as module1Quiz } from './../quizzes/module1';
import { quizContent as module2Quiz } from './../quizzes/module2';
import { quizContent as module3Quiz } from './../quizzes/module3';
import { quizContent as module4Quiz } from './../quizzes/module4';
import { quizContent as module5Quiz } from './../quizzes/module5';
import { quizContent as module6Quiz } from './../quizzes/module6';
import { quizContent as module7Quiz } from './../quizzes/module7';
import { quizContent as module8Quiz } from './../quizzes/module8';
import { quizContent as module9Quiz } from './../quizzes/module9';
import { quizContent as module10Quiz } from './../quizzes/module10';

import { speakingContent as module1Speaking } from './../speaking/module1';
import { speakingContent as module2Speaking } from './../speaking/module2';
import { speakingContent as module3Speaking } from './../speaking/module3';
import { speakingContent as module4Speaking } from './../speaking/module4';
import { speakingContent as module5Speaking } from './../speaking/module5';
import { speakingContent as module6Speaking } from './../speaking/module6';
import { speakingContent as module7Speaking } from './../speaking/module7';
import { speakingContent as module8Speaking } from './../speaking/module8';
import { speakingContent as module9Speaking } from './../speaking/module9';
import { speakingContent as module10Speaking } from './../speaking/module10';

const learningByModule = {
  'module-1': module1Learning,
  'module-2': module2Learning,
  'module-3': module3Learning,
  'module-4': module4Learning,
  'module-5': module5Learning,
  'module-6': module6Learning,
  'module-7': module7Learning,
  'module-8': module8Learning,
  'module-9': module9Learning,
  'module-10': module10Learning,
};

const practiceByModule = {
  'module-1': module1Practice,
  'module-2': module2Practice,
  'module-3': module3Practice,
  'module-4': module4Practice,
  'module-5': module5Practice,
  'module-6': module6Practice,
  'module-7': module7Practice,
  'module-8': module8Practice,
  'module-9': module9Practice,
  'module-10': module10Practice,
};

const speakingByModule = {
  'module-1': module1Speaking,
  'module-2': module2Speaking,
  'module-3': module3Speaking,
  'module-4': module4Speaking,
  'module-5': module5Speaking,
  'module-6': module6Speaking,
  'module-7': module7Speaking,
  'module-8': module8Speaking,
  'module-9': module9Speaking,
  'module-10': module10Speaking,
};

const quizByModule = {
  'module-1': module1Quiz,
  'module-2': module2Quiz,
  'module-3': module3Quiz,
  'module-4': module4Quiz,
  'module-5': module5Quiz,
  'module-6': module6Quiz,
  'module-7': module7Quiz,
  'module-8': module8Quiz,
  'module-9': module9Quiz,
  'module-10': module10Quiz,
};

const getLearningContent = (moduleId, subLessonId) => {
  return learningByModule[moduleId]?.[subLessonId] ?? null;
};

const getPracticeContent = (moduleId, subLessonId) => {
  return practiceByModule[moduleId]?.[subLessonId] ?? [];
};

const getSpeakingContent = (moduleId, subLessonId) => {
  return speakingByModule[moduleId]?.[subLessonId] ?? null;
};

const getQuizContent = (moduleId, subLessonId) => {
  return quizByModule[moduleId]?.[subLessonId] ?? [];
};

export {
  getCountryTopics,
  getDefaultModuleId, getGrammarContent, getLearningContent, getModuleLabel, getPracticeContent, getQuizContent, getSpeakingContent, lessonCatalog
};

