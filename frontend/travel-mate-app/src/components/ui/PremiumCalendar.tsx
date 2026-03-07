import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PremiumCalendarProps {
    checkIn: string;  // 'YYYY-MM-DD'
    checkOut: string; // 'YYYY-MM-DD'
    onChange: (checkIn: string, checkOut: string) => void;
    minDate?: string;
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

// Use LOCAL date (not UTC) to avoid UTC offset shifting the date
const fmt = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};
const toDate = (str: string) => str ? new Date(str + 'T00:00:00') : null;

export const PremiumCalendar = ({ checkIn, checkOut, onChange, minDate }: PremiumCalendarProps) => {
    const today = new Date();
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());
    const [hovered, setHovered] = useState<string | null>(null);

    // picking state: first click = checkIn, second click = checkOut
    const selIn = toDate(checkIn);
    const selOut = toDate(checkOut);
    const minD = minDate ? new Date(minDate + 'T00:00:00') : new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const prevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
    };

    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrev = new Date(viewYear, viewMonth, 0).getDate();

    const dayDate = (day: number) => new Date(viewYear, viewMonth, day);

    const isDisabled = (day: number) => dayDate(day) < minD;
    const isCheckIn = (day: number) => selIn ? dayDate(day).toDateString() === selIn.toDateString() : false;
    const isCheckOut = (day: number) => selOut ? dayDate(day).toDateString() === selOut.toDateString() : false;
    const isInRange = (day: number) => {
        const d = dayDate(day);
        const end = hovered && checkIn && !checkOut ? toDate(hovered) : selOut;
        return selIn && end && d > selIn && d < end;
    };
    const isToday = (day: number) => dayDate(day).toDateString() === today.toDateString();

    const handleSelect = (day: number) => {
        if (isDisabled(day)) return;
        const d = dayDate(day);
        const dateStr = fmt(d);

        if (!checkIn || (checkIn && checkOut)) {
            // Start fresh selection
            onChange(dateStr, '');
        } else {
            // We have checkIn, now set checkOut
            if (d <= new Date(checkIn + 'T12:00:00')) {
                // Clicked before or same as checkIn, restart
                onChange(dateStr, '');
            } else {
                onChange(checkIn, dateStr);
            }
        }
    };

    const handleHover = (day: number) => {
        if (checkIn && !checkOut && !isDisabled(day)) {
            setHovered(fmt(dayDate(day)));
        }
    };

    // Build grid
    const cells: { day: number; current: boolean }[] = [];
    for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: daysInPrev - i, current: false });
    for (let i = 1; i <= daysInMonth; i++) cells.push({ day: i, current: true });
    while (cells.length % 7 !== 0) cells.push({ day: cells.length - daysInMonth - firstDay + 1, current: false });

    const fmtDisplay = (str: string) => {
        if (!str) return '';
        const d = toDate(str)!;
        return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`;
    };

    return (
        <div className="w-full">
            {/* Selection pills */}
            <div className="flex gap-2 mb-3">
                <div className={`flex-1 flex items-center gap-2 rounded-2xl px-4 py-3 border-2 transition-all ${checkIn ? 'border-[var(--tm-ethereal-purple)] bg-purple-50/50' : 'border-gray-200 bg-gray-50'}`}>
                    <svg className={`w-4 h-4 flex-shrink-0 ${checkIn ? 'text-[var(--tm-ethereal-purple)]' : 'text-gray-300'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Check-In</p>
                        <p className={`text-sm font-bold ${checkIn ? 'text-gray-900' : 'text-gray-300'}`}>{checkIn ? fmtDisplay(checkIn) : 'Select date'}</p>
                    </div>
                </div>
                <div className="flex items-center text-gray-300 font-bold">→</div>
                <div className={`flex-1 flex items-center gap-2 rounded-2xl px-4 py-3 border-2 transition-all ${checkOut ? 'border-green-400 bg-green-50/50' : 'border-gray-200 bg-gray-50'}`}>
                    <svg className={`w-4 h-4 flex-shrink-0 ${checkOut ? 'text-green-500' : 'text-gray-300'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Check-Out</p>
                        <p className={`text-sm font-bold ${checkOut ? 'text-gray-900' : 'text-gray-300'}`}>{checkOut ? fmtDisplay(checkOut) : 'Select date'}</p>
                    </div>
                </div>
            </div>

            {/* Helpful hint */}
            <p className="text-xs text-center text-gray-400 font-medium mb-3 italic">
                {!checkIn ? '🗓 Click a date to set check-in' : !checkOut ? '✅ Now pick your check-out date' : '🎉 Dates selected! Adjust or reserve below.'}
            </p>

            {/* Calendar */}
            <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-100 rounded-3xl shadow-xl overflow-hidden"
            >
                {/* Month Header */}
                <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-[var(--tm-deep-indigo)] to-[var(--tm-ethereal-purple)]">
                    <button onClick={prevMonth} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <AnimatePresence mode="wait">
                        <motion.span key={`${viewYear}-${viewMonth}`}
                            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                            className="text-white font-black text-base tracking-wide">
                            {MONTHS[viewMonth]} {viewYear}
                        </motion.span>
                    </AnimatePresence>
                    <button onClick={nextMonth} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 px-3 pt-4 pb-2">
                    {DAYS.map(d => <div key={d} className="text-center text-[10px] font-black text-gray-400 uppercase tracking-wider py-1">{d}</div>)}
                </div>

                {/* Days */}
                <div className="grid grid-cols-7 px-3 pb-4 gap-y-0.5" onMouseLeave={() => setHovered(null)}>
                    {cells.map((cell, idx) => {
                        const disabled = !cell.current || isDisabled(cell.day);
                        const ci = cell.current && isCheckIn(cell.day);
                        const co = cell.current && isCheckOut(cell.day);
                        const inRange = cell.current && isInRange(cell.day);
                        const tod = cell.current && isToday(cell.day);

                        return (
                            <button
                                key={idx}
                                onClick={() => cell.current && handleSelect(cell.day)}
                                onMouseEnter={() => cell.current && handleHover(cell.day)}
                                disabled={disabled}
                                className={`
                                    relative h-9 w-full flex items-center justify-center text-sm font-bold transition-all duration-100 select-none
                                    ${!cell.current ? 'text-gray-200 cursor-default' : ''}
                                    ${disabled && cell.current ? 'text-gray-300 cursor-not-allowed' : ''}
                                    ${ci ? 'bg-gradient-to-br from-[var(--tm-deep-indigo)] to-[var(--tm-ethereal-purple)] text-white rounded-l-xl shadow-lg z-10' : ''}
                                    ${co ? 'bg-gradient-to-br from-[var(--tm-ethereal-purple)] to-green-500 text-white rounded-r-xl shadow-lg z-10' : ''}
                                    ${inRange && !ci && !co ? 'bg-purple-50 text-[var(--tm-deep-indigo)] rounded-none' : ''}
                                    ${!ci && !co && !inRange && !disabled && cell.current ? 'text-gray-700 hover:bg-purple-50 hover:text-[var(--tm-deep-indigo)] rounded-xl' : ''}
                                    ${tod && !ci && !co ? 'ring-2 ring-inset ring-[var(--tm-ethereal-purple)] rounded-xl text-[var(--tm-deep-indigo)]' : ''}
                                `}
                            >
                                {cell.day}
                            </button>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="px-5 pb-4 pt-2 flex justify-between items-center border-t border-gray-100">
                    <button onClick={() => onChange('', '')} className="text-xs text-gray-400 hover:text-gray-600 font-bold transition-colors">Clear</button>
                    <span className="text-xs text-gray-400 font-medium">Check-in from 12:00 PM</span>
                    <button onClick={() => {
                        const t = new Date(); onChange(fmt(t), '');
                        setViewMonth(t.getMonth()); setViewYear(t.getFullYear());
                    }} className="text-xs font-black text-[var(--tm-ethereal-purple)] hover:text-[var(--tm-deep-indigo)] transition-colors">Today</button>
                </div>
            </motion.div>
        </div>
    );
};
