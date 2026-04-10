import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';
import SortableTable from '../../components/common/SortableTable';
import { StarDisplay } from '../../components/common/StarRating';

function AddStoreModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ name: '', email: '', address: '', ownerId: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [owners, setOwners] = useState([]);

  useEffect(() => {
    adminAPI.getOwners().then((res) => setOwners(res.data.data.owners)).catch(() => {});
  }, []);

  const handle = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((p) => ({ ...p, [e.target.name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name || form.name.length < 20 || form.name.length > 60) errs.name = 'Store name must be 20–60 characters';
    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Valid email required';
    if (!form.address || form.address.length > 400) errs.address = 'Address required (max 400 chars)';
    if (!form.ownerId) errs.ownerId = 'Store owner is required';
    return errs;
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await adminAPI.createStore(form);
      toast.success('Store created successfully!');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create store');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>Add New Store</h3>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={submit} noValidate>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Store Name <span>*</span></label>
              <input className={`input ${errors.name ? 'error' : ''}`} name="name" placeholder="Min 20 characters" value={form.name} onChange={handle} />
              {errors.name ? <p className="form-error">⚠ {errors.name}</p> : <p className="form-hint">{form.name.length}/60 (min 20)</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Store Email <span>*</span></label>
              <input className={`input ${errors.email ? 'error' : ''}`} type="email" name="email" placeholder="store@example.com" value={form.email} onChange={handle} />
              {errors.email && <p className="form-error">⚠ {errors.email}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Address <span>*</span></label>
              <textarea className={`input ${errors.address ? 'error' : ''}`} name="address" rows={2} placeholder="Store address" value={form.address} onChange={handle} style={{ resize: 'vertical' }} />
              {errors.address && <p className="form-error">⚠ {errors.address}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Store Owner <span>*</span></label>
              <select className={`input ${errors.ownerId ? 'error' : ''}`} name="ownerId" value={form.ownerId} onChange={handle}>
                <option value="">-- Select an owner --</option>
                {owners.map((o) => <option key={o._id} value={o._id}>{o.name} ({o.email})</option>)}
              </select>
              {errors.ownerId && <p className="form-error">⚠ {errors.ownerId}</p>}
              {owners.length === 0 && (
                <p className="form-hint" style={{ color: 'var(--warning)' }}>
                  ⚠ No store owners found. Create a user with role "owner" first.
                </p>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spinner" /> Creating...</> : 'Create Store'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminStores() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ name: '', email: '', address: '' });
  const [showModal, setShowModal] = useState(false);

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const res = await adminAPI.getStores(params);
      setStores(res.data.data.stores);
    } catch {
      toast.error('Failed to load stores');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchStores(); }, [fetchStores]);

  const handleFilter = (e) => setFilters((p) => ({ ...p, [e.target.name]: e.target.value }));

  const columns = [
    { key: 'name', label: 'Store Name' },
    { key: 'email', label: 'Email' },
    { key: 'address', label: 'Address', render: (v) => <span style={{ maxWidth: 200, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</span> },
    { key: 'owner', label: 'Owner', render: (v) => v?.name || '—', sortable: false },
    {
      key: 'averageRating', label: 'Avg Rating', sortable: true,
      render: (v, row) => v != null
        ? <StarDisplay rating={v} count={row.totalRatings} />
        : <span style={{ color: 'var(--text-3)' }}>No ratings</span>
    },
  ];

  return (
    <>
      <div className="page-header">
        <h2>Manage Stores</h2>
        <p>View, filter, and add stores to the platform</p>
      </div>

      <div className="page-body">
        <div className="filter-bar">
          {[
            { name: 'name', placeholder: 'Filter by name...' },
            { name: 'email', placeholder: 'Filter by email...' },
            { name: 'address', placeholder: 'Filter by address...' },
          ].map(({ name, placeholder }) => (
            <div className="search-input-wrap" key={name} style={{ minWidth: 180 }}>
              <input className="input" name={name} placeholder={placeholder} value={filters[name]} onChange={handleFilter} />
            </div>
          ))}
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>🏪 Add Store</button>
        </div>

        {loading
          ? <div className="loading-center"><div className="spinner spinner-lg" /></div>
          : <SortableTable columns={columns} data={stores} emptyMessage="No stores match the current filters" />
        }
      </div>

      {showModal && (
        <AddStoreModal onClose={() => setShowModal(false)} onSuccess={fetchStores} />
      )}
    </>
  );
}
