const express = require('express');
const axios = require('axios');
const { parseStringPromise } = require('xml2js');

const router = express.Router();

// Helper for HTML escaping
function escapeHTML(str = "") {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// PIB Fetcher logic
async function fetchPIB() {
    const rssUrl = "https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1";
    const { data } = await axios.get(rssUrl, {
        headers: { "User-Agent": "Mozilla/5.0", Accept: "application/rss+xml" },
        timeout: 15000
    });
    const parsed = await parseStringPromise(data);
    const items = parsed?.rss?.channel?.[0]?.item || [];
    return items.map(item => ({
        title: item?.title?.[0] || "Untitled",
        description: item?.description?.[0] || "",
        link: item?.link?.[0] || "#",
        publishedAt: item?.pubDate?.[0] || ""
    }));
}

/* ---------------- API (JSON) ---------------- */
// Mounted at /api/news/pib
router.get("/pib", async (req, res) => {
    try {
        const news = await fetchPIB();

        res.json({
            source: "Press Information Bureau, Government of India",
            language: "English",
            total: news.length,
            updates: news
        });
    } catch (err) {
        console.error("API ERROR:", err.message);
        res.status(500).json({ error: err.message });
    }
});

/* ---------------- HTML VIEW ---------------- */
// Mounted at /api/news/view
router.get("/view", async (req, res) => {
    try {
        const news = await fetchPIB();

        const cards = news.map(n => `
      <div class="card">
        <h3>${escapeHTML(n.title)}</h3>
        <p>${escapeHTML(n.description || "No description available.")}</p>
        <a href="${n.link}" target="_blank">Read full release →</a>
      </div>
    `).join("");

        res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>PIB Daily Highlights</title>
        <style>
          body { font-family: Arial, sans-serif; background: #f4f6f8; padding: 30px; }
          h1 { margin-bottom: 6px; }
          .sub { color: #555; margin-bottom: 25px; }
          .card { background: #fff; padding: 20px; border-radius: 10px; margin-bottom: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
          .card h3 { margin-top: 0; color: #0a58ca; }
          .card p { color: #333; line-height: 1.6; }
          .card a { text-decoration: none; font-weight: bold; color: #198754; }
        </style>
      </head>
      <body>
        <h1>PIB Daily Highlights</h1>
        <div class="sub">
          ${new Date().toDateString()} | Press Information Bureau, Government of India
        </div>
        ${cards || "<p>No updates available.</p>"}
      </body>
      </html>
    `);
    } catch (err) {
        console.error("VIEW ERROR:", err.message);
        res.status(500).send("Failed to render PIB view");
    }
});

module.exports = router;