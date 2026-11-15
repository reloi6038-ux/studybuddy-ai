import { el, getTheme, toggleTheme, initTheme } from './ui.js';
import { getUser, isLoggedIn, logout } from './api.js';

const NAV_ITEMS = [
  { href: '/dashboard.html', label: 'Dashboard', icon: '◧' },
  { href: '/tutor.html', label: 'Tutor', icon: '💡' },
  { href: '/flashcards.html', label: 'Flashcards', icon: '🃏' },
  { href: '/quiz.html', label: 'Quiz', icon: '📝' },
  { href: '/plan.html', label: 'Planner', icon: '📅' },
];

export function renderNav(activePath = '') {
  initTheme();

  const nav = el('nav', { class: 'nav', role: 'navigation', 'aria-label': 'Main' });
  const inner = el('div', { class: 'nav-inner' });

  // Brand
  const brand = el('a', { href: isLoggedIn() ? '/dashboard.html' : '/', class: 'brand' },
    el('span', { class: 'brand-mark', 'aria-hidden': 'true' }, '📚'),
    el('span', {}, 'Study', el('span', {}, 'Buddy'), ' AI'),
  );

  // Right side
  const links = el('div', { class: 'nav-links' });

  // Theme toggle
  const themeBtn = el('button', {
    class: 'icon-btn',
    type: 'button',
    'aria-label': 'Toggle theme',
    title: 'Toggle theme',
    onclick: toggleTheme,
  }, el('span', { 'data-theme-icon': '' }, getTheme() === 'dark' ? '☀️' : '🌙'));
  links.appendChild(themeBtn);

  if (isLoggedIn()) {
    NAV_ITEMS.forEach((item) => {
      const cls = 'nav-link' + (activePath === item.href ? ' active' : '');
      links.appendChild(el('a', { href: item.href, class: cls }, item.label));
    });

    const user = getUser();
    if (user) {
      links.appendChild(el('span', { class: 'text-muted text-sm', style: 'padding:0 0.5rem;' }, user.name.split(' ')[0]));
    }
    links.appendChild(el('button', { class: 'btn btn-ghost btn-sm', onclick: logout }, 'Log out'));
  } else {
    links.appendChild(el('a', { href: '/login.html', class: 'nav-link' }, 'Log in'));
    links.appendChild(el('a', { href: '/register.html', class: 'btn btn-primary btn-sm' }, 'Get started'));
  }

  inner.appendChild(brand);
  inner.appendChild(links);
  nav.appendChild(inner);

  // Skip link
  const skip = el('a', { href: '#main', class: 'skip-link' }, 'Skip to content');

  document.body.insertBefore(skip, document.body.firstChild);
  document.body.insertBefore(nav, document.body.firstChild);
}

export function renderSidebar(activePath = '') {
  if (!isLoggedIn()) return null;

  const aside = el('aside', { class: 'sidebar', 'aria-label': 'Dashboard navigation' });

  aside.appendChild(el('div', { class: 'sidebar-section' },
    el('div', { class: 'sidebar-title' }, 'Study'),
    ...NAV_ITEMS.slice(1).map((item) => {
      const cls = 'sidebar-link' + (activePath === item.href ? ' active' : '');
      return el('a', { href: item.href, class: cls },
        el('span', { 'aria-hidden': 'true' }, item.icon),
        el('span', {}, item.label),
      );
    }),
  ));

  aside.appendChild(el('div', { class: 'sidebar-section' },
    el('div', { class: 'sidebar-title' }, 'Account'),
    el('a', { href: '/dashboard.html', class: 'sidebar-link' + (activePath === '/dashboard.html' ? ' active' : '') },
      el('span', { 'aria-hidden': 'true' }, '◧'),
      el('span', {}, 'Overview'),
    ),
  ));

  return aside;
}