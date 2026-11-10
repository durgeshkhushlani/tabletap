import { useCallback, useEffect, useState } from 'react';
import api from '../../api/client.js';

const COLUMNS = [
  { status: 'placed', title: 'New', next: 'preparing', action: 'Start preparing' },
  { status: 'preparing', title: 'Preparing', next: 'ready', action: 'Mark ready' },
  { status: 'ready', title: 'Ready to serve', next: 'served', action: 'Mark served' },
];

export default function Kitchen() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    api.get('/kitchen').then((r) => setOrders(r.data)).catch(() => setError('Could not load orders'));
  }, []);

  // Poll every 5s so new guest orders show up without a refresh.
  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [load]);

  const move = async (id, status) => {
    try {
      await api.patch(`/kitchen/${id}/status`, { status });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <>
      <h2>Kitchen board</h2>
      {error && <div className="error">{error}</div>}
      <div className="columns">
        {COLUMNS.map((col) => (
          <div key={col.status}>
            <h3>{col.title}</h3>
            {orders.filter((o) => o.status === col.status).map((o) => (
              <div className="card" key={o._id}>
                <div className="row between">
                  <strong>Table {o.tableNumber}</strong>
                  <span className="muted">{new Date(o.createdAt).toLocaleTimeString()}</span>
                </div>
                <div className="muted">{o.guestName}</div>
                <ul>
                  {o.items.map((i, idx) => (
                    <li key={idx}>
                      {i.quantity} × {i.name}
                      {i.note && <em className="muted"> ({i.note})</em>}
                    </li>
                  ))}
                </ul>
                <div className="row">
                  <button className="primary" onClick={() => move(o._id, col.next)}>{col.action}</button>
                  {col.status !== 'ready' && (
                    <button className="danger" onClick={() => move(o._id, 'cancelled')}>Cancel</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
