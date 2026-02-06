/**
 * 統一 API 請求工具
 * 自動附加認證 Token，統一超時和錯誤處理
 */

const API_TIMEOUT = 30000; // 30 秒超時

/**
 * 取得當前保存的 API Token
 */
export function getApiToken() {
  return localStorage.getItem('bruv_api_token') || '';
}

/**
 * 認證版 fetch — 自動附加 Authorization header 和超時控制
 * @param {string} url - 請求 URL
 * @param {RequestInit} options - fetch 選項
 * @returns {Promise<Response>}
 */
export async function authFetch(url, options = {}) {
  const token = getApiToken();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        ...options.headers,
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    });

    // 401 時清除 Token 並跳轉登入頁
    if (response.status === 401) {
      localStorage.removeItem('bruv_api_token');
      // 避免在登入頁面時無限重定向
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    return response;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * GET JSON 請求
 */
export async function apiGet(url) {
  const response = await authFetch(url);
  if (!response.ok) {
    throw new Error(`API 請求失敗: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

/**
 * POST JSON 請求
 */
export async function apiPost(url, data) {
  const response = await authFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`API 請求失敗: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

/**
 * DELETE 請求
 */
export async function apiDelete(url) {
  const response = await authFetch(url, { method: 'DELETE' });
  if (!response.ok) {
    throw new Error(`API 請求失敗: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

/**
 * PUT JSON 請求
 */
export async function apiPut(url, data) {
  const response = await authFetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`API 請求失敗: ${response.status} ${response.statusText}`);
  }
  return response.json();
}
