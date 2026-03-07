import { useEffect, useState, useRef } from 'react';
import { useUserStore } from '../../store/useUserStore';
import { GlassCard } from './GlassCard';
import { Calendar, Building, Bell, CheckCircle, PlusCircle, Pencil, Upload, X, ImagePlus, Loader2, Save, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const BACKEND = 'http://localhost:5000';
const AMENITY_OPTIONS = ['WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Bar', 'Valet', 'Parking'];
const imgUrl = (p: string) => !p ? '' : p.startsWith('http') ? p : p.startsWith('/') ? `${BACKEND}${p}` : `${BACKEND}/uploads/${p}`;

// ─── Edit Modal ──────────────────────────────────────────────────────
const EditHotelModal = ({ hotel, onClose, onSaved }: { hotel: any; onClose: () => void; onSaved: (updated: any) => void }) => {
    const [name, setName] = useState(hotel.name || '');
    const [description, setDescription] = useState(hotel.description || '');
    const [price, setPrice] = useState(String(hotel.pricePerNight || ''));
    const [amenities, setAmenities] = useState<string[]>(hotel.amenities || []);
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [saveError, setSaveError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const toggleAmenity = (am: string) =>
        setAmenities(prev => prev.includes(am) ? prev.filter(a => a !== am) : [...prev, am]);

    const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setNewFiles(files);
        setPreviews(files.map(f => URL.createObjectURL(f)));
    };

    const handleSave = async () => {
        setSaving(true);
        setSaveError('');
        const fd = new FormData();
        fd.append('name', name);
        fd.append('description', description);
        fd.append('pricePerNight', price);
        fd.append('amenities', JSON.stringify(amenities));
        newFiles.forEach(f => fd.append('images', f));
        // Use _id (MongoDB ObjectId) — backend now accepts both ObjectId and numeric hotelId
        const hotelIdentifier = hotel._id;
        try {
            const res = await fetch(`${BACKEND}/api/hotel/${hotelIdentifier}/edit`, { method: 'PATCH', body: fd });
            const json = await res.json();
            if (res.ok) {
                setSaved(true);
                await new Promise(r => setTimeout(r, 1200));
                onSaved(json.data);
            } else {
                setSaveError(json.message || 'Save failed. Please try again.');
            }
        } catch (e: any) {
            setSaveError('Network error: ' + e.message);
        }
        setSaving(false);
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={e => e.stopPropagation()}
                className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-br from-[var(--tm-deep-indigo)] to-[var(--tm-ethereal-purple)] p-6 text-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">Host Dashboard</p>
                            <h2 className="text-2xl font-serif font-black">Edit Your Hotel</h2>
                        </div>
                        <button onClick={onClose} className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-5">
                    {/* Name */}
                    <div>
                        <label className="text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5 block">Hotel Name</label>
                        <input value={name} onChange={e => setName(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl text-sm font-bold focus:border-[var(--tm-ethereal-purple)] focus:outline-none focus:ring-4 focus:ring-[var(--tm-ethereal-purple)]/10 transition-all" />
                    </div>
                    {/* Description */}
                    <div>
                        <label className="text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5 block">Description</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl text-sm font-medium focus:border-[var(--tm-ethereal-purple)] focus:outline-none focus:ring-4 focus:ring-[var(--tm-ethereal-purple)]/10 transition-all resize-none" />
                    </div>
                    {/* Price */}
                    <div>
                        <label className="text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5 block">Price Per Night (₹)</label>
                        <input value={price} onChange={e => setPrice(e.target.value)} type="number"
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl text-sm font-bold focus:border-[var(--tm-ethereal-purple)] focus:outline-none focus:ring-4 focus:ring-[var(--tm-ethereal-purple)]/10 transition-all" />
                    </div>
                    {/* Amenities */}
                    <div>
                        <label className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2 block">Amenities</label>
                        <div className="flex flex-wrap gap-2">
                            {AMENITY_OPTIONS.map(am => (
                                <button key={am} onClick={() => toggleAmenity(am)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all border ${amenities.includes(am) ? 'bg-[var(--tm-ethereal-purple)] text-white border-transparent' : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-400'}`}>
                                    {am}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Photo Upload */}
                    <div>
                        <label className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2 block">
                            Photos {newFiles.length > 0 ? <span className="text-[var(--tm-ethereal-purple)]">({newFiles.length} new selected — will replace existing)</span> : <span className="text-gray-400">(Upload to replace existing photos)</span>}
                        </label>
                        <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />

                        {/* Current photos preview */}
                        {previews.length === 0 && hotel.images?.length > 0 && (
                            <div className="flex gap-2 flex-wrap mb-3">
                                {hotel.images.slice(0, 4).map((img: string, i: number) => (
                                    <div key={i} className="w-16 h-12 rounded-xl overflow-hidden border-2 border-gray-200">
                                        <img src={imgUrl(img)} alt="" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                                {hotel.images.length > 4 && <div className="w-16 h-12 rounded-xl bg-gray-100 border-2 border-gray-200 flex items-center justify-center text-xs font-black text-gray-500">+{hotel.images.length - 4}</div>}
                            </div>
                        )}
                        {previews.length > 0 && (
                            <div className="flex gap-2 flex-wrap mb-3">
                                {previews.map((p, i) => (
                                    <div key={i} className="w-16 h-12 rounded-xl overflow-hidden border-2 border-[var(--tm-ethereal-purple)]">
                                        <img src={p} alt="" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        )}

                        <button onClick={() => fileInputRef.current?.click()}
                            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-2xl text-sm font-bold text-gray-500 hover:border-[var(--tm-ethereal-purple)] hover:text-[var(--tm-ethereal-purple)] transition-all flex items-center justify-center gap-2">
                            <ImagePlus className="w-4 h-4" />
                            {newFiles.length > 0 ? `${newFiles.length} photo${newFiles.length > 1 ? 's' : ''} selected — click to change` : 'Select new photos'}
                        </button>
                    </div>

                    {/* Save button */}
                    {saveError && (
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-sm text-red-700 font-bold">
                            ⚠ {saveError}
                        </div>
                    )}
                    <button onClick={handleSave} disabled={saving || saved}
                        className="w-full py-4 rounded-2xl font-black text-white text-base shadow-xl shadow-[var(--tm-ethereal-purple)]/20 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
                        style={{ background: 'linear-gradient(135deg, var(--tm-deep-indigo), var(--tm-ethereal-purple))' }}>
                        {saving ? <><Loader2 className="w-5 h-5 animate-spin" />Saving…</>
                            : saved ? <><Check className="w-5 h-5" />Saved!</>
                                : <><Save className="w-5 h-5" />Save Changes</>}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

// ─── Host Dashboard ──────────────────────────────────────────────────
export const HostDashboard = () => {
    const { user, role } = useUserStore();
    const [bookings, setBookings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editOpen, setEditOpen] = useState(false);
    const [hotelData, setHotelData] = useState<any>(user);

    useEffect(() => {
        const fetchHostData = async () => {
            if (!user?.email || role !== "HOTEL_HOST") return;
            setIsLoading(true);
            try {
                // 1. Fetch the actual Hotel document by email to get the correct _id and metadata
                // This resolves the mismatch if the host is logged in with a User record ID
                const hotelRes = await fetch(`${BACKEND}/api/hotel/approved`);
                const allHotels = await hotelRes.json();
                const actualHotel = allHotels.data.find((h: any) => h.email.toLowerCase() === user.email.toLowerCase());
                
                if (actualHotel) {
                    setHotelData(actualHotel);
                    
                    // 2. Fetch bookings using the Hotel's real MongoDB _id
                    const bookingsRes = await fetch(`${BACKEND}/api/bookings/hotel/${actualHotel._id}`);
                    if (bookingsRes.ok) {
                        const bData = await bookingsRes.json();
                        setBookings(bData);
                    }
                }
            } catch (error) { 
                console.error("Failed to fetch host dashboard data:", error); 
            } finally { 
                setIsLoading(false); 
            }
        };
        fetchHostData();
    }, [user, role]);

    if (!user || role !== "HOTEL_HOST") return <div className="p-8 text-center text-red-400">Restricted Access. Hotel Hosts only.</div>;

    return (
        <div className="pt-24 min-h-screen px-4 pb-12">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">Host Command Center</h1>
                    <p className="text-gray-600 font-medium">Manage your premium listings and guest reservations.</p>
                </div>
                <div className="px-4 py-2 bg-blue-50 border border-blue-100 shadow-sm rounded-xl flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm font-bold text-[var(--tm-ethereal-purple)]">Status: {hotelData.status || 'APPROVED'}</span>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Add Property Widget (only if no bookings yet) */}
                {bookings.length === 0 && (
                    <div className="md:col-span-3 mb-4">
                        <Link to="/list-hotel" className="w-full relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-[var(--tm-deep-indigo)] to-[var(--tm-ethereal-purple)] flex items-center justify-between text-white group shadow-xl hover:-translate-y-1 transition-transform border border-purple-400">
                            <div>
                                <h3 className="text-2xl font-black mb-1">List New Property</h3>
                                <p className="text-white/80 font-medium">Add a sanctuary to the TravelMate network.</p>
                            </div>
                            <PlusCircle className="w-10 h-10 group-hover:scale-110 transition-transform" />
                        </Link>
                    </div>
                )}

                {/* Property Card */}
                <div className="md:col-span-1 border border-gray-200 rounded-3xl overflow-hidden shadow-xl bg-white">
                    {/* Hotel hero image */}
                    <div className="h-32 relative bg-gradient-to-br from-[var(--tm-deep-indigo)] to-[var(--tm-ethereal-purple)]">
                        {hotelData.images?.[0] && (
                            <img src={imgUrl(hotelData.images[0])} alt="" className="absolute inset-0 w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        {/* Edit button */}
                        <button onClick={() => setEditOpen(true)}
                            className="absolute top-3 right-3 w-9 h-9 bg-white/20 hover:bg-white/40 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
                            title="Edit hotel details">
                            <Pencil className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="p-6 relative -mt-12">
                        <div className="w-16 h-16 rounded-2xl bg-white border border-gray-100 flex items-center justify-center mb-4 shadow-lg">
                            <Building className="w-8 h-8 text-[var(--tm-liquid-blue)]" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-0.5">{hotelData.name}</h2>
                        <p className="text-sm text-gray-500 font-medium mb-1">{hotelData.address?.city}, {hotelData.address?.country}</p>
                        {hotelData.description && <p className="text-xs text-gray-400 font-medium mb-4 line-clamp-2">{hotelData.description}</p>}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                                <span className="text-gray-500 font-bold">Nightly Rate</span>
                                <span className="text-gray-900 font-mono font-bold text-lg">₹{hotelData.pricePerNight || 0}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                                <span className="text-gray-500 font-bold">Total Bookings</span>
                                <span className="text-gray-900 font-mono font-bold text-lg">{bookings.length}</span>
                            </div>
                            {hotelData.amenities?.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                    {hotelData.amenities.slice(0, 4).map((am: string) => (
                                        <span key={am} className="text-xs font-bold bg-purple-50 text-[var(--tm-ethereal-purple)] border border-purple-100 px-2 py-0.5 rounded-lg">{am}</span>
                                    ))}
                                    {hotelData.amenities.length > 4 && <span className="text-xs text-gray-400 font-bold">+{hotelData.amenities.length - 4}</span>}
                                </div>
                            )}
                        </div>
                        <button onClick={() => setEditOpen(true)}
                            className="mt-5 w-full py-2.5 rounded-2xl text-sm font-black text-[var(--tm-ethereal-purple)] border-2 border-[var(--tm-ethereal-purple)]/30 hover:bg-purple-50 transition-all flex items-center justify-center gap-2">
                            <Pencil className="w-4 h-4" /> Edit Hotel Details
                        </button>
                    </div>
                </div>

                {/* Live Guest Activity */}
                <div className="md:col-span-2">
                    <GlassCard className="p-6 h-full flex flex-col bg-white/80 shadow-xl border-gray-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                <Bell className="w-6 h-6 text-[var(--tm-liquid-blue)]" /> Live Guest Activity
                            </h2>
                            <span className="text-xs font-bold px-2 py-1 rounded-md bg-green-50 text-green-600 border border-green-100">Auto-Confirm Active</span>
                        </div>
                        {isLoading ? (
                            <div className="flex-grow flex items-center justify-center"><div className="w-8 h-8 border-2 border-[var(--tm-liquid-blue)] border-t-transparent rounded-full animate-spin" /></div>
                        ) : bookings.length === 0 ? (
                            <div className="flex-grow flex flex-col items-center justify-center text-center p-8 border border-gray-200 rounded-xl bg-gray-50">
                                <Calendar className="w-12 h-12 text-gray-400 mb-4" />
                                <p className="text-gray-500 font-bold">Your registry is clean. Awaiting new guests.</p>
                            </div>
                        ) : (
                            <div className="space-y-4 overflow-y-auto pr-2 max-h-[500px]">
                                {bookings.map((b, i) => (
                                    <motion.div key={b._id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                                        className="p-5 border border-green-100 rounded-xl bg-gradient-to-r from-green-50/50 to-emerald-50/50 hover:shadow-md transition-all relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
                                        <div className="ml-4 flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                                    <h3 className="font-bold text-gray-900">New Booking Received</h3>
                                                </div>
                                                <p className="text-sm text-gray-600 font-medium">Guest <span className="text-[var(--tm-liquid-blue)] font-bold">{b.user?.name || b.user}</span> booked for {new Date(b.checkInDate).toLocaleDateString()}</p>
                                                <p className="text-xs text-gray-400 mt-2 font-mono font-bold tracking-wider">Ref: {b._id.substring(0, 8).toUpperCase()}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-2xl font-black text-[var(--tm-ethereal-purple)]">₹{b.totalAmount}</span>
                                                <p className="text-xs text-green-600 mt-1 uppercase font-bold tracking-wider bg-green-100/50 inline-block px-2 py-0.5 rounded border border-green-200">{b.status}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </GlassCard>
                </div>
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {editOpen && (
                    <EditHotelModal hotel={hotelData} onClose={() => setEditOpen(false)}
                        onSaved={(updated) => { setHotelData(updated); setEditOpen(false); }} />
                )}
            </AnimatePresence>
        </div>
    );
};
