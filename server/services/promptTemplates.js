/**
 * Prompt templates for StudyBuddy AI.
 * Each function returns { system, user } for the Gemini API.
 */

// ─── 1. Explain a concept ──────────────────────────
const explainPrompt = ({ question, gradeLevel = 'secondary', subject = 'general' }) => {
  const levelMap = {
    primary: 'a 10-year-old (very simple words, short sentences)',
    secondary: 'a 15-year-old (clear, friendly, examples)',
    highschool: 'a 17-year-old preparing for exams (exam-focused, precise)',
    university: 'a university student (academic but accessible)',
    other: 'a curious learner (adapt to the question)',
  };

  return {
    system: `You are StudyBuddy, a patient and encouraging tutor. You explain concepts clearly, use relatable examples, and never make the student feel stupid. Always answer in the same language as the question.`,
    user: `Explain the following to ${levelMap[gradeLevel] || levelMap.other}:

Question: "${question}"
Subject area: ${subject}

Structure your answer:
1. A one-sentence simple answer
2. A clear explanation with an everyday example
3. One common mistake students make about this topic
4. A short "try this" question to test understanding

Keep the total response under 400 words. Be warm, not robotic.`,
  };
};

// ─── 2. Generate flashcards from notes ──────────────
const flashcardsPrompt = ({ notes, subject = 'general', count = 10 }) => {
  return {
    system: `You are a study assistant that creates high-quality flashcards. Each flashcard has a front (question/prompt) and back (concise answer). Fronts must be specific enough to test real understanding, not trivia.`,
    user: `Create ${count} flashcards from these study notes on ${subject}:

---
${notes.slice(0, 6000)}
---

Return ONLY valid JSON matching this schema:
{
  "cards": [
    { "front": "question or prompt", "back": "concise answer", "difficulty": "easy|medium|hard" }
  ]
}

Rules:
- No duplicate concepts
- Fronts should be questions or fill-in-the-blank
- Backs must be under 60 words
- Order from easiest to hardest`,
  };
};

// ─── 3. Generate a quiz ────────────────────────────
const quizPrompt = ({ topic, gradeLevel = 'secondary', questionCount = 5 }) => {
  return {
    system: `You are an exam creator. You write fair, unambiguous multiple-choice questions that test understanding, not memorization.`,
    user: `Create a ${questionCount}-question multiple-choice quiz on "${topic}" for a ${gradeLevel} student.

Return ONLY valid JSON matching this schema:
{
  "title": "Quiz title",
  "questions": [
    {
      "question": "The question text",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "explanation": "Why this is correct (1-2 sentences)"
    }
  ]
}

Rules:
- Exactly 4 options per question
- correctIndex is 0-based (0 = first option)
- Explanations are educational, not just "because"
- No trick questions`,
  };
};

// ─── 4. Generate a study plan ──────────────────────
const studyPlanPrompt = ({ subjects, examDate, hoursPerDay = 2, weakTopics = [] }) => {
  const daysUntil = examDate
    ? Math.max(1, Math.ceil((new Date(examDate) - new Date()) / (1000 * 60 * 60 * 24)))
    : 14;

  return {
    system: `You are a study coach. You create realistic, balanced study schedules that avoid burnout. You prioritize weak topics but include review of stronger ones.`,
    user: `Create a ${daysUntil}-day study plan.

Subjects: ${subjects.join(', ')}
Available hours per day: ${hoursPerDay}
Weak topics to prioritize: ${weakTopics.length ? weakTopics.join(', ') : 'none specified'}
Days until exam: ${daysUntil}

Return ONLY valid JSON matching this schema:
{
  "planTitle": "string",
  "totalDays": ${daysUntil},
  "dailyPlan": [
    {
      "day": 1,
      "date": "YYYY-MM-DD (if exam date given)",
      "focus": "Main topic for this day",
      "tasks": [
        { "subject": "string", "topic": "string", "durationMinutes": 30, "type": "learn|practice|review" }
      ]
    }
  ]
}

Rules:
- Each day's total duration must not exceed ${hoursPerDay} hours
- Include at least one "review" task every 3 days
- Last 2 days should be light review, not new material
- Distribute subjects evenly, prioritizing weak topics early`,
  };
};

module.exports = {
  explainPrompt,
  flashcardsPrompt,
  quizPrompt,
  studyPlanPrompt,
};