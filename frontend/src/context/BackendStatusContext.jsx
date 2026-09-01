import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BASE_URL } from '../api';

const BackendStatusContext = createContext({ isOnline: true, checking: false, checkStatus: () => {} });

export function BackendStatusProvider({ children }) {
  const [isOnline, setIsOnline] = useState(true);
  const [checking, setChecking] = useState(false);

  const checkStatus = useCallback(async () => {
    setChecking(true);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    try {
      const res = await fetch(`${BASE_URL}/api/health`, { signal: controller.signal });
      if (res.ok) {
        setIsOnline(true);
      } else {
        setIsOnline(false);
      }
    } catch {
      setIsOnline(false);
    } finally {
      clearTimeout(timer);
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 15000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  return (
    <BackendStatusContext.Provider value={{ isOnline, checking, checkStatus }}>
      {children}
      {!isOnline && (
        <div className="backend-offline-banner" role="alert">
          <div className="backend-offline-content">
            <span className="backend-offline-dot" aria-hidden="true" />
            <div className="backend-offline-text">
              <strong>Koneksi ke Server Backend Terputus</strong>
              <p>Server API backend tidak berjalan atau tidak dapat dijangkau. Pastikan backend diport 3001 sudah aktif.</p>
            </div>
            <button
              type="button"
              className="backend-offline-btn"
              onClick={checkStatus}
              disabled={checking}
            >
              {checking ? 'Memeriksa…' : 'Coba Lagi'}
            </button>
          </div>
        </div>
      )}
    </BackendStatusContext.Provider>
  );
}

export function useBackendStatus() {
  return useContext(BackendStatusContext);
}
