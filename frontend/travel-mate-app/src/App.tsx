//V's_new_start
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { SearchPage } from './pages/SearchPage'
import { SandboxBooking } from './pages/SandboxBooking'
import { ReviewPortal } from './pages/ReviewPortal'
import { useUserStore } from './store/useUserStore'

function App() {
  const { isAuthenticated, login, logout } = useUserStore()

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Simple Navigation Logic Scaffold */}
        <nav className="bg-white shadow p-4 flex justify-between items-center">
          <div className="space-x-4">
            <Link to="/" className="text-blue-600 font-bold">Search</Link>
            <Link to="/booking" className="text-blue-600 font-bold">Booking Test</Link>
            <Link to="/review" className="text-blue-600 font-bold">Review Test</Link>
          </div>
          <div>
            {isAuthenticated ? (
              <button onClick={() => logout()} className="text-red-500 font-semibold text-sm">Logout</button>
            ) : (
              <button
                onClick={() => login({ userId: "2001", name: "Test User" })}
                className="text-green-600 font-semibold text-sm"
              >
                Mock Login
              </button>
            )}
          </div>
        </nav>

        {/* Routes */}
        <main className="flex-grow p-4">
          <Routes>
            <Route path="/" element={<SearchPage />} />
            <Route path="/booking" element={<SandboxBooking />} />
            <Route path="/review" element={<ReviewPortal />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
//V's_new_end
