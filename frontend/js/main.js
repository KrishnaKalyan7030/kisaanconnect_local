// frontend/js/main.js
// Shared utilities, language toggle, common functions for KisaanConnect Local

// ================== Multilingual Support ==================
const translations = {
  en: {
    // Common texts used across pages
    "welcome": "Welcome",
    "logout": "Logout",
    "search": "Search",
    "add_product": "Add Product",
    "my_products": "My Products",
    "marketplace": "Marketplace",
    "dashboard": "Dashboard",
    "contact_farmer": "Contact Farmer",
    "no_products": "No products found",
    "loading": "Loading...",
    "success": "Success",
    "error": "Error"
  },
  hi: {
    "welcome": "स्वागत है",
    "logout": "लॉग आउट",
    "search": "खोजें",
    "add_product": "उत्पाद जोड़ें",
    "my_products": "मेरे उत्पाद",
    "marketplace": "मार्केटप्लेस",
    "dashboard": "डैशबोर्ड",
    "contact_farmer": "किसान से संपर्क करें",
    "no_products": "कोई उत्पाद नहीं मिला",
    "loading": "लोड हो रहा है...",
    "success": "सफल",
    "error": "त्रुटि"
  }
};

let currentLang = 'en';

function toggleLanguage() {
  currentLang = currentLang === 'en' ? 'hi' : 'en';
  
  // Update all elements that have data-translate attribute
  document.querySelectorAll('[data-translate]').forEach(el => {
    const key = el.getAttribute('data-translate');
    if (translations[currentLang][key]) {
      el.textContent = translations[currentLang][key];
    }
  });

  window.API.showToast(currentLang === 'en' ? "Language changed to English" : "भाषा हिंदी में बदल गई");
}

// ================== Common Navigation Helper ==================
function navigateTo(page) {
  window.location.href = page;
}

// ================== Check Authentication Status ==================
function checkAuth() {
  if (!window.API.isLoggedIn()) {
    window.location.href = '/login.html';
    return false;
  }
  return true;
}

// ================== Role-based Redirection ==================
function redirectToDashboard() {
  const role = window.API.getUserRole();
  if (role === 'farmer') {
    window.location.href = '/dashboard/farmer/index.html';
  } else if (role === 'buyer') {
    window.location.href = '/dashboard/buyer/index.html';
  } else {
    window.location.href = '/login.html';
  }
}

// ================== Format Date ==================
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
}

// ================== Toast Notification (already in api.js, but wrapper) ==================
function showToast(message, type = 'success') {
  window.API.showToast(message, type);
}

// ================== Make functions globally available ==================
window.Main = {
  toggleLanguage,
  navigateTo,
  checkAuth,
  redirectToDashboard,
  formatDate,
  showToast
};

// Auto initialize on every page load
document.addEventListener('DOMContentLoaded', () => {
  // You can add global initialization logic here if needed
  console.log('✅ KisaanConnect main.js loaded');
});