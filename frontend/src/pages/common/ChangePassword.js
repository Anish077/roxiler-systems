import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { authAPI } from '../../services/api';
import { validators } from '../../utils/validators';

export default function ChangePassword() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handle = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((p) => ({ ...p, [e.target.name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.currentPassword) errs.currentPassword = 'Current password is required';
    const pwErr = validators.password(form.newPassword);
    if (pwErr) errs.newPassword = pwErr;
    if (form.newPassword !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await authAPI.changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      toast.success('Password changed successfully!');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <h2>Change Password</h2>
        <p>Update your account password</p>
      </div>
      <div className="page-body">
        <div className="card" style={{ maxWidth: 480 }}>
          <form onSubmit={submit} noValidate>
            {[
              { name: 'currentPassword', label: 'Current Password', hint: '' },
              { name: 'newPassword', label: 'New Password', hint: '8–16 chars, 1 uppercase, 1 special character' },
              { name: 'confirmPassword', label: 'Confirm New Password', hint: '' },
            ].map(({ name, label, hint }) => (
              <div className="form-group" key={name}>
                <label className="form-label">{label} <span>*</span></label>
                <input
                  className={`input ${errors[name] ? 'error' : ''}`}
                  type="password" name={name}
                  value={form[name]} onChange={handle}
                  placeholder={hint || `Enter ${label.toLowerCase()}`}
                />
                {errors[name]
                  ? <p className="form-error">⚠ {errors[name]}</p>
                  : hint && <p className="form-hint">{hint}</p>
                }
              </div>
            ))}

            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? <><span className="spinner" /> Updating...</> : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
