import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/client.js';

export default function GuestMenu() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const guestName = sessionStorage.getItem('tabletap_guest');
  const tableNumber = sessionStorage.getItem('tabletap_table');

  const [menu, setMenu] = useState(null);
  const [cart, setCart] = useState({}); // menuItem id -> { item, quantity, note }
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get(`/menu/public/${slug}`).then((r) => setMenu(r.data)).catch(() => setError('Could not load the menu'));
  }, [slug]);

  const lines = Object.values(cart);
  const count = lines.reduce((n, l) => n + l.quantity, 0);
  const subtotal = useMemo(() => lines.reduce((s, l) => s + l.item.price * l.quantity, 0), [cart]);

  if (!guestName || !tableNumber) {
    return <div className="narrow card">Please scan the QR code on your table to start ordering.</div>;
  }

  const change = (item, delta) => {
    const quantity = (cart[item._id]?.quantity || 0) + delta;
    const next = { ...cart };
    if (quantity <= 0) delete next[item._id];
    else next[item._id] = { item, quantity, note: cart[item._id]?.note || '' };
    setCart(next);
  };

  const setNote = (id, note) => setCart({ ...cart, [id]: { ...cart[id], note } });

  const place = async () => {
    setError('');
    setBusy(true);
    try {
      const { data } = await api.post('/orders', {
        slug,
        guestName,
        tableNumber: Number(tableNumber),
        items: lines.map((l) => ({ menuItem: l.item._id, quantity: l.quantity, note: l.note })),
      });
      navigate(`/r/${slug}/order/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not place the order');
    } finally {
      setBusy(false);
    }
  };

  if (!menu) return <div className="narrow muted">{error || 'Loading menu…'}</div>;
  const { currency } = menu.restaurant;

  return (
    <>
      <div className="container">
        <h1>{menu.restaurant.name}</h1>
        <p className="muted">Hi {guestName} · Table {tableNumber}</p>

        {Object.entries(menu.categories).map(([category, items]) => (
          <section key={category}>
            <h2>{category}</h2>
            <div className="grid">
              {items.map((item) => (
                <div className="card" key={item._id}>
                  <div className="row between">
                    <strong>{item.name}</strong>
                    <span>{currency} {item.price}</span>
                  </div>
                  <div className="muted">{item.isVeg ? 'Veg' : 'Non-veg'}</div>
                  {item.description && <p className="muted">{item.description}</p>}
                  <div className="qty">
                    <button onClick={() => change(item, -1)} disabled={!cart[item._id]}>−</button>
                    <span>{cart[item._id]?.quantity || 0}</span>
                    <button onClick={() => change(item, 1)}>+</button>
                  </div>
                  {cart[item._id] && (
                    <input style={{ marginTop: 8 }} placeholder="Note (e.g. less spicy)" value={cart[item._id].note} onChange={(e) => setNote(item._id, e.target.value)} />
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
        {Object.keys(menu.categories).length === 0 && <p className="muted">The menu is empty right now.</p>}
      </div>

      {count > 0 && (
        <div className="cartbar">
          <div className="container row between" style={{ padding: 0 }}>
            <span><strong>{count}</strong> item{count > 1 && 's'} · {currency} {subtotal} <span className="muted">(+ tax)</span></span>
            <button className="primary" onClick={place} disabled={busy}>{busy ? 'Placing…' : 'Place order'}</button>
          </div>
          {error && <div className="error">{error}</div>}
        </div>
      )}
    </>
  );
}
