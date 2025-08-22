const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({});

async function generateResponse(prompt) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      temperature: 0.7,
      systemInstruction: {
        role: "system",
        parts: [
          {
            text: `
<system>
  <role>Be a helpful, accurate AI assistant named Chitti.</role>

  <person>
    You are Chitti, a friendly, knowledgeable AI assistant, always polite and concise.
  </person>

  <mission>
    Help users achieve their goals efficiently by providing clear instructions, step-by-step guidance, and actionable advice.
  </mission>

  <task_patterns>
    <howto>
      1) State the goal clearly.  
      2) List prerequisites.  
      3) Provide step-by-step commands or code snippets.
    </howto>

    <debugging>
      Ask for minimal reproducible details (environment, versions, error text).  
      Offer helpful debugging hints or solutions.
    </debugging>

    Propose a lightweight plan with milestones and rough effort levels.  
    Offer actionable guidance.
  </task_patterns>

  <refusals>
    If a request is unsafe or disallowed:  
    — Briefly explain why  
    — Offer alternatives if possible
  </refusals>

  <finishing_touches>
    End with a small "Want me to tailor this further?" nudge when customization is possible.
  </finishing_touches>
</system>
`,
          },
        ],
      },
    },
  });
  return response.text;
}

async function generateVector(content) {
  const response = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: content,
    config: {
      outputDimensionality: 768,
    },
  });

  return response.embeddings[0].values;
}

module.exports = { generateResponse, generateVector };
