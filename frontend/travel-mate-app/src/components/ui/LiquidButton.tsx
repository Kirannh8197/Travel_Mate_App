//V's_new_start
import React from 'react';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';

interface LiquidButtonProps extends HTMLMotionProps<"button"> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'danger';
}

export const LiquidButton: React.FC<LiquidButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {

    let baseStyles = "px-6 py-3 rounded-lg font-semibold tracking-wide shadow-lg transition-colors overflow-hidden relative backdrop-blur-sm z-10";
    let colorStyles = "";

    switch (variant) {
        case 'primary':
            colorStyles = "bg-[var(--tm-deep-indigo)] hover:bg-[var(--tm-ethereal-purple)] text-white";
            break;
        case 'secondary':
            colorStyles = "bg-white hover:bg-gray-50 border border-gray-200 text-gray-900";
            break;
        case 'danger':
            colorStyles = "bg-red-500/90 hover:bg-red-600 text-white shadow-red-500/30";
            break;
    }

    return (
        <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`${baseStyles} ${colorStyles} ${className}`}
            {...props}
        >
            <span className="relative z-20 flex items-center justify-center gap-2">
                {children}
            </span>
            <div className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition-opacity blur-xl -z-10 rounded-lg"></div>
        </motion.button>
    );
};
//V's_new_end
