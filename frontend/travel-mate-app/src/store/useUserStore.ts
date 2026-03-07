import { create } from 'zustand';

interface UserState {
    isAuthenticated: boolean;
    user: any | null; 
    role: "USER" | "HOTEL_HOST" | "ADMIN" | null;
    login: (userData: any, role: "USER" | "HOTEL_HOST" | "ADMIN") => void;
    logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
    isAuthenticated: false,
    user: null,
    role: null,
    login: (userData, role) => set({ isAuthenticated: true, user: userData, role }),
    logout: () => {
        set({ isAuthenticated: false, user: null, role: null });
        window.location.href = '/';
    },
}));
