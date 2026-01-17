
import fetch from 'node-fetch';

const KEY = process.env.GEMINI_API_KEY || '';

async function listModels() {
    // Correct endpoint to list models
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${KEY}`;

    console.log("Fetching available Gemini models...");
    try {
        const res = await fetch(url);
        if (res.ok) {
            const data = await res.json();
            if (data.models) {
                console.log("✅ Available Models:");
                data.models.forEach(m => console.log(` - ${m.name}`));
            } else {
                console.log("✅ request OK but no 'models' list found.", data);
            }
        } else {
            console.log(`❌ FAILED (${res.status})`);
            const txt = await res.text();
            console.log("Error:", txt);
        }
    } catch (e) {
        console.log("Error:", e.message);
    }
}

listModels();
