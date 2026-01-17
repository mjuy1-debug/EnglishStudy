
/* eslint-env node */
import fetch from 'node-fetch';

const API_KEY = process.env.GROQ_API_KEY || '';
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

async function testGroq() {
    console.log("Testing Groq API for Rate Limits...");
    const seed = Date.now();
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: "You are a Bible Verse generator." },
                    { role: "user", content: `Generate a NEW and UNIQUE daily verse (Seed: ${seed}).\n\nSTRICT RULES:\n1. Do NOT use Philippians 4:6 or 4:13 (Too common).\n2. Format: English Verse | Reference | Korean Verse | Korean Reflection\n3. Pure Hangul for Korean parts.\n4. Pick randomly from Psalms, Proverbs, Gospels, or Epistles.\n\nExample:\nThe Lord is my shepherd. | Psalm 23:1 | 여호와는 나의 목자시니. | 주님이 함께하십니다.` }
                ],
                temperature: 0.95,
                max_tokens: 512
            })
        });

        if (!response.ok) {
            console.error(`API Error Status: ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.error("Error Body:", text);
            return;
        }

        const data = await response.json();
        const content = data.choices[0].message.content;
        console.log("\nRAW CONTENT:", content);

        const parts = content.split('|').map(s => s.trim());
        if (parts.length < 4) {
            console.error("Format Error: split length is " + parts.length);
        } else {
            console.log("Success! Parsed: ", parts);
        }

    } catch (error) {
        console.error("Network Error:", error);
    }
}

testGroq();
