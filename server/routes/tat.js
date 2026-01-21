const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

router.post('/evaluate', async (req, res) => {
    try {
        const { imageId, userStory } = req.body;

        if (!imageId || !userStory) {
            return res.status(400).json({ error: "Missing imageId or userStory" });
        }

        // Fetch Ground Truth
        const tatImage = await prisma.tATImage.findUnique({
            where: { id: parseInt(imageId) }
        });

        if (!tatImage) {
            return res.status(404).json({ error: "TAT Image not found" });
        }

        // Construct Prompt
        const prompt = `
        You are an expert SSB Assessor. Evaluate the following candidate's story based on the provided ground truth context/themes for the image.
        
        **Ground Truth / Context:**
        1. ${tatImage.description1}
        2. ${tatImage.description2}
        3. ${tatImage.description3}

        **Candidate's Story:**
        "${userStory}"

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

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Clean JSON string if needed (remove backticks)
        const jsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const evaluation = JSON.parse(jsonString);

        res.json(evaluation);

    } catch (error) {
        console.error("TAT Evaluation Error:", error);
        res.status(500).json({ error: "Evaluation failed" });
    }
});

module.exports = router;
