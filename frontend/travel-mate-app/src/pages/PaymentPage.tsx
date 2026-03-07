import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CreditCard, Lock, Check, Car, Star, Sparkles, ArrowRight, Smartphone
} from 'lucide-react';
import { useUserStore } from '../store/useUserStore';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const BACKEND = 'http://localhost:5000';
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// ─── Step Bar ────────────────────────────────────────────────────────
const STEPS = ['Payment', 'Ride', 'Done'];
const StepBar = ({ step }: { step: number }) => (
    <div className="flex items-center justify-center gap-3 mb-10">
        {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black transition-all duration-500
                    ${i < step ? 'bg-green-500 text-white shadow-lg shadow-green-200'
                        : i === step ? 'bg-gradient-to-br from-[var(--tm-deep-indigo)] to-[var(--tm-ethereal-purple)] text-white shadow-lg shadow-[var(--tm-ethereal-purple)]/30 scale-110'
                            : 'bg-gray-100 text-gray-400'}`}>
                    {i < step ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-xs font-bold hidden sm:block ${i === step ? 'text-[var(--tm-deep-indigo)]' : 'text-gray-400'}`}>{label}</span>
                {i < STEPS.length - 1 && <div className={`w-8 h-0.5 rounded-full transition-all ${i < step ? 'bg-green-400' : 'bg-gray-200'}`} />}
            </div>
        ))}
    </div>
);

const formatCard = (v: string) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
const formatExpiry = (v: string) => { const d = v.replace(/\D/g, '').slice(0, 4); return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d; };

// ─── UPI SVG Icons ───────────────────────────────────────────────────
const GPayIcon = () => (
    <svg viewBox="0 0 48 48" className="w-7 h-7">
        <path fill="#4285F4" d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z" />
        <path fill="#34A853" d="M6.3 14.7l7 5.1C15.1 16.1 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2c-7.6 0-14.2 4.4-17.7 10.7z" />
        <path fill="#FBBC05" d="M24 46c5.5 0 10.4-1.9 14.2-5l-6.6-5.4C29.6 37.3 27 38 24 38c-6 0-10.7-3.9-12.3-9.5l-7 5.4C8 40.5 15.4 46 24 46z" />
        <path fill="#EA4335" d="M44.5 20H24v8.5h11.8c-1 2.9-2.9 5.4-5.5 7l6.6 5.4c3.9-3.6 6.1-8.9 6.1-15 0-1-.2-2-.5-3.9z" />
    </svg>
);
const PhonePeIcon = () => (
    <svg viewBox="0 0 48 48" className="w-7 h-7">
        <rect width="48" height="48" rx="10" fill="#5F259F" />
        <text x="24" y="34" textAnchor="middle" fontSize="20" fontWeight="bold" fill="white" fontFamily="Arial">Pe</text>
    </svg>
);
const PaytmIcon = () => (
    <svg viewBox="0 0 48 48" className="w-7 h-7">
        <rect width="48" height="48" rx="4" fill="#00B9F1" />
        <rect x="3" y="3" width="42" height="42" rx="3" fill="white" />
        <text x="24" y="30" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#00B9F1" fontFamily="Arial">PAYTM</text>
    </svg>
);
const UPIIcon = () => (
    <svg viewBox="0 0 48 48" className="w-7 h-7">
        <rect width="48" height="48" rx="8" fill="#f5f5f5" stroke="#ddd" strokeWidth="1.5" />
        <text x="24" y="31" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#6B7280" fontFamily="Arial">UPI</text>
    </svg>
);

const UPI_APPS = [
    { id: 'gpay', name: 'Google Pay', Icon: GPayIcon },
    { id: 'phonepe', name: 'PhonePe', Icon: PhonePeIcon },
    { id: 'paytm', name: 'Paytm', Icon: PaytmIcon },
    { id: 'other', name: 'Other UPI ID', Icon: UPIIcon },
];

// ─── Step 1: Payment ─────────────────────────────────────────────────
const PaymentStep = ({ booking, onPaid }: { booking: any; onPaid: () => void }) => {
    const [mode, setMode] = useState<'card' | 'upi'>('card');
    const [card, setCard] = useState('');
    const [name, setName] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [flipped, setFlipped] = useState(false);
    const [upiApp, setUpiApp] = useState('gpay');
    const [upiId, setUpiId] = useState('');
    const [upiSent, setUpiSent] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [done, setDone] = useState(false);
    const { user } = useUserStore();

    const createBooking = async () => {
        try {
            await fetch(`${BACKEND}/api/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user?._id, hotelId: booking.hotelMongoId, checkInDate: booking.checkIn, checkOutDate: booking.checkOut }),
            });
        } catch (e) { console.error(e); }
    };

    const handleCardPay = async () => {
        if (!name || card.replace(/\s/g, '').length < 16 || expiry.length < 5 || cvv.length < 3) return;
        setProcessing(true);
        await createBooking();
        await new Promise(r => setTimeout(r, 2500));
        setProcessing(false);
        setDone(true);
        await new Promise(r => setTimeout(r, 1400));
        onPaid();
    };

    const handleUpiSend = async () => {
        setUpiSent(true);
        setProcessing(true);
        await createBooking();
        await new Promise(r => setTimeout(r, 3000));
        setProcessing(false);
        setDone(true);
        await new Promise(r => setTimeout(r, 1400));
        onPaid();
    };

    return (
        <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="max-w-md mx-auto">
            <h2 className="text-3xl font-serif font-black text-gray-900 mb-1 text-center">Secure Payment</h2>
            <p className="text-center text-gray-500 font-medium mb-6">256-bit SSL encrypted · All major payment methods accepted</p>

            {/* Booking pill */}
            <div className="bg-gradient-to-br from-[var(--tm-deep-indigo)] to-[var(--tm-ethereal-purple)] rounded-2xl p-5 mb-6 shadow-xl text-white">
                <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">{booking.hotelName}</p>
                <div className="flex justify-between items-center">
                    <div>
                        <p className="font-bold text-sm">{booking.roomLabel} · {booking.nights} night{booking.nights > 1 ? 's' : ''}</p>
                        <p className="text-white/60 text-xs">{booking.checkIn} → {booking.checkOut}</p>
                    </div>
                    <p className="text-2xl font-black">₹{booking.grand.toLocaleString('en-IN')}</p>
                </div>
            </div>

            {/* Mode tabs */}
            <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl mb-6">
                <button onClick={() => setMode('card')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 ${mode === 'card' ? 'bg-white shadow-md text-gray-900' : 'text-gray-500'}`}>
                    <CreditCard className="w-4 h-4" /> Card
                </button>
                <button onClick={() => setMode('upi')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 ${mode === 'upi' ? 'bg-white shadow-md text-gray-900' : 'text-gray-500'}`}>
                    <Smartphone className="w-4 h-4" /> UPI
                </button>
            </div>

            <AnimatePresence mode="wait">
                {mode === 'card' && (
                    <motion.div key="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        {/* 3D Card */}
                        <div className="perspective-1000 mb-6 cursor-pointer" onClick={() => setFlipped(f => !f)}>
                            <motion.div animate={{ rotateY: flipped ? 180 : 0 }} transition={{ duration: 0.6 }}
                                style={{ transformStyle: 'preserve-3d' }} className="relative h-40 w-full">
                                <div style={{ backfaceVisibility: 'hidden' }}
                                    className="absolute inset-0 bg-gradient-to-br from-gray-900 via-[var(--tm-deep-indigo)] to-[var(--tm-ethereal-purple)] rounded-3xl p-5 text-white shadow-2xl">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-9 h-6 bg-yellow-400 rounded-md opacity-90" />
                                        <div className="flex gap-1"><div className="w-6 h-6 rounded-full bg-red-500/80" /><div className="w-6 h-6 rounded-full bg-yellow-500/80 -ml-2" /></div>
                                    </div>
                                    <p className="font-mono text-base tracking-widest mb-4 text-white/90">{card || '•••• •••• •••• ••••'}</p>
                                    <div className="flex justify-between items-end">
                                        <div><p className="text-white/40 text-xs uppercase">Card Holder</p><p className="font-bold text-xs">{name || 'YOUR NAME'}</p></div>
                                        <div><p className="text-white/40 text-xs uppercase">Expires</p><p className="font-bold text-xs">{expiry || 'MM/YY'}</p></div>
                                    </div>
                                </div>
                                <div style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                                    className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-700 rounded-3xl shadow-2xl overflow-hidden">
                                    <div className="h-10 bg-gray-600 mt-8" />
                                    <div className="flex items-center gap-4 px-5 mt-3">
                                        <div className="flex-1 h-8 bg-white/10 rounded" />
                                        <div className="bg-white text-gray-900 px-3 py-1.5 rounded font-mono font-bold text-sm">{cvv || '•••'}</div>
                                    </div>
                                    <p className="text-white/40 text-xs text-center mt-3">Tap to flip back</p>
                                </div>
                            </motion.div>
                        </div>
                        <div className="space-y-4">
                            <div className="relative">
                                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input value={card} onChange={e => setCard(formatCard(e.target.value))} placeholder="Card Number"
                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-2xl font-mono text-sm focus:border-[var(--tm-ethereal-purple)] focus:outline-none focus:ring-4 focus:ring-[var(--tm-ethereal-purple)]/10 transition-all" />
                            </div>
                            <input value={name} onChange={e => setName(e.target.value)} placeholder="Cardholder Name"
                                className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-2xl text-sm font-bold focus:border-[var(--tm-ethereal-purple)] focus:outline-none focus:ring-4 focus:ring-[var(--tm-ethereal-purple)]/10 transition-all" />
                            <div className="grid grid-cols-2 gap-4">
                                <input value={expiry} onChange={e => setExpiry(formatExpiry(e.target.value))} placeholder="MM/YY"
                                    className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-2xl text-sm font-mono font-bold focus:border-[var(--tm-ethereal-purple)] focus:outline-none focus:ring-4 focus:ring-[var(--tm-ethereal-purple)]/10 transition-all" />
                                <input value={cvv} type="password" onChange={e => setCvv(e.target.value.slice(0, 4))} placeholder="CVV"
                                    onFocus={() => setFlipped(true)} onBlur={() => setFlipped(false)}
                                    className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-2xl text-sm font-mono font-bold focus:border-[var(--tm-ethereal-purple)] focus:outline-none focus:ring-4 focus:ring-[var(--tm-ethereal-purple)]/10 transition-all" />
                            </div>
                        </div>
                        <button onClick={handleCardPay} disabled={processing || done}
                            className="w-full mt-6 py-4 rounded-2xl font-black text-white text-base shadow-2xl shadow-[var(--tm-ethereal-purple)]/30 transition-all active:scale-95 disabled:cursor-not-allowed"
                            style={{ background: 'linear-gradient(135deg, var(--tm-deep-indigo), var(--tm-ethereal-purple))' }}>
                            {processing ? <div className="flex items-center justify-center gap-2"><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Processing…</span></div>
                                : done ? <div className="flex items-center justify-center gap-2"><Check className="w-5 h-5" />Payment Successful!</div>
                                    : <div className="flex items-center justify-center gap-2"><Lock className="w-4 h-4" />Pay ₹{booking.grand.toLocaleString('en-IN')}</div>}
                        </button>
                    </motion.div>
                )}

                {mode === 'upi' && (
                    <motion.div key="upi" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        <div className="grid grid-cols-2 gap-3 mb-5">
                            {UPI_APPS.map(app => (
                                <button key={app.id} onClick={() => setUpiApp(app.id)}
                                    className={`p-3.5 rounded-2xl border-2 transition-all flex items-center gap-3 ${upiApp === app.id ? 'border-[var(--tm-ethereal-purple)] bg-purple-50 shadow-md' : 'border-gray-200 bg-gray-50 hover:border-gray-300'}`}>
                                    <app.Icon />
                                    <span className="text-xs font-black text-gray-800">{app.name}</span>
                                </button>
                            ))}
                        </div>
                        <div className="mb-5">
                            <label className="text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5 block">
                                {upiApp === 'other' ? 'Enter UPI ID' : 'UPI Linked Number / ID'}
                            </label>
                            <input value={upiId} onChange={e => setUpiId(e.target.value)}
                                placeholder={upiApp === 'other' ? 'yourname@bank' : '98765XXXXX'}
                                className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-2xl text-sm font-bold focus:border-[var(--tm-ethereal-purple)] focus:outline-none focus:ring-4 focus:ring-[var(--tm-ethereal-purple)]/10 transition-all" />
                        </div>
                        {upiSent && !done && (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5 flex items-center gap-3">
                                <div className="w-8 h-8 border-[3px] border-amber-400 border-t-amber-600 rounded-full animate-spin flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-black text-amber-800">Awaiting UPI Approval</p>
                                    <p className="text-xs text-amber-600">Check your {UPI_APPS.find(a => a.id === upiApp)?.name} app to confirm ₹{booking.grand.toLocaleString('en-IN')}</p>
                                </div>
                            </motion.div>
                        )}
                        <button onClick={handleUpiSend} disabled={!upiId || processing || done || upiSent}
                            className="w-full py-4 rounded-2xl font-black text-white text-base shadow-2xl shadow-[var(--tm-ethereal-purple)]/30 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                            style={{ background: 'linear-gradient(135deg, var(--tm-deep-indigo), var(--tm-ethereal-purple))' }}>
                            {done ? <div className="flex items-center justify-center gap-2"><Check className="w-5 h-5" />Payment Confirmed!</div>
                                : upiSent ? <div className="flex items-center justify-center gap-2"><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Confirming…</div>
                                    : <div className="flex items-center justify-center gap-2"><Smartphone className="w-4 h-4" />Send ₹{booking.grand.toLocaleString('en-IN')} via UPI</div>}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
            <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
                <Lock className="w-3 h-3" /> Secured with 256-bit TLS encryption
            </p>
        </motion.div>
    );
};

// ─── Step 2: Ride Booking ─────────────────────────────────────────────
const RideStep = ({ booking, onSkip, onRideBooked }: { booking: any; onSkip: () => void; onRideBooked: () => void }) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const [distance, setDistance] = useState<number | null>(null);
    const [fare, setFare] = useState<number | null>(null);
    const [paying, setPaying] = useState(false);
    const [paid, setPaid] = useState(false);

    const hotelLng = booking.hotelLng || 77.59;
    const hotelLat = booking.hotelLat || 12.97;

    const drawRoute = async (m: mapboxgl.Map, userLng: number, userLat: number) => {
        try {
            const res = await fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${userLng},${userLat};${hotelLng},${hotelLat}?geometries=geojson&access_token=${MAPBOX_TOKEN}`);
            const json = await res.json();
            const route = json.routes?.[0];
            if (!route) return;
            const distKm = route.distance / 1000;
            setDistance(distKm);
            setFare(Math.round(distKm * 15));
            const addLayer = () => {
                if (m.getSource('route')) return;
                m.addSource('route', { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: route.geometry } });
                m.addLayer({ id: 'route', type: 'line', source: 'route', layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#7c3aed', 'line-width': 4, 'line-opacity': 0.85 } });
                m.fitBounds([[Math.min(userLng, hotelLng) - 0.05, Math.min(userLat, hotelLat) - 0.05], [Math.max(userLng, hotelLng) + 0.05, Math.max(userLat, hotelLat) + 0.05]], { padding: 60 });
            };
            if (m.loaded()) { addLayer(); } else { m.on('load', addLayer); }
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        if (!mapContainer.current) return;
        mapboxgl.accessToken = MAPBOX_TOKEN;
        const m = new mapboxgl.Map({ container: mapContainer.current, style: 'mapbox://styles/mapbox/dark-v11', center: [hotelLng, hotelLat], zoom: 11 });
        mapRef.current = m;
        new mapboxgl.Marker({ color: '#7c3aed' }).setLngLat([hotelLng, hotelLat]).addTo(m);

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                pos => {
                    const { longitude: ul, latitude: ult } = pos.coords;
                    new mapboxgl.Marker({ color: '#3b82f6' }).setLngLat([ul, ult]).addTo(m);
                    drawRoute(m, ul, ult);
                },
                () => {
                    const simLng = hotelLng - 0.07;
                    const simLat = hotelLat - 0.06;
                    new mapboxgl.Marker({ color: '#3b82f6' }).setLngLat([simLng, simLat]).addTo(m);
                    drawRoute(m, simLng, simLat);
                }
            );
        } else {
            const simLng = hotelLng - 0.07;
            const simLat = hotelLat - 0.06;
            new mapboxgl.Marker({ color: '#3b82f6' }).setLngLat([simLng, simLat]).addTo(m);
            drawRoute(m, simLng, simLat);
        }
        return () => m.remove();
    }, []);

    const handleRidePay = async () => {
        setPaying(true);
        await new Promise(r => setTimeout(r, 2200));
        setPaid(true);
        await new Promise(r => setTimeout(r, 1200));
        onRideBooked();
    };

    return (
        <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="max-w-xl mx-auto">
            <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100"><Car className="w-5 h-5 text-blue-500" /></div>
                <div>
                    <h2 className="text-2xl font-serif font-black text-gray-900">Book a Chauffeur?</h2>
                    <p className="text-sm text-gray-500 font-medium">Arrive in style — we'll handle the route.</p>
                </div>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
                <div ref={mapContainer} className="h-64 rounded-2xl overflow-hidden shadow-xl border border-gray-100" />
                <div className="flex flex-col gap-4">
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-3 shadow-inner flex-1">
                        <div className="flex justify-between text-sm"><span className="text-gray-500 font-medium">Vehicle</span><span className="font-bold text-gray-900">Premium Sedan</span></div>
                        <div className="flex justify-between text-sm"><span className="text-gray-500 font-medium">Total Distance</span><span className="font-bold text-gray-900">{distance ? `${distance.toFixed(1)} km` : '—'}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-gray-500 font-medium">Est. Time</span><span className="font-bold text-gray-900">{distance ? `~${Math.ceil(distance / 25 * 60)} mins` : '—'}</span></div>
                        <div className="flex justify-between text-sm pt-2 border-t border-gray-200 font-black"><span>Ride Fare</span><span className="text-[var(--tm-ethereal-purple)] text-base">₹{fare?.toLocaleString('en-IN') || '…'}</span></div>
                    </div>
                    <button onClick={handleRidePay} disabled={paying || paid || !fare}
                        className="w-full py-3.5 rounded-2xl font-black text-white text-base shadow-xl shadow-[var(--tm-ethereal-purple)]/20 disabled:opacity-60 flex items-center justify-center gap-2 transition-all active:scale-95"
                        style={{ background: 'linear-gradient(135deg, var(--tm-deep-indigo), var(--tm-ethereal-purple))' }}>
                        {paying ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            : paid ? <><Check className="w-5 h-5" />Booked!</>
                                : <><Car className="w-4 h-4" />Confirm Ride · ₹{fare?.toLocaleString('en-IN') || '…'}</>}
                    </button>
                    <button onClick={onSkip} className="text-sm text-gray-400 hover:text-gray-600 font-bold text-center transition-colors">I'll arrange my own transit</button>
                </div>
            </div>
        </motion.div>
    );
};

// ─── Step 3: Final Confirmation ───────────────────────────────────────
const FinalStep = ({ booking, hasRide }: { booking: any; hasRide: boolean }) => {
    const navigate = useNavigate();
    const gradients = ['from-[#1a1a2e] via-[#16213e] to-[#0f3460]', 'from-[#0d1117] via-[#1c1f2e] to-[#2d1b69]', 'from-[#1a0533] via-[#2d0a5c] to-[#3d1785]', 'from-[#0a1628] via-[#1e3a5f] to-[#0d4d8a]'];
    const grad = gradients[(booking.hotelName?.charCodeAt(0) || 0) % 4];

    return (
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="max-w-lg mx-auto text-center">
            {/* CSS hotel banner — no external image, never breaks */}
            <div className={`relative h-56 rounded-3xl overflow-hidden mb-8 shadow-2xl bg-gradient-to-br ${grad}`}>
                <div className="absolute inset-0 flex items-end justify-center overflow-hidden opacity-20">
                    <div className="flex items-end gap-1">
                        {[60, 80, 120, 100, 140, 110, 90, 70].map((h, i) => (
                            <div key={i} className="bg-white/60 rounded-t-sm" style={{ width: 18, height: h }} />
                        ))}
                    </div>
                </div>
                {[...Array(18)].map((_, i) => (
                    <div key={i} className="absolute rounded-full bg-white animate-pulse"
                        style={{ width: [1, 2, 1.5][i % 3], height: [1, 2, 1.5][i % 3], left: `${(i * 17 + 5) % 95}%`, top: `${(i * 23 + 8) % 55}%`, animationDelay: `${i * 0.35}s`, opacity: 0.4 + (i % 3) * 0.2 }} />
                ))}
                <div className="absolute top-5 right-8 w-9 h-9 rounded-full border border-yellow-200/30 bg-yellow-100/10" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="absolute bottom-5 left-0 right-0 text-white">
                    <div className="flex items-center justify-center gap-1 mb-1">
                        {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />)}
                    </div>
                    <p className="text-xl font-serif font-black tracking-wide">{booking.hotelName}</p>
                    <p className="text-white/60 text-xs font-medium mt-0.5">Luxury Collection</p>
                </motion.div>
            </div>

            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
                className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-yellow-200">
                <Sparkles className="w-10 h-10 text-white" />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <h2 className="text-4xl font-serif font-black text-gray-900 mb-3">Your Sanctuary Awaits!</h2>
                <p className="text-gray-600 font-medium text-base mb-2 leading-relaxed max-w-sm mx-auto">
                    {hasRide ? 'Your chauffeur is on the way. Sit back, relax and let us handle the rest.' : 'Make your way to the hotel at your leisure.'}
                </p>
                <p className="text-[var(--tm-ethereal-purple)] font-black text-sm mb-8 max-w-sm mx-auto">
                    ✨ Comfort yourself — a luxurious stay awaits you at {booking.hotelName}. Have a wonderful time! ✨
                </p>
                <div className="bg-gradient-to-br from-gray-50 to-purple-50 rounded-2xl p-5 mb-8 text-left space-y-2 border border-gray-100 shadow-inner">
                    <div className="flex justify-between text-sm"><span className="text-gray-500">Room</span><span className="font-bold text-gray-900">{booking.roomLabel}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-500">Check-In</span><span className="font-bold text-gray-900">{booking.checkIn} · 12:00 PM</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-500">Check-Out</span><span className="font-bold text-gray-900">{booking.checkOut} · 12:00 PM</span></div>
                    <div className="flex justify-between text-sm font-black pt-2 border-t border-gray-200"><span className="text-gray-700">Total Paid</span><span className="text-[var(--tm-ethereal-purple)]">₹{booking.grand?.toLocaleString('en-IN')}</span></div>
                    {hasRide && <div className="flex justify-between text-sm text-green-700 font-bold pt-1 border-t border-green-100"><span>🚗 Chauffeur Transfer</span><span>Confirmed</span></div>}
                </div>
                <button onClick={() => navigate('/booking')}
                    className="w-full py-4 rounded-2xl font-black text-white text-base shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95"
                    style={{ background: 'linear-gradient(135deg, var(--tm-deep-indigo), var(--tm-ethereal-purple))' }}>
                    View Active Bookings <ArrowRight className="w-5 h-5" />
                </button>
            </motion.div>
        </motion.div>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────
export const PaymentPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const booking = location.state as any;
    const [step, setStep] = useState(0);
    const [hasRide, setHasRide] = useState(false);

    if (!booking) { navigate('/search'); return null; }

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 bg-gradient-to-br from-white via-purple-50/30 to-white">
            <div className="max-w-2xl mx-auto">
                <StepBar step={step} />
                <AnimatePresence mode="wait">
                    {step === 0 && <PaymentStep key="pay" booking={booking} onPaid={() => setStep(1)} />}
                    {step === 1 && <RideStep key="ride" booking={booking} onSkip={() => { setHasRide(false); setStep(2); }} onRideBooked={() => { setHasRide(true); setStep(2); }} />}
                    {step === 2 && <FinalStep key="final" booking={booking} hasRide={hasRide} />}
                </AnimatePresence>
            </div>
        </div>
    );
};
