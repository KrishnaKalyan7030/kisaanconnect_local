const BASE_URL = "http://localhost:8000";

const API = {

  // ── Register ──────────────────────────────────────────────
  async register(formData) {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Registration failed");
    return data;
  },

  // ── Login ─────────────────────────────────────────────────
  async login(email, password) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",   // ← stores cookie in browser
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Login failed");
    return data;
  },

  // ── Save token to localStorage (backup) ──────────────────
  saveToken(token, userType) {
    localStorage.setItem("access_token", token);
    localStorage.setItem("user_type", userType);
  },

  // ── Get token ─────────────────────────────────────────────
  getToken() {
    return localStorage.getItem("access_token");
  },

  // ── Logout ────────────────────────────────────────────────
  logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_type");
    window.location.href = "/auth/login";
  },

  // ── Is Logged In ──────────────────────────────────────────
  isLoggedIn() {
    return !!localStorage.getItem("access_token");
  }
};