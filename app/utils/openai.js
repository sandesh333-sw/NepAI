const getOpenAIResponse = async (messages) => {
    // Validate input
    if (!process.env.OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY is not configured");
    }

    // Accept either string or array of messages
    const messageArray = typeof messages === 'string' 
        ? [{ role: "user", content: messages }]
        : messages;

    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: messageArray,
            temperature: 0.7,
            max_completion_tokens: 1000  
        })
    };

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", options);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error("OpenAI API Error Response:", errorText);
            let errorData;
            try {
                errorData = JSON.parse(errorText);
            } catch {
                throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
            }
            throw new Error(errorData.error?.message || "OpenAI API error");
        }

        const data = await response.json();
        
        if (!data.choices?.[0]?.message?.content) {
            throw new Error("Invalid response from OpenAI");
        }

        return data.choices[0].message.content;
    } catch (error) {
        console.error("OpenAI API Error:", error.message);
        throw error;
    }
};

export default getOpenAIResponse;