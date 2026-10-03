const TOKEN_KEY = "accessToken";

// DELCOM_BASEURL diinjeksikan oleh vite.config.js (define)
export const BASE_URL = DELCOM_BASEURL;

export const getAccessToken = () => localStorage.getItem(TOKEN_KEY);
export const putAccessToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const removeAccessToken = () => localStorage.removeItem(TOKEN_KEY);

// Cover & foto dari API berupa path relatif (img/...) atau URL absolut.
export const assetUrl = (path) => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${new URL(BASE_URL).origin}/${path.replace(/^\//, "")}`;
};

const buildQuery = (query) => {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, value);
    }
  });
  const text = params.toString();
  return text ? `?${text}` : "";
};

const buildMessage = (json) => {
  const details =
    json.data && typeof json.data === "object"
      ? Object.values(json.data).flat().join(", ")
      : "";
  return (
    [json.message, details].filter(Boolean).join(": ") ||
    "Terjadi kesalahan pada server"
  );
};

export async function request(
  path,
  { method = "GET", query = {}, body, auth = true } = {},
) {
  const headers = { Accept: "application/json" };
  const token = getAccessToken();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  let payload;
  if (body instanceof FormData) {
    payload = body; // browser mengatur boundary multipart sendiri
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${path}${buildQuery(query)}`, {
    method,
    headers,
    body: payload,
  });
  const json = await response.json().catch(() => ({}));

  if (!response.ok || json.status !== "success") {
    const error = new Error(buildMessage(json));
    error.status = response.status;
    throw error;
  }
  return json;
}

export const api = {
  get: (path, options) => request(path, { ...options, method: "GET" }),
  post: (path, options) => request(path, { ...options, method: "POST" }),
  put: (path, options) => request(path, { ...options, method: "PUT" }),
  delete: (path, options) => request(path, { ...options, method: "DELETE" }),
};
