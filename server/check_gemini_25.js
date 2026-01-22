const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function check() {
    try {
        console.log("Checking gemini-2.5-flash...");
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const res = await model.generateContent("Hello");
        console.log("✅ SUCCESS: gemini-2.5-flash works!");
    } catch (e) {
        console.log(`❌ FAILED: gemini-2.5-flash - ${e.message}`);
    }
}

check();
