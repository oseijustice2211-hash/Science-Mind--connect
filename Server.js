
const express = require("express");
const cors = require("cors");

const app = express();

app.use(express.json({ limit: "20kb" }));
app.use(cors());

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

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: `You are ScienceMind Connect AI Tutor.
              Explain Biology, Chemistry, Physics,
              Agriculture and Environmental Science.
              Also answer general educational questions.
              Use simple language and examples.
              Be accurate and admit uncertainty.
              Help students understand, not just memorize.
              Be respectful and age-appropriate.`
            }]
          },
          contents: [{
            role: "user",
            parts: [{ text: question }]
          }],
          generationConfig: {
            maxOutputTokens: 1200
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini error:", data);
      return res.status(502).json({
        error: "AI service could not answer. Please try again."
      });
    }

    const answer = data.candidates?.[0]?.content?.parts
      ?.map(part => part.text || "")
      .join("\n");

    res.json({
      answer: answer || "No answer was generated."
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "AI service unavailable. Please try again."
    });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("ScienceMind Gemini AI is running.");
});
