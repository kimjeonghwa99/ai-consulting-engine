import express from "express";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import OpenAI from "openai";

const USE_MOCK = !process.env.OPENAI_API_KEY;
const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

if (USE_MOCK) {
  return res.json({
    scenario,
    answer:
      "🧪 Mock 응답입니다. 현재 API 키가 없어서 실제 AI 대신 테스트 응답을 반환하고 있어요."
  });
}

router.post("/", async (req, res) => {
  try {
    const { message, scenario = "company" } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "message is required" });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "OPENAI_API_KEY is not set" });
    }


    
    // repo root = one level up from /api
    const repoRoot = path.resolve(process.cwd(), "..");
    const scenarioPath = path.join(repoRoot, "scenarios", `${scenario}.yml`);

    if (!fs.existsSync(scenarioPath)) {
      return res.status(404).json({ error: `scenario not found: ${scenario}` });
    }

    const scenarioYaml = fs.readFileSync(scenarioPath, "utf8");
    const cfg = yaml.load(scenarioYaml);

    const systemPrompt = [
      "You are an AI consultant embedded in a website chat widget.",
      "",
      "Role:",
      cfg?.role ?? "Be helpful, concise, and professional.",
      "",
      "Goals:",
      Array.isArray(cfg?.goals) ? cfg.goals.map((g) => `- ${g}`).join("\n") : "- Provide helpful answers",
      "",
      "Constraints:",
      Array.isArray(cfg?.constraints)
        ? cfg.constraints.map((c) => `- ${c}`).join("\n")
        : "- Do not invent facts. If unsure, ask clarifying questions.",
    ].join("\n");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
    });

    const answer = completion.choices?.[0]?.message?.content ?? "";

    return res.json({ scenario, answer });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "chat failed" });
  }
});

export default router;
