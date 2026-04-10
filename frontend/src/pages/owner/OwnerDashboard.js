import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ownerAPI } from '../../services/api';
import { StarDisplay } from '../../components/common/StarRating';
import SortableTable from '../../components/common/SortableTable';

export default function OwnerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ownerAPI.getDashboard()
      .then((res) => setData(res.data.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="loading-center"><div className="spinner spinner-lg" /><p>Loading your dashboard...</p></div>
  );

  if (!data) return (
    <div className="loading-center"><p style={{ color: 'var(--danger)' }}>Could not load store data.</p></div>
  );

  const columns = [
    { key: 'userName', label: 'Customer Name', render: (v, row) => row.user?.name || '—' },
    { key: 'userEmail', label: 'Email', render: (v, row) => row.user?.email || '—', sortable: false },
    {
      key: 'userAddress', label: 'Address', sortable: false,
      render: (v, row) => (
        <span style={{ maxWidth: 200, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {row.user?.address || '—'}
        </span>
      ),
    },
    {
      key: 'rating', label: 'Rating',
      render: (v) => <StarDisplay rating={v} />,
    },
    {
      key: 'updatedAt', label: 'Rated On',
      render: (v) => new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    },
  ];

  const tableData = data.ratings.map((r, i) => ({ ...r, _id: r._id || i }));

  return (
    <>
      <div className="page-header">
        <h2>Store Dashboard</h2>
        <p>{data.store.name}</p>
      </div>

      <div className="page-body">
        {/* Stats */}
        <div className="stat-grid" style={{ marginBottom: 32 }}>
          <div className="stat-card purple">
            <div className="stat-icon purple">⭐</div>
            <div className="stat-value">
              {data.averageRating != null ? data.averageRating.toFixed(1) : '—'}
            </div>
            <div className="stat-label">Average Rating</div>
          </div>
          <div className="stat-card pink">
            <div className="stat-icon pink">👤</div>
            <div className="stat-value">{data.totalRatings}</div>
            <div className="stat-label">Total Ratings</div>
          </div>
        </div>

        {/* Store info */}
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>
            Store Info
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {[
              ['Store Name', data.store.name],
              ['Email', data.store.email],
              ['Address', data.store.address],
            ].map(([label, value]) => (
              <div key={label}>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</p>
                <p style={{ fontSize: '0.9rem', color: 'var(--text)' }}>{value}</p>
              </div>
            ))}
            <div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Overall Rating</p>
              {data.averageRating != null
                ? <StarDisplay rating={data.averageRating} count={data.totalRatings} size="lg" />
                : <p style={{ fontSize: '0.9rem', color: 'var(--text-3)' }}>No ratings yet</p>
              }
            </div>
          </div>
        </div>

        {/* Ratings table */}
        <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700 }}>
            Customer Ratings
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>{data.totalRatings} total</span>
        </div>
        <SortableTable
          columns={columns}
          data={tableData}
          emptyMessage="No ratings received yet"
        />
      </div>
    </>
  );
}
