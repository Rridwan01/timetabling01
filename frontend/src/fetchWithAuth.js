// fetchWithAuth.js
// Utility to wrap fetch and handle token expiration globally

export async function fetchWithAuth(url, options = {}, onAuthError) {
  const token = localStorage.getItem("token");
  const headers = {
    ...(options.headers || {}),
    Authorization: token ? `Bearer ${token}` : undefined,
  };

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401 || response.status === 403) {
    // Token invalid or expired
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (typeof onAuthError === "function") onAuthError();
  }

  return response;
}
