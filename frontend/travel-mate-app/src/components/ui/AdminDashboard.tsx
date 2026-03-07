//V's_new_start
import { useEffect, useState } from 'react';
import { useUserStore } from '../../store/useUserStore';
import { GlassCard } from './GlassCard';
import { ShieldAlert, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const AdminDashboard = () => {
    const { user, role } = useUserStore();
    const [hotels, setHotels] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHotels = async () => {
            if (role !== "ADMIN") return;
            try {
                const response = await fetch(`http://localhost:5000/api/hotel`, {
                    headers: { 'userid': user?.userId?.toString() || '' } // Using mock admin header if implemented
                });
                if (response.ok) {
                    const data = await response.json();
                    setHotels(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch hotels for admin:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHotels();
    }, [role]);

    const handleAction = async (hotelId: number, status: 'APPROVED' | 'REJECTED') => {
        try {
            const action = status === 'APPROVED' ? 'approve' : 'reject';
            const res = await fetch(`http://localhost:5000/api/hotel/${hotelId}/${action}`, {
                method: 'PATCH',
                headers: { 'userid': user?.userId?.toString() || '' }
            });
            
            if (res.ok) {
                setHotels(prev => prev.map(h => h.hotelId === hotelId ? { ...h, status } : h));
            } else {
                alert("Action failed. Check console.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (role !== "ADMIN") {
        return <div className="p-8 text-center text-red-400">Restricted Access. Admins only.</div>;
    }

    const pendingHotels = hotels.filter(h => h.status === 'PENDING_VERIFICATION');
    const processedHotels = hotels.filter(h => h.status !== 'PENDING_VERIFICATION');

    return (
        <div className="pt-24 min-h-screen px-4">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">Global Governance</h1>
                    <p className="text-gray-500 font-medium">Review, approve, and reject partner applications.</p>
                </div>
                <div className="w-12 h-12 bg-red-50 rounded-xl border border-red-100 flex items-center justify-center shadow-sm">
                    <ShieldAlert className="w-6 h-6 text-red-500 drop-shadow-sm" />
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Pending Verification */}
                <GlassCard className="p-6 h-fit border border-orange-200 shadow-xl bg-white/90">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-orange-500 animate-pulse shadow-sm" /> Pending Approval
                    </h2>

                    {isLoading ? (
                        <div className="flex justify-center p-8"><div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>
                    ) : pendingHotels.length === 0 ? (
                        <div className="text-center p-8 border border-gray-100 rounded-xl bg-gray-50 shadow-inner">
                            <p className="text-gray-500 font-bold">All applications processed.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {pendingHotels.map((h, i) => (
                                <motion.div 
                                    key={h.hotelId} 
                                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                                    className="p-5 border border-gray-100 rounded-xl bg-white shadow-sm hover:shadow-md transition-all"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg">{h.name}</h3>
                                            <p className="text-sm text-gray-500 font-mono mt-1">Host: {h.email}</p>
                                        </div>
                                        <span className="text-xs px-2.5 py-1 rounded-md bg-orange-50 text-orange-600 font-bold tracking-wider border border-orange-100 shadow-sm">PENDING</span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-600 mb-5">{h.address?.city}, {h.address?.state && `${h.address.state}, `}{h.address?.country}</p>
                                    
                                    <div className="flex gap-3">
                                        <button 
                                            onClick={() => handleAction(h.hotelId, 'APPROVED')}
                                            className="flex-1 py-2.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-500 hover:text-white transition-colors border border-green-200 flex justify-center items-center gap-2 font-bold text-sm shadow-sm hover:shadow-md"
                                        >
                                            <CheckCircle className="w-4 h-4" /> Approve
                                        </button>
                                        <button 
                                            onClick={() => handleAction(h.hotelId, 'REJECTED')}
                                            className="flex-1 py-2.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-colors border border-red-100 flex justify-center items-center gap-2 font-bold text-sm shadow-sm hover:shadow-md"
                                        >
                                            <XCircle className="w-4 h-4" /> Reject
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </GlassCard>

                {/* Audit Log */}
                <GlassCard className="p-6 h-fit bg-gray-50/80 border-gray-200 shadow-lg">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-4">Recent Processed</h2>
                    
                    <div className="space-y-3">
                        {processedHotels.slice(0, 10).map((h) => (
                            <div key={h.hotelId} className="flex justify-between items-center p-4 border border-gray-100 rounded-lg bg-white shadow-sm">
                                <div>
                                    <h4 className="text-gray-900 text-sm font-bold">{h.name}</h4>
                                    <p className="text-xs text-gray-500 font-mono mt-0.5">{h.hotelId}</p>
                                </div>
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-md shadow-sm ${h.status === 'APPROVED' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                                    {h.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};
//V's_new_end
