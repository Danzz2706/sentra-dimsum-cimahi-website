const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

async function testGemini() {
    console.log("Testing Gemini API...");
    console.log("API Key present:", !!process.env.GEMINI_API_KEY);

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Try the standard gemini-pro first
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = "Hello, are you working?";
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log("Success! Response:", text);
    } catch (error) {
        console.error("Error:", error.message);
    }
}

testGemini();
