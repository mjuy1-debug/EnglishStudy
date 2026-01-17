const USERS_KEY = 'speakflow_users_v1';
const CURRENT_ID_KEY = 'speakflow_curr_id';

const defaultUser = {
    id: 'user_' + Date.now(),
    name: 'User',
    level: 1,
    xp: 0,
    nextLevelXp: 100,
    avatar: null,
    joinedDate: new Date().toISOString(),
    stats: {
        daysStreak: 0,
        wordsLearned: 0,
        lastActiveDate: null,
        totalSpeakingCount: 0
    },
    dailyProgress: {
        date: new Date().toISOString().split('T')[0],
        count: 0,
        target: 20
    },
    settings: {
        darkMode: false,
        notifications: true,
        emailAlerts: false
    }
};

// Event System
const listeners = new Set();
export const subscribeUser = (callback) => {
    listeners.add(callback);
    return () => listeners.delete(callback);
};
const notifyListeners = (user) => {
    listeners.forEach(cb => cb(user));
};

// Migration & internal helpers
const loadUsers = () => {
    // 1. Check for new system
    const storedUsers = localStorage.getItem(USERS_KEY);
    if (storedUsers) return JSON.parse(storedUsers);

    // 2. Migration: Check for old single user
    const oldUser = localStorage.getItem('speakflow_user');
    if (oldUser) {
        try {
            const parsed = JSON.parse(oldUser);
            // Ensure ID
            if (!parsed.id) parsed.id = 'user_migrated';

            const users = [parsed];
            localStorage.setItem(USERS_KEY, JSON.stringify(users));
            localStorage.setItem(CURRENT_ID_KEY, parsed.id);
            return users;
        } catch (e) { console.error("Migration failed", e); }
    }

    // 3. Defaults
    const initUser = { ...defaultUser };
    const users = [initUser];
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(CURRENT_ID_KEY, initUser.id);
    return users;
};

export const getUsers = () => {
    return loadUsers();
};

export const getUser = () => {
    const users = loadUsers();
    let currentId = localStorage.getItem(CURRENT_ID_KEY);

    // Find current user or fallback to first
    let user = users.find(u => u.id === currentId) || users[0];

    // Auto-fix current ID if invalid
    if (user.id !== currentId) {
        localStorage.setItem(CURRENT_ID_KEY, user.id);
    }

    // Safe merge defaults (runtime only, simpler than complex migration logic every time)
    // We do a shallow merge of top-level props + specific nested ones if needed
    if (!user.stats) user.stats = { ...defaultUser.stats };
    if (!user.dailyProgress) user.dailyProgress = { ...defaultUser.dailyProgress };

    // New Day Logic
    const today = new Date().toISOString().split('T')[0];
    if (user.dailyProgress.date !== today) {
        user.dailyProgress = {
            date: today,
            count: 0,
            target: user.dailyProgress.target || 20
        };
        // Save this daily reset immediately? 
        // Better to just update it in memory and save strictly via updateUser to avoid loops.
        // But for consistency let's save it.
        // To avoid infinite recursion, we call a raw save helper.
        saveUserInternal(users.map(u => u.id === user.id ? user : u));
    }

    return user;
};

const saveUserInternal = (users) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const updateUser = (updates) => {
    const users = loadUsers();
    const currentUser = getUser();

    const updatedUser = { ...currentUser, ...updates };

    const newUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
    saveUserInternal(newUsers);

    notifyListeners(updatedUser);
    return updatedUser;
};

export const switchUser = (userId) => {
    const users = loadUsers();
    if (users.find(u => u.id === userId)) {
        localStorage.setItem(CURRENT_ID_KEY, userId);
        notifyListeners(getUser()); // Notify with new user
        return true;
    }
    return false;
};

export const createNewUser = (name) => {
    const params = { ...defaultUser }; // fresh copy
    params.id = 'user_' + Date.now();
    params.name = name;
    params.joinedDate = new Date().toISOString();

    const users = loadUsers();
    users.push(params);
    saveUserInternal(users);

    switchUser(params.id);
    return params;
};

export const deleteUser = (userId) => {
    let users = loadUsers();
    if (users.length <= 1) return false; // Cannot delete last user

    users = users.filter(u => u.id !== userId);
    saveUserInternal(users);

    // If we deleted current user, switch to first
    if (localStorage.getItem(CURRENT_ID_KEY) === userId) {
        switchUser(users[0].id);
    } else {
        notifyListeners(getUser()); // Just refresh data
    }
    return true;
};

// Keep existing logic for incrementing
export const incrementSpeakingCount = (amount = 1) => {
    const user = getUser();
    // Logic duplicated from before but simplified knowing getUser returns safe object
    user.dailyProgress.count += amount;
    user.stats.totalSpeakingCount += amount;

    // XP
    user.xp = (user.xp || 0) + (amount * 10);
    const nextLvl = user.nextLevelXp || 100;
    if (user.xp >= nextLvl) {
        user.level = (user.level || 1) + 1;
        user.xp -= nextLvl;
        user.nextLevelXp = Math.floor(nextLvl * 1.2);
    }

    // Streak
    const today = new Date().toISOString().split('T')[0];
    const lastActive = user.stats.lastActiveDate;
    if (lastActive !== today) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        if (lastActive === yesterday) {
            user.stats.daysStreak = (user.stats.daysStreak || 0) + 1;
        } else {
            user.stats.daysStreak = 1;
        }
        user.stats.lastActiveDate = today;
    }

    return updateUser(user);
};

export const resetUserProgress = () => {
    const current = getUser();
    const reset = {
        ...current,
        level: 1,
        xp: 0,
        nextLevelXp: 100,
        stats: { daysStreak: 0, wordsLearned: 0, totalSpeakingCount: 0, lastActiveDate: null },
        dailyProgress: { ...defaultUser.dailyProgress, date: new Date().toISOString().split('T')[0] }
    };

    // Use updateUser to save and notify
    return updateUser(reset);
};
