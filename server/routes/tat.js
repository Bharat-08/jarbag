const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Middleware to verify token
// Middleware (Soft Auth)
// Middleware (Soft Auth with Refresh Support)
const extractUser = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.userId = decoded.id;
        } catch (error) {
            // Token is present but invalid/expired. 
            // Return 401 so client can refresh.
            return res.status(401).json({ message: 'Invalid or expired token', code: 'TOKEN_EXPIRED' });
        }
    }
    // If no header, proceed as guest
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

        // Support both single and multiple formats
        let itemsToEvaluate = [];
        if (Array.isArray(stories) && stories.length > 0) {
            itemsToEvaluate = stories;
        } else if (imageId && userStory) {
            itemsToEvaluate = [{ imageId, text: userStory }]; // Normalize to object structure
        } else {
            return res.status(400).json({ error: "Missing stories array or imageId/userStory" });
        }

        console.log(`TAT Evaluate Request. userId: ${req.userId}, items: ${itemsToEvaluate.length}`);

        const results = [];
        let totalSum = 0;

        // Process each story
        for (const item of itemsToEvaluate) {
            const currentImageId = item.imageId;
            const currentStoryText = item.text || item.userStory; // Handle variations in key names if any

            // Fetch Ground Truth
            const tatImage = await prisma.tATImage.findUnique({
                where: { id: parseInt(currentImageId) }
            });

            if (!tatImage) {
                console.warn(`TAT Image ${currentImageId} not found, skipping.`);
                continue;
            }

            // Construct Prompt
            const prompt = `
            You are an expert SSB Assessor. Evaluate the following candidate's story based on the provided ground truth context/themes for the image.
            
            **Ground Truth / Context:**
            1. ${tatImage.description1}
            2. ${tatImage.description2}
            3. ${tatImage.description3}

            **Candidate's Story:**
            "${currentStoryText}"

            **Task:**
            Evaluate the story on these 16 parameters (Scale 1-5, where 5 is excellent):
            1. Effective Intelligence
            2. Reasoning Ability
            3. Organizing Ability
            4. Power of Expression
            5. Social Adaptability
            6. Cooperation
            7. Sense of Responsibility
            8. Initiative
            9. Self Confidence
            10. Speed of Decision
            11. Ability to Influence the Group
            12. Liveliness
            13. Determination
            14. Courage
            15. Stamina
            16. Overall Story Relevance

            **Output Format:**
            Strictly return a JSON object with this structure (no markdown, no backticks):
            {
                "scores": [
                    { "parameter": "Effective Intelligence", "score": 4, "remark": "Short observation..." },
                    ... (for all 16)
                ],
                "totalScore": 0,
                "summary": "Brief overall feedback."
            }
            `;

            // Retry logic for 429 Rate Limits
            let attempts = 0;
            const maxAttempts = 5; // Increased attempts for robust 429 handling
            let success = false;
            let evaluation = null;

            while (attempts < maxAttempts && !success) {
                try {
                    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
                    const result = await model.generateContent(prompt);
                    const responseText = result.response.text();
                    const jsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
                    evaluation = JSON.parse(jsonString);
                    success = true;
                } catch (err) {
                    attempts++;
                    console.error(`Attempt ${attempts} failed for image ${currentImageId}:`, err.message);

                    if (err.message.includes('429') || err.message.includes('Quota')) {
                        console.log(`Rate limit hit. Waiting 20 seconds to clear quota... (Attempt ${attempts}/${maxAttempts})`);
                        await new Promise(r => setTimeout(r, 20000)); // Wait 20s (safe margin for Gemini Flash)
                    } else {
                        // Non-retriable error? Maybe just break.
                        if (attempts === maxAttempts) console.error("Max attempts reached.");
                        // For non-quota errors, wait briefly
                        if (!err.message.includes('429')) await new Promise(r => setTimeout(r, 2000));
                    }
                }
            }

            if (success && evaluation) {
                results.push({
                    trigger: tatImage.url,
                    description: tatImage.description1,
                    response: currentStoryText,
                    scores: evaluation.scores,
                    individualSummary: evaluation.summary,
                    individualTotal: evaluation.totalScore
                });

                totalSum += (evaluation.totalScore || 0);
            } else {
                console.error(`Skipping image ${currentImageId} due to repeated errors.`);
            }
        }

        // --- Save to Database (Aggregated) ---
        // Average score? Or sum? Usually aggregate or avg. Let's avg the total score.
        // Max total per story is 80.
        // Overall score for the exam = Average of story scores.
        const count = results.length;
        if (count === 0) {
            return res.status(503).json({
                error: "Evaluation failed for all images due to AI Rate Limits. Please try again in 1 minute.",
                detail: "Quota Exceeded"
            });
        }

        const finalScore = count > 0 ? Math.round(totalSum / count) : 0;
        const percentage = (finalScore / 80) * 100;

        // Combined summary? Just take the first one or generic.
        const feedback = count > 0 ? "Multi-image TAT Evaluation Completed" : "Evaluation Failed";

        const responsePayload = {
            summary: feedback,
            totalScore: finalScore,
            results: results // Send detailed breakdown to frontend
        };

        try {
            if (req.userId && count > 0) {
                const savedResult = await prisma.examResult.create({
                    data: {
                        userId: req.userId,
                        examName: "TAT Evaluation",
                        testType: "TAT",
                        score: finalScore,
                        total: 80,
                        percentage: parseFloat(percentage.toFixed(1)),
                        feedback: feedback,
                        responseDetails: results // Store all individual results
                    }
                });
                console.log("TAT Result saved:", savedResult.id);
            }
        } catch (dbError) {
            console.error("Failed to save TAT result to DB:", dbError);
        }

        res.json(responsePayload); // Return the full structure

    } catch (error) {
        console.error("TAT Evaluation Error:", error);
        if (error.response) {
            console.error("Gemini API Error Details:", error.response);
        }
        res.status(500).json({ error: "Evaluation failed", details: error.message });
    }
});

module.exports = router;
