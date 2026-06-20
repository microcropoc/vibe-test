/**
 * Generates 11 JSON files (30 questions each) for guest seed data.
 * Keeps 2 existing questions per topic + adds 28 new demo-level questions.
 * Shuffles answer order so the correct option is not always first.
 *
 * Usage: npm run generate:seed
 * Output: src/guest/data/seed/questions/*.json
 */

import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { TOPICS } from './seed-question-bank.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '../src/guest/data/seed/questions');
const QUESTIONS_PER_TOPIC = 30;
const EXTRA_PER_TOPIC = 28;

/** @param {string} str */
function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** @param {T[]} items @param {number} seed */
function shuffleItems(items, seed) {
  const result = [...items];
  let state = seed;
  const nextInt = (max) => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state % (max + 1);
  };
  for (let i = result.length - 1; i > 0; i--) {
    const j = nextInt(i);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Shuffles answers and returns the new correct index.
 * @param {{ text: string, answers: string[], correct: number }} question
 * @param {number} seed
 */
function shuffleAnswers(question, seed) {
  const correctText = question.answers[question.correct];
  const wrong = shuffleItems(
    question.answers.filter((_, i) => i !== question.correct),
    seed ^ 0x9e3779b9,
  );
  const targetIndex = seed % (wrong.length + 1);
  const answers = [...wrong];
  answers.splice(targetIndex, 0, correctText);
  return { text: question.text, answers, correct: targetIndex };
}

/** @param {ReturnType<typeof shuffleAnswers>} question @param {string} slug @param {number} index */
function prepareQuestion(question, slug, index) {
  const seed = hashString(`${slug}:${index}:${question.text}`);
  return shuffleAnswers(question, seed);
}

/** @param {ReturnType<typeof shuffleAnswers>[]} questions @param {string} slug */
function validateQuestions(questions, slug) {
  if (questions.length !== QUESTIONS_PER_TOPIC) {
    throw new Error(`${slug}: expected ${QUESTIONS_PER_TOPIC} questions, got ${questions.length}`);
  }
  const texts = new Set();
  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    if (texts.has(question.text)) {
      throw new Error(`${slug}: duplicate question text: ${question.text}`);
    }
    texts.add(question.text);
    if (!question.answers || question.answers.length < 2) {
      throw new Error(`${slug} Q${i + 1}: need at least 2 answers`);
    }
    if (
      typeof question.correct !== 'number' ||
      question.correct < 0 ||
      question.correct >= question.answers.length
    ) {
      throw new Error(`${slug} Q${i + 1}: invalid correct index`);
    }
    for (const text of question.answers) {
      if (!text?.trim()) {
        throw new Error(`${slug} Q${i + 1}: empty answer text`);
      }
    }
  }
}

mkdirSync(OUTPUT_DIR, { recursive: true });

/** @type {number[]} */
const correctPositionCounts = [0, 0, 0, 0];

for (const [slug, { existing, extra }] of Object.entries(TOPICS)) {
  if (extra.length !== EXTRA_PER_TOPIC) {
    throw new Error(`${slug}: expected ${EXTRA_PER_TOPIC} extra questions, got ${extra.length}`);
  }
  const questions = [...existing, ...extra].map((question, index) =>
    prepareQuestion(question, slug, index),
  );
  validateQuestions(questions, slug);
  for (const question of questions) {
    const correctIndex = question.correct;
    if (correctIndex >= 0 && correctIndex < correctPositionCounts.length) {
      correctPositionCounts[correctIndex]++;
    }
  }
  const outPath = join(OUTPUT_DIR, `${slug}.json`);
  writeFileSync(outPath, `${JSON.stringify(questions, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${outPath} (${questions.length} questions)`);
}

console.log(`Correct answer positions [0..3]: ${correctPositionCounts.join(', ')}`);
console.log('Done.');
