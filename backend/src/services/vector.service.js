const { Pinecone } = require("@pinecone-database/pinecone");

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const chatbotIndex = pc.Index("ai-chatbot");

async function createMemory({ vector, metadata, messageId }) {
  await chatbotIndex.upsert([
    {
      id: messageId,
      values: vector,
      metadata,
    },
  ]);
}

async function queryMemory({ queryVector, limit = 5, metadata }) {
  const data = await chatbotIndex.query({
    vector: queryVector,
    topK: limit,
    filter: metadata ? metadata : undefined,
    includeMetadata: true,
  });
  return data.matches;
}

module.exports = { createMemory, queryMemory };
