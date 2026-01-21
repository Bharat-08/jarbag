const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

// Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const OLQS = [
    "Reasoning Ability",
    "Practical Intelligence",
    "Social Adaptability",
    "Cooperation",
    "Sense of Responsibility",
    "Initiative",
    "Self-Confidence",
    "Speed of Decision",
    "Ability to Influence Group",
    "Liveliness",
    "Determination",
    "Courage",
    "Stamina",
    "Integrity",
    "Emotional Stability",
    "Negative Indicator"
];

// --- Local Heuristic Evaluator ---
function localEvaluate(word, sentence) {
    const text = `${word} ${sentence}`.toLowerCase();
    const words = sentence.trim().split(/\s+/).filter(Boolean).length || 0;

    const lex = {
        pos: ["good", "great", "best", "love", "like", "enjoy", "excellent", "pleasant", "happy", "positive"],
        neg: ["bad", "hate", "worst", "awful", "sad", "angry", "fear", "afraid", "panic", "hopeless", "negative"],
        causal: ["because", "since", "therefore", "thus", "hence", "so"],
        action: ["do", "make", "use", "apply", "solve", "fix", "eat", "run", "build", "start", "started", "took", "perform"],
        social: ["we", "team", "people", "others", "group", "together"],
        firstPerson: ["i ", "i'm", "i've", "i'll", "my ", "me ", "i\b"],
        speed: ["quickly", "fast", "immediately", "right away", "prompt"],
        influence: ["lead", "leadership", "persuade", "convince", "influence", "motivate"],
        determination: ["persist", "determined", "persevere", "never give up", "keep trying"],
        courage: ["brave", "courage", "dared", "risk"],
        stamina: ["endure", "long", "stamina", "tireless"],
        integrity: ["honest", "truth", "fair", "integrity"],
        calm: ["calm", "steady", "composed", "balanced"],
        negativeIndicator: ["avoid", "can't", "cannot", "don't try", "can't do", "afraid", "fear", "avoidance"]
    };

    const countMatches = (arr) => {
        let c = 0;
        arr.forEach(w => {
            const re = new RegExp("\\b" + w.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&") + "\\b", "i");
            if (re.test(text)) c += 1;
        });
        return c;
    };

    const features = {};
    Object.entries(lex).forEach(([k, arr]) => {
        features[k] = countMatches(arr);
    });

    features.exclamation = (text.match(/!/g) || []).length;
    features.question = (text.match(/\?/g) || []).length;
    features.length = words;
    features.avgWordLength = tokensAvgLen(sentence);

    const norm = {
        pos: Math.min(1, features.pos / 3),
        neg: Math.min(1, features.neg / 3),
        causal: Math.min(1, features.causal / 2),
        action: Math.min(1, features.action / 3),
        social: Math.min(1, features.social / 2),
        firstPerson: Math.min(1, features.firstPerson / 2),
        speed: Math.min(1, features.speed / 1),
        influence: Math.min(1, features.influence / 1),
        determination: Math.min(1, features.determination / 1),
        courage: Math.min(1, features.courage / 1),
        stamina: Math.min(1, features.stamina / 1),
        integrity: Math.min(1, features.integrity / 1),
        calm: Math.min(1, features.calm / 1),
        negativeIndicator: Math.min(1, features.negativeIndicator / 2),
        exclamation: Math.min(1, features.exclamation / 2),
        question: Math.min(1, features.question / 2),
        lengthFactor: Math.min(1, words / 30),
        avgWordLenFactor: Math.min(1, (features.avgWordLength || 0) / 7)
    };

    const weights = {
        "Reasoning Ability": { causal: 0.6, avgWordLenFactor: 0.2, lengthFactor: 0.2 },
        "Practical Intelligence": { action: 0.5, avgWordLenFactor: 0.3, lengthFactor: 0.2 },
        "Social Adaptability": { social: 0.6, pos: 0.2, firstPerson: 0.2 },
        "Cooperation": { social: 0.6, pos: 0.2, firstPerson: 0.2 },
        "Sense of Responsibility": { firstPerson: 0.4, integrity: 0.4, avgWordLenFactor: 0.2 },
        "Initiative": { action: 0.5, determination: 0.3, pos: 0.2 },
        "Self-Confidence": { pos: 0.4, firstPerson: 0.3, superlative: 0.3 },
        "Speed of Decision": { speed: 0.6, exclamation: 0.2, action: 0.2 },
        "Ability to Influence Group": { influence: 0.7, social: 0.3 },
        "Liveliness": { pos: 0.5, exclamation: 0.3, superlative: 0.2 },
        "Determination": { determination: 0.7, pos: 0.2, lengthFactor: 0.1 },
        "Courage": { courage: 0.6, determination: 0.3, neg: -0.1 },
        "Stamina": { stamina: 0.6, determination: 0.3, lengthFactor: 0.1 },
        "Integrity": { integrity: 0.8, pos: 0.2 },
        "Emotional Stability": { calm: 0.6, neg: -0.3, pos: 0.1 },
        "Negative Indicator": { negativeIndicator: 0.7, neg: 0.3 }
    };

    const scores = {};
    OLQS.forEach(o => {
        const map = weights[o];
        let v = 0;
        Object.entries(map).forEach(([feat, w]) => {
            const fv = norm[feat] ?? 0;
            v += fv * w;
        });
        scores[o] = Math.round(Math.max(0, Math.min(1, v)) * 5);
    });

    return { scores, features: { rawCounts: features, normalized: norm } };
}

function tokensAvgLen(s) {
    if (!s) return 0;
    const toks = s.split(/\s+/).filter(Boolean);
    if (toks.length === 0) return 0;
    const total = toks.reduce((a, t) => a + t.length, 0);
    return total / toks.length;
}

// --- Gemini Evaluator ---
async function evaluateSentence(word, sentence) {
    const prompt = `
You are an SSB Psychological Assessor.

Evaluate the WAT sentence strictly on observable behavior.

Rules:

Return ONLY valid JSON. No text.

Word: "${word}"
Sentence: "${sentence}"

JSON format:
{
  "scores": {
    "Reasoning Ability": 0,
    "Practical Intelligence": 0,
    "Social Adaptability": 0,
    "Cooperation": 0,
    "Sense of Responsibility": 0,
    "Initiative": 0,
    "Self-Confidence": 0,
    "Speed of Decision": 0,
    "Ability to Influence Group": 0,
    "Liveliness": 0,
    "Determination": 0,
    "Courage": 0,
    "Stamina": 0,
    "Integrity": 0,
    "Emotional Stability": 0,
    "Negative Indicator": 0
  }
}
`;

    let data;
    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            const body = {
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                temperature: 0.0,
                maxOutputTokens: 800,
                candidateCount: 1
            };

            const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                throw new Error(`Gemini API Error: ${response.status} ${response.statusText}`);
            }

            data = await response.json();
            break;
        } catch (err) {
            console.error(`Gemini fetch failed (attempt ${attempt})`, err.message);
            if (attempt === maxAttempts) {
                console.log("Falling back to localEvaluate");
                return localEvaluate(word, sentence);
            }
            await new Promise(r => setTimeout(r, 250));
        }
    }

    const rawText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        data?.candidates?.[0]?.content?.[0]?.text ||
        data?.candidates?.[0]?.content?.text ||
        "{}";

    const cleanedText = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();

    let parsed;
    try {
        parsed = JSON.parse(cleanedText);
    } catch (err) {
        console.error("Gemini invalid JSON:", cleanedText);
        return localEvaluate(word, sentence);
    }

    const parsedScores = parsed?.scores ?? parsed;

    if (!parsedScores) return localEvaluate(word, sentence);

    // Check for all zeros
    const finalScores = {};
    OLQS.forEach(o => {
        const v = Number(parsedScores?.[o] ?? 0);
        finalScores[o] = Math.round(Math.min(5, Math.max(0, v)));
    });

    const allZero = Object.values(finalScores).every(v => v === 0);
    if (allZero) {
        console.log("Gemini returned all zeros -> fallback local");
        return localEvaluate(word, sentence); // Fallback to local if Gemini gives empty results
    }

    return { scores: finalScores, features: { source: 'gemini', raw: cleanedText } };
}

// --- Aggregation ---
function aggregateScores(scoreList) {
    const final = {};
    if (!Array.isArray(scoreList) || scoreList.length === 0) {
        OLQS.forEach(o => (final[o] = 0));
        return final;
    }
    OLQS.forEach(o => {
        const sum = scoreList.reduce((s, x) => s + (Number(x?.[o] ?? 0)), 0);
        final[o] = (sum / scoreList.length).toFixed(1); // Keep 1 decimal
    });
    return final;
}

// --- Route Handler ---
router.post("/evaluate", async (req, res) => {
    const { responses } = req.body;

    if (!Array.isArray(responses) || responses.length === 0) {
        return res.status(400).json({ error: "Responses required" });
    }

    try {
        const sentenceWise = [];

        // Process in parallel or sequential? Sequential is safer for rate limits usually, 
        // but Gemini Flash is fast. Let's do parallel with Promise.all for speed.
        // However, rate limits might hit. Let's do chunks of 5.

        const chunkSize = 5;
        for (let i = 0; i < responses.length; i += chunkSize) {
            const chunk = responses.slice(i, i + chunkSize);
            const results = await Promise.all(chunk.map(async (r) => {
                if (!r.word || !r.response) return { ...r, scores: localEvaluate(r.word || "", "").scores };
                const evalResult = await evaluateSentence(r.word, r.response);
                return { ...r, scores: evalResult.scores, features: evalResult.features };
            }));
            sentenceWise.push(...results);
        }

        const finalScorecard = aggregateScores(sentenceWise.map(s => s.scores));

        res.json({ sentenceWise, finalScorecard });
    } catch (err) {
        console.error("Evaluation Handler Failed:", err);
        res.status(500).json({ error: "Evaluation failed" });
    }
});

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// --- Get Words Endpoint ---
router.get("/words", async (req, res) => {
    try {
        const words = await prisma.wATWord.findMany();
        // Shuffle logic can be here or frontend. Let's return all.
        res.json(words);
    } catch (err) {
        console.error("Failed to fetch WAT words:", err);
        res.status(500).json({ error: "Failed to fetch words" });
    }
});

module.exports = router;
