import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

const token = process.env.GITHUB_TOKEN;
const endpoint = "https://models.github.ai/inference";
const model = "openai/gpt-4o-mini";
const client = ModelClient(endpoint, new AzureKeyCredential(token));

// ── Generate Week Plan ────────────────────────────────────────────────
export async function generateWeekPlan(req, res) {
    try {
        const {
            examType,
            examName,
            syllabus,
            weeklyHours,
            weekNumber,
            totalWeeks,
            previousWeekTopics,
        } = req.body;

        if (!syllabus?.trim() || !weekNumber || !totalWeeks) {
            return res.status(400).json({
                error: "syllabus, weekNumber, and totalWeeks are required",
            });
        }

        const prevContext =
            previousWeekTopics && previousWeekTopics.length > 0
                ? `\nTopics already covered in earlier weeks: ${previousWeekTopics.join(", ")}\nDo NOT repeat these topics. Continue from where the student left off.`
                : "";

        const prompt = `You are a study planner AI. Generate a study plan for Week ${weekNumber} of ${totalWeeks} total weeks.

Exam: ${examName || "General"} (${examType || "exam"})
Syllabus: ${syllabus}
Weekly study hours: ${weeklyHours || 21} hours${prevContext}

Rules:
- Generate 5-8 focused study tasks for this single week
- Distribute the ${weeklyHours || 21} hours across tasks
- Each task should cover a specific topic/chapter from the syllabus
- Tasks should progress logically (fundamentals first, advanced later)
- Since this is week ${weekNumber}/${totalWeeks}, pace the syllabus accordingly
- Be specific: include chapter names, topic names, practice types

Return ONLY a valid JSON array, no markdown:
[{"id":"w${weekNumber}t1","title":"Task title","description":"What to study and how","estimatedMinutes":120,"subject":"Subject/Chapter name","priority":"high|medium|low"}]`;

        const response = await client.path("/chat/completions").post({
            body: {
                messages: [
                    {
                        role: "system",
                        content:
                            "You output compact JSON only. Be specific and practical.",
                    },
                    { role: "user", content: prompt },
                ],
                model,
                temperature: 0.6,
                max_tokens: 1200,
            },
        });

        if (isUnexpected(response))
            throw response.body?.error || new Error("Unexpected API response");

        const text = response.body.choices[0].message.content;
        const cleaned = text.replace(/```json|```/g, "").trim();
        let parsed = JSON.parse(cleaned);
        if (!Array.isArray(parsed)) parsed = [parsed];

        // Ensure each task has all required fields
        const tasks = parsed.map((t, i) => ({
            id: t.id || `w${weekNumber}t${i + 1}`,
            title: t.title || "Study Task",
            description: t.description || "",
            estimatedMinutes: t.estimatedMinutes || 60,
            subject: t.subject || "",
            priority: t.priority || "medium",
        }));

        res.json(tasks);
    } catch (error) {
        console.error("Week plan generation error:", error);
        res.status(500).json({ error: "Failed to generate week plan" });
    }
}

// ── Edit Task ─────────────────────────────────────────────────────────
export async function editTask(req, res) {
    try {
        const { task, instruction } = req.body;
        if (!task || !instruction?.trim()) {
            return res
                .status(400)
                .json({ error: "task and instruction are required" });
        }

        const prompt = `Here is a study task:
${JSON.stringify(task)}

The student wants to edit it with this instruction: "${instruction}"

Return the updated task as ONLY valid JSON, no markdown:
{"id":"${task.id}","title":"...","description":"...","estimatedMinutes":...,"subject":"...","priority":"high|medium|low"}`;

        const response = await client.path("/chat/completions").post({
            body: {
                messages: [
                    {
                        role: "system",
                        content: "You output compact JSON only. Apply the edit precisely.",
                    },
                    { role: "user", content: prompt },
                ],
                model,
                temperature: 0.4,
                max_tokens: 400,
            },
        });

        if (isUnexpected(response))
            throw response.body?.error || new Error("Unexpected API response");

        const text = response.body.choices[0].message.content;
        const cleaned = text.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleaned);

        res.json({
            id: parsed.id || task.id,
            title: parsed.title || task.title,
            description: parsed.description || task.description,
            estimatedMinutes: parsed.estimatedMinutes || task.estimatedMinutes,
            subject: parsed.subject || task.subject,
            priority: parsed.priority || task.priority,
        });
    } catch (error) {
        console.error("Edit task error:", error);
        res.status(500).json({ error: "Failed to edit task" });
    }
}
