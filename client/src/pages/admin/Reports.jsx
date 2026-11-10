import { useEffect, useState } from 'react';
import api from '../../api/client.js';

export default function Reports({ currency }) {
  const [range, setRange] = useState({ from: '', to: '' });
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const load = () => {
    setError('');
    const params = Object.fromEntries(Object.entries(range).filter(([, v]) => v));
    api.get('/reports/summary', { params }).then((r) => setData(r.data)).catch((e) => setError(e.response?.data?.message || 'Could not load report'));
  };
  useEffect(() => { load(); }, []);

  return (
    <>
      <h2>Sales report</h2>
      <div className="card row">
        <div><label>From</label><input type="date" value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} /></div>
        <div><label>To</label><input type="date" value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} /></div>
        <button className="primary" onClick={load}>Apply</button>
      </div>
      {error && <div className="error">{error}</div>}
      {data && (
        <>
          <div className="grid">
            <div className="card"><div className="muted">Revenue</div><div className="stat">{currency} {data.revenue}</div></div>
            <div className="card"><div className="muted">Orders</div><div className="stat">{data.orders}</div></div>
            <div className="card"><div className="muted">Avg order value</div><div className="stat">{currency} {data.averageOrderValue}</div></div>
          </div>
          <div className="row" style={{ alignItems: 'flex-start' }}>
            <div className="card" style={{ flex: 1, minWidth: 260 }}>
              <h3>Top items</h3>
              {data.topItems.length === 0 && <p className="muted">No sales yet.</p>}
              {data.topItems.map((i) => (
                <div className="row between" key={i.name}><span>{i.name}</span><span className="muted">{i.quantity} sold · {currency} {i.revenue}</span></div>
              ))}
            </div>
            <div className="card" style={{ flex: 1, minWidth: 260 }}>
              <h3>By day</h3>
              {data.daily.length === 0 && <p className="muted">No sales yet.</p>}
              {data.daily.map((d) => (
                <div className="row between" key={d.date}><span>{d.date}</span><span className="muted">{d.orders} orders · {currency} {d.revenue}</span></div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
