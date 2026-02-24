// Health and root route handlers - avoid 404 for common probes

export function healthCheck(req, res) {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
}

export function apiRoot(req, res) {
  res.json({
    message: "Brain XP API",
    version: "1.0",
    endpoints: {
      quiz: "/api/quiz",
      pastQuiz: "/api/past-quiz",
      challenges: "/api/challenges",
      mentors: "/api/mentors",
      health: "/health",
    },
  });
}
