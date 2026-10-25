import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Guest ordering (Moksh)
import GuestEntry from './pages/guest/GuestEntry.jsx';
import GuestMenu from './pages/guest/GuestMenu.jsx';

// Restaurant management (Durgesh)
import Login from './pages/admin/Login.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';

export default function App() {
  return (
    <Routes>
      {/* QR target: /r/<restaurantSlug>/t/<tableNumber> */}
      <Route path="/r/:slug/t/:table" element={<GuestEntry />} />
      <Route path="/r/:slug/menu" element={<GuestMenu />} />

      <Route path="/admin/login" element={<Login />} />
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
}
