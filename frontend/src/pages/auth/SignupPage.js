import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import { validateForm } from '../../utils/validators';

export default function SignupPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handle = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((p) => ({ ...p, [e.target.name]: '' }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = validateForm(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const res = await authAPI.signup(form);
      const { user, token } = res.data.data;
      login(user, token);
      toast.success('Account created! Welcome to Roxiler.');
      navigate('/user/stores');
    } catch (err) {
      const serverErrors = err.response?.data?.errors;
      if (serverErrors) {
        const mapped = {};
        serverErrors.forEach(({ field, message }) => { mapped[field] = message; });
        setErrors(mapped);
      } else {
        toast.error(err.response?.data?.message || 'Signup failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 500 }}>
        <div className="auth-logo">
          <h1>Roxiler</h1>
          <p>Store Rating Platform</p>
        </div>

        <h2 className="auth-subtitle">Create your account</h2>
        <p className="auth-desc">Join Roxiler to discover and rate stores</p>

        <form onSubmit={submit} noValidate>
          <div className="form-group">
            <label className="form-label">Full Name <span>*</span></label>
            <input
              className={`input ${errors.name ? 'error' : ''}`}
              name="name" placeholder="Min 20 characters"
              value={form.name} onChange={handle}
            />
            {errors.name
              ? <p className="form-error">⚠ {errors.name}</p>
              : <p className="form-hint">{form.name.length}/60 characters (min 20)</p>
            }
          </div>

          <div className="form-group">
            <label className="form-label">Email <span>*</span></label>
            <input
              className={`input ${errors.email ? 'error' : ''}`}
              type="email" name="email" placeholder="you@example.com"
              value={form.email} onChange={handle}
            />
            {errors.email && <p className="form-error">⚠ {errors.email}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Password <span>*</span></label>
            <input
              className={`input ${errors.password ? 'error' : ''}`}
              type="password" name="password" placeholder="8–16 chars, 1 uppercase, 1 special"
              value={form.password} onChange={handle}
            />
            {errors.password
              ? <p className="form-error">⚠ {errors.password}</p>
              : <p className="form-hint">Must be 8–16 characters with 1 uppercase and 1 special character</p>
            }
          </div>

          <div className="form-group">
            <label className="form-label">Address <span>*</span></label>
            <textarea
              className={`input ${errors.address ? 'error' : ''}`}
              name="address" rows={3} placeholder="Your address (max 400 characters)"
              value={form.address} onChange={handle}
              style={{ resize: 'vertical' }}
            />
            {errors.address
              ? <p className="form-error">⚠ {errors.address}</p>
              : <p className="form-hint">{form.address.length}/400 characters</p>
            }
          </div>

          <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
            {loading ? <><span className="spinner" /> Creating account...</> : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
