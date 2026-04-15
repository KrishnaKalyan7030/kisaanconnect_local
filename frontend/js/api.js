const BASE_URL = "http://127.0.0.1:8000";

// ================= TOKEN =================
function setToken(token) {
    localStorage.setItem("access_token", token);
}

function getToken() {
    return localStorage.getItem("access_token");
}

function getAuthHeaders() {
    const token = getToken();
    if (!token) {
        console.warn("Warning: No access token found!");
    }
    return {
        "Authorization": "Bearer " + (token || ""),
        "Content-Type": "application/json"
    };
}

// ================= API =================
window.API = {

    // ================= REGISTER =================
    async register(userData) {
        try {
            const res = await fetch(`${BASE_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData)
            });

            const data = await res.json();

            return { success: res.ok, data };

        } catch {
            return { success: false, message: "Network error" };
        }
    },

    // ================= LOGIN =================
    async login(email, password) {
        try {
            const formData = new URLSearchParams();
            formData.append("username", email);
            formData.append("password", password);

            const res = await fetch(`${BASE_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: formData
            });

            const data = await res.json();

            if (res.ok) {
                setToken(data.access_token);
                localStorage.setItem("user_type", data.user_type);
            }

            return { success: res.ok, data };

        } catch {
            return { success: false, message: "Network error" };
        }
    },

    // ================= GET CURRENT USER =================
    async getCurrentUser() {
        try {
            const res = await fetch(`${BASE_URL}/auth/me`, {
                headers: getAuthHeaders()
            });

            const data = await res.json();

            return { success: res.ok, data };

        } catch {
            return { success: false };
        }
    },

    // ================= GET ALL PRODUCTS =================
    async getAllProducts() {
        try {
            const res = await fetch(`${BASE_URL}/products/`);
            const data = await res.json();

            return { success: res.ok, data };

        } catch {
            return { success: false, message: "Failed to load products" };
        }
    },

    // ================= GET MY PRODUCTS =================
    async getMyProducts() {
        try {
            const res = await fetch(`${BASE_URL}/products/my`, {
                headers: getAuthHeaders()
            });

            const data = await res.json();

            return { success: res.ok, data };

        } catch {
            return { success: false };
        }
    },

    // ================= CREATE PRODUCT - FIXED & IMPROVED =================
  // ================= CREATE PRODUCT - FIXED FOR MULTIPART =================
async createProduct(formData) {   // Now accepts FormData object, not JSON
    try {
        const token = getToken();
        if (!token) {
            return { success: false, message: "You are not logged in. Please login again." };
        }

        console.log("📤 Sending multipart form data...");

        const res = await fetch(`${BASE_URL}/products/`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
                // Do NOT set Content-Type → browser sets correct multipart boundary
            },
            body: formData
        });

        let data = {};
        try {
            data = await res.json();
        } catch (e) {}

        console.log(`Response Status: ${res.status}`, data);

        if (res.ok) {
            console.log("✅ Product created successfully!");
            return { success: true, data };
        }

        return {
            success: false,
            message: data.detail || data.message || `Error ${res.status}`
        };

    } catch (err) {
        console.error("❌ Network Error:", err);
        return { success: false, message: "Network error. Check console (F12)." };
    }
},
    // ================= DELETE PRODUCT =================
    async deleteProduct(id) {
        try {
            const res = await fetch(`${BASE_URL}/products/${id}`, {
                method: "DELETE",
                headers: getAuthHeaders()
            });

            return { success: res.ok };

        } catch {
            return { success: false };
        }
    },

    // ================= LOGOUT =================
    logout() {
        localStorage.clear();
        window.location.href = "/login.html";
    },

    // ================= CHECK LOGIN =================
    isLoggedIn() {
        return !!getToken();
    },

    showToast(message) {
        alert(message);
    }
};