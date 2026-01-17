
import fetch from 'node-fetch';

const keys = [
    {
        provider: 'gemini',
        key: process.env.VITE_GEMINI_API_KEY || '',
        url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-001:generateContent',
        model: 'gemini-1.5-flash-001',
        body: (key, _model) => ({
            method: "POST",
            headers: { "Content-Type": "application/json" },
            URL_SUFFIX: `?key=${key}`,
            body: JSON.stringify({ contents: [{ parts: [{ text: "hi" }] }] })
        })
    }
];

async function test() {
    console.log("Starting Key Verification...\n");

    for (const k of keys) {
        console.log(`Testing [${k.provider.toUpperCase()}]... `);
        try {
            let url = k.url;
            const reqOpts = k.body(k.key, k.model);
            if (reqOpts.URL_SUFFIX) {
                url += reqOpts.URL_SUFFIX;
                delete reqOpts.URL_SUFFIX;
            }

            const res = await fetch(url, reqOpts);

            if (res.ok) {
                await res.json();
                console.log("STATUS: OK");
            } else {
                console.log(`STATUS: FAILED (${res.status}: ${res.statusText})`);
                const txt = await res.text();
                console.log("   -> " + txt.substring(0, 200).replace(/\n/g, ' '));
            }
        } catch (e) {
            console.log(`❌ ERROR (${e.message})`);
        }
    }
}

test();
