require("dotenv").config();
const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

async function agentHook(input, platform, goal) {
  const model = gemini.getGenerativeModel({ model: "gemini-2.0-flash" });
  const prompt = `
Kamu AI Hook Specialist.
Buat 3 hook viral untuk topik "${input}" untuk platform ${platform} dengan tujuan ${goal}.
Balas JSON:
[
 {"hook":"..."},
 {"hook":"..."},
 {"hook":"..."}
]`;
  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text().replace(/```json|```/g, "").trim());
}

async function agentImage(input, hooks) {
  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{
      role: "user",
      content: `Buat prompt gambar sinematik untuk topik "${input}" berdasarkan hook ini: ${hooks.map(h=>h.hook).join(", ")}. Balas JSON {"image_prompt":"..."}`,
    }],
  });
  return JSON.parse(completion.choices[0].message.content.replace(/```json|```/g, "").trim());
}

async function agentVideo(input, hooks) {
  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{
      role: "user",
      content: `Buat storyboard video pendek 3 scene untuk topik "${input}" berdasarkan hook ini: ${hooks.map(h=>h.hook).join(", ")}. Balas JSON {"video_script":["scene 1","scene 2","scene 3"]}`,
    }],
  });
  return JSON.parse(completion.choices[0].message.content.replace(/```json|```/g, "").trim());
}

app.post("/api/orchestra/generate", async (req, res) => {
  try {
    const { input, platform = "TikTok", goal = "Viral" } = req.body;

    const hooks = await agentHook(input, platform, goal);
    const image = await agentImage(input, hooks);
    const video = await agentVideo(input, hooks);

    res.json({
      success: true,
      data: {
        hooks,
        image_prompt: image.image_prompt,
        video_script: video.video_script
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.get("/", (req,res)=>res.send("AI Orchestra Running 🚀"));

app.listen(process.env.PORT || 3001, ()=> console.log("AI Orchestra Running 🚀"));
