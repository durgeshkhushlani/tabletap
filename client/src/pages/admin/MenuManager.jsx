import { useEffect, useState } from 'react';
import api from '../../api/client.js';

const EMPTY = { name: '', category: '', price: '', description: '', isVeg: true, isAvailable: true };

export default function MenuManager({ isOwner, currency }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const load = () => api.get('/menu').then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const body = { ...form, price: Number(form.price) };
    try {
      if (editingId) await api.put(`/menu/${editingId}`, body);
      else await api.post('/menu', body);
      setForm(EMPTY);
      setEditingId(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    }
  };

  const edit = (item) => {
    setEditingId(item._id);
    setForm({ name: item.name, category: item.category, price: item.price, description: item.description, isVeg: item.isVeg, isAvailable: item.isAvailable });
  };

  const toggle = async (item) => {
    await api.put(`/menu/${item._id}`, { isAvailable: !item.isAvailable });
    load();
  };

  const remove = async (item) => {
    if (!window.confirm(`Delete ${item.name}?`)) return;
    await api.delete(`/menu/${item._id}`);
    load();
  };

  return (
    <>
      <h2>Menu</h2>
      {isOwner ? (
        <form className="card" onSubmit={submit}>
          <h3>{editingId ? 'Edit item' : 'Add item'}</h3>
          <div className="grid">
            <div><label>Name</label><input value={form.name} onChange={set('name')} required /></div>
            <div><label>Category</label><input value={form.category} onChange={set('category')} required /></div>
            <div><label>Price ({currency})</label><input type="number" min="0" value={form.price} onChange={set('price')} required /></div>
          </div>
          <label>Description</label>
          <input value={form.description} onChange={set('description')} />
          <div className="row">
            <label className="inline-check"><input type="checkbox" checked={form.isVeg} onChange={set('isVeg')} /> Vegetarian</label>
            <label className="inline-check"><input type="checkbox" checked={form.isAvailable} onChange={set('isAvailable')} /> Available</label>
          </div>
          {error && <div className="error">{error}</div>}
          <div className="row">
            <button className="primary">{editingId ? 'Save changes' : 'Add item'}</button>
            {editingId && <button type="button" onClick={() => { setEditingId(null); setForm(EMPTY); }}>Cancel</button>}
          </div>
        </form>
      ) : (
        <p className="muted">Only the owner can edit the menu.</p>
      )}

      <div className="grid">
        {items.map((i) => (
          <div className="card" key={i._id} style={{ opacity: i.isAvailable ? 1 : 0.55 }}>
            <div className="row between">
              <strong>{i.name}</strong>
              <span>{currency} {i.price}</span>
            </div>
            <div className="muted">{i.category} · {i.isVeg ? 'Veg' : 'Non-veg'}{!i.isAvailable && ' · Unavailable'}</div>
            {i.description && <p className="muted">{i.description}</p>}
            {isOwner && (
              <div className="row">
                <button onClick={() => edit(i)}>Edit</button>
                <button onClick={() => toggle(i)}>{i.isAvailable ? 'Hide' : 'Show'}</button>
                <button className="danger" onClick={() => remove(i)}>Delete</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
