
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/api/ai/generate", async (req, res) => {
  try {
    const { input, platform, goal } = req.body;

    const prompt = `Buat 3 hook viral untuk ${input} di ${platform} dengan tujuan ${goal} dalam JSON`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: prompt }],
    });

    let text = completion.choices[0].message.content;

    let data;
    try { data = JSON.parse(text); } catch { data = []; }

    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.listen(process.env.PORT || 3001);
