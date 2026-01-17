export const patterns = [
    {
        id: 'p1',
        pattern: "I'm trying to...",
        meaning: "~하려고 노력 중이야",
        level: 1,
        examples: [
            { en: "I'm trying to learn English.", ko: "영어 배우려고 노력 중이야." },
            { en: "I'm trying to focus.", ko: "집중하려고 노력 중이야." },
            { en: "I'm trying to fix this.", ko: "이거 고치려고 노력 중이야." }
        ]
    },
    {
        id: 'p2',
        pattern: "Do you mind if...",
        meaning: "내가 ~해도 괜찮을까?",
        level: 2,
        examples: [
            { en: "Do you mind if I sit here?", ko: "여기 앉아도 될까?" },
            { en: "Do you mind if I open the window?", ko: "창문 좀 열어도 될까?" },
            { en: "Do you mind if I ask a question?", ko: "질문 하나 해도 될까?" }
        ]
    },
    {
        id: 'p3',
        pattern: "It looks like...",
        meaning: "~인 것 같아 (보여)",
        level: 1,
        examples: [
            { en: "It looks like it's going to rain.", ko: "비 올 것 같아." },
            { en: "It looks like you're busy.", ko: "너 바쁜 것 같아." },
            { en: "It looks like a good idea.", ko: "좋은 생각인 것 같아." }
        ]
    }
];

export const getRandomPattern = () => {
    return patterns[Math.floor(Math.random() * patterns.length)];
};
