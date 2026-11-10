import { useEffect, useState } from 'react';
import api from '../../api/client.js';

export default function Tables({ isOwner }) {
  const [tables, setTables] = useState([]);
  const [number, setNumber] = useState('');
  const [label, setLabel] = useState('');
  const [error, setError] = useState('');
  const [qr, setQr] = useState({}); // table id -> { url, qr }

  const load = () => api.get('/tables').then((r) => setTables(r.data));
  useEffect(() => { load(); }, []);

  const add = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/tables', { number: Number(number), label });
      setNumber('');
      setLabel('');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add table');
    }
  };

  const showQr = async (t) => {
    const { data } = await api.get(`/tables/${t._id}/qr`);
    setQr({ ...qr, [t._id]: data });
  };

  const remove = async (t) => {
    if (!window.confirm(`Delete table ${t.number}?`)) return;
    await api.delete(`/tables/${t._id}`);
    load();
  };

  return (
    <>
      <h2>Tables &amp; QR codes</h2>
      {isOwner && (
        <form className="card" onSubmit={add}>
          <div className="grid">
            <div><label>Table number</label><input type="number" min="1" value={number} onChange={(e) => setNumber(e.target.value)} required /></div>
            <div><label>Label (optional)</label><input value={label} onChange={(e) => setLabel(e.target.value)} /></div>
          </div>
          {error && <div className="error">{error}</div>}
          <button className="primary">Add table</button>
        </form>
      )}
      <div className="grid">
        {tables.map((t) => (
          <div className="card" key={t._id}>
            <strong>Table {t.number}</strong> {t.label && <span className="muted">· {t.label}</span>}
            <div className="row" style={{ margin: '8px 0' }}>
              <button onClick={() => showQr(t)}>Show QR</button>
              {isOwner && <button className="danger" onClick={() => remove(t)}>Delete</button>}
            </div>
            {qr[t._id] && (
              <div className="qr">
                <img src={qr[t._id].qr} alt={`QR for table ${t.number}`} />
                <div className="muted" style={{ wordBreak: 'break-all' }}>{qr[t._id].url}</div>
                <a href={qr[t._id].qr} download={`table-${t.number}-qr.png`}>Download PNG</a>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
