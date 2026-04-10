import React, { useEffect, useState, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { userAPI } from '../../services/api';
import { StarDisplay, StarInput } from '../../components/common/StarRating';

function RatingModal({ store, onClose, onSuccess }) {
  const [rating, setRating] = useState(store.userRating || 0);
  const [loading, setLoading] = useState(false);
  const isUpdate = store.userRatingId != null;

  const submit = async () => {
    if (!rating) { toast.error('Please select a rating'); return; }
    setLoading(true);
    try {
      if (isUpdate) {
        await userAPI.updateRating(store.userRatingId, { rating });
        toast.success('Rating updated!');
      } else {
        await userAPI.submitRating({ storeId: store._id, rating });
        toast.success('Rating submitted!');
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>{isUpdate ? 'Update Rating' : 'Rate Store'}</h3>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <p style={{ color: 'var(--text-2)', marginBottom: 20, fontSize: '0.9rem' }}>
            {isUpdate ? 'Update your rating for' : 'Rate'}{' '}
            <strong style={{ color: 'var(--text)' }}>{store.name}</strong>
          </p>
          <div style={{ marginBottom: 24 }}>
            <p className="your-rating-label" style={{ marginBottom: 12 }}>Select your rating</p>
            <StarInput value={rating} onChange={setRating} />
          </div>
          {rating > 0 && (
            <div style={{
              background: 'var(--bg-3)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)', padding: '12px 16px',
              fontSize: '0.85rem', color: 'var(--text-2)',
            }}>
              {['', '😞 Poor experience', '😕 Below average', '😐 Average', '🙂 Good experience', '😄 Excellent!'][rating]}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={loading || !rating}>
            {loading ? <><span className="spinner" /> Submitting...</> : (isUpdate ? 'Update Rating' : 'Submit Rating')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UserStores() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('asc');
  const [selectedStore, setSelectedStore] = useState(null);

  // Only pass search to backend. Sorting is done client-side so computed
  // fields like averageRating (not a real DB column) sort correctly.
  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userAPI.getStores({ search });
      setStores(res.data.data.stores);
    } catch {
      toast.error('Failed to load stores');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchStores, 300);
    return () => clearTimeout(t);
  }, [fetchStores]);

  const sortedStores = useMemo(() => {
    return [...stores].sort((a, b) => {
      const av = a[sortBy];
      const bv = b[sortBy];
      // Push nulls to the end regardless of sort direction
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
      return order === 'asc' ? cmp : -cmp;
    });
  }, [stores, sortBy, order]);

  const toggleSort = (field) => {
    if (sortBy === field) setOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    else { setSortBy(field); setOrder('asc'); }
  };

  return (
    <>
      <div className="page-header">
        <h2>Browse Stores</h2>
        <p>Discover and rate stores on the platform</p>
      </div>

      <div className="page-body">
        <div className="filter-bar">
          <div className="search-input-wrap" style={{ flex: 1, maxWidth: 400 }}>
            <span className="search-icon">🔍</span>
            <input
              className="input"
              placeholder="Search by store name or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <span style={{ fontSize: '0.8rem', color: 'var(--text-3)', flexShrink: 0 }}>Sort:</span>
          {[['name', 'Name'], ['averageRating', 'Rating']].map(([field, label]) => (
            <button
              key={field}
              className={`btn btn-sm ${sortBy === field ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => toggleSort(field)}
            >
              {label} {sortBy === field ? (order === 'asc' ? '↑' : '↓') : ''}
            </button>
          ))}

          <span style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginLeft: 'auto' }}>
            {sortedStores.length} store{sortedStores.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="loading-center">
            <div className="spinner spinner-lg" />
            <p>Loading stores...</p>
          </div>
        ) : sortedStores.length === 0 ? (
          <div className="empty-state" style={{ padding: '80px 20px' }}>
            <div className="empty-state-icon">🏪</div>
            <p>{search ? 'No stores match your search' : 'No stores available yet'}</p>
          </div>
        ) : (
          <div className="stores-grid">
            {sortedStores.map((store) => (
              <div className="store-card" key={store._id}>
                <div className="store-name">{store.name}</div>
                <div className="store-address">📍 {store.address}</div>

                <div style={{ marginBottom: 8 }}>
                  <p className="your-rating-label">Overall Rating</p>
                  {store.averageRating != null
                    ? <StarDisplay rating={store.averageRating} count={store.totalRatings} />
                    : <span style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>No ratings yet</span>
                  }
                </div>

                <div className="store-card-footer">
                  <div>
                    <p className="your-rating-label">Your Rating</p>
                    {store.userRating != null
                      ? <StarDisplay rating={store.userRating} />
                      : <span style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>Not rated</span>
                    }
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setSelectedStore(store)}
                  >
                    {store.userRating != null ? '✏️ Edit Rating' : '⭐ Rate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedStore && (
        <RatingModal
          store={selectedStore}
          onClose={() => setSelectedStore(null)}
          onSuccess={fetchStores}
        />
      )}
    </>
  );
}
