//V's_new_start
import { useEffect, useState } from 'react';
import { useUserStore } from '../../store/useUserStore';
import { GlassCard } from './GlassCard';
import { Calendar, User, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export const UserDashboard = () => {
    const { user } = useUserStore();
    const [bookings, setBookings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            if (!user?._id) return;
            try {
                const response = await fetch(`http://localhost:5000/api/bookings/user/${user._id}`);
                if (response.ok) {
                    const data = await response.json();
                    setBookings(data);
                }
            } catch (error) {
                console.error("Failed to fetch bookings:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBookings();
    }, [user]);

    if (!user) return <div className="p-8 text-center text-red-400">Please sign in.</div>;

    return (
        <div className="pt-24 min-h-screen px-4 pb-12">
            <h1 className="text-4xl font-serif font-bold text-gray-900 mb-8 drop-shadow-sm">Traveler Portal</h1>
            
            <div className="grid md:grid-cols-3 gap-8">
                {/* Profile Widget */}
                <div className="md:col-span-1">
                    <GlassCard className="p-6 bg-white/80 shadow-xl border-gray-100">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shadow-sm">
                                <User className="w-8 h-8 text-[var(--tm-liquid-blue)]" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                                <p className="text-sm font-bold text-[var(--tm-ethereal-purple)]">Premium Member</p>
                            </div>
                        </div>
                        <div className="space-y-3 text-sm text-gray-500 font-medium">
                            <p className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-400">Email:</span> <span className="text-gray-900">{user.email}</span></p>
                            <p className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-400">User ID:</span> <span className="text-gray-900 font-mono">{user.userId}</span></p>
                        </div>
                    </GlassCard>
                </div>

                {/* Active Bookings Widget */}
                <div className="md:col-span-2">
                    <GlassCard className="p-6 h-full border border-gray-200 shadow-xl bg-white/80">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Calendar className="w-6 h-6 text-[var(--tm-liquid-blue)] drop-shadow-sm" /> Active Reservations
                        </h2>
                        
                        {isLoading ? (
                            <div className="flex justify-center p-8"><div className="w-8 h-8 border-2 border-[var(--tm-liquid-blue)] border-t-transparent rounded-full animate-spin" /></div>
                        ) : bookings.length === 0 ? (
                            <div className="text-center p-8 border border-gray-200 rounded-xl bg-gray-50 shadow-inner">
                                <p className="text-gray-500 font-bold">No active sanctuaries found.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {bookings.map((b, i) => (
                                    <motion.div 
                                        key={b._id} 
                                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                                        className="p-5 border border-indigo-100/50 rounded-xl bg-gradient-to-r from-blue-50/50 to-purple-50/50 hover:shadow-md transition-all shadow-sm"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-lg">{b.hotel?.name || 'Grand Obsidian Suite'}</h3>
                                                <p className="text-sm text-green-600 font-mono font-bold tracking-widest bg-green-50 inline-block px-2 py-0.5 rounded-md border border-green-100 mt-1">{b.status}</p>
                                            </div>
                                            <span className="text-[var(--tm-ethereal-purple)] font-extrabold text-xl">₹{b.totalAmount}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-4 font-medium">
                                            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                <span>{new Date(b.checkInDate).toLocaleDateString()} - {new Date(b.checkOutDate).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                                                <MapPin className="w-4 h-4 text-gray-400" />
                                                <span>Global Access</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};
//V's_new_end
