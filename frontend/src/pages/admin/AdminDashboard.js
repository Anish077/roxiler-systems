import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getDashboard()
      .then((res) => setStats(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="loading-center"><div className="spinner spinner-lg" /><p>Loading dashboard...</p></div>
  );

  return (
    <>
      <div className="page-header">
        <h2>Admin Dashboard</h2>
        <p>Platform-wide statistics and overview</p>
      </div>

      <div className="page-body">
        <div className="stat-grid">
          <div className="stat-card purple">
            <div className="stat-icon purple">👥</div>
            <div className="stat-value">{stats?.totalUsers ?? 0}</div>
            <div className="stat-label">Total Users</div>
          </div>
          <div className="stat-card pink">
            <div className="stat-icon pink">🏪</div>
            <div className="stat-value">{stats?.totalStores ?? 0}</div>
            <div className="stat-label">Total Stores</div>
          </div>
          <div className="stat-card green">
            <div className="stat-icon green">⭐</div>
            <div className="stat-value">{stats?.totalRatings ?? 0}</div>
            <div className="stat-label">Total Ratings</div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>
            Quick Actions
          </h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/admin/users" className="btn btn-primary">➕ Add User</Link>
            <Link to="/admin/stores" className="btn btn-ghost">🏪 Add Store</Link>
          </div>
        </div>
      </div>
    </>
  );
}
