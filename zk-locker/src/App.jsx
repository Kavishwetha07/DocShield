import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Upload from './pages/Upload.jsx'
import LockedSeal from './pages/LockedSeal.jsx'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/locked-seal" element={<LockedSeal />} />
        </Routes>
      </main>
    </div>
  )
}
