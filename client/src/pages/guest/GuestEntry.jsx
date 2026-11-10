import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/client.js';

// QR target: /r/:slug/t/:table. Guest gives a name; no account needed.
export default function GuestEntry() {
  const { slug, table } = useParams();
  const navigate = useNavigate();
  const [info, setInfo] = useState(null);
  const [name, setName] = useState(sessionStorage.getItem('tabletap_guest') || '');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/tables/public/${slug}/${table}`)
      .then((r) => setInfo(r.data))
      .catch(() => setError('This table or restaurant could not be found. Please scan the QR code again.'));
  }, [slug, table]);

  const start = (e) => {
    e.preventDefault();
    sessionStorage.setItem('tabletap_guest', name.trim());
    sessionStorage.setItem('tabletap_table', table);
    navigate(`/r/${slug}/menu`);
  };

  if (error) return <div className="narrow card error">{error}</div>;
  if (!info) return <div className="narrow muted">Loading…</div>;

  return (
    <form className="narrow card" onSubmit={start}>
      <h1>{info.restaurant.name}</h1>
      <p className="muted">You're at table {info.table.number}. Tell us your name to start ordering.</p>
      <label>Your name</label>
      <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} required autoFocus />
      <button className="primary" disabled={!name.trim()}>View menu</button>
    </form>
  );
}
