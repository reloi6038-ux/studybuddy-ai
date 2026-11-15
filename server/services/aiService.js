const { GoogleGenAI } = require('@google/genai');

// ─── Model fallback chain ───────────────────────────
// Primary → Fallback 1 → Fallback 2
// All are free-tier eligible per current Gemini pricing docs
const MODEL_CHAIN = [
  process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-3.6-flash',
].filter(Boolean);

let client = null;

const getClient = () => {
  if (!client) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return client;
};

/**
 * Call Gemini with structured JSON output.
 * Tries each model in the chain. Retries once per model on 429/503.
 *
 * @param {string} systemPrompt
 * @param {string} userPrompt
 * @param {object} jsonSchema - JSON schema for structured output
 * @param {object} options - { temperature, maxOutputTokens }
 * @returns {object} parsed JSON response
 */
const generateStructured = async (systemPrompt, userPrompt, jsonSchema, options = {}) => {
  const { temperature = 0.4, maxOutputTokens = 2048 } = options;
  const ai = getClient();

  const errors = [];

  for (const model of MODEL_CHAIN) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`🤖 AI request → ${model} (attempt ${attempt})`);

        const response = await ai.models.generateContent({
          model,
          contents: userPrompt,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
            responseJsonSchema: jsonSchema,
            temperature,
            maxOutputTokens,
          },
        });

        const text = response.text;
        if (!text) {
          throw new Error('Empty response from model');
        }

        const parsed = JSON.parse(text);
        console.log(`✅ AI success → ${model}`);
        return { data: parsed, model };
      } catch (err) {
        const status = err.status || err.code;
        const isRetryable = status === 429 || status === 503 || status === 500;
        const isLastAttempt = attempt === 2;

        console.warn(
          `⚠️ ${model} failed (status=${status || 'unknown'}): ${err.message}`
        );

        // If not retryable, break to next model immediately
        if (!isRetryable) {
          errors.push(`${model}: ${err.message}`);
          break;
        }

        // If retryable and not last attempt, wait and retry same model
        if (!isLastAttempt) {
          const waitMs = attempt * 1000;
          console.log(`   Retrying ${model} in ${waitMs}ms...`);
          await new Promise((r) => setTimeout(r, waitMs));
          continue;
        }

        // Retryable and last attempt — move to next model
        errors.push(`${model}: ${err.message} (after retry)`);
      }
    }
  }

  // All models failed
  const error = new Error(
    `AI service unavailable. All models failed: ${errors.join(' | ')}`
  );
  error.statusCode = 503;
  throw error;
};

// ─── Feature wrappers ───────────────────────────────

const explainConcept = async ({ question, gradeLevel, subject }) => {
  const { explainPrompt } = require('./promptTemplates');
  const { system, user } = explainPrompt({ question, gradeLevel, subject });

  const schema = {
    type: 'object',
    properties: {
      simpleAnswer: { type: 'string' },
      explanation: { type: 'string' },
      example: { type: 'string' },
      commonMistake: { type: 'string' },
      checkQuestion: { type: 'string' },
    },
    required: ['simpleAnswer', 'explanation', 'example', 'commonMistake', 'checkQuestion'],
  };

  const result = await generateStructured(system, user, schema, { temperature: 0.5 });
  return result;
};

const generateFlashcards = async ({ notes, subject, count = 10 }) => {
  const { flashcardsPrompt } = require('./promptTemplates');
  const { system, user } = flashcardsPrompt({ notes, subject, count });

  const schema = {
    type: 'object',
    properties: {
      cards: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            front: { type: 'string' },
            back: { type: 'string' },
            difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
          },
          required: ['front', 'back', 'difficulty'],
        },
      },
    },
    required: ['cards'],
  };

  return generateStructured(system, user, schema, { temperature: 0.4, maxOutputTokens: 3000 });
};

const generateQuiz = async ({ topic, gradeLevel, questionCount = 5 }) => {
  const { quizPrompt } = require('./promptTemplates');
  const { system, user } = quizPrompt({ topic, gradeLevel, questionCount });

  const schema = {
    type: 'object',
    properties: {
      title: { type: 'string' },
      questions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            question: { type: 'string' },
            options: { type: 'array', items: { type: 'string' }, minItems: 4, maxItems: 4 },
            correctIndex: { type: 'integer', minimum: 0, maximum: 3 },
            explanation: { type: 'string' },
          },
          required: ['question', 'options', 'correctIndex', 'explanation'],
        },
      },
    },
    required: ['title', 'questions'],
  };

  return generateStructured(system, user, schema, { temperature: 0.5, maxOutputTokens: 3000 });
};

const generateStudyPlan = async ({ subjects, examDate, hoursPerDay, weakTopics }) => {
  const { studyPlanPrompt } = require('./promptTemplates');
  const { system, user } = studyPlanPrompt({ subjects, examDate, hoursPerDay, weakTopics });

  const schema = {
    type: 'object',
    properties: {
      planTitle: { type: 'string' },
      totalDays: { type: 'integer' },
      dailyPlan: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            day: { type: 'integer' },
            date: { type: 'string' },
            focus: { type: 'string' },
            tasks: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  subject: { type: 'string' },
                  topic: { type: 'string' },
                  durationMinutes: { type: 'integer' },
                  type: { type: 'string', enum: ['learn', 'practice', 'review'] },
                },
                required: ['subject', 'topic', 'durationMinutes', 'type'],
              },
            },
          },
          required: ['day', 'focus', 'tasks'],
        },
      },
    },
    required: ['planTitle', 'totalDays', 'dailyPlan'],
  };

  return generateStructured(system, user, schema, { temperature: 0.5, maxOutputTokens: 4000 });
};

module.exports = {
  generateStructured,
  explainConcept,
  generateFlashcards,
  generateQuiz,
  generateStudyPlan,
  MODEL_CHAIN,
};