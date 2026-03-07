import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserStore } from '../store/useUserStore';
import { GlassCard } from '../components/ui/GlassCard';
import {
    Calendar, MapPin, Tag, X, AlertTriangle, CheckCircle,
    ChevronRight, Loader2, Clock, CreditCard, RotateCcw
} from 'lucide-react';

const BACKEND = 'http://localhost:5000';
const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const CANCEL_RULES = [
    { icon: '🕐', title: 'Cancelled 48+ hours before check-in', refund: '100% refund (full amount)' },
    { icon: '⏰', title: 'Cancelled 24–48 hours before check-in', refund: '50% refund of total amount' },
    { icon: '⚡', title: 'Cancelled within 24 hours of check-in', refund: 'No refund applicable' },
    { icon: '🏨', title: 'No-show (did not check in)', refund: 'No refund — room charged in full' },
];

// ─── Booking Detail Modal ──────────────────────────────────────────
const BookingModal = ({ booking, onClose, onCancel }: { booking: any; onClose: () => void; onCancel: () => void }) => {
    const hotel = booking.hotel;
    const nights = Math.max(1, Math.ceil(
        (new Date(booking.checkOutDate).getTime() - new Date(booking.checkInDate).getTime()) / 86400000
    ));
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={e => e.stopPropagation()}
                className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden max-h-[90vh] overflow-y-auto">
                {/* Hotel header */}
                <div className="relative h-44 bg-gradient-to-br from-[var(--tm-deep-indigo)] to-[var(--tm-ethereal-purple)]">
                    <div className="absolute inset-0 flex flex-col justify-end p-6">
                        <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">Your Reservation</p>
                        <h2 className="text-2xl font-serif font-black text-white">{hotel?.name || 'Hotel'}</h2>
                        <div className="flex items-center gap-1 mt-1">
                            <MapPin className="w-3.5 h-3.5 text-white/60" />
                            <span className="text-white/70 text-sm font-medium">{hotel?.address?.city}, {hotel?.address?.country}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-all">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Status badge */}
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-black border
                        ${booking.status === 'CONFIRMED' ? 'bg-green-50 border-green-100 text-green-700'
                            : booking.status === 'CANCELLED' ? 'bg-red-50 border-red-100 text-red-700'
                                : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                        {booking.status === 'CONFIRMED' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                        {booking.status}
                    </div>

                    {/* Details grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                            <div className="flex items-center gap-2 mb-1"><Calendar className="w-4 h-4 text-[var(--tm-ethereal-purple)]" /><p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Check-In</p></div>
                            <p className="font-black text-gray-900 text-sm">{fmtDate(booking.checkInDate)}</p>
                            <p className="text-xs text-gray-400 mt-0.5">From 12:00 PM</p>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                            <div className="flex items-center gap-2 mb-1"><Calendar className="w-4 h-4 text-green-500" /><p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Check-Out</p></div>
                            <p className="font-black text-gray-900 text-sm">{fmtDate(booking.checkOutDate)}</p>
                            <p className="text-xs text-gray-400 mt-0.5">By 12:00 PM</p>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                            <div className="flex items-center gap-2 mb-1"><Clock className="w-4 h-4 text-blue-400" /><p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Duration</p></div>
                            <p className="font-black text-gray-900 text-sm">{nights} Night{nights > 1 ? 's' : ''}</p>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                            <div className="flex items-center gap-2 mb-1"><CreditCard className="w-4 h-4 text-[var(--tm-ethereal-purple)]" /><p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Paid</p></div>
                            <p className="font-black text-[var(--tm-ethereal-purple)] text-sm">₹{booking.totalAmount?.toLocaleString('en-IN')}</p>
                        </div>
                    </div>

                    {/* Booking ID */}
                    <div className="flex items-center justify-between bg-purple-50 border border-purple-100 rounded-2xl px-4 py-3">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Booking ID</span>
                        <span className="font-mono text-sm font-black text-gray-900">{booking._id?.slice(-8).toUpperCase()}</span>
                    </div>

                    {/* Amenities */}
                    {hotel?.amenities?.length > 0 && (
                        <div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Included Amenities</p>
                            <div className="flex flex-wrap gap-2">
                                {hotel.amenities.map((am: string) => (
                                    <span key={am} className="bg-gray-100 text-gray-700 text-xs font-bold px-3 py-1 rounded-xl">{am}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Cancel button (only if CONFIRMED and not in past) */}
                    {booking.status === 'CONFIRMED' && new Date(booking.checkInDate) > new Date() && (
                        <button onClick={onCancel}
                            className="w-full py-3.5 border-2 border-red-200 text-red-600 hover:bg-red-50 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2">
                            <RotateCcw className="w-4 h-4" /> Cancel Booking
                        </button>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

// ─── Cancel Confirmation Modal ─────────────────────────────────────
const CancelModal = ({ booking, onConfirm, onClose, isLoading }: { booking: any; onConfirm: () => void; onClose: () => void; isLoading: boolean }) => {
    const hoursToCheckIn = (new Date(booking.checkInDate).getTime() - Date.now()) / 3600000;
    const refundPercent = hoursToCheckIn >= 48 ? 100 : hoursToCheckIn >= 24 ? 50 : 0;
    const refundAmount = Math.round((booking.totalAmount || 0) * refundPercent / 100);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={e => e.stopPropagation()}
                className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-br from-red-500 to-orange-500 p-6">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                        <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-xl font-serif font-black text-white mb-1">Cancel Your Booking?</h2>
                    <p className="text-white/80 text-sm font-medium">Please read our cancellation policy carefully before proceeding.</p>
                </div>

                <div className="p-6 space-y-5">
                    {/* Refund Calculator */}
                    <div className={`rounded-2xl p-4 border-2 ${refundPercent === 100 ? 'bg-green-50 border-green-200' : refundPercent === 50 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}`}>
                        <p className="text-xs font-black uppercase tracking-wider mb-1 text-gray-500">Your Estimated Refund</p>
                        <p className={`text-3xl font-black ${refundPercent === 100 ? 'text-green-600' : refundPercent === 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                            ₹{refundAmount.toLocaleString('en-IN')}
                        </p>
                        <p className="text-sm text-gray-500 font-medium mt-1">{refundPercent}% of ₹{booking.totalAmount?.toLocaleString('en-IN')} · Based on timing</p>
                    </div>

                    {/* Policy rules */}
                    <div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Cancellation Policy</p>
                        <div className="space-y-2.5">
                            {CANCEL_RULES.map(rule => (
                                <div key={rule.title} className="flex items-start gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                    <span className="text-lg flex-shrink-0">{rule.icon}</span>
                                    <div>
                                        <p className="text-xs font-bold text-gray-800">{rule.title}</p>
                                        <p className="text-xs text-gray-500 mt-0.5 font-medium">{rule.refund}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Warning */}
                    <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex items-start gap-3">
                        <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-orange-700 font-medium">This action is <strong>irreversible</strong>. Once cancelled, your booking cannot be reinstated.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={onClose} className="py-3.5 rounded-2xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all text-sm">
                            Keep Booking
                        </button>
                        <button onClick={onConfirm} disabled={isLoading}
                            className="py-3.5 rounded-2xl font-bold text-white bg-red-500 hover:bg-red-600 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><X className="w-4 h-4" /> Confirm Cancel</>}
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

// ─── Refund Confirmation Modal ─────────────────────────────────────
const RefundModal = ({ amount, onClose }: { amount: number; onClose: () => void }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}>
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.15 }}
                className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5 border-4 border-white shadow-xl">
                <CheckCircle className="w-10 h-10 text-green-500" />
            </motion.div>
            <h2 className="text-2xl font-serif font-black text-gray-900 mb-2">Booking Cancelled</h2>
            <p className="text-gray-500 font-medium mb-4 text-sm leading-relaxed">
                Your booking has been successfully cancelled.
                {amount > 0 ? (
                    <> A refund of <strong className="text-green-600">₹{amount.toLocaleString('en-IN')}</strong> will be processed to your original payment method.</>
                ) : ' No refund is applicable as per our cancellation policy.'}
            </p>
            {amount > 0 && (
                <div className="bg-green-50 border border-green-100 rounded-2xl p-4 mb-5 text-sm">
                    <p className="font-black text-green-700">⏱ Refund Timeline: 3–5 Business Days</p>
                    <p className="text-green-600 font-medium text-xs mt-1">You'll receive an email confirmation shortly.</p>
                </div>
            )}
            <button onClick={onClose}
                className="w-full py-3.5 rounded-2xl font-black text-white text-sm shadow-xl transition-all active:scale-95"
                style={{ background: 'linear-gradient(135deg, var(--tm-deep-indigo), var(--tm-ethereal-purple))' }}>
                Done
            </button>
        </motion.div>
    </motion.div>
);

// ─── Main Active Bookings Page ─────────────────────────────────────
export const SandboxBooking = () => {
    const { user } = useUserStore();
    const queryClient = useQueryClient();
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [cancelTarget, setCancelTarget] = useState<any>(null);
    const [refundAmount, setRefundAmount] = useState<number | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ['my-bookings', user?._id],
        enabled: !!user?._id,
        queryFn: async () => {
            const res = await fetch(`${BACKEND}/api/bookings/user/${user._id}`);
            if (!res.ok) throw new Error('Failed to fetch bookings');
            return res.json();
        },
    });

    const cancelMutation = useMutation({
        mutationFn: async (bookingId: string) => {
            const res = await fetch(`${BACKEND}/api/bookings/${bookingId}/cancel`, { method: 'PATCH' });
            if (!res.ok) throw new Error('Cancel failed');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
            const hoursToCheckIn = (new Date(cancelTarget.checkInDate).getTime() - Date.now()) / 3600000;
            const pct = hoursToCheckIn >= 48 ? 100 : hoursToCheckIn >= 24 ? 50 : 0;
            setRefundAmount(Math.round((cancelTarget.totalAmount || 0) * pct / 100));
            setCancelTarget(null);
            setSelectedBooking(null);
        },
    });

    const bookings: any[] = data || [];
    const active = bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'PENDING');
    const past = bookings.filter(b => b.status === 'CANCELLED' || b.status === 'COMPLETED');

    return (
        <div className="min-h-screen pt-24 pb-20 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-serif font-black text-gray-900 mb-1">Active Bookings</h1>
                    <p className="text-gray-500 font-medium">Manage your reservations and view details.</p>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-4 border-[var(--tm-ethereal-purple)] border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : bookings.length === 0 ? (
                    <GlassCard className="p-12 text-center border-gray-100 bg-white shadow-xl">
                        <div className="text-5xl mb-4">🏨</div>
                        <h2 className="text-xl font-black text-gray-900 mb-2">No Bookings Yet</h2>
                        <p className="text-gray-500 font-medium mb-6">Explore our premium hotels and make your first reservation.</p>
                        <a href="/search" className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-white text-sm shadow-xl transition-all"
                            style={{ background: 'linear-gradient(135deg, var(--tm-deep-indigo), var(--tm-ethereal-purple))' }}>
                            Discover Hotels <ChevronRight className="w-4 h-4" />
                        </a>
                    </GlassCard>
                ) : (
                    <div className="space-y-8">
                        {/* Active */}
                        {active.length > 0 && (
                            <section>
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Active Reservations</p>
                                <div className="space-y-4">
                                    {active.map(b => {
                                        const hotel = b.hotel;
                                        const nights = Math.max(1, Math.ceil(
                                            (new Date(b.checkOutDate).getTime() - new Date(b.checkInDate).getTime()) / 86400000
                                        ));
                                        return (
                                            <motion.div key={b._id} whileHover={{ y: -2 }}
                                                onClick={() => setSelectedBooking(b)}
                                                className="cursor-pointer">
                                                <GlassCard className="p-5 bg-white shadow-lg hover:shadow-xl border-gray-100 rounded-3xl transition-all">
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-16 h-16 bg-gradient-to-br from-[var(--tm-deep-indigo)] to-[var(--tm-ethereal-purple)] rounded-2xl flex items-center justify-center text-white font-black text-xl flex-shrink-0 shadow-lg shadow-[var(--tm-ethereal-purple)]/20">
                                                            {hotel?.name?.[0] || 'H'}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex justify-between items-start gap-2">
                                                                <h3 className="font-black text-gray-900 text-base truncate">{hotel?.name || 'Hotel'}</h3>
                                                                <span className="text-base font-black text-[var(--tm-ethereal-purple)] flex-shrink-0">₹{b.totalAmount?.toLocaleString('en-IN')}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1 mt-1">
                                                                <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                                                <span className="text-xs text-gray-500 font-medium">{hotel?.address?.city}, {hotel?.address?.country}</span>
                                                            </div>
                                                            <div className="flex items-center gap-3 mt-3 flex-wrap">
                                                                <span className="inline-flex items-center gap-1 bg-green-50 border border-green-100 text-green-700 text-xs font-black px-2.5 py-1 rounded-xl">
                                                                    <CheckCircle className="w-3 h-3" /> {b.status}
                                                                </span>
                                                                <span className="inline-flex items-center gap-1 text-gray-500 text-xs font-medium">
                                                                    <Calendar className="w-3 h-3" /> {fmtDate(b.checkInDate)} – {fmtDate(b.checkOutDate)}
                                                                </span>
                                                                <span className="inline-flex items-center gap-1 text-gray-400 text-xs font-medium">
                                                                    <Tag className="w-3 h-3" /> {nights} night{nights > 1 ? 's' : ''}
                                                                </span>
                                                                <span className="text-xs text-[var(--tm-ethereal-purple)] font-black ml-auto flex items-center gap-1">
                                                                    View Details <ChevronRight className="w-3 h-3" />
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </GlassCard>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </section>
                        )}

                        {/* Past */}
                        {past.length > 0 && (
                            <section>
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Past Reservations</p>
                                <div className="space-y-3">
                                    {past.map(b => {
                                        const hotel = b.hotel;
                                        return (
                                            <GlassCard key={b._id} className="p-4 bg-gray-50 border-gray-100 opacity-70 rounded-2xl">
                                                <div className="flex justify-between items-center gap-4">
                                                    <div>
                                                        <h3 className="font-bold text-gray-700 text-sm">{hotel?.name || 'Hotel'}</h3>
                                                        <p className="text-xs text-gray-400">{fmtDate(b.checkInDate)} – {fmtDate(b.checkOutDate)}</p>
                                                    </div>
                                                    <span className={`text-xs font-black px-2.5 py-1 rounded-xl border ${b.status === 'CANCELLED' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-gray-100 border-gray-200 text-gray-500'}`}>
                                                        {b.status}
                                                    </span>
                                                </div>
                                            </GlassCard>
                                        );
                                    })}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </div>

            {/* Modals */}
            <AnimatePresence>
                {selectedBooking && !cancelTarget && (
                    <BookingModal booking={selectedBooking} onClose={() => setSelectedBooking(null)}
                        onCancel={() => setCancelTarget(selectedBooking)} />
                )}
                {cancelTarget && (
                    <CancelModal booking={cancelTarget} isLoading={cancelMutation.isPending}
                        onConfirm={() => cancelMutation.mutate(cancelTarget._id)}
                        onClose={() => setCancelTarget(null)} />
                )}
                {refundAmount !== null && (
                    <RefundModal amount={refundAmount} onClose={() => setRefundAmount(null)} />
                )}
            </AnimatePresence>
        </div>
    );
};
