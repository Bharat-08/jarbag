const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Middleware (Soft Auth)
const extractUser = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.userId = decoded.id;
        } catch (error) { }
    }
    next();
};

const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const OLQS = [
    "Reasoning Ability", "Practical Intelligence", "Social Adaptability", "Cooperation",
    "Sense of Responsibility", "Initiative", "Self-Confidence", "Speed of Decision",
    "Ability to Influence Group", "Liveliness", "Determination", "Courage",
    "Stamina", "Integrity", "Emotional Stability", "Negative Indicator"
];

function localEvaluate(word, sentence) {
    const scores = {};
    OLQS.forEach(o => scores[o] = 3);
    return { scores, features: { source: "local_fallback" } };
}

async function evaluateSentence(word, sentence) {
    const prompt = `
    You are an expert Psychologist at the Services Selection Board (SSB). Your task is to evaluate the candidate's response to the Word Association Test (WAT).
    
    **Evaluation Protocol:**
    1. **Psychological Projection**: Does the sentence reveal a personality trait or is it just a factual statement?
       - *Factual/Idiom/Definition*: Score 1-2 (e.g., "Sun rises in east", "Honesty is policy").
       - *Observation*: Score 3 (e.g., "Sun is bright").
       - *Constructive/Action-Oriented*: Score 4-5 (e.g., "Sun gives life to earth", "Honesty builds trust").
    2. **Officer Like Qualities (OLQs)**: Assess the response against these specific parameters:
       ${OLQS.map(q => `- ${q}`).join('\n       ')}

    **Input Data:**
    - Word: "${word}"
    - Sentence: "${sentence}"

    **Task:**
    Assign a score (1-5) for each of the 16 OLQs based *strictly* on the sentence provided. If a Quality is NOT applicable or visible in the short sentence, give it a neutral score of 3 (or 0 if negative). 
    However, for WAT, usually we look for:
    - **Social Adaptability**: Pro-social themes.
    - **Initiative/Determination**: Active verbs.
    - **Reasoning**: Logical connections.

    **Output Format:**
    Return strictly valid JSON. Do NOT use markdown.
    {
        "scores": {
            "Reasoning Ability": 3,
            "Practical Intelligence": 4,
            ... (all 16 items)
        }
    }
    `;

    const generateWithModel = async (modelName) => {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        return result.response.text();
    };

    try {
        let responseText;
        try {
            // Priority 1: User requested Gemini 2.5 Flash
            responseText = await generateWithModel("gemini-2.5-flash");
        } catch (primaryError) {
            console.warn(`Gemini 2.5 failed (${primaryError.message}). Falling back to 1.5 Flash.`);
            // Priority 2: Fallback to Gemini 1.5 Flash (Higher quotas/Stability)
            responseText = await generateWithModel("gemini-1.5-flash");
        }

        const jsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        let parsed;
        try {
            parsed = JSON.parse(jsonString);
        } catch (e) {
            console.error("Failed to parse JSON from Gemini:", jsonString);
            // Attempt to extract JSON if surrounded by text
            const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
            if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
            else throw e;
        }
        const parsedScores = parsed?.scores || parsed;

        const finalScores = {};
        OLQS.forEach(o => finalScores[o] = Number(parsedScores?.[o]) || 0);

        // Check for all zeros
        if (Object.values(finalScores).every(v => v === 0)) return localEvaluate(word, sentence);

        return { scores: finalScores };

    } catch (err) {
        console.error("Gemini WAT SDK Error (All Models Failed):", err.message);
        if (err.response) console.error("Gemini Response Error:", JSON.stringify(err.response));
        return localEvaluate(word, sentence);
    }
}

router.post("/evaluate", extractUser, async (req, res) => {
    const { responses } = req.body;
    if (!Array.isArray(responses)) return res.status(400).json({ error: "Invalid input" });

    try {
        const results = await Promise.all(responses.map(async (r) => {
            if (!r.word || !r.response) return { ...r, scores: localEvaluate("", "").scores };
            const evalResult = await evaluateSentence(r.word, r.response);
            return { ...r, scores: evalResult.scores };
        }));

        const finalScorecard = {};
        if (results.length > 0) {
            OLQS.forEach(o => {
                const sum = results.reduce((s, x) => s + (Number(x.scores?.[o] || 0)), 0);
                finalScorecard[o] = (sum / results.length).toFixed(1);
            });
        }

        if (req.userId) {
            const totalScore = Object.values(finalScorecard).reduce((a, b) => a + Number(b), 0);
            await prisma.examResult.create({
                data: {
                    userId: req.userId,
                    examName: "WAT Evaluation",
                    testType: "WAT",
                    score: Math.round(totalScore),
                    total: 80,
                    percentage: parseFloat((totalScore / 80 * 100).toFixed(1)),
                    feedback: "WAT Analysis Completed",
                    responseDetails: results
                }
            });
        }

        res.json({ sentenceWise: results, finalScorecard });
    } catch (err) {
        console.error("WAT Handler Error:", err);
        res.status(500).json({ error: "Evaluation failed" });
    }
});

router.get("/words", async (req, res) => {
    try {
        const words = await prisma.wATWord.findMany();
        res.json(words);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch words" });
    }
});

module.exports = router;