import express from "express";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import OpenAI from "openai";

const router = express.Router();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/", async (req, res) => {
  try {
    const { message, scenario = "company" } = req.body;

    if (!message) {
      return res.status(400).json({ error: "message is required" });
    }

    // 1. 시나리오 파일 로드
    const scenarioPath = path.resolve(
      "../scenarios",
      `${scenario}.yml`
    );

    const scenarioYaml = fs.readFileSync(scenarioPath, "utf8");
    const scenarioConfig = yaml.load(scenarioYaml);

    // 2. 시스템 프롬프트 구성
    const systemPrompt = `
You are an AI consultant.

Role:
${scenarioConfig.role}

Goals:
${scenarioConfig.goals?.join("\n")}

Constraints:
${scenarioConfig.constraints?.join("\n")}
    `;

    // 3. LLM 호출
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
    });

    const answer = completion.choices[0].message.content;

    // 4. 응답
    res.json({
      scenario,
      answer,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "chat failed" });
  }
});

export default router;
