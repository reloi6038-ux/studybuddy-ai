// ─── Toast notifications ────────────────────────────
function ensureToastContainer() {
  let c = document.getElementById('toast-container');
  if (!c) {
    c = document.createElement('div');
    c.id = 'toast-container';
    c.setAttribute('aria-live', 'polite');
    c.setAttribute('aria-atomic', 'false');
    document.body.appendChild(c);
  }
  return c;
}

export function toast(message, type = 'info', duration = 3600) {
  const container = ensureToastContainer();
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.setAttribute('role', 'status');
  el.textContent = message;
  container.appendChild(el);

  setTimeout(() => {
    el.classList.add('leaving');
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }, duration);
}

// ─── Theme toggle ────────────────────────────────────
const THEME_KEY = 'studybuddy_theme';

export function getTheme() {
  return localStorage.getItem(THEME_KEY) || 'dark';
}

export function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
  document.querySelectorAll('[data-theme-icon]').forEach((el) => {
    el.textContent = theme === 'dark' ? '☀️' : '🌙';
  });
  document.querySelectorAll('[data-theme-label]').forEach((el) => {
    el.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
  });
}

export function toggleTheme() {
  setTheme(getTheme() === 'dark' ? 'light' : 'dark');
}

export function initTheme() {
  setTheme(getTheme());
}

// ─── Scroll reveal ───────────────────────────────────
export function initReveal() {
  // Only add the class that triggers animations if JS is actually running
  document.documentElement.classList.add('js-reveal');

  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  if (!('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('visible'));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  els.forEach((el) => io.observe(el));
}

// ─── Tiny DOM helpers ────────────────────────────────
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'class') node.className = v;
    else if (k === 'dataset') Object.assign(node.dataset, v);
    else if (k.startsWith('on') && typeof v === 'function') {
      node.addEventListener(k.slice(2).toLowerCase(), v);
    } else if (v !== false && v != null) {
      node.setAttribute(k, v);
    }
  });
  children.flat().forEach((c) => {
    if (c == null || c === false) return;
    node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  });
  return node;
}

// ─── Format helpers ──────────────────────────────────
export function formatDate(d) {
  const date = new Date(d);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatRelative(d) {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(d);
}

// ─── Confirm dialog (promise-based) ──────────────────
export function confirmDialog(message, { title = 'Confirm', okText = 'Confirm' } = {}) {
  return new Promise((resolve) => {
    const overlay = el('div', {
      class: 'modal-overlay',
      style: 'position:fixed;inset:0;background:rgba(0,0,0,0.6);display:grid;place-items:center;z-index:3000;backdrop-filter:blur(6px);animation:slideDown 200ms ease;',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-labelledby': 'cd-title',
    });
    const box = el('div', { class: 'card card-pad', style: 'max-width:420px;width:90%;' },
      el('h3', { class: 'h-2', id: 'cd-title' }, title),
      el('p', { class: 'text-muted', style: 'margin-top:0.5rem;margin-bottom:1.25rem;' }, message),
      el('div', { class: 'flex', style: 'justify-content:flex-end;' },
        el('button', { class: 'btn btn-ghost', onclick: close }, 'Cancel'),
        el('button', { class: 'btn btn-primary', onclick: () => close(true) }, okText),
      ),
    );
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    function close(result = false) {
      document.removeEventListener('keydown', onKey);
      overlay.remove();
      resolve(result);
    }
  });
}