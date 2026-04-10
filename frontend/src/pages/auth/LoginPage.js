import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handle = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    if (!form.password) errs.password = 'Password is required';
    return errs;
  };

  const submit = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    authAPI.login(form)
      .then((res) => {
        const { user, token } = res.data.data;
        login(user, token);
        toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
        if (user.role === 'admin') navigate('/admin/dashboard');
        else if (user.role === 'owner') navigate('/owner/dashboard');
        else navigate('/user/stores');
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || 'Login failed');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>Roxiler</h1>
          <p>Store Rating Platform</p>
        </div>

        <h2 className="auth-subtitle">Welcome back</h2>
        <p className="auth-desc">Sign in to your account to continue</p>

        <form onSubmit={submit} noValidate autoComplete="new-password">
          <div className="form-group">
            <label className="form-label">Email <span>*</span></label>
            <input
              className={`input ${errors.email ? 'error' : ''}`}
              type="text" name="email"
              autoComplete="off"
              placeholder="you@example.com"
              value={form.email} onChange={handle}
            />
            {errors.email && <p className="form-error">⚠ {errors.email}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Password <span>*</span></label>
            <input
              className={`input ${errors.password ? 'error' : ''}`}
              type="password" name="password"
              placeholder="Enter your password"
              value={form.password} onChange={handle}
              autoComplete="off"
            />
            {errors.password && <p className="form-error">⚠ {errors.password}</p>}
          </div>

          <button className="btn btn-primary btn-full btn-lg" type="button" onClick={submit} disabled={loading}>
            {loading ? <><span className="spinner" /> Signing in...</> : 'Sign In'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account?{' '}
          <Link to="/signup" className="auth-link">Create one</Link>
        </p>
      </div>
    </div>
  );
}
