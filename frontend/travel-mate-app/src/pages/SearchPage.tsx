//V's_new_start
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../components/ui/GlassCard';
import { LiquidButton } from '../components/ui/LiquidButton';
import { Search, MapPin, Filter, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BACKEND = 'http://localhost:5000';
// Handle all image path formats: bare filename, /uploads/file, or full URL
const imgUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    if (path.startsWith('/')) return `${BACKEND}${path}`;
    return `${BACKEND}/uploads/${path}`; // bare filename stored in DB
};


export const SearchPage = () => {
    const navigate = useNavigate();

    const [priceRange, setPriceRange] = useState(99999);
    const [amenities, setAmenities] = useState<string[]>([]);

    const fetchHotels = async () => {
        const amParam = amenities.length > 0 ? `&amenities=${amenities.join(',')}` : '';
        const response = await fetch(`http://localhost:5000/api/hotel/approved?maxPrice=${priceRange}${amParam}`);
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    };

    const { data, isLoading, error } = useQuery({
        queryKey: ['allHotels', priceRange, amenities],
        queryFn: fetchHotels,
    });

    const toggleAmenity = (am: string) => {
        setAmenities(prev => prev.includes(am) ? prev.filter(a => a !== am) : [...prev, am]);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full h-full pb-12 pt-24"
        >
            <div className="flex flex-col md:flex-row gap-8">
                {/* Advanced Filter Sidebar */}
                <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0">
                    <GlassCard className="sticky top-32 bg-white/80 shadow-xl border-gray-200">
                        <div className="flex items-center gap-2 mb-8 border-b border-gray-100 pb-4">
                            <Filter className="w-5 h-5 text-[var(--tm-liquid-blue)] drop-shadow-sm" />
                            <h2 className="text-xl font-serif font-bold text-gray-900">Intelligent Filters</h2>
                        </div>

                        <div className="mb-8">
                            <div className="flex justify-between items-center mb-3">
                                <label className="text-sm font-bold text-gray-700">Max Price</label>
                                <span className="bg-blue-50 border border-blue-100 px-2 py-1 rounded text-xs text-[var(--tm-liquid-blue)] font-bold font-mono">₹{priceRange}</span>
                            </div>
                            <input
                                type="range"
                                min="1000" max="100000" step="1000"
                                value={priceRange}
                                onChange={(e) => setPriceRange(Number(e.target.value))}
                                className="w-full accent-[var(--tm-ethereal-purple)] bg-gray-200 rounded-lg appearance-none h-2 cursor-pointer shadow-inner"
                            />
                        </div>

                        <div className="mb-8">
                            <label className="block text-sm font-bold mb-3 text-gray-700">Premium Amenities</label>
                            <div className="flex flex-wrap gap-2">
                                {['WiFi', 'Pool', 'Spa', 'Gym'].map(am => (
                                    <button
                                        key={am}
                                        onClick={() => toggleAmenity(am)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 border ${amenities.includes(am) ? 'bg-gradient-to-r from-[var(--tm-deep-indigo)] to-[var(--tm-ethereal-purple)] border-transparent text-white shadow-md shadow-[var(--tm-ethereal-purple)]/30' : 'bg-gray-50 border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-100 shadow-sm'}`}
                                    >
                                        {am}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <LiquidButton onClick={() => { }} variant="primary" className="w-full text-sm py-3 font-bold shadow-lg shadow-[var(--tm-ethereal-purple)]/20">
                            Apply Filters
                        </LiquidButton>
                    </GlassCard>
                </div>

                {/* Search Results Grid */}
                <div className="w-full md:w-2/3 lg:w-3/4 flex-grow">
                    <div className="mb-8 flex items-center justify-between border-b border-gray-200 pb-4">
                        <h1 className="text-4xl md:text-5xl font-serif font-extrabold text-gray-900 tracking-tight drop-shadow-sm">Stay within Reach</h1>
                        {isLoading && <div className="w-6 h-6 border-2 border-[var(--tm-liquid-blue)] border-t-transparent rounded-full animate-spin"></div>}
                    </div>

                    {error && (
                        <GlassCard className="border-red-200 bg-red-50 mb-6 shadow-sm">
                            <p className="text-red-600 font-medium">Connection anomaly detected: {error.message}</p>
                        </GlassCard>
                    )}

                    {!isLoading && !error && data?.data?.length === 0 && (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center p-16 text-center bg-white/80 border border-gray-200 shadow-xl glass-panel rounded-3xl mt-8">
                            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100 shadow-inner">
                                <Search className="w-10 h-10 text-gray-400" />
                            </div>
                            <p className="text-2xl font-serif font-bold text-gray-900">No sanctuaries match your exact parameters.</p>
                            <p className="text-base mt-2 text-gray-500 font-medium">Try extending the price range or relaxing your amenity requirements.</p>
                        </motion.div>
                    )}

                    <AnimatePresence>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 relative mt-4">
                            {data?.data?.map((hotel: any, index: number) => (
                                <motion.div
                                    key={hotel._id || hotel.hotelId}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
                                    layoutId={`hotel-card-${hotel.hotelId}`}
                                    className="h-full"
                                >
                                    <GlassCard className="group h-full flex flex-col relative overflow-hidden transition-all duration-500 hover:-translate-y-2 border-gray-200 bg-white hover:shadow-2xl hover:shadow-[var(--tm-ethereal-purple)]/10 cursor-pointer p-0 rounded-3xl">
                                        <div className="h-64 bg-gray-100 w-full relative overflow-hidden">
                                            {/* Light Mode Simulated Image Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-tr from-gray-900/40 to-transparent transition-opacity group-hover:opacity-30 z-0"></div>
                                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent z-10"></div>

                                            {/* In a real app we'd map hotel.images[0] here */}
                                            {hotel.images?.[0] ? (
                                                <img src={imgUrl(hotel.images[0])} alt={hotel.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542314831-c6a4d14d8376?w=600&h=400&fit=crop'; }} />
                                            ) : (
                                                <img src="https://images.unsplash.com/photo-1542314831-c6a4d14d8376?w=600&h=400&fit=crop" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90" />
                                            )}

                                            <div className="absolute top-4 right-4 z-20">
                                                <div className="flex items-center gap-1.5 text-yellow-500 text-sm font-bold bg-white/90 backdrop-blur-md border border-white px-3 py-1.5 rounded-full shadow-lg">
                                                    <Star className="w-4 h-4 fill-yellow-500" /> {hotel.averageRating || 'New'}
                                                </div>
                                            </div>

                                            <div className="absolute bottom-4 left-5 z-20 flex gap-2">
                                                <span className="bg-white/90 border border-white/50 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-black text-gray-900 shadow-xl drop-shadow-sm">
                                                    ₹{hotel.pricePerNight} <span className="text-gray-500 font-semibold text-xs ml-1">/ NIGHT</span>
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-8 flex-grow flex flex-col pt-6">
                                            <div className="mb-2">
                                                <h2 className="text-2xl font-serif font-extrabold text-gray-900 group-hover:text-[var(--tm-liquid-blue)] transition-colors tracking-tight">{hotel.name}</h2>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-4 font-bold tracking-wide">
                                                <MapPin className="w-4 h-4 text-[var(--tm-ethereal-purple)]" /> {hotel.address?.city}, {hotel.address?.country}
                                            </div>

                                            <p className="text-sm text-gray-600 line-clamp-2 mb-8 leading-relaxed font-medium">
                                                {hotel.description || 'Experience ultimate comfort and prestige in this exclusive premium location.'}
                                            </p>

                                            <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                                                <div className="flex gap-2 flex-wrap">
                                                    {hotel.amenities?.slice(0, 3).map((am: string) => (
                                                        <span key={am} className="text-xs font-bold text-gray-600 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-lg">{am}</span>
                                                    ))}
                                                    {(hotel.amenities?.length || 0) > 3 && <span className="text-xs font-bold text-gray-400 px-1 py-1">+{hotel.amenities.length - 3}</span>}
                                                </div>
                                                <LiquidButton variant="primary" onClick={() => navigate(`/hotel/${hotel.hotelId}`)} className="py-2.5 px-6 text-sm font-bold shadow-lg shadow-[var(--tm-ethereal-purple)]/20 hover:scale-105 transition-transform">Reserve</LiquidButton>
                                            </div>
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            ))}
                        </div>
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
};
//V's_new_end
