import AssistedQuiz from "../modal/PracticeArenaModal/AssistedQuiz.js";
import WeakSubtopic from "../modal/WeakSubtopicsModal/WeakSubtopic.js";
import Stats from "../modal/XPandCoinsModal/Stats.js";

const USER_ID = "guest";

// ── Save quiz after result ────────────────────────────────────────────
export async function saveAssistedQuiz(req, res) {
  try {
    const { topic, difficulty, questions, score, totalXP, weakSubtopics } = req.body;

    // Upsert XP
    await Stats.findOneAndUpdate(
      { userId: USER_ID },
      { $inc: { totalXP }, $push: { history: { source: "assisted_quiz", xp: totalXP, coins: 0 } } },
      { upsert: true }
    );

    // Upsert weak subtopics counts
    for (const sub of (weakSubtopics || [])) {
      await WeakSubtopic.findOneAndUpdate(
        { userId: USER_ID, subtopic: sub, source: "quiz" },
        { $inc: { count: 1 }, $set: { lastSeenAt: new Date() } },
        { upsert: true }
      );
    }

    const quiz = await AssistedQuiz.create({
      userId: USER_ID, topic, difficulty,
      questions: questions || [],
      score: score || 0, totalXP: totalXP || 0,
      weakSubtopics: weakSubtopics || [],
      name: `${topic} — ${new Date().toLocaleDateString()}`,
    });

    res.status(201).json({ id: quiz._id, message: "Quiz saved" });
  } catch (err) {
    console.error("saveAssistedQuiz error:", err);
    res.status(500).json({ error: "Failed to save quiz" });
  }
}

// ── List all past quizzes ─────────────────────────────────────────────
export async function listAssistedQuizzes(req, res) {
  try {
    const quizzes = await AssistedQuiz.find({ userId: USER_ID })
      .select("_id name topic difficulty score totalXP weakSubtopics createdAt")
      .sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch quizzes" });
  }
}

// ── Get single quiz detail ────────────────────────────────────────────
export async function getAssistedQuizById(req, res) {
  try {
    const quiz = await AssistedQuiz.findOne({ _id: req.params.id, userId: USER_ID });
    if (!quiz) return res.status(404).json({ error: "Not found" });
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch quiz" });
  }
}

// ── Rename ────────────────────────────────────────────────────────────
export async function renameAssistedQuiz(req, res) {
  try {
    const { name } = req.body;
    await AssistedQuiz.findOneAndUpdate({ _id: req.params.id, userId: USER_ID }, { name });
    res.json({ message: "Renamed" });
  } catch (err) {
    res.status(500).json({ error: "Failed to rename" });
  }
}

// ── Delete ────────────────────────────────────────────────────────────
export async function deleteAssistedQuiz(req, res) {
  try {
    await AssistedQuiz.findOneAndDelete({ _id: req.params.id, userId: USER_ID });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete" });
  }
}

// ── Toggle bookmark on a question ─────────────────────────────────────
export async function toggleQuizBookmark(req, res) {
  try {
    const { questionIndex } = req.body;
    const quiz = await AssistedQuiz.findOne({ _id: req.params.id, userId: USER_ID });
    if (!quiz) return res.status(404).json({ error: "Not found" });
    quiz.questions[questionIndex].isBookmarked = !quiz.questions[questionIndex].isBookmarked;
    await quiz.save();
    res.json({ isBookmarked: quiz.questions[questionIndex].isBookmarked });
  } catch (err) {
    res.status(500).json({ error: "Failed to toggle bookmark" });
  }
}

// ── Add/update note on a question ─────────────────────────────────────
export async function addQuizNote(req, res) {
  try {
    const { questionIndex, note } = req.body;
    const quiz = await AssistedQuiz.findOne({ _id: req.params.id, userId: USER_ID });
    if (!quiz) return res.status(404).json({ error: "Not found" });
    quiz.questions[questionIndex].note = note;
    await quiz.save();
    res.json({ message: "Note saved" });
  } catch (err) {
    res.status(500).json({ error: "Failed to save note" });
  }
}
