import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

const token = process.env.GITHUB_TOKEN;
// #region agent log
fetch('http://127.0.0.1:7542/ingest/ae9920c6-98d1-43cb-a31f-25abc51be2c0', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'b588c2' }, body: JSON.stringify({ sessionId: 'b588c2', location: 'mentorController.js:pre-client', message: 'before ModelClient', data: { hasToken: !!token, tokenLen: token?.length }, hypothesisId: 'H5', timestamp: Date.now() }) }).catch(() => { });
// #endregion
const endpoint = "https://models.github.ai/inference";
const model = "openai/gpt-4o";
const client = ModelClient(endpoint, new AzureKeyCredential(token));
// #region agent log
fetch('http://127.0.0.1:7542/ingest/ae9920c6-98d1-43cb-a31f-25abc51be2c0', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'b588c2' }, body: JSON.stringify({ sessionId: 'b588c2', location: 'mentorController.js:post-client', message: 'ModelClient created', data: {}, hypothesisId: 'H6', timestamp: Date.now() }) }).catch(() => { });
// #endregion

// Compact system prompts - minimal tokens, character-specific
const MENTOR_SYSTEMS = {
  quantum: "Physics tutor. Brief, precise. Use formulas when helpful.",
  alchemy: "Chemistry tutor. Focus on reactions, elements, bonds. Concise.",
  euclid: "Math tutor. Step-by-step logic. Formal but accessible.",
  genome: "Biology tutor. Cells, systems, evolution. Clear examples.",
  athena: "History tutor. Stories, causes, consequences. Engaging.",
  constitution: "Civics & Government tutor. Explain democracy, rights, duties, constitution, governance. Use real-world examples. Concise.",
  atlas: "Geography & Environmental Studies tutor. Maps, climates, ecosystems, resources. Visual descriptions. Concise.",
  shakespeare: "Literature tutor. Poetry, prose, drama, literary devices. Encourage deep reading. Engaging.",
  grammar: "Grammar & Writing tutor. Sentence structure, punctuation, style. Clear rules with examples.",
  vyakaran: "Hindi Grammar tutor. व्याकरण, संधि, समास, अलंकार, वाक्य रचना। Respond in Hindi when appropriate. Clear and systematic.",
  kavya: "Hindi Literature tutor. काव्य, गद्य, कवि परिचय, रस, छंद। Discuss works in Hindi. Engaging and expressive.",
  ledger: "Accountancy tutor. Journals, ledgers, trial balance, financial statements. Step-by-step, precise.",
  enterprise: "Business Studies tutor. Management, marketing, finance, entrepreneurship. Practical examples. Concise.",
  computers: "Computer Science tutor. Hardware, software, operating systems, networking, programming basics. Clear explanations with real-world analogies.",
};

// Session start - get subtopics (5-10) + welcome + first question
const SESSION_PROMPT = (mentor, topic) =>
  `Topic:${topic}. Split into 5-10 subtopics (5 if simple, up to 10 if complex). Reply JSON only:
{"subtopics":["s1","s2",...],"welcome":"1-2 sentences greeting","firstQuestion":"1 MCQ or short Q from first subtopic"}`;

// Chat turn - compact state, get reply + next action
const CHAT_PROMPT = (mentor, topic, hist, subtopicIdx, lastQ, perf, qInSub) =>
  `Topic:${topic} SubtopicsIdx:${subtopicIdx} QInSub:${qInSub} C:${perf.correct} W:${perf.wrong} LastQ:${lastQ}
Conv: ${hist.map((m) => m.role + ":" + String(m.content).slice(0, 80)).join(" | ")}
Evaluate user's last msg vs LastQ. Reply JSON only:
{"reply":"1-2 sent feedback/solution","correct":bool,"moveToNext":bool if qInSub>=3,"completedSubtopic":${subtopicIdx},"xpEarned":2 if correct,"newQuestion":"next Q","waitingForAnswer":true}
Rules: Correct→brief praise+new Q variation. Wrong→solution+related Q. qInSub>=3→moveToNext true.`;

async function callAI(system, user, temperature = 0.7) {
  const res = await client.path("/chat/completions").post({
    body: {
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      model,
      temperature,
    },
  });
  if (isUnexpected(res)) throw res.body?.error || new Error("AI error");
  const text = res.body.choices[0].message.content;
  const cleaned = text.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}

export async function startSession(req, res) {
  try {
    const { mentorId, topic } = req.body;
    if (!MENTOR_SYSTEMS[mentorId] || !topic?.trim()) {
      return res.status(400).json({ error: "Invalid mentor or topic" });
    }
    const sys = MENTOR_SYSTEMS[mentorId];
    const parsed = await callAI(sys, SESSION_PROMPT(mentorId, topic.trim()), 0.5);
    const subtopics = Array.isArray(parsed.subtopics)
      ? parsed.subtopics
      : [parsed.subtopics].filter(Boolean);
    res.json({
      subtopics: subtopics.slice(0, 10),
      welcomeMessage: parsed.welcome || `Let's explore ${topic}.`,
      firstQuestion: parsed.firstQuestion || "What do you already know about this?",
    });
  } catch (e) {
    console.error("Mentor session error:", e);
    res.status(500).json({ error: "Failed to start session" });
  }
}

export async function chat(req, res) {
  try {
    const {
      mentorId,
      topic,
      subtopics,
      conversation,
      currentSubtopicIndex,
      lastQuestion,
      performanceSummary,
    } = req.body;

    if (!MENTOR_SYSTEMS[mentorId] || !topic) {
      return res.status(400).json({ error: "Invalid mentor or topic" });
    }

    const perf = performanceSummary || { correct: 0, wrong: 0 };
    const hist = (conversation || []).slice(-6);
    const qInSub = req.body.questionsInSubtopic ?? 0;
    const sys = MENTOR_SYSTEMS[mentorId];

    const parsed = await callAI(
      sys,
      CHAT_PROMPT(mentorId, topic, hist, currentSubtopicIndex ?? 0, lastQuestion || "", perf, qInSub),
      0.5
    );

    res.json({
      reply: parsed.reply || "Let's continue.",
      correct: !!parsed.correct,
      moveToNext: !!parsed.moveToNext,
      completedSubtopic: parsed.completedSubtopic,
      xpEarned: parsed.correct ? (parsed.xpEarned ?? 2) : 0,
      newQuestion: parsed.newQuestion || "",
      waitingForAnswer: parsed.waitingForAnswer !== false && !!parsed.newQuestion,
    });
  } catch (e) {
    console.error("Mentor chat error:", e);
    res.status(500).json({ error: "Chat failed" });
  }
}
