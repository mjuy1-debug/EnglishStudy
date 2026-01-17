// Debug comment to shift lines
/**
 * Real AI Service using Groq API
 * Model: llama-3.3-70b-versatile
 */

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || ''; // User provided Key
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const SYSTEM_PROMPT = `
You are 'SpeakFlow AI', a professional English tutor.
ROLE:
1. You act as a native English speaker conversation partner.
2. You ALSO act as a professional Korean translator/tutor.
3. Your goal is to keep the conversation going naturally while providing perfect Korean translations.

OUTPUT FORMAT (JSON ONLY):
{
  "english": "Your natural English response to the user.",
  "korean": "The natural Korean translation of your English response.",
  "correction": "Optional. If the user made a grammar mistake, explain it briefly here in Korean. Otherwise null.",
  "suggestions": [
    { "english": "Option 1", "korean": "Translation 1" },
    { "english": "Option 2", "korean": "Translation 2" },
    { "english": "Option 3", "korean": "Translation 3" }
  ]
}

RULES FOR KOREAN TRANSLATION:
1. MUST use natural spoken Korean (구어체/해요체).
2. NEVER use literal translations (직역 금지).
3. NEVER use foreign characters or Hanja in the Korean field.
4. If the user asks a question, answer it directly.

RULES FOR SUGGESTIONS:
1. Provide exactly 3 short, natural English responses for the user to reply with.
2. Include the natural Korean meaning for each suggestion.
3. Varied styles: e.g., one agreeing, one disagreeing/alternative, one asking a question.

EXAMPLE:
User: "I want drink water."
AI: {
  "english": "Oh, are you thirsty? Do you want some cold water?",
  "korean": "아, 목이 마르신가요? 시원한 물 좀 드릴까요?",
  "correction": "'I want to drink water.'라고 하는 게 더 자연스러워요.",
  "suggestions": [
    { "english": "Yes, please.", "korean": "네, 주세요." },
    { "english": "No, I'm okay now.", "korean": "아니요, 지금은 괜찮아요." },
    { "english": "Do you have juice?", "korean": "주스 있나요?" }
  ]
}
`;

export const sendMessageToAI = async (message, history) => {
    try {
        // Construct standard message history
        // Map our internal format {role, content/english} to API format
        const apiMessages = [
            { role: "system", content: SYSTEM_PROMPT },
            ...history.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.role === 'user' ? msg.content : JSON.stringify({
                    english: msg.english,
                    korean: msg.korean,
                    correction: msg.correction,
                    suggestions: msg.suggestions || []
                })
            })),
            { role: "user", content: message }
        ];

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: apiMessages,
                temperature: 0.7,
                max_tokens: 1024,
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;

        try {
            return JSON.parse(content);
        } catch (e) {
            console.error("JSON Parse Error:", e);
            // Fallback if model fails to output JSON
            return {
                english: content,
                korean: "죄송해요, 번역 과정에서 문제가 발생했어요.",
                correction: null,
                suggestions: []
            };
        }

    } catch (error) {
        console.error("AI Service Error:", error);
        return {
            english: "I'm having trouble connecting to the server. Please check your internet or API Key.",
            korean: "서버 연결에 문제가 생겼어요. 인터넷이나 API 키를 확인해주세요.",
            correction: null
        };
    }
};

const VERSE_SYSTEM_PROMPT = `
You remain 'SpeakFlow AI', but now act as a spiritual mentor.
GOAL: Provide a random, encouraging Bible verse (NIV style for English) and a short reflection.

OUTPUT FORMAT (JSON ONLY):
{
  "verse": "English verse text",
  "reference": "Book Chapter:Verse",
  "korean": "Natural Korean translation of the verse",
  "reflection": "A short, warm, 1-sentence reflection in Korean encouraging the user."
}

RULES:
1. Pick a random verse suitable for motivation, comfort, or strength.
2. Korean translation must be natural.
3. Reflection should be positive and uplifting.
`;

// Multi-Provider Configuration
// We rotate through different providers to avoid rate limits
const API_CONFIGS = [
    {
        provider: 'groq',
        key: import.meta.env.VITE_GROQ_API_KEY || '',
        url: 'https://api.groq.com/openai/v1/chat/completions',
        model: 'llama-3.3-70b-versatile'
    }
];

let currentIndex = 0;

const getNextConfig = () => {
    currentIndex = (currentIndex + 1) % API_CONFIGS.length;
    return API_CONFIGS[currentIndex];
};

// Helper: Clean Response Text
const cleanText = (text) => {
    return text.replace(/```json\n?|```/g, "").replace(/\n/g, " ").trim();
};

// Provider 1: OpenAI & Groq (Compatible Format)
const fetchOpenAICompatible = async (config, systemPrompt, userPrompt) => {
    const response = await fetch(config.url, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${config.key}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: config.model,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            temperature: 0.4,
            max_tokens: 512
        })
    });

    if (response.status === 429) throw new Error("RATE_LIMIT");
    if (!response.ok) throw new Error(`API_ERROR_${response.status}`);

    const data = await response.json();
    return data.choices[0].message.content;
};

// Provider 2: Google Gemini (Different Format)
const fetchGemini = async (config, systemPrompt, userPrompt) => {
    const fullUrl = `${config.url}?key=${config.key}`;
    const response = await fetch(fullUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
            }]
        })
    });

    if (response.status === 429) throw new Error("RATE_LIMIT");
    if (!response.ok) throw new Error(`API_ERROR_${response.status}`);

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
};

export const getDailyVerseFromAI = async (retryCount = 0) => {
    if (retryCount >= API_CONFIGS.length * 2) {
        console.error("All providers exhausted.");
        return null;
    }

    const config = API_CONFIGS[currentIndex];
    const seed = Date.now();

    const SYSTEM_PROMPT_TEXT = "You are a Bible Verse generator.";
    const USER_PROMPT_TEXT = `Generate a NEW and UNIQUE daily verse (Seed: ${seed}).
    
    STRICT RULES:
    1. Do NOT use Philippians 4:6 or 4:13.
    2. Format strictly: English Verse|Reference|Korean Verse|Korean Reflection
    3. Korean Verse MUST be from the **Korean Revised Version (BSK / 개역한글)** but use **HANGUL ONLY (한글전용)**.
    4. **ABSOLUTELY NO CHINESE CHARACTERS (HANJA/한자)**. No English, No Thai. Pure Hangul.
    5. Reflection must be warm, graceful, and blessing-oriented.
    6. **OUTPUT ONLY THE RAW STRING**, no introduction, no markdown, no specific formatting tags.
    
    Example:
    Cast your cares on the LORD and he will sustain you.|Psalm 55:22|네 짐을 여호와께 맡겨 버리라 너를 붙드시고 의인의 요동함을 영영히 허락지 아니하시리로다.|주님께 모든 것을 맡기면 주님께서 당신을 굳건하게 지켜주실 것입니다.`;

    try {
        let rawContent;
        console.log(`Using Provider: ${config.provider}`);

        if (config.provider === 'gemini') {
            rawContent = await fetchGemini(config, SYSTEM_PROMPT_TEXT, USER_PROMPT_TEXT);
        } else {
            rawContent = await fetchOpenAICompatible(config, SYSTEM_PROMPT_TEXT, USER_PROMPT_TEXT);
        }

        console.log("AI Raw:", rawContent); // Debugging

        // Validate strictly against Hanja (Chinese characters)
        // Range: Common CJK Unified Ideographs [u4E00-u9FFF]
        if (/[\u4E00-\u9FFF]/.test(rawContent)) {
            console.error("Detected Hanja/Chinese characters in output. Rejecting.");
            throw new Error("INVALID_CONTENT_HANJA");
        }

        console.log("AI Raw:", rawContent); // Debugging

        // Robust Parsing using Regex to find the pattern: Text | Ref | Text | Text
        // Matches 3 pipes with content in between
        const clean = cleanText(rawContent);

        // Simple fallback split if strict regex is too hard
        const parts = clean.split('|').map(s => s.trim());

        if (parts.length < 4) {
            console.error("Format Error: ", parts);
            throw new Error("INVALID_FORMAT");
        }

        // If 5 parts (maybe leading or trailing pipe), try to intelligently pick
        // Often models put | at start or end.
        let verse, reference, korean, reflection;

        if (parts.length === 4) {
            [verse, reference, korean, reflection] = parts;
        } else {
            // Filter empty strings
            const validParts = parts.filter(p => p.length > 0);
            if (validParts.length >= 4) {
                [verse, reference, korean, reflection] = validParts;
            } else {
                throw new Error("INVALID_FORMAT_COUNT");
            }
        }

        const cleanStr = (str) => str ? str.replace(/^["']|["']$/g, '').trim() : '';

        if (!verse || !korean || korean.length < 2) throw new Error("MISSING_DATA");

        return {
            verse: cleanStr(verse),
            reference: cleanStr(reference),
            korean: cleanStr(korean),
            reflection: cleanStr(reflection)
        };

    } catch (error) {
        console.warn(`Provider ${config.provider} failed: ${error.message}. Switching...`);
        getNextConfig(); // Rotate to next provider
        return getDailyVerseFromAI(retryCount + 1); // Retry
    }
};
