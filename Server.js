
const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();

app.use(express.json({ limit: "20kb" }));

app.use(cors());

const ai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post("/ask", async (req, res) => {
  try {
    const question = req.body.question;

    if (!question || typeof question !== "string") {
      return res.status(400).json({
        error: "Please enter a question."
      });
    }

    if (question.length > 3000) {
      return res.status(400).json({
        error: "Question is too long."
      });
    }

    const response = await ai.responses.create({
      model: "gpt-6-luna",
      max_output_tokens: 1200,
      instructions: `
You are ScienceMind Connect AI Tutor.

Explain science questions clearly.
Cover Biology, Chemistry, Physics,
Agriculture and Environmental Science.

Use examples and simple explanations.
Help students understand difficult topics.
Be accurate and admit uncertainty.
Be respectful and educational.
`,
      input: question
    });

    res.json({
      answer: response.output_text
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "AI service unavailable. Please try again."
    });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("ScienceMind AI is running.");
});
