import { BrowserRouter, Routes, Route, Link, NavLink, Navigate } from 'react-router-dom'
import { SearchPage } from './pages/SearchPage'
import { LandingPage } from './pages/LandingPage'
import { ListHotelWizard } from './components/ui/ListHotelWizard'
import { SandboxBooking } from './pages/SandboxBooking'
import { ReviewPortal } from './pages/ReviewPortal'
import { HotelDetailPage } from './pages/HotelDetailPage'
import { PaymentPage } from './pages/PaymentPage'
import { useUserStore } from './store/useUserStore'
import { LiquidButton } from './components/ui/LiquidButton'
import { AuthModal } from './components/ui/AuthModal'
import { BrandIcon } from './components/ui/BrandIcon'
import { MapPin, UserCircle, LayoutDashboard } from 'lucide-react'
import { useState } from 'react'
import { UserDashboard } from './components/ui/UserDashboard'
import { HostDashboard } from './components/ui/HostDashboard'
import { AdminDashboard } from './components/ui/AdminDashboard'

// Role-based Router Component
const DashboardRouter = () => {
  const { user, role } = useUserStore();
  
  if (!user) {
    return <div className="p-12 text-center text-gray-400 mt-24">Please sign in to access your dashboard.</div>;
  }

  switch(role) {
    case 'ADMIN':
      return <AdminDashboard />;
    case 'HOTEL_HOST':
      return <HostDashboard />;
    case 'USER':
    default:
      return <UserDashboard />;
  }
};

function App() {
  const { isAuthenticated, user, role, logout } = useUserStore()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col text-gray-900 font-sans selection:bg-[var(--tm-ethereal-purple)] selection:text-white">
        {/* Premium Ethereal Navigation - Full Width & Sticky */}
        <nav className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-2xl border-b border-gray-200/50 shadow-sm transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3 cursor-pointer">
              <BrandIcon size={36} />
              <Link to="/" className="text-xl font-serif font-black tracking-tight text-gray-900 hover:text-[var(--tm-ethereal-purple)] transition-colors">TravelMate</Link>
            </div>
            <div className="hidden md:flex space-x-8 items-center">
              {role === 'HOTEL_HOST' ? (
                  <>
                      <NavLink to="/dashboard" className={({ isActive }) => `text-sm font-semibold transition-all relative pb-1 ${isActive ? 'text-[var(--tm-ethereal-purple)] font-black after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[var(--tm-ethereal-purple)] after:rounded-full' : 'text-gray-600 hover:text-[var(--tm-liquid-blue)]'}`}>My Listings</NavLink>
                      <NavLink to="/review" className={({ isActive }) => `text-sm font-semibold transition-all relative pb-1 ${isActive ? 'text-[var(--tm-ethereal-purple)] font-black after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[var(--tm-ethereal-purple)] after:rounded-full' : 'text-gray-600 hover:text-[var(--tm-liquid-blue)]'}`}>Reviews</NavLink>
                  </>
              ) : role === 'ADMIN' ? null : (
                  <>
                      <NavLink to="/search" className={({ isActive }) => `text-sm font-semibold transition-all relative pb-1 ${isActive ? 'text-[var(--tm-ethereal-purple)] font-black after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[var(--tm-ethereal-purple)] after:rounded-full' : 'text-gray-600 hover:text-[var(--tm-liquid-blue)]'}`}>Search & Discover</NavLink>
                      <NavLink to="/booking" className={({ isActive }) => `text-sm font-semibold transition-all relative pb-1 ${isActive ? 'text-[var(--tm-ethereal-purple)] font-black after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[var(--tm-ethereal-purple)] after:rounded-full' : 'text-gray-600 hover:text-[var(--tm-liquid-blue)]'}`}>Active Booking</NavLink>
                      <NavLink to="/review" className={({ isActive }) => `text-sm font-semibold transition-all relative pb-1 ${isActive ? 'text-[var(--tm-ethereal-purple)] font-black after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[var(--tm-ethereal-purple)] after:rounded-full' : 'text-gray-600 hover:text-[var(--tm-liquid-blue)]'}`}>Trust Portal</NavLink>
                  </>
              )}
              {isAuthenticated && (
                  <Link to="/dashboard" className="text-sm font-bold text-[var(--tm-ethereal-purple)] hover:text-[var(--tm-deep-indigo)] transition-all flex items-center gap-1">
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
              )}
            </div>
            <div>
              {isAuthenticated ? (
                <div className="flex items-center gap-4">
                   <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                       <UserCircle className="w-5 h-5 text-[var(--tm-liquid-blue)]" />
                       {role === 'ADMIN' ? 'Admin' : (user?.name || 'Traveler')}
                   </div>
                   <button 
                     onClick={() => logout()} 
                     className="px-4 py-2 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 font-bold text-sm transition-colors border border-transparent hover:border-red-500/30"
                   >
                     Logout
                   </button>
                </div>
              ) : (
                <LiquidButton 
                  variant="primary" 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-sm py-2 px-5 font-bold shadow-lg shadow-[var(--tm-ethereal-purple)]/30"
                >
                  Sign In
                </LiquidButton>
              )}
            </div>
          </div>
        </nav>

        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

        {/* Routes */}
        <main className="flex-grow flex flex-col relative w-full pt-8 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
          <Routes>
            {/* Direct logged-in users away from the landing page */}
            <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LandingPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/hotel/:hotelId" element={<HotelDetailPage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/list-hotel" element={<ListHotelWizard />} />
            <Route path="/booking" element={<SandboxBooking />} />
            <Route path="/review" element={<ReviewPortal />} />
            <Route path="/dashboard" element={<DashboardRouter />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
//V's_new_end
