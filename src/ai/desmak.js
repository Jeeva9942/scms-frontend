const DEFAULT_FALLBACK =
  "Chat assistant is temporarily unavailable. Please try again later.";

const postJson = async (url, payload) => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with status ${response.status}`);
  }

  return response.json();
};

export const desmakai = async (prompt, onChunk) => {
  const endpoint =
    import.meta.env.VITE_CHATBOT_API_URL || "http://localhost:3000/api/chat";

  if (!endpoint) {
    if (onChunk) {
      onChunk(DEFAULT_FALLBACK);
    }
    return DEFAULT_FALLBACK;
  }

  try {
    const result = await postJson(endpoint, { prompt });
    const reply =
      typeof result === "string"
        ? result
        : result?.response ?? DEFAULT_FALLBACK;

    if (onChunk) {
      onChunk(reply);
    }

    return reply;
  } catch (error) {
    console.error("Chatbot request failed:", error);
    if (onChunk) {
      onChunk(DEFAULT_FALLBACK);
    }
    return DEFAULT_FALLBACK;
  }
};
