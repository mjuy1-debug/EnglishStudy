export const rolePlayScenarios = [
    {
        id: 'cafe',
        title: 'Cafe Order',
        description: 'Order a coffee from a barista.',
        emoji: '☕',
        difficulty: 'Easy',
        aiRole: 'Barista',
        userRole: 'Customer',
        mission: 'Order an Iced Americano and ask for extra shot.',
        initialMessage: {
            english: "Hi there! What can I get for you today?",
            korean: "안녕하세요! 주문하시겠어요?"
        }
    },
    {
        id: 'airport',
        title: 'Immigration',
        description: 'Answer questions at the airport.',
        emoji: '✈️',
        difficulty: 'Medium',
        aiRole: 'Officer',
        userRole: 'Traveler',
        mission: 'Explain that you are here for a 5-day vacation.',
        initialMessage: {
            english: "Passport please. What is the purpose of your visit?",
            korean: "여권 주세요. 방문 목적이 무엇인가요?"
        }
    },
    {
        id: 'hotel',
        title: 'Hotel Check-in',
        description: 'Check into your hotel room.',
        emoji: '🏨',
        difficulty: 'Easy',
        aiRole: 'Receptionist',
        userRole: 'Guest',
        mission: 'Check in and ask about the breakfast time.',
        initialMessage: {
            english: "Welcome to Grand Hotel. How can I help you?",
            korean: "그랜드 호텔에 오신 것을 환영합니다. 무엇을 도와드릴까요?"
        }
    },
    {
        id: 'shopping',
        title: 'Shopping',
        description: 'Buying clothes at a store.',
        emoji: '👗',
        difficulty: 'Medium',
        aiRole: 'Staff',
        userRole: 'Shopper',
        mission: 'Ask for a smaller size and a discount.',
        initialMessage: {
            english: "Hello! Let me know if you need any help finding sizes.",
            korean: "안녕하세요! 사이즈 찾는 거 도와드릴까요?"
        }
    },
    {
        id: 'taxi',
        title: 'Taking a Taxi',
        description: 'Giving directions to the driver.',
        emoji: '🚕',
        difficulty: 'Easy',
        aiRole: 'Driver',
        userRole: 'Passenger',
        mission: 'Go to City Hall and ask how long it takes.',
        initialMessage: {
            english: "Where are you heading to?",
            korean: "어디로 모실까요?"
        }
    },
    {
        id: 'hospital',
        title: 'Hospital',
        description: 'Explaining symptoms to a doctor.',
        emoji: '🏥',
        difficulty: 'Hard',
        aiRole: 'Doctor',
        userRole: 'Patient',
        mission: 'Explain you have a headache and fever since yesterday.',
        initialMessage: {
            english: "Come in. What brings you here today?",
            korean: "들어오세요. 어디가 불편해서 오셨나요?"
        }
    },
    {
        id: 'interview',
        title: 'Job Interview',
        description: 'English job interview practice.',
        emoji: '💼',
        difficulty: 'Hard',
        aiRole: 'Interviewer',
        userRole: 'Applicant',
        mission: 'Introduce yourself and talk about your strengths.',
        initialMessage: {
            english: "Nice to meet you. Please briefly introduce yourself.",
            korean: "반갑습니다. 간단하게 자기소개 부탁드립니다."
        }
    },
    {
        id: 'restaurant',
        title: 'Restaurant',
        description: 'Making a reservation or complaining.',
        emoji: '🍽️',
        difficulty: 'Medium',
        aiRole: 'Manager',
        userRole: 'Customer',
        mission: 'Complain gently that the soup is too cold.',
        initialMessage: {
            english: "Is everything okay with your meal?",
            korean: "식사는 입에 맞으신가요?"
        }
    }
];
