document.addEventListener('DOMContentLoaded', () => {
    const mount = document.getElementById('footer');
    if (!mount) return;
  
    // Inject styles once
    if (!document.getElementById('site-footer-styles')) {
      const style = document.createElement('style');
      style.id = 'site-footer-styles';
      style.textContent = `
        :root{
          --accent:#c07a3f;
          --border: rgba(255,255,255,.14);
  
          --max: 980px;
          --pad: 1.25rem;
        }
  
        .site-footer{
          background:#000;
          border-top: 1px solid var(--border);
        }
  
        .site-footer-inner{
          max-width: var(--max);
          margin: 0 auto;
          padding: 1.1rem var(--pad) 1.3rem;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }
  
        .site-footer-brand{
          display:flex;
          gap:.6rem;
          align-items:center;
          color:#fff;
        }
  
        .site-footer-mark{
          width: 28px;
          height: 28px;
          border-radius: 9px;
          display:grid;
          place-items:center;
          background:#111;
          border: 1px solid rgba(255,255,255,.14);
          color:#fff;
          font-size: 1rem;
        }
  
        .site-footer-title{
          font-weight: 750;
          letter-spacing:.02em;
          line-height:1.1;
        }
  
        .site-footer-sub{
          display:block;
          font-size:.85rem;
          color: rgba(255,255,255,.68);
          line-height:1.2;
        }
  
        .site-footer-links{
          display:flex;
          gap: .9rem;
          flex-wrap: wrap;
          align-items:center;
        }
  
        .site-footer-links a{
          color: rgba(255,255,255,.78);
          text-decoration:none;
          font-size: .9rem;
        }
  
        .site-footer-links a:hover{
          color:#fff;
          text-decoration: underline;
        }
  
        .site-footer-copy{
          color: rgba(255,255,255,.62);
          font-size: .86rem;
          white-space: nowrap;
        }
  
        @media (max-width: 720px){
          .site-footer-inner{ justify-content:center; text-align:center; }
          .site-footer-copy{ white-space: normal; }
          .site-footer-links{ justify-content:center; }
        }
      `;
      document.head.appendChild(style);
    }
  
    const year = new Date().getFullYear();
  
    mount.innerHTML = `
      <footer class="site-footer">
        <div class="site-footer-inner">
          <div class="site-footer-brand">
            <span class="site-footer-mark">🦁</span>
            <div>
              <span class="site-footer-title">Safari</span>
              <span class="site-footer-sub">Keep it simple. Then go.</span>
            </div>
          </div>
  
          <nav class="site-footer-links" aria-label="Footer">
            <a href="destination.html">Destinations</a>
            <a href="safaris.html">Safaris</a>
            <a href="plan.html">Plan</a>
            <a href="contact.html">Contact</a>
          </nav>
  
          <div class="site-footer-copy">© ${year} Safari</div>
        </div>
      </footer>
    `;
  });