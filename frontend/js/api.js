// // frontend/js/api.js
// // KisaanConnect — API client
// // FIX: removed duplicate showToast, fixed logout path, cleaned console.logs

// const BASE_URL = "https://kisaanconnect-backend.onrender.com";
// // const BASE_URL = "http://127.0.0.1:8000"; // ← uncomment for local dev

// // ─── Token helpers ────────────────────────────────────────────────────────────
// function setToken(token) {
//   localStorage.setItem("access_token", token);
// }

// function getToken() {
//   return localStorage.getItem("access_token");
// }

// function getAuthHeaders() {
//   const token = getToken();
//   return {
//     "Authorization": "Bearer " + (token || ""),
//     "Content-Type": "application/json"
//   };
// }

// // ─── API object ───────────────────────────────────────────────────────────────
// window.API = {

//   // ── REGISTER ────────────────────────────────────────────────────────────────
//   async register(userData) {
//     try {
//       const res = await fetch(`${BASE_URL}/auth/register`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(userData)
//       });
//       const data = await res.json();
//       return { success: res.ok, data };
//     } catch (err) {
//       return { success: false, message: "Network error. Please check your connection." };
//     }
//   },

//   // ── LOGIN ────────────────────────────────────────────────────────────────────
//   // Backend uses OAuth2PasswordRequestForm → must send as form-urlencoded
//   async login(email, password) {
//     try {
//       const formData = new URLSearchParams();
//       formData.append("username", email);
//       formData.append("password", password);

//       const res = await fetch(`${BASE_URL}/auth/login`, {
//         method: "POST",
//         headers: { "Content-Type": "application/x-www-form-urlencoded" },
//         body: formData
//       });

//       const data = await res.json();

//       if (res.ok) {
//         setToken(data.access_token);
//         localStorage.setItem("user_type", data.user_type);
//       }

//       return { success: res.ok, data };
//     } catch (err) {
//       return { success: false, message: "Network error. Please check your connection." };
//     }
//   },

//   // ── GET CURRENT USER ─────────────────────────────────────────────────────────
//   async getCurrentUser() {
//     try {
//       const res = await fetch(`${BASE_URL}/auth/me`, {
//         headers: getAuthHeaders()
//       });
//       const data = await res.json();
//       // If 401, token is expired/invalid — clear storage
//       if (res.status === 401) {
//         localStorage.removeItem("access_token");
//         localStorage.removeItem("user_type");
//       }
//       return { success: res.ok, data };
//     } catch (err) {
//       return { success: false, data: null };
//     }
//   },

//   // ── GET ALL PRODUCTS ─────────────────────────────────────────────────────────
//   async getAllProducts() {
//     try {
//       const res = await fetch(`${BASE_URL}/products/`);
//       const data = await res.json();
//       return { success: res.ok, data };
//     } catch (err) {
//       return { success: false, message: "Failed to load products", data: [] };
//     }
//   },

//   // ── GET MY PRODUCTS ──────────────────────────────────────────────────────────
//   async getMyProducts() {
//     try {
//       const res = await fetch(`${BASE_URL}/products/my`, {
//         headers: getAuthHeaders()
//       });
//       const data = await res.json();
//       return { success: res.ok, data };
//     } catch (err) {
//       return { success: false, data: [] };
//     }
//   },

//   // ── CREATE PRODUCT (multipart/form-data) ─────────────────────────────────────
//   // Do NOT set Content-Type manually — browser sets correct multipart boundary
//   async createProduct(formData) {
//     try {
//       const token = getToken();
//       if (!token) {
//         return { success: false, message: "You are not logged in. Please login again." };
//       }

//       const res = await fetch(`${BASE_URL}/products/`, {
//         method: "POST",
//         headers: { "Authorization": `Bearer ${token}` },
//         body: formData
//       });

//       let data = {};
//       try { data = await res.json(); } catch (e) { /* empty body */ }

//       if (res.ok) return { success: true, data };

//       return {
//         success: false,
//         message: data.detail || data.message || `Server error (${res.status})`
//       };
//     } catch (err) {
//       return { success: false, message: "Network error. Please check your connection." };
//     }
//   },

//   // ── DELETE PRODUCT ───────────────────────────────────────────────────────────
//   async deleteProduct(id) {
//     try {
//       const res = await fetch(`${BASE_URL}/products/${id}`, {
//         method: "DELETE",
//         headers: getAuthHeaders()
//       });
//       return { success: res.ok };
//     } catch (err) {
//       return { success: false };
//     }
//   },

//   // ── LOGOUT ───────────────────────────────────────────────────────────────────
//   // FIX: use relative path so it works regardless of deployment subdirectory
//   logout() {
//     localStorage.removeItem("access_token");
//     localStorage.removeItem("user_type");
//     // Detect depth from current path and go up to root
//     const depth = (window.location.pathname.match(/\//g) || []).length - 1;
//     const prefix = depth > 1 ? "../".repeat(depth - 1) : "";
//     window.location.href = prefix + "login.html";
//   },

//   // ── AUTH CHECK ───────────────────────────────────────────────────────────────
//   isLoggedIn() {
//     return !!getToken();
//   },

//   getUserRole() {
//     return localStorage.getItem("user_type");
//   },

//   // ── TOAST (single definition) ────────────────────────────────────────────────
//   // Pages define their own rich showToast; this is a fallback used by main.js
//   showToast(message, type = "success") {
//     // Delegate to Main.showToast if available, otherwise create a simple one
//     if (window.Main && window.Main._showToastInternal) {
//       window.Main._showToastInternal(message, type);
//     } else {
//       const bg = type === "success" ? "#16a34a" : "#dc2626";
//       const toast = document.createElement("div");
//       toast.style.cssText = `
//         position:fixed;bottom:24px;left:50%;transform:translateX(-50%);
//         padding:14px 24px;background:${bg};color:#fff;border-radius:16px;
//         font-size:15px;z-index:9999;box-shadow:0 4px 20px rgba(0,0,0,0.2);
//         display:flex;align-items:center;gap:10px;
//       `;
//       toast.innerHTML = `<i class="fas ${type === "success" ? "fa-check-circle" : "fa-exclamation-circle"}"></i><span>${message}</span>`;
//       document.body.appendChild(toast);
//       setTimeout(() => {
//         toast.style.transition = "opacity 0.3s";
//         toast.style.opacity = "0";
//         setTimeout(() => toast.remove(), 300);
//       }, 3500);
//     }
//   }
// };

// =======================

// frontend/js/api.js
// KisaanConnect — API client
// FIX: removed duplicate showToast, fixed logout path, cleaned console.logs

const BASE_URL = "https://kisaanconnect-backend.onrender.com";
// const BASE_URL = "http://127.0.0.1:8000"; // ← uncomment for local dev

// ─── Token helpers ────────────────────────────────────────────────────────────
function setToken(token) {
  localStorage.setItem("access_token", token);
}
function getToken() {
  return localStorage.getItem("access_token");
}

function getAuthHeaders() {
  const token = getToken();
  return {
    "Authorization": "Bearer " + (token || ""),
    "Content-Type": "application/json"
  };
}

// ─── API object ───────────────────────────────────────────────────────────────
window.API = {

  // ── REGISTER ────────────────────────────────────────────────────────────────
  // async register(userData) {
  //   try {
  //     const res = await fetch(`${BASE_URL}/auth/register`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(userData)
  //     });
  //     const data = await res.json();
  //     return { success: res.ok, data };
  //   } catch (err) {
  //     return { success: false, message: "Network error. Please check your connection." };
  //   }
  // },

  async register(userData) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
      signal: controller.signal
    });

    clearTimeout(timeout);
    const data = await res.json();
    return { success: res.ok, data };

  } catch (err) {
    if (err.name === "AbortError") {
      return { success: false, message: "Server is waking up, please try again in 30 seconds." };
    }
    return { success: false, message: "Network error. Please check your connection." };
  }
},

  // ── LOGIN ────────────────────────────────────────────────────────────────────
  // Backend uses OAuth2PasswordRequestForm → must send as form-urlencoded
  async login(email, password) {
    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        setToken(data.access_token);
        localStorage.setItem("user_type", data.user_type);
      }

      return { success: res.ok, data };
    } catch (err) {
      return { success: false, message: "Network error. Please check your connection." };
    }
  },

  // ── GET CURRENT USER ─────────────────────────────────────────────────────────
  async getCurrentUser() {
    try {
      const res = await fetch(`${BASE_URL}/auth/me`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      // If 401, token is expired/invalid — clear storage
      if (res.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user_type");
      }
      return { success: res.ok, data };
    } catch (err) {
      return { success: false, data: null };
    }
  },

  // ── GET ALL PRODUCTS ─────────────────────────────────────────────────────────
  async getAllProducts() {
    try {
      const res = await fetch(`${BASE_URL}/products/`);
      const data = await res.json();
      return { success: res.ok, data };
    } catch (err) {
      return { success: false, message: "Failed to load products", data: [] };
    }
  },

  // ── GET MY PRODUCTS ──────────────────────────────────────────────────────────
  async getMyProducts() {
    try {
      const res = await fetch(`${BASE_URL}/products/my`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      return { success: res.ok, data };
    } catch (err) {
      return { success: false, data: [] };
    }
  },

  // ── CREATE PRODUCT (multipart/form-data) ─────────────────────────────────────
  // Do NOT set Content-Type manually — browser sets correct multipart boundary
  async createProduct(formData) {
    try {
      const token = getToken();
      if (!token) {
        return { success: false, message: "You are not logged in. Please login again." };
      }

      const res = await fetch(`${BASE_URL}/products/`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });

      let data = {};
      try { data = await res.json(); } catch (e) { /* empty body */ }

      if (res.ok) return { success: true, data };

      return {
        success: false,
        message: data.detail || data.message || `Server error (${res.status})`
      };
    } catch (err) {
      return { success: false, message: "Network error. Please check your connection." };
    }
  },

  // ── DELETE PRODUCT ───────────────────────────────────────────────────────────
  async deleteProduct(id) {
    try {
      const res = await fetch(`${BASE_URL}/products/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      return { success: res.ok };
    } catch (err) {
      return { success: false };
    }
  },

  // ── LOGOUT ───────────────────────────────────────────────────────────────────
  // FIX: use relative path so it works regardless of deployment subdirectory
 logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_type");
    window.location.href = window.location.origin + "/login.html";
},

  // ── AUTH CHECK ───────────────────────────────────────────────────────────────
  isLoggedIn() {
    return !!getToken();
  },

  getUserRole() {
    return localStorage.getItem("user_type");
  },

  // ── TOAST (single definition) ────────────────────────────────────────────────
  // Pages define their own rich showToast; this is a fallback used by main.js
  showToast(message, type = "success") {
    // Delegate to Main.showToast if available, otherwise create a simple one
    if (window.Main && window.Main._showToastInternal) {
      window.Main._showToastInternal(message, type);
    } else {
      const bg = type === "success" ? "#16a34a" : "#dc2626";
      const toast = document.createElement("div");
      toast.style.cssText = `
        position:fixed;bottom:24px;left:50%;transform:translateX(-50%);
        padding:14px 24px;background:${bg};color:#fff;border-radius:16px;
        font-size:15px;z-index:9999;box-shadow:0 4px 20px rgba(0,0,0,0.2);
        display:flex;align-items:center;gap:10px;
      `;
      toast.innerHTML = `<i class="fas ${type === "success" ? "fa-check-circle" : "fa-exclamation-circle"}"></i><span>${message}</span>`;
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.style.transition = "opacity 0.3s";
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 300);
      }, 3500);
    }
  }
};