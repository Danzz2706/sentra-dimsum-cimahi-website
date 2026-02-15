const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

async function listModels() {
    console.log("Listing available models...");
    try {
        // Access the API key directly to avoid initialization issues if any
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is missing in .env.local");
        }

        // Just fetch models using the generic client if possible, or try a known one
        // The library doesn't have a direct listModels on the main class in some versions,
        // but we can try to instantiate a model and catch the error which might list them,
        // or usage typical REST logic if the library permits.
        // Actually, the error message itself said "Call ListModels to see...".
        // Let's try to query the model list via a different way or just print the error fully.

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // We will try to get a model that definitely should exist, or force an error to see the list.
        // But better, let's try to use the `getGenerativeModel` and print what happens.

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        console.log("Attempting to generate content with gemini-1.5-flash...");

        const result = await model.generateContent("Test");
        console.log("Success with gemini-1.5-flash!");
    } catch (error) {
        console.error("FULL ERROR DETAILS:");
        console.error(error);
    }
}

listModels();
