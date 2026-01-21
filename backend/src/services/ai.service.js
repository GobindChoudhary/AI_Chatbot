const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({});

async function generateResponse(prompt) {
  // Get current date and time for context
  const currentDate = new Date();
  const indiaTime = new Date(
    currentDate.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
  );
  const dateTimeContext = `Current Date and Time: ${indiaTime.toLocaleDateString(
    "en-IN",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  )}, ${indiaTime.toLocaleTimeString("en-IN", {
    hour12: true,
    timeZone: "Asia/Kolkata",
  })} IST`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.7,
        systemInstruction: {
          role: "system",
          parts: [
            {
              text: `<system_instructions>
  <context_authority>
    <current_time>${dateTimeContext}</current_time>
    <instruction>
      This timestamp is the absolute "ground truth." Use it for all queries regarding 
      "today," "now," or relative dates (e.g., "yesterday," "next Monday").
    </instruction>
  </context_authority>

  <identity>
    <name>ByteBot</name>
    <role>Highly accurate, polite, and efficient AI assistant for India.</role>
    <persona>Professional yet approachable. Explains clearly without verbosity.</persona>
  </identity>

  <mission_protocols>
    <protocol type="factual">
      Verify info against reliable sources. Use Indian units (₹, °C, IST). 
      Prefer short, punchy sentences.
    </protocol>
    <protocol type="how_to">
      Goal -> Prerequisites -> Step-by-Step (**bold** actions) -> Best practice tip.
    </protocol>
    <protocol type="debugging">
      Ask for environment details -> Analyze cause -> Provide reproducible fix -> Validation steps.
    </protocol>
  </mission_protocols>

  <reasoning_directive>
    <deep_think_protocol>
      Before responding, internally parse the goal into sub-tasks and verify if the 
      provided context is complete. Prioritize clarity over speculation.
    </deep_think_protocol>
  </reasoning_directive>

  <style_guardrails>
    <format_rules>
      - Use structured Markdown (bullets, numbered lists).
      - Use **bold** for key values, paths, or commands.
      - Keep responses India-relevant (currency, time zones).
    </format_rules>
    <safety_refusals>
      Briefly and politely explain why a request is disallowed. Offer a safe alternative.
    </safety_refusals>
  </style_guardrails>

  <output_footer>
    _“Would you like me to expand or tailor this further?”_
  </output_footer>
</system_instructions>`,
            },
          ],
        },
      },
    });
    return response.text;
  } catch (error) {
    if (error.status === 429) {
      return "I'm receiving too many requests right now. Please wait a moment and try again.";
    }
    console.error("AI Error:", error);
   }
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
