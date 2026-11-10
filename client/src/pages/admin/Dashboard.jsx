import { useEffect, useState } from 'react';
import { NavLink, Routes, Route, Navigate } from 'react-router-dom';
import api from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import Kitchen from './Kitchen.jsx';
import MenuManager from './MenuManager.jsx';
import Tables from './Tables.jsx';
import Reports from './Reports.jsx';

export default function Dashboard() {
  const { logout } = useAuth();
  const [me, setMe] = useState(null);

  useEffect(() => {
    api.get('/auth/me').then((r) => setMe(r.data)).catch(() => logout());
  }, []);

  if (!me) return <div className="container muted">Loading…</div>;
  const isOwner = me.user.role === 'owner';

  return (
    <>
      <nav className="nav">
        <div className="container">
          <span className="brand">{me.restaurant.name}</span>
          <NavLink to="/admin" end>Kitchen</NavLink>
          <NavLink to="/admin/menu">Menu</NavLink>
          <NavLink to="/admin/tables">Tables</NavLink>
          {isOwner && <NavLink to="/admin/reports">Reports</NavLink>}
          <span className="spacer" />
          <span className="muted">{me.user.name} ({me.user.role})</span>
          <button onClick={logout}>Log out</button>
        </div>
      </nav>
      <div className="container">
        <Routes>
          <Route index element={<Kitchen />} />
          <Route path="menu" element={<MenuManager isOwner={isOwner} currency={me.restaurant.currency} />} />
          <Route path="tables" element={<Tables isOwner={isOwner} />} />
          {isOwner && <Route path="reports" element={<Reports currency={me.restaurant.currency} />} />}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </div>
    </>
  );
}
