import React from 'react';

export default function ConfirmModal({
  isOpen,
  title = 'Konfirmasi Tindakan',
  message = 'Apakah Anda yakin ingin melanjutkan?',
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  type = 'danger',
  onConfirm,
  onCancel,
  busy = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="admin__modal-backdrop" onClick={onCancel}>
      <div className="admin__modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin__modal-header">
          <div className={`admin__modal-icon admin__modal-icon--${type}`}>
            {type === 'danger' ? (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="16" y2="12" /><line x1="12" x2="12.01" y1="8" y2="8" />
              </svg>
            )}
          </div>
          <div>
            <h3 className="admin__modal-title">{title}</h3>
            <p className="admin__modal-desc">{message}</p>
          </div>
        </div>
        <div className="admin__modal-footer">
          <button type="button" className="admin__btn admin__btn--ghost" onClick={onCancel} disabled={busy}>
            {cancelText}
          </button>
          <button
            type="button"
            className={`admin__btn ${type === 'danger' ? 'admin__btn--danger' : 'admin__btn--primary'}`}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? <span className="admin__spinner" /> : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
