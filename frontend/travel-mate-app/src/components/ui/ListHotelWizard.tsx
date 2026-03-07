import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './GlassCard';
import { LiquidButton } from './LiquidButton';
import { MapPin, Image as ImageIcon, CheckCircle, Info } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';
import { StatusModal } from './StatusModal';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

export const ListHotelWizard = () => {
    const { user } = useUserStore();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const map = useRef<mapboxgl.Map | null>(null);
    const marker = useRef<mapboxgl.Marker | null>(null);

    // Modal State
    const [modalData, setModalData] = useState<{isOpen: boolean, type: 'success'|'error', title: string, message: string}>({
        isOpen: false,
        type: 'error',
        title: '',
        message: ''
    });

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        pricePerNight: '',
        address: { city: '', state: '', country: '' },
        coordinates: [77.59, 12.97], // Default Bangalore
        amenities: [] as string[],
        images: [] as File[] // Array to hold actual file objects
    });

    const amenitiesList = ['WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Bar', 'Room Service', 'Valet'];

    const toggleAmenity = (am: string) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities.includes(am) 
                ? prev.amenities.filter(a => a !== am)
                : [...prev.amenities, am]
        }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            if (formData.images.length < 3) {
                throw new Error("Please upload at least 3 images.");
            }

            const data = new FormData();
            data.append('hotelId', Math.floor(Math.random() * 100000).toString());
            data.append('name', formData.name);
            data.append('email', user?.email || `host_${Date.now()}@travelmate.com`);
            data.append('password', 'password123'); // Default mock password for host
            data.append('description', formData.description);
            data.append('pricePerNight', formData.pricePerNight);
            data.append('address', JSON.stringify(formData.address));
            data.append('location', JSON.stringify({ type: 'Point', coordinates: formData.coordinates }));
            data.append('amenities', JSON.stringify(formData.amenities));

            // Append each file under 'images'
            formData.images.forEach(file => {
                data.append('images', file);
            });

            const response = await fetch('http://localhost:5000/api/hotel/register', {
                method: 'POST',
                body: data // Let browser automatically set Content-Type header with the correct boundary
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message);
            }

            setStep(4); // Success Step
        } catch (error: any) {
            setModalData({
                isOpen: true,
                type: 'error',
                title: 'Upload Failed',
                message: error.message
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen py-24 px-4 flex flex-col items-center relative overflow-hidden bg-transparent">
            
            {/* Ethereal Background Orbs */}
            <div className="fixed top-1/4 -left-1/4 w-[500px] h-[500px] bg-[var(--tm-ethereal-purple)]/10 rounded-full blur-[120px] mix-blend-multiply pointer-events-none" />
            <div className="fixed bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-[var(--tm-liquid-blue)]/10 rounded-full blur-[150px] mix-blend-multiply pointer-events-none" />

            <div className="w-full max-w-2xl z-10">
                <div className="mb-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-2 drop-shadow-sm tracking-tight text-balance">Partner With TravelMate</h1>
                    <p className="text-gray-600 font-medium text-lg">List your sanctuary on the world's most premium network.</p>
                </div>

                {/* Progress Indicators */}
                <div className="flex justify-between mb-12 relative w-3/4 mx-auto">
                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -z-10 -translate-y-1/2 rounded-full shadow-inner" />
                    {[1, 2, 3].map((num) => (
                        <div key={num} className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-500 shadow-md ${step >= num ? 'bg-gradient-to-br from-[var(--tm-deep-indigo)] to-[var(--tm-ethereal-purple)] text-white shadow-[var(--tm-ethereal-purple)]/40 hover:scale-105' : 'bg-white text-gray-400 border-2 border-gray-200'}`}>
                            {num}
                        </div>
                    ))}
                </div>

                <GlassCard className="p-8 relative overflow-hidden bg-white/90 shadow-2xl border-white backdrop-blur-3xl rounded-3xl">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <div className="flex items-center gap-2 mb-8 border-b border-gray-100 pb-4">
                                    <Info className="w-6 h-6 text-[var(--tm-liquid-blue)] drop-shadow-sm" />
                                    <h2 className="text-2xl font-serif font-bold text-gray-900">Property Details</h2>
                                </div>
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-600 mb-2 uppercase tracking-wide">Hotel Name</label>
                                        <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-4 px-4 text-gray-900 focus:outline-none focus:ring-4 focus:ring-[var(--tm-ethereal-purple)]/10 focus:border-[var(--tm-ethereal-purple)] transition-all shadow-sm placeholder:text-gray-400 font-medium" placeholder="e.g. The Obsidian Grand" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-600 mb-2 uppercase tracking-wide">Description</label>
                                        <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-4 px-4 text-gray-900 focus:outline-none focus:ring-4 focus:ring-[var(--tm-ethereal-purple)]/10 focus:border-[var(--tm-ethereal-purple)] transition-all shadow-sm placeholder:text-gray-400 font-medium resize-none shadow-inner" placeholder="Describe the premium experience..." />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-600 mb-2 uppercase tracking-wide">Price Per Night (₹)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">₹</span>
                                            <input type="number" value={formData.pricePerNight} onChange={e => setFormData({...formData, pricePerNight: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-4 pl-10 pr-4 text-gray-900 font-bold focus:outline-none focus:ring-4 focus:ring-[var(--tm-ethereal-purple)]/10 focus:border-[var(--tm-ethereal-purple)] transition-all shadow-inner placeholder:text-gray-300 placeholder:font-normal" placeholder="45,000" />
                                        </div>
                                    </div>
                                    
                                    <div className="pt-4">
                                        <label className="block text-sm font-bold text-gray-600 mb-3 uppercase tracking-wide">Premium Amenities</label>
                                        <div className="flex flex-wrap gap-2.5">
                                            {amenitiesList.map(am => (
                                                <button key={am} onClick={() => toggleAmenity(am)} className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all border shadow-sm ${formData.amenities.includes(am) ? 'bg-gradient-to-r from-[var(--tm-deep-indigo)] to-[var(--tm-ethereal-purple)] border-transparent text-white shadow-md shadow-[var(--tm-ethereal-purple)]/30 scale-105' : 'bg-white border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50'}`}>
                                                    {am}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="mt-10 flex justify-end">
                                        <LiquidButton variant="primary" onClick={() => setStep(2)} className="px-10 py-3.5 shadow-lg shadow-[var(--tm-ethereal-purple)]/20 hover:shadow-[var(--tm-ethereal-purple)]/40 font-bold text-sm">Continue</LiquidButton>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <div className="flex items-center gap-2 mb-8 border-b border-gray-100 pb-4">
                                    <MapPin className="w-6 h-6 text-[var(--tm-liquid-blue)] drop-shadow-sm" />
                                    <h2 className="text-2xl font-serif font-bold text-gray-900">Location & Identity</h2>
                                </div>
                                <div className="space-y-6">
                                     <div className="grid grid-cols-3 gap-5">
                                         <div>
                                            <label className="block text-sm font-bold text-gray-600 mb-2 uppercase tracking-wide">City</label>
                                            <input type="text" value={formData.address.city} onChange={e => setFormData({...formData, address: {...formData.address, city: e.target.value}})} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 px-4 text-gray-900 focus:outline-none focus:ring-4 focus:ring-[var(--tm-ethereal-purple)]/10 focus:border-[var(--tm-ethereal-purple)] transition-all shadow-sm font-medium" />
                                         </div>
                                         <div>
                                            <label className="block text-sm font-bold text-gray-600 mb-2 uppercase tracking-wide">State</label>
                                            <input type="text" value={formData.address.state} onChange={e => setFormData({...formData, address: {...formData.address, state: e.target.value}})} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 px-4 text-gray-900 focus:outline-none focus:ring-4 focus:ring-[var(--tm-ethereal-purple)]/10 focus:border-[var(--tm-ethereal-purple)] transition-all shadow-sm font-medium" />
                                         </div>
                                         <div>
                                            <label className="block text-sm font-bold text-gray-600 mb-2 uppercase tracking-wide">Country</label>
                                            <input type="text" value={formData.address.country} onChange={e => setFormData({...formData, address: {...formData.address, country: e.target.value}})} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 px-4 text-gray-900 focus:outline-none focus:ring-4 focus:ring-[var(--tm-ethereal-purple)]/10 focus:border-[var(--tm-ethereal-purple)] transition-all shadow-sm font-medium" />
                                         </div>
                                     </div>
                                     
                                     <div className="mt-8 p-1.5 border border-gray-200 rounded-2xl bg-gray-50 shadow-inner overflow-hidden relative">
                                        {/* Mapbox Container */}
                                        <div 
                                            className="w-full h-72 rounded-xl cursor-crosshair shadow-md"
                                            ref={(el) => {
                                                if (el && !map.current) {
                                                    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
                                                    map.current = new mapboxgl.Map({
                                                        container: el,
                                                        style: 'mapbox://styles/mapbox/light-v11', // Light theme map
                                                        center: [formData.coordinates[0], formData.coordinates[1]],
                                                        zoom: 12
                                                    });

                                                    marker.current = new mapboxgl.Marker({ color: '#7c3aed' })
                                                        .setLngLat([formData.coordinates[0], formData.coordinates[1]])
                                                        .addTo(map.current);

                                                    map.current.on('click', (e) => {
                                                        const { lng, lat } = e.lngLat;
                                                        setFormData(prev => ({ ...prev, coordinates: [lng, lat] }));
                                                        if (marker.current) {
                                                            marker.current.setLngLat([lng, lat]);
                                                        }
                                                    });
                                                }
                                            }}
                                        />
                                        <div className="absolute top-5 left-5 right-5 pointer-events-none">
                                            <div className="bg-white/90 backdrop-blur-md border border-white px-5 py-3 rounded-xl text-center shadow-xl">
                                                <p className="text-gray-900 text-sm mb-1 font-bold">Click on the map to drop the property pin</p>
                                                <p className="text-[var(--tm-ethereal-purple)] text-xs font-mono font-bold tracking-widest">[{formData.coordinates[0].toFixed(4)}, {formData.coordinates[1].toFixed(4)}]</p>
                                            </div>
                                        </div>
                                     </div>

                                    <div className="mt-10 flex justify-between items-center">
                                        <button onClick={() => setStep(1)} className="text-gray-500 font-bold hover:text-gray-900 px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors">Back</button>
                                        <LiquidButton variant="primary" onClick={() => setStep(3)} className="px-10 py-3.5 shadow-lg shadow-[var(--tm-ethereal-purple)]/20 font-bold text-sm">Continue</LiquidButton>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <div className="flex items-center gap-2 mb-8 border-b border-gray-100 pb-4">
                                    <ImageIcon className="w-6 h-6 text-[var(--tm-liquid-blue)] drop-shadow-sm" />
                                    <h2 className="text-2xl font-serif font-bold text-gray-900">Media Collection</h2>
                                </div>
                                
                                <label className="block w-full p-10 mt-6 border-2 border-dashed border-gray-300 rounded-2xl text-center hover:border-[var(--tm-ethereal-purple)] hover:bg-purple-50/30 transition-all cursor-pointer bg-gray-50 relative group">
                                    <input 
                                        type="file" 
                                        multiple 
                                        accept="image/jpeg, image/png, image/webp" 
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={(e) => {
                                            if (e.target.files) {
                                                const filesArray = Array.from(e.target.files);
                                                setFormData(prev => ({ ...prev, images: [...prev.images, ...filesArray] }));
                                            }
                                        }}
                                    />
                                    <div className="w-16 h-16 bg-white border border-gray-200 shadow-sm rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                        <ImageIcon className="w-8 h-8 text-[var(--tm-ethereal-purple)]" />
                                    </div>
                                    <p className="text-gray-900 font-bold mb-1 text-lg">Click to upload high-resolution images</p>
                                    <p className="text-gray-500 font-medium text-sm">Require at least 3 images showing the exterior, lobby, and a premium suite.</p>
                                    
                                    {formData.images.length > 0 && (
                                        <div className="mt-6 pt-4 border-t border-gray-200 text-sm bg-purple-50 text-[var(--tm-ethereal-purple)] font-black uppercase tracking-widest px-4 py-2 rounded-lg inline-block shadow-inner">
                                            {formData.images.length} file(s) staging
                                        </div>
                                    )}
                                </label>

                                <div className="mt-8">
                                    <div className="bg-blue-50/80 border border-blue-100 p-5 rounded-2xl flex gap-4 shadow-sm">
                                        <Info className="w-6 h-6 text-[var(--tm-liquid-blue)] flex-shrink-0 drop-shadow-sm mt-0.5" />
                                        <div>
                                            <h4 className="text-gray-900 font-bold text-sm mb-1 uppercase tracking-wider">Verification Standard</h4>
                                            <p className="text-gray-600 text-sm leading-relaxed font-medium">By submitting this form, you agree to our physical verification process. Our regional director will contact you to schedule an on-site audit before your listing goes live.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-10 flex justify-between items-center">
                                    <button onClick={() => setStep(2)} className="text-gray-500 font-bold hover:text-gray-900 px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors">Back</button>
                                    <LiquidButton variant="primary" onClick={handleSubmit} disabled={isSubmitting} className="px-10 py-3.5 flex items-center gap-2 shadow-lg shadow-[var(--tm-ethereal-purple)]/20 font-bold text-sm">
                                        {isSubmitting ? <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" /> : 'Finalize Application'}
                                    </LiquidButton>
                                </div>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div key="step4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
                                <motion.div 
                                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}
                                    className="w-24 h-24 bg-green-50 border-4 border-white shadow-xl rounded-full flex items-center justify-center mx-auto mb-8"
                                >
                                    <CheckCircle className="w-12 h-12 text-green-500 drop-shadow-sm" />
                                </motion.div>
                                <h2 className="text-4xl md:text-5xl font-serif font-extrabold text-gray-900 mb-6 drop-shadow-sm tracking-tight text-balance">Application Received</h2>
                                <p className="text-gray-600 text-lg mb-12 max-w-lg mx-auto font-medium leading-relaxed">
                                    Your property data has been secured. It is currently placed under <span className="bg-purple-50 text-[var(--tm-ethereal-purple)] font-black px-2 py-0.5 rounded border border-purple-100 whitespace-nowrap">PENDING VERIFICATION</span> status. Our local governance team will contact you shortly.
                                </p>
                                <LiquidButton variant="secondary" onClick={() => window.location.href = '/'} className="px-10 py-4 font-bold bg-white shadow-lg text-gray-900 hover:shadow-xl border-gray-200 text-base">
                                    Return to Registry
                                </LiquidButton>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </GlassCard>
            </div>
            
            <StatusModal 
                isOpen={modalData.isOpen}
                onClose={() => setModalData(prev => ({ ...prev, isOpen: false }))}
                type={modalData.type}
                title={modalData.title}
                message={modalData.message}
            />
        </div>
    );
};
