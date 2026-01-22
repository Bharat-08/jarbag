const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function check() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Placeholder
        console.log("Checking API key...");
        // There isn't a direct "list models" in the simple SDK usage pattern easily accessible without admin/google-ai-studio context? 
        // Actually, there is `availableModels() ` or similar in some versions, but standard is just trying.
        // However, I'll try to generate with a few likely candidates.

        const candidates = [
            "gemini-2.0-flash-exp",
            "gemini-2.0-flash",
            "gemini-1.5-flash",
            "gemini-1.5-flash-latest",
            "gemini-1.5-pro",
            "gemini-pro"
        ];

        for (const m of candidates) {
            try {
                console.log(`Testing ${m}...`);
                const mod = genAI.getGenerativeModel({ model: m });
                const res = await mod.generateContent("Hello");
                console.log(`✅ SUCCESS: ${m}`);
                // If success, we print and continue to find all valid ones? Or just stop?
                // Let's find all valid ones.
            } catch (e) {
                console.log(`❌ FAILED: ${m} - ${e.message.split('\n')[0]}`);
            }
        }

    } catch (e) {
        console.error("Global Error:", e);
    }
}

check();
