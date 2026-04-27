/**
 * Travel Safari — Shared Header Component
 * Injects a simple, auth-aware sticky header into #header
 */
(function () {
  const NAV_LINKS = [
    { href: 'home.html',        label: 'Home' },
    { href: 'destination.html', label: 'Destinations' },
    { href: 'safaris.html',     label: 'Safaris & Tours' },
    { href: 'plan.html',        label: 'Plan Trip' },
    { href: 'matches.html',     label: 'Find Matches', highlight: true },
    { href: 'contact.html',     label: 'Contact' },
  ];

  function currentPage() {
    return window.location.pathname.split('/').pop() || 'home.html';
  }

  function isLoggedIn() {
    return !!localStorage.getItem('authToken');
  }

  function injectStyles() {
    if (document.getElementById('ts-header-style')) return;
    const s = document.createElement('style');
    s.id = 'ts-header-style';
    s.textContent = `
      .ts-header {
        position: sticky;
        top: 0;
        z-index: 50;
        background: rgba(250,250,248,0.97);
        border-bottom: 1px solid #e4ddd5;
        backdrop-filter: blur(8px);
        font-family: 'Inter', system-ui, sans-serif;
        -webkit-font-smoothing: antialiased;
      }
      .ts-header-inner {
        max-width: 1100px;
        margin: 0 auto;
        padding: 0 24px;
        height: 60px;
        display: flex;
        align-items: center;
        gap: 0;
      }
      .ts-logo {
        display: flex;
        align-items: center;
        gap: 10px;
        text-decoration: none;
        flex-shrink: 0;
        margin-right: 36px;
      }
      .ts-logo-mark {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .ts-logo-mark img {
        width: 65px;
        height: auto;
        border-radius: 8px;
        object-fit: contain;
      }
      .ts-logo-name {
        font-size: 0.95rem;
        font-weight: 700;
        color: #1c1a18;
        letter-spacing: -0.01em;
        white-space: nowrap;
      }
      .ts-nav {
        display: flex;
        align-items: center;
        gap: 2px;
        flex: 1;
      }
      .ts-nav a {
        font-size: 0.875rem;
        font-weight: 500;
        color: #6b6560;
        text-decoration: none;
        padding: 6px 12px;
        border-radius: 7px;
        transition: color 0.15s, background 0.15s;
        white-space: nowrap;
      }
      .ts-nav a:hover { color: #1c1a18; background: #f2ece4; }
      .ts-nav a.active { color: #b85c28; font-weight: 600; background: #f5e8dc; }
      .ts-nav a.highlight {
        color: #3a5a3e;
        font-weight: 700;
        background: #e4ede5;
        position: relative;
      }
      .ts-nav a.highlight::after {
        content: '';
        position: absolute;
        top: 4px; right: 4px;
        width: 6px; height: 6px;
        border-radius: 50%;
        background: #b85c28;
      }
      .ts-nav a.highlight:hover { background: #d4e6d5; color: #2e4831; }
      .ts-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
        margin-left: 20px;
      }
      .ts-btn {
        display: inline-flex;
        align-items: center;
        padding: 7px 16px;
        border-radius: 8px;
        font-size: 0.85rem;
        font-weight: 600;
        text-decoration: none;
        border: none;
        cursor: pointer;
        transition: all 0.15s;
        font-family: inherit;
        white-space: nowrap;
      }
      .ts-btn-ghost {
        background: transparent;
        color: #6b6560;
        border: 1px solid #e4ddd5;
      }
      .ts-btn-ghost:hover { background: #f2ece4; color: #1c1a18; text-decoration: none; }
      .ts-btn-primary {
        background: #b85c28;
        color: white;
      }
      .ts-btn-primary:hover { background: #924519; transform: translateY(-1px); color: white; text-decoration: none; }
      .ts-btn-logout {
        background: transparent;
        color: #b85c28;
        border: 1px solid rgba(184,92,40,0.3);
      }
      .ts-btn-logout:hover { background: #f5e8dc; color: #924519; text-decoration: none; }

      /* Mobile toggle */
      .ts-mobile-toggle {
        display: none;
        background: none;
        border: none;
        cursor: pointer;
        padding: 6px;
        color: #6b6560;
        margin-left: auto;
        font-size: 1.2rem;
      }
      @media (max-width: 720px) {
        .ts-nav { display: none; }
        .ts-actions .ts-btn-ghost { display: none; }
        .ts-mobile-toggle { display: flex; }
        .ts-logo { margin-right: auto; }
        .ts-actions { margin-left: 8px; }
        .ts-nav.open {
          display: flex;
          flex-direction: column;
          position: absolute;
          top: 60px;
          left: 0;
          right: 0;
          background: rgba(250,250,248,0.98);
          border-bottom: 1px solid #e4ddd5;
          padding: 12px 16px;
          gap: 4px;
          backdrop-filter: blur(8px);
        }
        .ts-nav.open a { padding: 10px 14px; border-radius: 8px; }
      }
    `;
    document.head.appendChild(s);
  }

  function render() {
    const page    = currentPage();
    const loggedIn = isLoggedIn();

    const navHTML = NAV_LINKS.map(function(l) {
      const classes = [];
      if (page === l.href) classes.push('active');
      if (l.highlight && page !== l.href) classes.push('highlight');
      const cls = classes.length ? ' class="' + classes.join(' ') + '"' : '';
      return '<a href="' + l.href + '"' + cls + '>' + l.label + '</a>';
    }).join('');

    const authHTML = loggedIn
      ? '<button class="ts-btn ts-btn-logout" id="tsLogout">Log out</button>'
      : '<a href="login.html" class="ts-btn ts-btn-ghost">Log in</a>'
        + '<a href="register.html" class="ts-btn ts-btn-primary">Get started</a>';

    const html = `
      <header class="ts-header" role="banner">
        <div class="ts-header-inner">
          <a href="home.html" class="ts-logo" aria-label="Travel Safari home">
            <span class="ts-logo-mark"><img src="assets/images/logo.png" alt="Travel Safari Logo"></span>
            <span class="ts-logo-name">Travel Safari</span>
          </a>
          <nav class="ts-nav" id="tsNav" aria-label="Main navigation">
            ${navHTML}
          </nav>
          <div class="ts-actions">
            ${authHTML}
          </div>
          <button class="ts-mobile-toggle" id="tsMobileToggle" aria-label="Toggle menu" aria-expanded="false">☰</button>
        </div>
      </header>
    `;

    const placeholder = document.getElementById('header');
    if (placeholder) placeholder.innerHTML = html;

    // Logout
    const logoutBtn = document.getElementById('tsLogout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
      });
    }

    // Mobile toggle
    const toggle = document.getElementById('tsMobileToggle');
    const nav    = document.getElementById('tsNav');
    if (toggle && nav) {
      toggle.addEventListener('click', function() {
        const open = nav.classList.toggle('open');
        toggle.textContent      = open ? '✕' : '☰';
        toggle.setAttribute('aria-expanded', open);
      });
    }
  }

  injectStyles();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();