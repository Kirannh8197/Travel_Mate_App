import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User } from 'lucide-react';
import { LiquidButton } from './LiquidButton';
import { GlassCard } from './GlassCard';
import { useUserStore } from '../../store/useUserStore';
import { BrandIcon } from './BrandIcon'

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultRole?: "USER" | "HOTEL_HOST" | "ADMIN";
}

export const AuthModal = ({ isOpen, onClose, defaultRole = "USER" }: AuthModalProps) => {
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Form fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const endpoint = isLogin ? '/api/auth/login' : '/api/users';
            const payload = isLogin 
                ? { email, password } 
                : { name, email, password, userId: Math.floor(Math.random() * 100000), role: defaultRole }; // Inject the host role dynamically

            const response = await fetch(`http://localhost:5000${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Authentication failed');
            }

            const loginStore = useUserStore.getState().login;
            
            // For Register, data is nested differently. Normalize:
            const userData = isLogin ? data.data : data.data; 
            const userRole = isLogin ? data.role : data.data.role;

            loginStore(userData, userRole || 'USER');
            onClose();

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 font-sans">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-gray-900/40 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="relative w-full max-w-md"
                    >
                        <GlassCard className="p-8 shadow-2xl border border-gray-200 bg-white/95">
                            <button 
                                onClick={onClose}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex justify-center mb-6">
                                <BrandIcon size={64} pulse />
                            </div>

                            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2 tracking-tight text-center">
                                {isLogin ? 'Welcome Back' : (defaultRole === 'HOTEL_HOST' ? 'Join as a Host' : 'Join TravelMate')}
                            </h2>
                            <p className="text-gray-500 text-sm mb-8 font-medium text-center">
                                {isLogin ? 'Enter your details to access your sanctuary.' : 'Create an account to unlock premium experiences.'}
                            </p>

                            {error && (
                                <div className="mb-4 p-3 bg-red-50/80 border border-red-200 rounded-lg text-red-600 font-medium text-sm shadow-inner">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {!isLogin && (
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input 
                                            type="text" 
                                            placeholder="Full Name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required={!isLogin}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-[var(--tm-ethereal-purple)]/10 focus:border-[var(--tm-ethereal-purple)] transition-all font-medium shadow-inner"
                                        />
                                    </div>
                                )}

                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input 
                                        type="email" 
                                        placeholder="Email Address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-[var(--tm-ethereal-purple)]/10 focus:border-[var(--tm-ethereal-purple)] transition-all font-medium shadow-inner"
                                    />
                                </div>

                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input 
                                        type="password" 
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-[var(--tm-ethereal-purple)]/10 focus:border-[var(--tm-ethereal-purple)] transition-all font-medium shadow-inner"
                                    />
                                </div>

                                <div className="pt-4">
                                    <LiquidButton 
                                        variant="primary" 
                                        type="submit" 
                                        className="w-full py-3 text-base flex justify-center items-center"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            isLogin ? 'Sign In' : 'Create Account'
                                        )}
                                    </LiquidButton>
                                </div>
                            </form>

                            <div className="mt-6 text-center text-sm text-gray-500 font-medium">
                                {isLogin ? (
                                    <p>New to TravelMate? <button onClick={() => setIsLogin(false)} className="text-[var(--tm-liquid-blue)] hover:text-[var(--tm-deep-indigo)] transition-colors ml-1 font-bold">Create an account</button></p>
                                ) : (
                                    <p>Already have an account? <button onClick={() => setIsLogin(true)} className="text-[var(--tm-liquid-blue)] hover:text-[var(--tm-deep-indigo)] transition-colors ml-1 font-bold">Sign in</button></p>
                                )}
                            </div>
                        </GlassCard>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
