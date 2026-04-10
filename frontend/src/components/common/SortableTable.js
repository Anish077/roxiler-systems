import React, { useState, useMemo } from 'react';

export default function SortableTable({ columns, data, emptyMessage = 'No data found' }) {
  const [sort, setSort] = useState({ key: '', dir: 'asc' });

  const toggle = (key) => {
    setSort((prev) =>
      prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }
    );
  };

  const sorted = useMemo(() => {
    if (!sort.key) return data;
    return [...data].sort((a, b) => {
      const av = a[sort.key] ?? '';
      const bv = b[sort.key] ?? '';
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sort.dir === 'asc' ? cmp : -cmp;
    });
  }, [data, sort]);

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            {columns.map((col, ci) => (
              <th
                key={`${col.key}-${ci}`}
                onClick={() => col.sortable !== false && toggle(col.key)}
                className={sort.key === col.key ? 'sorted' : ''}
                style={{ cursor: col.sortable === false ? 'default' : 'pointer' }}
              >
                {col.label}
                {col.sortable !== false && (
                  <span className="sort-icon">
                    {sort.key === col.key ? (sort.dir === 'asc' ? ' ↑' : ' ↓') : ' ↕'}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>
                <div className="empty-state">
                  <div className="empty-state-icon">📭</div>
                  <p>{emptyMessage}</p>
                </div>
              </td>
            </tr>
          ) : (
            sorted.map((row, i) => (
              <tr key={row._id || i}>
                {columns.map((col, ci) => (
                  <td key={`${col.key}-${ci}`}>
                    {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
