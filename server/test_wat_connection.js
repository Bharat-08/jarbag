require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testConnection() {
    console.log("Testing Gemini API Connection...");
    try {
        if (!process.env.GEMINI_API_KEY) {
            console.error("Error: GEMINI_API_KEY is missing in environment variables.");
            return;
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // User requested model
        const modelName = "gemini-2.5-flash";
        console.log(`Attempting to use model: ${modelName}`);

        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Test connection. Reply with 'OK'.");
        console.log("Success! Response:", result.response.text());

    } catch (error) {
        console.error("Test Failed!");
        console.error("Error Message:", error.message);
        if (error.response) {
            console.error("Detailed Error:", JSON.stringify(error.response, null, 2));
        }
    }
}

testConnection();
