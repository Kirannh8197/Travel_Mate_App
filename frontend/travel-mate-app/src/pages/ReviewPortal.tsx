import React, { useState } from 'react';
import { useUserStore } from '../store/useUserStore';
import { InteractiveStarRating } from '../components/ui/InteractiveStarRating';
import { GlassCard } from '../components/ui/GlassCard';

export const ReviewPortal = () => {
    const { isAuthenticated, user } = useUserStore();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [status, setStatus] = useState<string | null>(null);

    // Mock hotel to review
    const hotelId = "6650"; // Using the custom numeric ID assumed by the backend

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAuthenticated) {
            setStatus('Error: You must be logged in.');
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reviewId: Math.floor(Math.random() * 100000), // Random numeric ID for testing
                    userId: user?.userId || "6650", // Custom numeric user ID
                    hotelId: hotelId,
                    rating,
                    comment
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Review failed');

            setStatus('Review submitted successfully!');
        } catch (err: any) {
            setStatus(`Error: ${err.message}`);
        }
    };

    return (
        <div className="pt-24 min-h-screen px-4 pb-12 w-full max-w-lg mx-auto">
            <GlassCard className="p-8 shadow-xl bg-white/80 border-gray-200">
                <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">Review Portal</h1>
                <p className="text-sm text-gray-500 mb-8 font-medium">
                    Testing Trust System Logic for Hotel #{hotelId}
                </p>

                {status && (
                    <div className={`p-4 rounded-xl mb-6 text-sm font-bold shadow-sm ${status.startsWith('Error') ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                        {status}
                    </div>
                )}

                {!isAuthenticated ? (
                    <div className="p-4 bg-yellow-50 border border-yellow-100 text-yellow-800 rounded-xl font-medium shadow-sm">
                        Please log in via the global Zustand store to submit a review.
                    </div>
                ) : (
                    <form onSubmit={handleSubmitReview} className="space-y-6">
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col items-center">
                            <label className="block text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">Tap to Rate</label>
                            <InteractiveStarRating rating={rating} setRating={setRating} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Your Experience</label>
                            <textarea
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                placeholder="Describe your stay..."
                                className="w-full bg-white border border-gray-200 p-4 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[var(--tm-ethereal-purple)] focus:ring-4 focus:ring-[var(--tm-ethereal-purple)]/10 transition-all shadow-sm"
                                rows={4}
                            />
                        </div>
                        <button type="submit" className="w-full bg-gradient-to-r from-[var(--tm-ethereal-purple)] to-[var(--tm-deep-indigo)] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[var(--tm-ethereal-purple)]/30 hover:shadow-[var(--tm-ethereal-purple)]/50 transform hover:-translate-y-0.5 transition-all">
                            Submit Verification
                        </button>
                    </form>
                )}

            {/* 
 * Testing Checklist:
 * [ ] Verify the global Zustand store accurately restricts the UI form.
 * [ ] Verify the backend blocks the review if NO COMPLETED booking exists.
 */}
            </GlassCard>
        </div>
    );
};
//V's_new_end
