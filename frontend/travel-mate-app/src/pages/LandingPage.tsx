import { motion } from 'framer-motion';
import { ArrowRight, Globe, Building, ShieldCheck, Star, Map, Crown } from 'lucide-react';
import { LiquidButton } from '../components/ui/LiquidButton';
import { AuthModal } from '../components/ui/AuthModal';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/useUserStore';

export const LandingPage = () => {
    const [authModalState, setAuthModalState] = useState<{isOpen: boolean, defaultRole: "USER"|"HOTEL_HOST"|"ADMIN"}>({isOpen: false, defaultRole: "USER"});
    const navigate = useNavigate();
    const { isAuthenticated } = useUserStore();

    return (
        <div className="w-full flex flex-col relative overflow-hidden bg-white -mt-24 pt-24 min-h-screen">
            
            {/* Bright Ethereal Background Orbs */}
            <div className="absolute top-0 left-0 right-0 h-[80vh] bg-gradient-to-b from-purple-50 via-white to-white -z-20" />
            <div className="absolute top-1/4 -left-32 w-[600px] h-[600px] bg-[var(--tm-ethereal-purple)]/10 rounded-full blur-[120px] mix-blend-multiply pointer-events-none -z-10" />
            <div className="absolute top-1/2 -right-32 w-[800px] h-[800px] bg-[var(--tm-liquid-blue)]/10 rounded-full blur-[150px] mix-blend-multiply pointer-events-none -z-10" />

            {/* Hero Section */}
            <div className="z-10 flex flex-col items-center justify-center text-center max-w-5xl mx-auto px-4 mt-20 md:mt-32">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <span className="inline-flex items-center gap-2 py-1.5 px-5 rounded-full bg-blue-50/80 backdrop-blur-sm border border-blue-100 text-[var(--tm-liquid-blue)] text-sm font-black mb-8 tracking-widest uppercase shadow-sm">
                        <Crown className="w-4 h-4" /> The New Standard in Travel
                    </span>
                    <h1 className="text-6xl md:text-8xl font-serif font-black text-gray-900 mb-8 leading-[1.05] tracking-tight drop-shadow-sm whitespace-nowrap">
                        Discover Sanctuaries.<br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--tm-liquid-blue)] via-[var(--tm-ethereal-purple)] to-[var(--tm-deep-indigo)] pb-2 block mt-2">
                            Experience TravelMate.
                        </span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto font-medium leading-relaxed text-balance">
                        Premium destinations, frictionless real-time bookings, and dedicated black-car transfers directly to your suite.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                        <LiquidButton onClick={() => navigate('/search')} variant="primary" className="w-full sm:w-auto text-lg py-4 px-10 font-bold flex items-center justify-center gap-2 shadow-xl shadow-[var(--tm-ethereal-purple)]/30 hover:shadow-2xl hover:shadow-[var(--tm-ethereal-purple)]/40 hover:-translate-y-1 transition-all duration-300">
                            Start Exploring <ArrowRight className="w-5 h-5" />
                        </LiquidButton>
                        <button onClick={() => setAuthModalState({isOpen: true, defaultRole: "USER"})} className="w-full sm:w-auto text-lg py-4 px-10 font-bold text-gray-700 bg-white border-2 border-gray-200 shadow-md rounded-2xl hover:bg-gray-50 hover:border-gray-300 hover:-translate-y-1 transition-all duration-300">
                            Join Platform
                        </button>
                    </div>

                    <div className="mt-16 flex items-center justify-center gap-4 text-sm font-bold text-gray-500 bg-white/50 backdrop-blur-md py-3 px-6 rounded-full border border-gray-100 shadow-sm w-max mx-auto">
                        <div className="flex -space-x-3">
                            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&h=50&fit=crop" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="User" />
                            <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=50&h=50&fit=crop" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="User" />
                            <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="User" />
                        </div>
                        <div className="flex flex-col text-left">
                            <div className="flex text-yellow-400 gap-0.5"><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/></div>
                            <span className="text-gray-900">Join 10,000+ premium travelers</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Immersive Image Grid Section */}
            <motion.div 
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
                className="w-full max-w-7xl mx-auto px-4 mt-24 mb-32 z-10"
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[500px] md:h-[600px]">
                    <div className="col-span-1 md:col-span-2 relative rounded-3xl overflow-hidden shadow-2xl group cursor-pointer">
                        <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800&fit=crop" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Luxury Hotel Exterior" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                        <div className="absolute bottom-8 left-8 text-left">
                            <p className="text-white/80 font-bold uppercase tracking-widest text-sm mb-2 drop-shadow-md">Curated Stays</p>
                            <h3 className="text-3xl font-serif font-bold text-white drop-shadow-lg">The Obsidian Grand</h3>
                        </div>
                    </div>
                    <div className="flex flex-col gap-6">
                        <div className="h-1/2 relative rounded-3xl overflow-hidden shadow-xl group cursor-pointer bg-gradient-to-br from-purple-100 to-blue-50 flex items-center justify-center p-8 text-center border border-white">
                            <div>
                                <Map className="w-10 h-10 text-[var(--tm-liquid-blue)] mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Mapbox Integration</h3>
                                <p className="text-sm font-medium text-gray-600">Explore geospatial data in real-time.</p>
                            </div>
                        </div>
                        <div className="h-1/2 relative rounded-3xl overflow-hidden shadow-xl group cursor-pointer">
                            <img src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&h=400&fit=crop" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Luxury Black Car Service" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                            <div className="absolute bottom-6 left-6 text-left">
                                <h3 className="text-2xl font-serif font-bold text-white drop-shadow-md">Dedicated Cab Transfers</h3>
                                <p className="text-white/80 font-medium text-sm">Real-time luxury black-car pickup straight to your portal.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Value Proposition Section */}
            <div className="bg-gray-50 py-32 border-t border-gray-100 w-full z-10">
                <div className="max-w-7xl mx-auto px-4 text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-serif font-black text-gray-900 mb-4">Why Choose TravelMate?</h2>
                    <p className="text-lg text-gray-500 font-medium max-w-2xl mx-auto">We've rebuilt the hospitality engine from the ground up to ensure absolute perfection at every touchpoint.</p>
                </div>
                <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-8"
                >
                    <div className="bg-white border border-gray-100 shadow-xl shadow-gray-200/50 p-10 rounded-3xl flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-500">
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                            <Globe className="w-10 h-10 text-[var(--tm-liquid-blue)]" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-4">Global Reach</h3>
                        <p className="text-gray-600 font-medium leading-relaxed">Join an elite network of properties visited by the world's most discerning travelers. Immediate visibility across continents.</p>
                    </div>
                    <div className="bg-gradient-to-br from-[var(--tm-ethereal-purple)] to-[var(--tm-deep-indigo)] p-10 rounded-3xl flex flex-col items-center text-center shadow-2xl shadow-[var(--tm-ethereal-purple)]/30 relative overflow-hidden group transform hover:-translate-y-2 transition-transform duration-500 border border-purple-400/30">
                        <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6 backdrop-blur-md">
                            <Building className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-2xl font-black text-white mb-4">Host Your Hotel</h3>
                        <p className="text-white/90 font-medium mb-8 leading-relaxed">List your property with our premium Mapbox integration and automated two-phase commit booking engine.</p>
                        <LiquidButton variant="secondary" onClick={() => isAuthenticated ? navigate('/list-hotel') : setAuthModalState({isOpen: true, defaultRole: "HOTEL_HOST"})} className="w-full py-4 text-gray-900 bg-white border-transparent font-bold shadow-xl">List Property Studio</LiquidButton>
                    </div>
                    <div className="bg-white border border-gray-100 shadow-xl shadow-gray-200/50 p-10 rounded-3xl flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-500">
                        <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mb-6">
                            <ShieldCheck className="w-10 h-10 text-[var(--tm-ethereal-purple)]" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-4">Verified Trust</h3>
                        <p className="text-gray-600 font-medium leading-relaxed">Every property undergoes strict physical verification logic to ensure the highest standards and prevent fraudulent listings.</p>
                    </div>
                </motion.div>
            </div>

            <AuthModal isOpen={authModalState.isOpen} defaultRole={authModalState.defaultRole} onClose={() => setAuthModalState(prev => ({ ...prev, isOpen: false }))} />
        </div>
    );
};
