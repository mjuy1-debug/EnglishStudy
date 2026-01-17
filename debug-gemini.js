
import fetch from 'node-fetch';

const KEY = process.env.GEMINI_API_KEY || '';
const MODELS_TO_TEST = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro',
    'gemini-pro'
];

async function testGemini() {
    console.log("Debugging Gemini API...\n");

    for (const model of MODELS_TO_TEST) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${KEY}`;
        console.log(`Testing Model: [${model}]`);

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: "Hello" }] }]
                })
            });

            if (res.ok) {
                const data = await res.json();
                console.log(`✅ SUCCESS! Response: ${JSON.stringify(data).slice(0, 50)}...`);
            } else {
                console.log(`❌ FAILED (${res.status})`);
                const txt = await res.text();
                // Clean up newlines for better printing
                console.log(`   Error Body: ${txt.replace(/\n/g, ' ')}`);
            }
        } catch (e) {
            console.log(`❌ ERROR: ${e.message}`);
        }
        console.log("-".repeat(20));
    }
}

testGemini();
