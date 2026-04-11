// frontend/js/api.js
// Centralized API calls for KisaanConnect Local
// Backend: FastAPI + PostgreSQL

const API_BASE_URL = 'http://localhost:8000';   // Change this in production

// api.js
export async function getHello() {
  const response = await fetch("http://127.0.0.1:8000/api/hello");
  return response.json();
}

// Helper to get auth token (if using JWT)
function getAuthToken() {
  return localStorage.getItem('access_token');
}

// Common headers
function getHeaders(includeAuth = true) {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (includeAuth && getAuthToken()) {
    headers['Authorization'] = `Bearer ${getAuthToken()}`;
  }
  return headers;
}

// ================== AUTH APIs ==================

// Login User (Farmer or Buyer)
async function loginUser(email, password, role) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role })
    });

    const data = await response.json();
    if (response.ok) {
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user_role', role);
      localStorage.setItem('user_id', data.user_id);
      return { success: true, data };
    } else {
      return { success: false, message: data.detail || 'Login failed' };
    }
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'Network error. Please try again.' };
  }
}

// Register New User
async function registerUser(name, email, phone, password, role) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, password, role })
    });

    const data = await response.json();
    return response.ok 
      ? { success: true, data } 
      : { success: false, message: data.detail || 'Registration failed' };
  } catch (error) {
    return { success: false, message: 'Network error' };
  }
}

// Logout
function logoutUser() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user_role');
  localStorage.removeItem('user_id');
  window.location.href = '../login.html';
}

// ================== FARMER APIs ==================

// Add New Product (with image)
async function addProduct(productData) {
  const formData = new FormData();
  
  // Append all fields
  Object.keys(productData).forEach(key => {
    if (key === 'image' && productData.image) {
      formData.append('image', productData.image);   // File object
    } else {
      formData.append(key, productData[key]);
    }
  });

  try {
    const response = await fetch(`${API_BASE_URL}/farmer/products`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: formData
    });

    const data = await response.json();
    return response.ok 
      ? { success: true, data } 
      : { success: false, message: data.detail || 'Failed to add product' };
  } catch (error) {
    console.error('Add product error:', error);
    return { success: false, message: 'Network error' };
  }
}

// Get Farmer's Products
async function getMyProducts() {
  try {
    const response = await fetch(`${API_BASE_URL}/farmer/products`, {
      method: 'GET',
      headers: getHeaders()
    });

    const data = await response.json();
    return response.ok ? { success: true, data } : { success: false, message: data.detail };
  } catch (error) {
    return { success: false, message: 'Failed to fetch products' };
  }
}

// Delete Product
async function deleteProduct(productId) {
  try {
    const response = await fetch(`${API_BASE_URL}/farmer/products/${productId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });

    return response.ok 
      ? { success: true, message: 'Product deleted successfully' } 
      : { success: false, message: 'Failed to delete product' };
  } catch (error) {
    return { success: false, message: 'Network error' };
  }
}

// ================== BUYER / MARKETPLACE APIs ==================

// Get All Active Products (Marketplace)
async function getAllProducts(filters = {}) {
  let url = `${API_BASE_URL}/products`;
  
  // Add query parameters if needed
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.category) params.append('category', filters.category);
  if (filters.min_price) params.append('min_price', filters.min_price);

  if (params.toString()) url += '?' + params.toString();

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(false)   // No auth required for public marketplace
    });

    const data = await response.json();
    return response.ok ? { success: true, data } : { success: false, message: data.detail };
  } catch (error) {
    return { success: false, message: 'Failed to load products' };
  }
}

// Get Single Product Details
async function getProductById(productId) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: 'GET',
      headers: getHeaders(false)
    });

    const data = await response.json();
    return response.ok ? { success: true, data } : { success: false, message: data.detail };
  } catch (error) {
    return { success: false, message: 'Failed to fetch product details' };
  }
}

// ================== UTILITY FUNCTIONS ==================

// Show Toast Notification (Reusable)
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `fixed bottom-6 right-6 px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-3 z-[9999] text-white 
                     ${type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`;
  toast.innerHTML = `
    <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
    <span>${message}</span>
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'all 0.4s';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

// Check if user is logged in
function isLoggedIn() {
  return !!getAuthToken();
}

// Get current user role
function getUserRole() {
  return localStorage.getItem('user_role');
}

// Redirect based on role
function redirectBasedOnRole() {
  const role = getUserRole();
  if (role === 'farmer') {
    window.location.href = 'dashboard/farmer/my-products.html';
  } else if (role === 'buyer') {
    window.location.href = 'marketplace.html';
  }
}

// Export all functions so other files can import them
// Note: Since we're using vanilla JS, we'll use window object for global access
window.API = {
  loginUser,
  registerUser,
  logoutUser,
  addProduct,
  getMyProducts,
  deleteProduct,
  getAllProducts,
  getProductById,
  showToast,
  isLoggedIn,
  getUserRole,
  redirectBasedOnRole
};