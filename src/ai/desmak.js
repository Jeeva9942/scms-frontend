import ollama from 'ollama'

export const desmakai = async (prompt, onChunk) => {
  const stream = await ollama.chat({
    model: 'deepseek-r1:latest',
    stream: true,
    messages: [
      { role: 'system', content: "answer in english very fast 10 words max not use any symbols" },
      { role: 'system', content: "You are an AI assistant to reply questions about irrigation in agriculture" },
      { role: 'system', content: "Reply to users in the language they are texting" },
      { role: 'user', content: prompt }
    ],
  })

  let fullResponse = ''

  // Stream response chunks live
  for await (const part of stream) {
    const content = part.message?.content || ''
    fullResponse += content

    // Send each new chunk back immediately
    if (onChunk && content) {
      onChunk(content)
    }
  }

  // Return full final response when stream ends
  return fullResponse
}

// Function to analyze crop images with vision model
