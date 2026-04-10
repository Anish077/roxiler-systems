import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';
import SortableTable from '../../components/common/SortableTable';
import { StarDisplay } from '../../components/common/StarRating';
import { validateForm } from '../../utils/validators';

const ROLES = ['user', 'admin', 'owner'];

function AddUserModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', address: '', role: 'user' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handle = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((p) => ({ ...p, [e.target.name]: '' }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = validateForm({ name: form.name, email: form.email, password: form.password, address: form.address });
    if (!form.role) errs.role = 'Role is required';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await adminAPI.createUser(form);
      toast.success('User created successfully!');
      onSuccess();
      onClose();
    } catch (err) {
      const serverErrors = err.response?.data?.errors;
      if (serverErrors) {
        const mapped = {};
        serverErrors.forEach(({ field, message }) => { mapped[field] = message; });
        setErrors(mapped);
      } else {
        toast.error(err.response?.data?.message || 'Failed to create user');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>Add New User</h3>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={submit} noValidate>
          <div className="modal-body">
            {[
              { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Min 20 characters' },
              { name: 'email', label: 'Email', type: 'email', placeholder: 'user@example.com' },
              { name: 'password', label: 'Password', type: 'password', placeholder: '8–16 chars, 1 uppercase, 1 special' },
              { name: 'address', label: 'Address', type: 'textarea', placeholder: 'Max 400 characters' },
            ].map(({ name, label, type, placeholder }) => (
              <div className="form-group" key={name}>
                <label className="form-label">{label} <span>*</span></label>
                {type === 'textarea'
                  ? <textarea className={`input ${errors[name] ? 'error' : ''}`} name={name} rows={2} placeholder={placeholder} value={form[name]} onChange={handle} style={{ resize: 'vertical' }} />
                  : <input className={`input ${errors[name] ? 'error' : ''}`} type={type} name={name} placeholder={placeholder} value={form[name]} onChange={handle} />
                }
                {errors[name] && <p className="form-error">⚠ {errors[name]}</p>}
              </div>
            ))}
            <div className="form-group">
              <label className="form-label">Role <span>*</span></label>
              <select className="input" name="role" value={form.role} onChange={handle}>
                {ROLES.map((r) => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spinner" /> Creating...</> : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [showModal, setShowModal] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const res = await adminAPI.getUsers(params);
      setUsers(res.data.data.users);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleFilter = (e) => setFilters((p) => ({ ...p, [e.target.name]: e.target.value }));

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'address', label: 'Address', render: (v) => <span style={{ maxWidth: 200, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</span> },
    {
      key: 'role', label: 'Role',
      render: (v) => <span className={`badge badge-${v}`}>{v}</span>
    },
    {
      key: 'storeRating', label: 'Store Rating', sortable: false,
      render: (v, row) => row.role === 'owner'
        ? (v != null ? <StarDisplay rating={v} /> : <span style={{ color: 'var(--text-3)' }}>No ratings yet</span>)
        : <span style={{ color: 'var(--text-3)' }}>—</span>
    },
  ];

  return (
    <>
      <div className="page-header">
        <h2>Manage Users</h2>
        <p>View, filter, and add platform users</p>
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
          <select className="input" name="role" value={filters.role} onChange={handleFilter} style={{ width: 140, flex: 'none' }}>
            <option value="">All Roles</option>
            {ROLES.map((r) => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
          </select>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>➕ Add User</button>
        </div>

        {loading
          ? <div className="loading-center"><div className="spinner spinner-lg" /></div>
          : <SortableTable columns={columns} data={users} emptyMessage="No users match the current filters" />
        }
      </div>

      {showModal && (
        <AddUserModal onClose={() => setShowModal(false)} onSuccess={fetchUsers} />
      )}
    </>
  );
}
