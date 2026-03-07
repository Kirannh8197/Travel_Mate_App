import { motion } from 'framer-motion';
import logoIcon from '../../assets/logo-icon.png';

interface BrandIconProps {
    className?: string;
    pulse?: boolean;
    size?: number;
}

/**
 * Premium Brand Icon Component
 * Renders the custom Pin/M/Bird elite concept logo icon.
 */
export const BrandIcon = ({ className = '', pulse = false, size = 32 }: BrandIconProps) => {
    return (
        <motion.div
            className={`relative flex items-center justify-center ${className}`}
            initial={pulse ? { scale: 0.95, opacity: 0.8 } : { scale: 1, opacity: 1 }}
            animate={pulse ? { 
                scale: [0.95, 1.05, 0.95],
                opacity: [0.8, 1, 0.8]
            } : { scale: 1, opacity: 1 }}
            transition={pulse ? {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
            } : {}}
            style={{ width: size, height: size }}
        >
            <img 
                src={logoIcon} 
                alt="TravelMate Brand Icon" 
                className="w-full h-full object-contain filter drop-shadow-sm"
            />
        </motion.div>
    );
};
