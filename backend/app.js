require("dotenv").config();
const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

// Providers
const gemini = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

const groq = process.env.GROQ_API_KEY
  ? new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    })
  : null;

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

async function generateHooks(prompt) {
  if (gemini) {
    try {
      console.log("Using Gemini...");
      const model = gemini.getGenerativeModel({
        model: "gemini-2.0-flash",
      });

      const result = await model.generateContent(prompt);
      let text = result.response.text();
      text = text.replace(/```json|```/g, "").trim();
      return JSON.parse(text);
    } catch (err) {
      console.log("Gemini failed:", err.message);
    }
  }

  if (groq) {
    try {
      console.log("Using Groq...");
      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
      });

      let text = completion.choices[0].message.content.trim();
      text = text.replace(/```json|```/g, "").trim();
      return JSON.parse(text);
    } catch (err) {
      console.log("Groq failed:", err.message);
    }
  }

  if (openai) {
    try {
      console.log("Using OpenAI...");
      const completion = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [{ role: "user", content: prompt }],
      });

      let text = completion.choices[0].message.content.trim();
      text = text.replace(/```json|```/g, "").trim();
      return JSON.parse(text);
    } catch (err) {
      console.log("OpenAI failed:", err.message);
    }
  }

  return [
    { hook: "Hook viral fallback 1 untuk testing" },
    { hook: "Hook viral fallback 2 untuk testing" },
    { hook: "Hook viral fallback 3 untuk testing" }
  ];
}

app.get("/", (req, res) => {
  res.send("MULTI AI FINAL BACKEND RUNNING 🚀");
});

app.get("/api/test", (req, res) => {
  res.json({ ok: true });
});

app.post("/api/ai/generate", async (req, res) => {
  try {
    const { input, platform, goal } = req.body;

    const prompt = `
Buat 3 hook viral untuk konten berikut:
Topik: ${input}
Platform: ${platform}
Tujuan: ${goal}

Balas HANYA JSON valid tanpa markdown:
[
  { "hook": "..." },
  { "hook": "..." },
  { "hook": "..." }
]
`;

    const data = await generateHooks(prompt);

    res.json({
      success: true,
      data,
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      error: e.message,
    });
  }
});

app.listen(process.env.PORT || 3001, () => {
  console.log("MULTI AI FINAL BACKEND RUNNING 🚀");
});
