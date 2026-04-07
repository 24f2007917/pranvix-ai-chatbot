/**
 * auth.js — Shared Authentication Utilities
 * Pranvix AI Chatbot | BBDU
 */

function showAlert(el, type, msg) {
  el.className = `alert ${type}`;
  el.innerHTML = msg;
  el.style.display = 'block';
}

function getLoggedInUser() {
  try { return JSON.parse(localStorage.getItem('pranvix_user')); }
  catch { return null; }
}

function logout() {
  localStorage.removeItem('pranvix_user');
  window.location.href = 'login.html';
}

// Dark / Light mode
function applyTheme() {
  const t = localStorage.getItem('pranvix_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', t);
}

function toggleTheme() {
  const current = localStorage.getItem('pranvix_theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  localStorage.setItem('pranvix_theme', next);
  document.documentElement.setAttribute('data-theme', next);
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = next === 'dark' ? '☀️' : '🌙';
}

// Apply on load
applyTheme();
