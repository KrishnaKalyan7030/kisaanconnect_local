// // frontend/js/main.js
// // KisaanConnect — shared utilities
// // FIXES:
// //   • logout() added to window.Main
// //   • checkAuth() actually redirects on expired token
// //   • redirectToDashboard() fixed (getUserRole is sync)
// //   • showToast uses real DOM toast, not alert()
// //   • _showToastInternal exposed for api.js fallback

// // ─── Toast (central, visible, styled) ────────────────────────────────────────
// function _showToastInternal(message, type = "success") {
//   let container = document.getElementById("toast-container");
//   if (!container) {
//     container = document.createElement("div");
//     container.id = "toast-container";
//     container.className = "fixed bottom-6 left-1/2 -translate-x-1/2 space-y-3 z-50";
//     document.body.appendChild(container);
//   }

//   const bg = type === "success" ? "bg-emerald-600" : "bg-red-600";
//   const icon = type === "success" ? "fa-check-circle" : "fa-exclamation-circle";

//   const toast = document.createElement("div");
//   toast.className = `${bg} text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 text-sm md:text-base`;
//   toast.innerHTML = `<i class="fas ${icon}"></i><span>${message}</span>`;
//   container.appendChild(toast);

//   setTimeout(() => {
//     toast.style.transition = "opacity 0.3s";
//     toast.style.opacity = "0";
//     setTimeout(() => toast.remove(), 300);
//   }, 3500);
// }

// // ─── Auth guard ───────────────────────────────────────────────────────────────
// async function checkAuth() {
//   if (!window.API || !window.API.isLoggedIn()) {
//     window.location.href = _loginPath();
//     return false;
//   }
//   // Validate token with server — if 401 comes back, API.getCurrentUser clears storage
//   const result = await window.API.getCurrentUser();
//   if (!result.success) {
//     window.location.href = _loginPath();
//     return false;
//   }
//   return true;
// }

// function _loginPath() {
//   // Go up the right number of directories to reach login.html
//   const depth = (window.location.pathname.match(/\//g) || []).length - 1;
//   const prefix = depth > 1 ? "../".repeat(depth - 1) : "";
//   return prefix + "login.html";
// }

// // ─── Role-based redirect ──────────────────────────────────────────────────────
// function redirectToDashboard() {
//   // FIX: getUserRole() is synchronous (reads localStorage), no await needed
//   const role = window.API.getUserRole();
//   const depth = (window.location.pathname.match(/\//g) || []).length - 1;
//   const prefix = depth > 1 ? "../".repeat(depth - 1) : "";
//   if (role === "farmer") {
//     window.location.href = prefix + "dashboard/farmer/index.html";
//   } else if (role === "buyer") {
//     window.location.href = prefix + "dashboard/buyer/index.html";
//   } else {
//     window.location.href = prefix + "login.html";
//   }
// }

// // ─── Logout ──────────────────────────────────────────────────────────────────
// function logout() {
//   window.API.logout();
// }

// // ─── Navigation helper ────────────────────────────────────────────────────────
// function navigateTo(page) {
//   window.location.href = page;
// }

// // ─── Date formatter ───────────────────────────────────────────────────────────
// function formatDate(dateString) {
//   if (!dateString) return "N/A";
//   return new Date(dateString).toLocaleDateString("en-IN", {
//     day: "numeric", month: "short", year: "numeric"
//   });
// }

// // ─── Expose globally ──────────────────────────────────────────────────────────
// window.Main = {
//   checkAuth,
//   redirectToDashboard,
//   logout,
//   navigateTo,
//   formatDate,
//   showToast: _showToastInternal,
//   _showToastInternal  // used by api.js fallback
// };

// document.addEventListener("DOMContentLoaded", () => {
//   // Inject language switcher into any navbar that has .lang-switcher-slot
//   if (typeof getLangSwitcherHTML === "function") {
//     document.querySelectorAll(".lang-switcher-slot").forEach(slot => {
//       slot.innerHTML = getLangSwitcherHTML();
//     });
//   }
// });

// ============================
// frontend/js/main.js
// KisaanConnect — shared utilities
// FIXES:
//   • logout() added to window.Main
//   • checkAuth() actually redirects on expired token
//   • redirectToDashboard() fixed (getUserRole is sync)
//   • showToast uses real DOM toast, not alert()
//   • _showToastInternal exposed for api.js fallback

// ─── Toast (central, visible, styled) ────────────────────────────────────────
function _showToastInternal(message, type = "success") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "fixed bottom-6 left-1/2 -translate-x-1/2 space-y-3 z-50";
    document.body.appendChild(container);
  }

  const bg = type === "success" ? "bg-emerald-600" : "bg-red-600";
  const icon = type === "success" ? "fa-check-circle" : "fa-exclamation-circle";

  const toast = document.createElement("div");
  toast.className = `${bg} text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 text-sm md:text-base`;
  toast.innerHTML = `<i class="fas ${icon}"></i><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = "opacity 0.3s";
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ─── Auth guard ───────────────────────────────────────────────────────────────
async function checkAuth() {
  if (!window.API || !window.API.isLoggedIn()) {
    window.location.href = _loginPath();
    return false;
  }
  // Validate token with server — if 401 comes back, API.getCurrentUser clears storage
  const result = await window.API.getCurrentUser();
  if (!result.success) {
    window.location.href = _loginPath();
    return false;
  }
  return true;
}

function _loginPath() {
  // Go up the right number of directories to reach login.html
  const depth = (window.location.pathname.match(/\//g) || []).length - 1;
  const prefix = depth > 1 ? "../".repeat(depth - 1) : "";
  return prefix + "login.html";
}

// ─── Role-based redirect ──────────────────────────────────────────────────────
function redirectToDashboard() {
  // FIX: getUserRole() is synchronous (reads localStorage), no await needed
  const role = window.API.getUserRole();
  const depth = (window.location.pathname.match(/\//g) || []).length - 1;
  const prefix = depth > 1 ? "../".repeat(depth - 1) : "";
  if (role === "farmer") {
    window.location.href = prefix + "dashboard/farmer/index.html";
  } else if (role === "buyer") {
    window.location.href = prefix + "dashboard/buyer/index.html";
  } else {
    window.location.href = prefix + "login.html";
  }
}

// ─── Logout ──────────────────────────────────────────────────────────────────
function logout() {
  window.API.logout();
}

// ─── Navigation helper ────────────────────────────────────────────────────────
function navigateTo(page) {
  window.location.href = page;
}

// ─── Date formatter ───────────────────────────────────────────────────────────
function formatDate(dateString) {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric"
  });
}

// ─── Expose globally ──────────────────────────────────────────────────────────
window.Main = {
  checkAuth,
  redirectToDashboard,
  logout,
  navigateTo,
  formatDate,
  showToast: _showToastInternal,
  _showToastInternal  // used by api.js fallback
};

document.addEventListener("DOMContentLoaded", () => {
  // Inject language switcher into any navbar that has .lang-switcher-slot
  if (typeof getLangSwitcherHTML === "function") {
    document.querySelectorAll(".lang-switcher-slot").forEach(slot => {
      slot.innerHTML = getLangSwitcherHTML();
    });
  }
});