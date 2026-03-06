//V's_new_start
import React, { useState } from 'react';
import { useUserStore } from '../store/useUserStore';

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
        <div className="p-6 max-w-md mx-auto border rounded-xl mt-10">
            <h1 className="text-xl font-bold mb-4">Review Portal</h1>
            <p className="text-sm text-gray-600 mb-4">
                Testing Trust System Logic for Hotel #{hotelId}
            </p>

            {status && (
                <div className={`p-3 rounded mb-4 text-sm ${status.startsWith('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {status}
                </div>
            )}

            {!isAuthenticated ? (
                <div className="p-4 bg-yellow-50 text-yellow-800 rounded">
                    Please log in via the global Zustand store to submit a review.
                </div>
            ) : (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Rating (1-5)</label>
                        <input
                            type="number"
                            min="1" max="5"
                            value={rating}
                            onChange={e => setRating(Number(e.target.value))}
                            className="w-full border p-2 rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Comment</label>
                        <textarea
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            className="w-full border p-2 rounded"
                            rows={3}
                        />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">
                        Submit Review
                    </button>
                </form>
            )}

            {/* 
 * Testing Checklist:
 * [ ] Verify the global Zustand store accurately restricts the UI form.
 * [ ] Verify the backend blocks the review if NO COMPLETED booking exists.
 */}
        </div>
    );
};
//V's_new_end
