const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Middleware (Soft Auth)
const extractUser = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.userId = decoded.id;
        } catch (error) {
            // Ignore token errors
        }
    }
    next();
};

router.get('/images', async (req, res) => {
    try {
        const images = await prisma.tATImage.findMany({
            select: { id: true, url: true }
        });
        res.json(images);
    } catch (error) {
        console.error("Fetch Images Error:", error);
        res.status(500).json({ error: "Failed to fetch images" });
    }
});

router.post('/evaluate', extractUser, async (req, res) => {
    try {
        const { stories, imageId, userStory } = req.body;

        let itemsToEvaluate = [];
        if (Array.isArray(stories) && stories.length > 0) {
            itemsToEvaluate = stories;
        } else if (imageId && userStory) {
            itemsToEvaluate = [{ imageId, text: userStory }];
        } else {
            return res.status(400).json({ error: "Invalid input" });
        }

        console.log(`TAT Evaluate Request (v2.5). Items: ${itemsToEvaluate.length}`);
        const results = [];
        let totalSum = 0;

        for (const item of itemsToEvaluate) {
            const currentImageId = item.imageId;
            const currentStoryText = item.text || item.userStory;

            // Fetch Context
            let tatImage = null;
            if (currentImageId && !isNaN(parseInt(currentImageId))) {
                try {
                    tatImage = await prisma.tATImage.findUnique({
                        where: { id: parseInt(currentImageId) }
                    });
                } catch (e) {
                    console.warn("DB Image lookup failed");
                }
            }

            // Fallback context if DB image not found
            const context = tatImage?.description || "A scene requiring leadership and quick action.";

            // Construct Prompt
            const prompt = `
            You are an expert Psychologist at the Services Selection Board (SSB). Your task is to analyze the candidate's story for the Thematic Apperception Test (TAT).

            **Image/Context Context:**
            ${context}

            **Candidate's Story:**
            "${currentStoryText}"

            **Evaluation Rubric:**
            1. **The Hero (Protagonist)**: Is there a clear central character? Does the candidate identify with them? (Factor 1 - Planning & Organizing)
            2. **The Need/Task**: Is the problem or objective clearly defined?
            3. **The Action**: What steps did the Hero take? 
               - *Low*: Passive, asking for help, magic, or luck. (Score 1-2)
               - *Average*: Routine actions, describing the scene. (Score 3)
               - *High*: Strategic, organized, resourceful, and socially adaptable actions. (Score 4-5)
            4. **The Outcome**: Is it a positive and logical conclusion?

            **Scoring (1-5 Scale) on 16 OLQs:**
            Evaluate the story against the 16 Officer Like Qualities. 
            - *Effective Intelligence*: Practical solution to the problem?
            - *Social Adaptability*: Did the hero work with others?
            - *Initiative*: Did the hero start the action?
            - *Courage/Stamina*: Did the hero persist?

            **Output Requirement:**
            Return strictly valid JSON. No Markdown.
            {
                "scores": [
                    { "parameter": "Effective Intelligence", "score": 4, "remark": "Hero found a practical solution by..." },
                    ... (all 16 OLQs)
                ],
                "totalScore": 65,
                "summary": "The candidate projected a clear hero who..."
            }
            `;

            let attempts = 0;
            let success = false;
            let evaluation = null;

            while (attempts < 2 && !success) {
                try {
                    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
                    const result = await model.generateContent(prompt);
                    const responseText = result.response.text();
                    const jsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

                    try {
                        evaluation = JSON.parse(jsonString);
                    } catch (parseErr) {
                        const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
                        if (jsonMatch) {
                            evaluation = JSON.parse(jsonMatch[0]);
                        } else {
                            throw parseErr;
                        }
                    }
                    success = true;
                } catch (err) {
                    attempts++;
                    console.error(`Gemini 2.5 Attempt ${attempts} failed:`, err.message);
                    await new Promise(r => setTimeout(r, 1500));
                }
            }

            if (!success || !evaluation) {
                evaluation = {
                    scores: [],
                    totalScore: 0,
                    summary: "Evaluation unavailable (Model Error)."
                };
            }

            results.push({
                trigger: tatImage?.url || "Practice Image",
                description: context,
                response: currentStoryText,
                scores: evaluation.scores || [],
                individualSummary: evaluation.summary || "",
                individualTotal: evaluation.totalScore || 0
            });

            totalSum += (evaluation.totalScore || 0);
        }

        const count = results.length;
        const finalScore = count > 0 ? Math.round(totalSum / count) : 0;
        const feedback = "TAT Evaluation Completed";

        // Save to DB
        if (req.userId && count > 0) {
            try {
                await prisma.examResult.create({
                    data: {
                        userId: req.userId,
                        examName: "TAT Evaluation",
                        testType: "TAT",
                        score: finalScore,
                        total: 80,
                        percentage: parseFloat((finalScore / 80 * 100).toFixed(1)),
                        feedback: feedback,
                        responseDetails: results
                    }
                });
            } catch (dbErr) {
                console.error("DB Save failed", dbErr);
            }
        }

        res.json({
            summary: feedback,
            totalScore: finalScore,
            results: results
        });

    } catch (error) {
        console.error("TAT Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;