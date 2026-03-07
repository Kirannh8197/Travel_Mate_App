import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Star, Wifi, Waves, Dumbbell, UtensilsCrossed, Car, Wine, BedDouble, Users, Baby, Clock, ChevronLeft, ChevronRight, Moon } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { LiquidButton } from '../components/ui/LiquidButton';
import { useUserStore } from '../store/useUserStore';
import { PremiumCalendar } from '../components/ui/PremiumCalendar';

const BACKEND = 'http://localhost:5000';
// Handle all image path formats: bare filename, /uploads/file, or full URL
const imgUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    if (path.startsWith('/')) return `${BACKEND}${path}`;
    return `${BACKEND}/uploads/${path}`;
};

const AMENITY_ICONS: Record<string, any> = {
    WiFi: Wifi, Pool: Waves, Gym: Dumbbell,
    Restaurant: UtensilsCrossed, Valet: Car, Bar: Wine,
};

const ROOM_TYPES = [
    { id: 'solo', label: 'Solo Escape', subtext: 'Perfect for lone explorers', icon: BedDouble, multiplier: 1.0 },
    { id: 'couple', label: 'Couples Retreat', subtext: 'Romance & luxury together', icon: Users, multiplier: 1.2 },
    { id: 'family', label: 'Family Suite', subtext: 'Space for everyone you love', icon: Baby, multiplier: 1.6 },
];



export const HotelDetailPage = () => {
    const { hotelId } = useParams<{ hotelId: string }>();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useUserStore();

    const [hotel, setHotel] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);
    const [roomType, setRoomType] = useState('solo');
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');


    useEffect(() => {
        const fetchHotel = async () => {
            try {
                const res = await fetch(`${BACKEND}/api/hotel/${hotelId}`);
                if (!res.ok) throw new Error('Hotel not found');
                const data = await res.json();
                setHotel(data.data);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchHotel();
    }, [hotelId]);

    const nights = (checkIn && checkOut)
        ? Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
        : 1;

    const selected = ROOM_TYPES.find(r => r.id === roomType) || ROOM_TYPES[0];
    const basePrice = hotel?.pricePerNight || 0;
    const totalPrice = Math.round(basePrice * selected.multiplier * nights);
    const taxes = Math.round(totalPrice * 0.18);
    const grand = totalPrice + taxes;

    const handleBook = () => {
        if (!isAuthenticated || !user) {
            navigate('/');
            return;
        }
        if (!checkIn || !checkOut) return;
        navigate('/payment', {
            state: {
                hotelName: hotel.name,
                hotelMongoId: hotel._id,
                hotelLng: hotel.location?.coordinates?.[0],
                hotelLat: hotel.location?.coordinates?.[1],
                roomLabel: selected.label,
                roomType,
                nights,
                checkIn,
                checkOut,
                grand,
            },
        });
    };

    const nextImg = () => setActiveImage(p => (p + 1) % (hotel?.images?.length || 1));
    const prevImg = () => setActiveImage(p => (p - 1 + (hotel?.images?.length || 1)) % (hotel?.images?.length || 1));

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-[var(--tm-ethereal-purple)] border-t-transparent rounded-full animate-spin" />
        </div>
    );
    if (!hotel) return (
        <div className="min-h-screen flex items-center justify-center text-gray-500 text-xl">Hotel not found.</div>
    );

    const images = hotel.images?.length ? hotel.images : ['https://images.unsplash.com/photo-1542314831-c6a4d14d8376?w=1200&h=700&fit=crop'];



    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full pb-20 pt-24 max-w-7xl mx-auto px-4">
            <button onClick={() => navigate('/search')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold mb-8 transition-colors group">
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back to Search
            </button>

            <div className="grid lg:grid-cols-5 gap-10">
                {/* Left: Images + Info */}
                <div className="lg:col-span-3 space-y-8">
                    <GlassCard className="p-0 overflow-hidden rounded-3xl shadow-2xl border-gray-100">
                        <div className="relative h-80 md:h-[480px] bg-gray-100 group">
                            <AnimatePresence mode="wait">
                                <motion.img key={activeImage}
                                    src={imgUrl(images[activeImage])}
                                    alt={`${hotel.name} ${activeImage + 1}`}
                                    className="absolute inset-0 w-full h-full object-cover"
                                    initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                                    transition={{ duration: 0.5 }}
                                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542314831-c6a4d14d8376?w=1200&h=700&fit=crop'; }}
                                />
                            </AnimatePresence>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                            {images.length > 1 && (
                                <>
                                    <button onClick={prevImg} className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/90 backdrop-blur-md hover:bg-white rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-110">
                                        <ChevronLeft className="w-5 h-5 text-gray-900" />
                                    </button>
                                    <button onClick={nextImg} className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/90 backdrop-blur-md hover:bg-white rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-110">
                                        <ChevronRight className="w-5 h-5 text-gray-900" />
                                    </button>
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                        {images.map((_: string, i: number) => (
                                            <button key={i} onClick={() => setActiveImage(i)}
                                                className={`h-2 rounded-full transition-all ${i === activeImage ? 'bg-white w-6' : 'bg-white/50 w-2'}`} />
                                        ))}
                                    </div>
                                </>
                            )}
                            <div className="absolute bottom-5 right-5 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-gray-700 shadow-lg">
                                {activeImage + 1} / {images.length}
                            </div>
                        </div>
                        {images.length > 1 && (
                            <div className="flex gap-2 p-4 bg-gray-50 overflow-x-auto">
                                {images.map((img: string, i: number) => (
                                    <button key={i} onClick={() => setActiveImage(i)}
                                        className={`flex-shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition-all ${i === activeImage ? 'border-[var(--tm-ethereal-purple)] shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                                        <img src={imgUrl(img)} alt="" className="w-full h-full object-cover"
                                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80x56?text=img'; }} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </GlassCard>

                    <div>
                        <div className="flex justify-between items-start mb-3">
                            <h1 className="text-4xl font-serif font-black text-gray-900 tracking-tight">{hotel.name}</h1>
                            <div className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 px-3 py-1.5 rounded-xl shadow-sm flex-shrink-0 ml-4">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-black text-yellow-700">{hotel.averageRating || 'New'}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 font-bold mb-6">
                            <MapPin className="w-4 h-4 text-[var(--tm-ethereal-purple)]" />
                            {hotel.address?.city}{hotel.address?.state ? `, ${hotel.address.state}` : ''}, {hotel.address?.country}
                        </div>
                        <p className="text-gray-600 font-medium leading-relaxed text-lg mb-8">{hotel.description}</p>

                        {hotel.amenities?.length > 0 && (
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">What's Included</h3>
                                <div className="flex flex-wrap gap-3">
                                    {hotel.amenities.map((am: string) => {
                                        const Icon = AMENITY_ICONS[am] || Star;
                                        return (
                                            <div key={am} className="flex items-center gap-2 bg-white border border-gray-100 shadow-sm rounded-xl px-4 py-2.5">
                                                <Icon className="w-4 h-4 text-[var(--tm-liquid-blue)]" />
                                                <span className="text-sm font-bold text-gray-700">{am}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    <GlassCard className="p-6 bg-blue-50/60 border-blue-100 shadow-md">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-[var(--tm-liquid-blue)]" /> Check-In / Check-Out Policy</h3>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="text-center p-5 bg-white rounded-2xl border border-blue-100 shadow-sm">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Check-In From</p>
                                <p className="text-4xl font-black text-gray-900">12:00</p>
                                <p className="text-sm text-gray-500 font-bold mt-1">PM · Noon</p>
                            </div>
                            <div className="text-center p-5 bg-white rounded-2xl border border-blue-100 shadow-sm">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Check-Out By</p>
                                <p className="text-4xl font-black text-gray-900">12:00</p>
                                <p className="text-sm text-gray-500 font-bold mt-1">PM · Noon</p>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 font-medium mt-4 text-center">Early check-in & late check-out available on request, subject to availability.</p>
                    </GlassCard>
                </div>

                {/* Right: Booking Panel */}
                <div className="lg:col-span-2">
                    <div className="sticky top-28 space-y-4">
                        <GlassCard className="p-6 bg-white shadow-2xl border-gray-100 rounded-3xl">
                            <div className="flex items-baseline gap-2 mb-6 pb-6 border-b border-gray-100">
                                <span className="text-4xl font-black text-gray-900">₹{basePrice.toLocaleString('en-IN')}</span>
                                <span className="text-gray-400 font-bold">/ night</span>
                            </div>



                            {/* Room Type */}
                            <div className="mb-6">
                                <h3 className="text-xs font-black text-gray-600 uppercase tracking-widest mb-3">Room Type</h3>
                                <div className="space-y-2.5">
                                    {ROOM_TYPES.map(room => {
                                        const Icon = room.icon;
                                        return (
                                            <button key={room.id} onClick={() => setRoomType(room.id)}
                                                className={`w-full p-3.5 rounded-2xl border-2 text-left transition-all duration-200 ${roomType === room.id ? 'border-[var(--tm-ethereal-purple)] bg-purple-50 shadow-md' : 'border-gray-100 bg-gray-50 hover:border-gray-200'}`}>
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${roomType === room.id ? 'bg-[var(--tm-ethereal-purple)] text-white' : 'bg-white border border-gray-200 text-gray-400'}`}>
                                                        <Icon className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className={`font-bold text-sm ${roomType === room.id ? 'text-[var(--tm-deep-indigo)]' : 'text-gray-800'}`}>{room.label}</p>
                                                        <p className="text-xs text-gray-400">{room.subtext}</p>
                                                    </div>
                                                    <span className={`text-xs font-black px-2 py-0.5 rounded-lg ${roomType === room.id ? 'bg-[var(--tm-ethereal-purple)]/10 text-[var(--tm-deep-indigo)]' : 'text-gray-300'}`}>
                                                        {room.multiplier === 1 ? 'Base' : `×${room.multiplier}`}
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Dual Date Calendar */}
                            <div className="mb-6">
                                <h3 className="text-xs font-black text-gray-600 uppercase tracking-widest mb-3">Select Dates</h3>
                                <PremiumCalendar
                                    checkIn={checkIn}
                                    checkOut={checkOut}
                                    onChange={(ci, co) => { setCheckIn(ci); setCheckOut(co); }}
                                    minDate={new Date().toISOString().split('T')[0]}
                                />
                            </div>

                            {/* Price Breakdown */}
                            {checkIn && checkOut && (
                                <div className="bg-gradient-to-br from-gray-50 to-purple-50 border border-gray-100 rounded-2xl p-4 mb-5 space-y-2.5 shadow-inner">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">₹{basePrice.toLocaleString('en-IN')} × {selected.multiplier}× × {nights} night{nights > 1 ? 's' : ''}</span>
                                        <span className="font-bold text-gray-900">₹{totalPrice.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">GST & Taxes (18%)</span>
                                        <span className="font-bold text-gray-900">₹{taxes.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-black pt-2 border-t border-gray-200">
                                        <span className="text-gray-900">Total</span>
                                        <span className="text-[var(--tm-ethereal-purple)]">₹{grand.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex items-center gap-1 pt-1">
                                        <Moon className="w-3 h-3 text-gray-400" />
                                        <span className="text-xs text-gray-400 font-medium">{nights} night{nights > 1 ? 's' : ''} · {checkIn} → {checkOut}</span>
                                    </div>
                                </div>
                            )}

                            <LiquidButton variant="primary" onClick={handleBook} disabled={!checkIn || !checkOut}
                                className={`w-full py-4 text-base font-bold shadow-xl shadow-[var(--tm-ethereal-purple)]/20 transition-all ${(!checkIn || !checkOut) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                {checkIn && checkOut ? `Reserve for ₹${grand.toLocaleString('en-IN')}` : 'Select dates to reserve'}
                            </LiquidButton>
                            <p className="text-center text-xs text-gray-400 font-medium mt-3">You won't be charged yet. Payment at property.</p>
                        </GlassCard>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
