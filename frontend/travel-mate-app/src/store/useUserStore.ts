import { create } from 'zustand';

interface UserState {
    isAuthenticated: boolean;
    user: any | null; // Placeholder for the actual User type
    login: (userData: any) => void;
    logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
    isAuthenticated: false,
    user: null,
    login: (userData) => set({ isAuthenticated: true, user: userData }),
    logout: () => set({ isAuthenticated: false, user: null }),
}));
