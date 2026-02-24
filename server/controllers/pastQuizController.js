// Handlers for Past Assisted Quiz module
// Ready for AI and future modules to extend

export async function listPastAssistedQuizzes(req, res) {
  try {
    // Placeholder: return empty list until persistence/DB is added
    res.json({ quizzes: [], message: "Past assisted quizzes will appear here" });
  } catch (error) {
    console.error("List past assisted quizzes error:", error);
    res.status(500).json({ error: "Failed to fetch past assisted quizzes" });
  }
}

export async function getPastAssistedQuizById(req, res) {
  try {
    const { id } = req.params;
    // Placeholder: return 404 until persistence is added
    res.status(404).json({ error: "Quiz not found", id });
  } catch (error) {
    console.error("Get past assisted quiz error:", error);
    res.status(500).json({ error: "Failed to fetch quiz" });
  }
}
