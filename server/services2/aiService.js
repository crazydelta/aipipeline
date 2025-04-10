const { CohereClient } = require("cohere-ai");

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

// General responses for small talk
const handleSmallTalk = (prompt) => {
  const msg = prompt.toLowerCase().trim();

  if (['hi', 'hello', 'hey'].includes(msg)) {
    return "Hello! 👋 How can I help you with your sales pipeline today?";
  }

  if (msg.includes("how are you")) {
    return "I'm doing great, thanks for asking! 😊 How can I assist you today?";
  }

  if (msg.includes("what can you do")) {
    return "I can analyze your deals, prioritize opportunities, and suggest smart next steps. Just ask me anything!";
  }

  return null;
};

const generateDealInsights = async (deals, prompt) => {
  const smallTalk = handleSmallTalk(prompt);
  if (smallTalk) return smallTalk;

  const dealSummaries = deals.map((deal, i) =>
    `${i + 1}. "${deal.title}" with ${deal.company}, value: $${deal.value || 0}, stage: ${deal.stage}, notes: ${deal.notes || 'None'}`
  ).join('\n');

  const fullPrompt = `
You are an intelligent AI sales assistant. Use the following deals to answer the user's request.

User Request: "${prompt}"

Deals:
${dealSummaries}

Your Response:
- Be helpful, specific, and focus on the deals.
- If the question isn't related to deals, you can say: "I can only help with sales pipeline-related questions."
`;

  try {
    const response = await cohere.generate({
      model: "command-r-plus",
      prompt: fullPrompt,
      max_tokens: 300,
      temperature: 0.6,
    });

    const result = response.generations[0].text.trim();

    // Handle empty/cohere failure responses
    if (!result || result.toLowerCase().includes("no relevant")) {
      return "I didn’t find anything useful for that question based on your deals. Try rephrasing or ask something deal-specific.";
    }

    return result;
  } catch (error) {
    console.error('Cohere API error:', error);
    return 'Sorry, I could not generate insights at the moment.';
  }
};

module.exports = { generateDealInsights };

