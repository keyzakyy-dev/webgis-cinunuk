const rawUrl = import.meta.env.VITE_API_URL ?? '';
const BASE_URL = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;

/** Timeout default untuk semua request (ms) */
const REQUEST_TIMEOUT_MS = 15_000;

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw Object.assign(new Error(json.message || 'Request failed'), {
        status: res.status,
        data: json,
      });
    }
    return json;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw Object.assign(new Error('Request timeout — server tidak merespons'), {
        status: 408,
        data: {},
      });
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  del: (path) => request(path, { method: 'DELETE' }),
  upload: async (path, formData) => {
    const token = getToken();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch(`${BASE_URL}${path}`, {
        method: 'POST',
        // Hanya kirim Authorization header jika token ada (hindari "Bearer null")
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
        signal: controller.signal,
      });
      const json = await res.json();
      if (!res.ok) {
        throw Object.assign(new Error(json.message || 'Upload failed'), { status: res.status });
      }
      return json;
    } catch (err) {
      if (err.name === 'AbortError') {
        throw Object.assign(new Error('Upload timeout'), { status: 408 });
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  },
};

export { BASE_URL };
