export const bibleVerses = [
    {
        id: 1,
        verse: "Cast your cares on the LORD and he will sustain you; he will never let the righteous be shaken.",
        reference: "Psalm 55:22",
        korean: "네 짐을 여호와께 맡겨 버리라 너를 붙드시고 의인의 요동함을 영영히 허락지 아니하시리로다.",
        reflection: "주님께 모든 짐을 맡기면 주님께서 당신을 붙드시고 평안을 주실 것입니다."
    },
    {
        id: 2,
        verse: "The Lord is my shepherd, I lack nothing.",
        reference: "Psalm 23:1",
        korean: "여호와는 나의 목자시니 내게 부족함이 없으리로다.",
        reflection: "진정한 만족과 평안은 주님 안에서 찾을 수 있습니다."
    },
    {
        id: 3,
        verse: "For I know the plans I have for you,” declares the Lord.",
        reference: "Jeremiah 29:11",
        korean: "너희를 향한 나의 생각을 내가 아나니...",
        reflection: "미래에 대한 희망을 잃지 말고 나아가세요."
    },
    {
        id: 4,
        verse: "Love is patient, love is kind.",
        reference: "1 Corinthians 13:4",
        korean: "사랑은 오래 참고 사랑은 온유하며...",
        reflection: "오늘 하루, 주변 사람들에게 작은 친절을 베풀어보세요."
    }
];

const VERSE_HISTORY_KEY = 'speakflow_verse_history_v1';

export const saveVerseToHistory = (newVerse) => {
    try {
        const history = JSON.parse(localStorage.getItem(VERSE_HISTORY_KEY) || '[]');
        // Check for duplicates by reference
        if (!history.some(v => v.reference === newVerse.reference)) {
            history.push(newVerse);
            localStorage.setItem(VERSE_HISTORY_KEY, JSON.stringify(history));
        }
    } catch (e) {
        console.error("Failed to save verse history:", e);
    }
};

export const getRandomVerse = () => {
    let pool = [...bibleVerses];
    try {
        const history = JSON.parse(localStorage.getItem(VERSE_HISTORY_KEY) || '[]');
        if (history.length > 0) {
            pool = [...pool, ...history];
        }
    } catch {
        // Ignore parsing errors
    }

    // Remove duplicates nicely just in case
    const uniquePool = Array.from(new Map(pool.map(item => [item.reference, item])).values());

    const randomIndex = Math.floor(Math.random() * uniquePool.length);
    return uniquePool[randomIndex];
};
