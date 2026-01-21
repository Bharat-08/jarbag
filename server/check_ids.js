const axios = require('axios'); // Wait, need axios installed or use fetch (Node 18+)
// Using native fetch
async function checkList() {
    try {
        const res = await fetch('http://localhost:3000/api/mentors/list');
        const data = await res.json();
        console.log("Mentor IDs:", data.mentors.map(m => m.id));
    } catch (e) {
        console.error(e);
    }
}
checkList();
