import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../api/client.js';

const STEPS = ['placed', 'preparing', 'ready', 'served'];
const LABEL = {
  placed: 'Order received',
  preparing: 'Being prepared',
  ready: 'Ready, on its way',
  served: 'Served. Enjoy!',
  cancelled: 'Cancelled',
};

export default function GuestOrder() {
  const { slug, id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  // Poll until the order reaches a final state.
  useEffect(() => {
    let timer;
    const load = () =>
      api.get(`/orders/${id}`)
        .then((r) => {
          setOrder(r.data);
          if (!['served', 'cancelled'].includes(r.data.status)) timer = setTimeout(load, 4000);
        })
        .catch(() => setError('Order not found'));
    load();
    return () => clearTimeout(timer);
  }, [id]);

  if (error) return <div className="narrow card error">{error}</div>;
  if (!order) return <div className="narrow muted">Loading…</div>;

  return (
    <div className="narrow card">
      <h1>{LABEL[order.status]}</h1>
      <span className={`badge ${order.status}`}>{order.status}</span>
      <p className="muted">Table {order.tableNumber} · {order.guestName}</p>
      {order.status !== 'cancelled' && (
        <p className="muted">Progress: {STEPS.map((s, i) => (i <= STEPS.indexOf(order.status) ? `● ${s}` : `○ ${s}`)).join('  ')}</p>
      )}
      <ul>
        {order.items.map((i, idx) => (
          <li key={idx}>{i.quantity} × {i.name} <span className="muted">({i.price} each)</span></li>
        ))}
      </ul>
      <strong>Total (incl. tax): {order.total}</strong>
      <p><Link to={`/r/${slug}/menu`}>Order more</Link></p>
    </div>
  );
}
