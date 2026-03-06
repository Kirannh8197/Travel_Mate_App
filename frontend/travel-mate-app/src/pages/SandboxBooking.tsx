//V's_new_start
import React, { useState } from 'react';
import { useUserStore } from '../store/useUserStore';

// Simple context to hold booking state between the "steps"
const SandboxBookingContext = React.createContext<any>(null);

export const SandboxBooking = () => {
    const [step, setStep] = useState(1);
    const [bookingId, setBookingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const { user } = useUserStore(); // Using the Zustand store

    // Mock data for sandbox
    const hotelId = "507f1f77bcf86cd799439011";
    const roomTypeId = "507f1f77bcf86cd799439012";
    const userId = user?._id || "507f1f77bcf86cd799439010";

    const handleHoldRoom = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/v1/bookings/hold`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    hotelId,
                    roomTypeId,
                    checkInDate: new Date().toISOString(),
                    checkOutDate: new Date(Date.now() + 86400000).toISOString(),
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Hold failed');

            setBookingId(data._id);
            setStep(2);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleConfirmPayment = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/v1/bookings/${bookingId}/confirm`, {
                method: 'PATCH',
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Confirm failed');

            setStep(3);
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <SandboxBookingContext.Provider value={{ bookingId, setBookingId, step, setStep }}>
            <div className="p-6 max-w-md mx-auto border rounded-xl mt-10">
                <h1 className="text-xl font-bold mb-4">Booking Flow Sandbox</h1>

                {error && <div className="p-3 bg-red-100 text-red-700 rounded mb-4">{error}</div>}

                {step === 1 && (
                    <div>
                        <h2 className="text-md font-semibold mb-2">Step 1: Select Room (Trigger 15-min TTL Hold)</h2>
                        <button
                            onClick={handleHoldRoom}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Hold Room
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div>
                        <h2 className="text-md font-semibold mb-2">Step 2: Awaiting Payment (Status: PENDING)</h2>
                        <p className="text-sm mb-4">Booking ID: {bookingId}</p>
                        <button
                            onClick={handleConfirmPayment}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        >
                            Simulate Payment Success
                        </button>
                    </div>
                )}

                {step === 3 && (
                    <div>
                        <h2 className="text-md font-bold text-green-600 mb-2">Booking Confirmed! (Status: CONFIRMED)</h2>
                        <p className="text-sm">The 2-phase commit transaction loop is successful.</p>
                    </div>
                )}

                {/* 
 * Testing Checklist:
 * [ ] Verify Step 1 correctly executes a MongoDB Transaction and decrements RoomAvailability.
 * [ ] Verify the database shows a PENDING booking.
 * [ ] Verify Step 2 execution calls /confirm and updates status to CONFIRMED.
 */}
            </div>
        </SandboxBookingContext.Provider>
    );
};
//V's_new_end
