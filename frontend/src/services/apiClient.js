/**
 * 統一 API 請求工具
 * 自動附加認證 Token，統一超時和錯誤處理
 * 
 * 層級:
 *   authFetch  → 底層：附加 Token、超時、401 處理，回傳 raw Response
 *   apiGet / apiPost / apiPut / apiDelete → 高層：自動 JSON 解析 + 錯誤提取
 *   apiPostForm → 高層：FormData 上傳（不設 Content-Type，由瀏覽器自動處理）
 * 
 * @author BruV Team
 * @date 2026-02-11
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
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    return response;
  } finally {
    clearTimeout(timeout);
  }
}

// ===== 內部工具 =====

/**
 * 從非 2xx 回應中提取錯誤訊息
 * @param {Response} response
 * @returns {Promise<string>}
 */
async function _extractErrorMessage(response) {
  try {
    const body = await response.json();
    return body.detail || body.message || `HTTP ${response.status}`;
  } catch {
    return `HTTP ${response.status} ${response.statusText}`;
  }
}

// ===== 高層便捷 API =====

/**
 * GET JSON 請求
 * @param {string} url
 * @returns {Promise<any>} 解析後的 JSON
 */
export async function apiGet(url) {
  const response = await authFetch(url);
  if (!response.ok) {
    throw new Error(await _extractErrorMessage(response));
  }
  return response.json();
}

/**
 * POST JSON 請求
 * @param {string} url
 * @param {any} data - 會自動 JSON.stringify
 * @returns {Promise<any>}
 */
export async function apiPost(url, data) {
  const response = await authFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(await _extractErrorMessage(response));
  }
  return response.json();
}

/**
 * POST FormData 請求（檔案上傳）
 * 不設 Content-Type，瀏覽器會自動加上 multipart/form-data boundary
 * @param {string} url
 * @param {FormData} formData
 * @returns {Promise<any>}
 */
export async function apiPostForm(url, formData) {
  const response = await authFetch(url, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    throw new Error(await _extractErrorMessage(response));
  }
  return response.json();
}

/**
 * DELETE 請求
 * @param {string} url
 * @returns {Promise<any>}
 */
export async function apiDelete(url) {
  const response = await authFetch(url, { method: 'DELETE' });
  if (!response.ok) {
    throw new Error(await _extractErrorMessage(response));
  }
  return response.json();
}

/**
 * PUT JSON 請求
 * @param {string} url
 * @param {any} data
 * @returns {Promise<any>}
 */
export async function apiPut(url, data) {
  const response = await authFetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(await _extractErrorMessage(response));
  }
  return response.json();
}
