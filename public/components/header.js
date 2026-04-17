document.addEventListener('DOMContentLoaded', () => {
    const mount = document.getElementById('header');
    if (!mount) return;
  
    // Inject styles once
    if (!document.getElementById('site-header-styles')) {
      const style = document.createElement('style');
      style.id = 'site-header-styles';
      style.textContent = `
        :root{
          --accent:#c07a3f;
          --border: rgba(255,255,255,.14);
  
          --max: 980px;
          --pad: 1.25rem;
        }
  
        .site-header{
          background: #000;
          border-bottom: 1px solid var(--border);
        }
  
        .site-header-inner{
          max-width: var(--max);
          margin: 0 auto;
          padding: .9rem var(--pad);
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }
  
        .site-brand{
          display:flex;
          align-items:center;
          gap:.6rem;
          text-decoration:none;
          color: #fff;
        }
  
        .site-brand-mark{
          width: 32px;
          height: 32px;
          border-radius: 10px;
          display:grid;
          place-items:center;
          background: #111;
          border: 1px solid rgba(255,255,255,.14);
          color:#fff;
          font-size: 1.05rem;
        }
  
        .site-brand-title{
          font-weight: 750;
          letter-spacing: .02em;
          line-height: 1.1;
          display:block;
          color:#fff;
        }
  
        .site-brand-subtitle{
          display:block;
          font-size: .85rem;
          color: rgba(255,255,255,.72);
          line-height: 1.2;
        }
  
        .site-nav{
          display:flex;
          align-items:center;
          gap: 1rem;
          flex-wrap: wrap;
        }
  
        .site-nav a{
          color: rgba(255,255,255,.82);
          text-decoration:none;
          font-size: .92rem;
          padding: .2rem 0;
        }
  
        .site-nav a:hover{
          text-decoration: underline;
          color:#fff;
        }
  
        .site-header-actions{
          display:flex;
          gap: .6rem;
          align-items:center;
          flex-wrap: wrap;
        }
  
        .site-btn{
          display:inline-flex;
          align-items:center;
          justify-content:center;
          border-radius: 999px;
          padding: .55rem .95rem;
          border: 1px solid transparent;
          font-size: .9rem;
          cursor:pointer;
          text-decoration:none;
          transition: transform .15s ease, background .15s ease, border-color .15s ease;
        }
  
        .site-btn-primary{
          background: var(--accent);
          color:#111;
          font-weight: 650;
        }
  
        .site-btn-primary:hover{
          transform: translateY(-1px);
          text-decoration:none;
        }
  
        .site-btn-ghost{
          background: transparent;
          color: rgba(255,255,255,.86);
          border: 1px solid rgba(255,255,255,.18);
        }
  
        .site-btn-ghost:hover{
          border-color: rgba(255,255,255,.35);
          color:#fff;
          text-decoration:none;
        }
  
        .site-user{
          font-size: .88rem;
          color: rgba(255,255,255,.72);
          white-space: nowrap;
        }
  
        @media (max-width: 720px){
          .site-header-inner{ justify-content: center; }
          .site-nav{ justify-content: center; }
          .site-header-actions{ width: 100%; justify-content: center; }
        }
      `;
      document.head.appendChild(style);
    }
  
    const token = localStorage.getItem('authToken');
  
    const userRaw = localStorage.getItem('user');
    let user = null;
    try { user = userRaw ? JSON.parse(userRaw) : null; } catch { user = null; }
    const name = user && (user.name || user.full_name || user.email) ? (user.name || user.full_name || user.email) : '';
  
    const actions = token
      ? `
        <span class="site-user">Hi${name ? ', ' + escapeHtml(name) : ''}</span>
        <a class="site-btn site-btn-ghost" href="home.html">Dashboard</a>
        <a class="site-btn site-btn-primary" id="logoutBtn" href="#">Log out</a>
      `
      : `
        <a class="site-btn site-btn-ghost" href="contact.html">Ask a question</a>
        <a class="site-btn site-btn-primary" href="login.html">Sign in</a>
      `;
  
    const headerHTML = `
      <header class="site-header">
        <div class="site-header-inner">
          <a href="home.html" class="site-brand" aria-label="Home">
            <span class="site-brand-mark">🦁</span>
            <span class="site-brand-text">
              <span class="site-brand-title">Safari</span>
              <span class="site-brand-subtitle">Plan it. Price it. Go.</span>
            </span>
          </a>
  
          <nav class="site-nav" aria-label="Main">
            <a href="destination.html">Destinations</a>
            <a href="safaris.html">Safaris</a>
            <a href="budget.html">Budget</a>
            <a href="plan.html">Plan</a>
            <a href="contact.html">Contact</a>
          </nav>
  
          <div class="site-header-actions">
            ${actions}
          </div>
        </div>
      </header>
    `;
  
    mount.innerHTML = headerHTML;
  
    // Wire up logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
      });
    }
  
    function escapeHtml(s) {
      return String(s).replace(/[&<>"']/g, (c) => ({
        '&':'&amp;',
        '<':'&lt;',
        '>':'&gt;',
        '"':'&quot;',
        "'":'&#39;'
      }[c]));
    }
  });