const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.get('/', async (req, res) => {
    try {
        // 1. Fetch raw HTML from PIB
        const url = 'https://www.pib.gov.in/indexd.aspx?reg=3&lang=1';
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        // 2. Clean HTML to reduce token usage (remove scripts, styles, etc.)
        const $ = cheerio.load(data);
        $('script').remove();
        $('style').remove();
        $('nav').remove();
        $('footer').remove();
        $('header').remove();

        // Get the relevant body text
        // limit to ~30k chars to stay well within safety margins while keeping context
        const cleanText = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 30000);

        // 3. Use Gemini to identifying and summarize
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `
      You are an AI assistant for a Defence Education platform.
      
      I have fetched the raw text content from the Press Information Bureau (PIB) website (Ministry of Defence section).
      
      Your task is to:
      1. Analyze the text below.
      2. Identify the specific news items/headlines related to "Daily Defence Updates" for today or the most recent date available.
      3. Create a concise, professional summary of these updates.
      
      Rules:
      - Focus ONLY on Defence-related news.
      - Ignore navigation menus, footers, and generic site text.
      - Format the output in clean Markdown.
      - Use a title: "## Daily Defence Updates"
      - Use bullet points for different news items.
      - If no specific news is found, reply with "No major defence updates reported at this time."
      
      Raw Website Text:
      ${cleanText}
    `;

        // Retry logic for 503 Service Unavailable (Model Overloaded)
        let text = '';
        let retries = 3;
        while (retries > 0) {
            try {
                const result = await model.generateContent(prompt);
                const response = await result.response;
                text = response.text();
                break; // Success, exit loop
            } catch (err) {
                if (err.message.includes('503') || err.message.includes('overloaded')) {
                    console.log(`Gemini 503 Overloaded. Retrying... (${3 - retries + 1}/3)`);
                    retries--;
                    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s
                    if (retries === 0) throw err; // Throw if last retry
                } else {
                    throw err; // Throw other errors immediately
                }
            }
        }

        res.json({ summary: text });

    } catch (error) {
        console.error('News Error Details:', error);
        res.status(500).json({ message: 'Failed to fetch news', error: error.message });
    }
});

module.exports = router;
