import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, X } from 'lucide-react';
import { LiquidButton } from './LiquidButton';
import { GlassCard } from './GlassCard';

interface StatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type: 'success' | 'error';
}

export const StatusModal = ({ isOpen, onClose, title, message, type }: StatusModalProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center px-4 font-sans">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="relative w-full max-w-md z-10"
                    >
                        <GlassCard className={`p-8 shadow-2xl bg-white/95 border ${type === 'error' ? 'border-red-100' : 'border-green-100'}`}>
                            <button 
                                onClick={onClose}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            
                            <div className="flex flex-col items-center text-center">
                                <motion.div 
                                    initial={{ scale: 0 }} 
                                    animate={{ scale: 1 }} 
                                    transition={{ type: "spring", delay: 0.1 }}
                                    className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-inner ${type === 'error' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}
                                >
                                    {type === 'error' ? <XCircle className="w-8 h-8" /> : <CheckCircle2 className="w-8 h-8" />}
                                </motion.div>
                                
                                <h3 className={`text-2xl font-serif font-bold mb-3 ${type === 'error' ? 'text-red-900' : 'text-green-900'}`}>
                                    {title}
                                </h3>
                                
                                <p className="text-gray-600 font-medium leading-relaxed mb-8">
                                    {message}
                                </p>
                                
                                <LiquidButton 
                                    variant={type === 'error' ? 'danger' : 'primary'}
                                    onClick={onClose}
                                    className="w-full py-3.5 font-bold shadow-md"
                                >
                                    {type === 'error' ? 'Understood' : 'Continue'}
                                </LiquidButton>
                            </div>
                        </GlassCard>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
