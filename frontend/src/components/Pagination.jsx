import React from 'react';

export default function Pagination({
  currentPage = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(totalItems, currentPage * pageSize);

  if (totalItems === 0) return null;

  return (
    <div className="admin__pagination">
      <div className="admin__pagination-info">
        <span>Menampilkan <strong>{startItem}–{endItem}</strong> dari <strong>{totalItems}</strong> data</span>
        {onPageSizeChange && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginLeft: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--admin-muted)' }}>Per hal:</span>
            <select
              className="admin__select"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              style={{ padding: '0.15rem 0.4rem', fontSize: '0.75rem', width: 'auto', borderRadius: '4px' }}
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="admin__pagination-actions">
        <button
          className="admin__btn admin__btn--sm admin__btn--ghost"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          title="Halaman Sebelumnya"
        >
          ‹ Prev
        </button>
        <span style={{ fontSize: '0.8125rem', fontWeight: 500, padding: '0 0.5rem', color: 'var(--admin-text)' }}>
          {currentPage} / {totalPages}
        </span>
        <button
          className="admin__btn admin__btn--sm admin__btn--ghost"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          title="Halaman Berikutnya"
        >
          Next ›
        </button>
      </div>
    </div>
  );
}
