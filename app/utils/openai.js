const getOpenAIResponse = async (messages) => {
    // Validate input
    if (!process.env.OPENAI_API_KEY){
        throw new Error("OpenAi api key not configured");
    }

    // Accept either string or array of  messages
    const messageArray = typeof messages == 'string'
      ? [{role: "user", content: messages}]
      : messages;

      const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-5-mini",
            messages: messageArray,
            temperature: 0.7,
            max_tokens: 1000 // Prevent cost
        })
      };

      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", options);

        if (!response.ok){
            const error = await response.json();
            throw new Error(error.error?.message || "OpenAI API error");
        }

        const data = await response.json();

        if (!data.choices?.[0].message?.content){
            throw new Error("Invalid response from OpenAI");
        }

        return data.choices[0].message.content;

      } catch (error) {
        console.error("OpenAI API Error:", error.message);
        throw new Error("Failed to get AI response. Please try again.");
      }
};

export default getOpenAIResponse;