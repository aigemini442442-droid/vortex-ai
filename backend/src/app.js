require("dotenv").config();
const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Tampilkan halaman frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/api/ai/generate", async (req, res) => {
  try {
    const { input, platform, goal } = req.body;

    if (!input || !platform || !goal) {
      return res.status(400).json({
        success: false,
        error: "input, platform, dan goal wajib diisi",
      });
    }

    const prompt = `
Buat 3 hook viral untuk konten berikut:
Topik: ${input}
Platform: ${platform}
Tujuan: ${goal}

Balas HANYA dalam format JSON array seperti ini:
[
  { "hook": "...." }
]
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: "Kamu adalah AI pembuat hook viral. Balas hanya JSON valid.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.8,
    });

    let text = completion.choices[0].message.content.trim();
    text = text.replace(/```json|```/g, "").trim();

    const data = JSON.parse(text);

    res.json({ success: true, data });

  } catch (e) {
    res.status(500).json({
      success: false,
      error: e.message,
    });
  }
});

app.listen(process.env.PORT || 3001, () => {
  console.log("Server running...");
});