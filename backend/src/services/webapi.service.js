const fetch = require("node-fetch");

async function fetchFromWeb(query) {
  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.TAVILY_API_KEY}`,
    },
    body: JSON.stringify({ query, max_results: 3 }),
  });

  if (!response.ok) {
    throw new Error(`Tavily API error: ${response.status}`);
  }

  const data = await response.json();
  return data.results?.map((r) => r.content).join("\n") || "";
}

module.exports = fetchFromWeb;
