//V's_new_start
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star } from 'lucide-react';

interface InteractiveStarRatingProps {
    rating: number;
    setRating: (rating: number) => void;
    editable?: boolean;
}

export const InteractiveStarRating: React.FC<InteractiveStarRatingProps> = ({ rating, setRating, editable = true }) => {
    const [hoverRating, setHoverRating] = useState(0);

    const handleMouseEnter = (index: number) => {
        if (!editable) return;
        setHoverRating(index);
    };

    const handleMouseLeave = () => {
        if (!editable) return;
        setHoverRating(0);
    };

    const handleClick = (index: number) => {
        if (!editable) return;
        setRating(index);
    };

    return (
        <div className="flex gap-1" onMouseLeave={handleMouseLeave}>
            {[1, 2, 3, 4, 5].map((index) => {
                const isFilled = (hoverRating || rating) >= index;
                return (
                    <motion.button
                        key={index}
                        type="button"
                        onClick={() => handleClick(index)}
                        onMouseEnter={() => handleMouseEnter(index)}
                        whileHover={editable ? { scale: 1.2 } : {}}
                        whileTap={editable ? { scale: 0.9 } : {}}
                        className={`p-1 rounded-full transition-colors focus:outline-none ${editable ? 'cursor-pointer' : 'cursor-default'}`}
                    >
                        <AnimatePresence>
                            {isFilled && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0 }}
                                    className="absolute inset-0"
                                >
                                    <Star className="w-8 h-8 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                        {/* Empty star base */}
                        <Star className={`w-8 h-8 transition-colors ${isFilled ? 'text-transparent' : 'text-gray-400/50'}`} />
                    </motion.button>
                );
            })}
        </div>
    );
};
//V's_new_end
