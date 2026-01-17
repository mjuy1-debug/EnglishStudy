const STORAGE_KEY = 'speakflow_bookmarks';

export const getBookmarks = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
};

export const addBookmark = (item) => {
    const current = getBookmarks();
    // Avoid duplicates
    if (current.some(b => b.english === item.english)) return;

    const newItem = { ...item, id: Date.now(), date: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([newItem, ...current]));
    return newItem;
};

export const removeBookmark = (id) => {
    const current = getBookmarks();
    const filtered = current.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

export const isBookmarked = (english) => {
    const current = getBookmarks();
    return current.some(b => b.english === english);
};
