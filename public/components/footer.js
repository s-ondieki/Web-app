/**
 * Travel Safari — Shared Footer Component
 * Injects a clean, simple footer into #footer
 */
(function () {
  function injectStyles() {
    if (document.getElementById('ts-footer-style')) return;
    const s = document.createElement('style');
    s.id = 'ts-footer-style';
    s.textContent = `
      .ts-footer {
        background: #1a1410;
        color: #b0a898;
        font-family: 'Inter', system-ui, sans-serif;
        font-size: 0.875rem;
        -webkit-font-smoothing: antialiased;
        margin-top: auto;
      }
      .ts-footer-inner {
        max-width: 1100px;
        margin: 0 auto;
        padding: 52px 24px 32px;
      }
      .ts-footer-grid {
        display: grid;
        grid-template-columns: 1.4fr 1fr 1fr;
        gap: 40px;
        padding-bottom: 36px;
        border-bottom: 1px solid rgba(255,255,255,0.07);
        margin-bottom: 24px;
      }
      .ts-footer-brand-mark {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 14px;
        text-decoration: none;
      }
      .ts-footer-lion {
        width: 32px;
        height: 32px;
        background: linear-gradient(135deg, #c07030, #8a4819);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.95rem;
        flex-shrink: 0;
      }
      .ts-footer-name {
        font-size: 0.9rem;
        font-weight: 700;
        color: #fff8ee;
        letter-spacing: -0.01em;
      }
      .ts-footer-tagline {
        color: #7a7268;
        font-size: 0.85rem;
        line-height: 1.7;
        max-width: 260px;
        margin-bottom: 20px;
      }
      .ts-footer-contact-line {
        color: #7a7268;
        font-size: 0.82rem;
        margin-bottom: 6px;
        display: flex;
        align-items: center;
        gap: 7px;
      }
      .ts-footer-contact-line a {
        color: #9a8e82;
        text-decoration: none;
        transition: color 0.15s;
      }
      .ts-footer-contact-line a:hover { color: #c8b49a; }
      .ts-footer-col h4 {
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: #6a6058;
        margin-bottom: 16px;
      }
      .ts-footer-links { list-style: none; display: flex; flex-direction: column; gap: 10px; }
      .ts-footer-links a {
        color: #8a8278;
        text-decoration: none;
        font-size: 0.875rem;
        transition: color 0.15s;
        display: block;
      }
      .ts-footer-links a:hover { color: #c8b49a; }
      .ts-footer-bottom {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
      }
      .ts-footer-bottom p { font-size: 0.8rem; color: #5a5248; margin: 0; }
      .ts-footer-bottom-links { display: flex; gap: 16px; }
      .ts-footer-bottom-links a { font-size: 0.8rem; color: #5a5248; text-decoration: none; transition: color 0.15s; }
      .ts-footer-bottom-links a:hover { color: #9a8e82; }

      @media (max-width: 680px) {
        .ts-footer-grid { grid-template-columns: 1fr; gap: 28px; }
        .ts-footer-inner { padding: 36px 16px 24px; }
        .ts-footer-bottom { flex-direction: column; align-items: flex-start; gap: 8px; }
      }
    `;
    document.head.appendChild(s);
  }

  function render() {
    const html = `
      <footer class="ts-footer" role="contentinfo">
        <div class="ts-footer-inner">
          <div class="ts-footer-grid">

            <div>
              <a href="home.html" class="ts-footer-brand-mark">
                <span class="ts-footer-lion">🦁</span>
                <span class="ts-footer-name">Travel Safari</span>
              </a>
              <p class="ts-footer-tagline">We help travellers plan meaningful African safari experiences — not just trips, but the kind of travel you remember.</p>
              <div class="ts-footer-contact-line">📞 <a href="tel:+254711100333">+254 711 100 333</a></div>
              <div class="ts-footer-contact-line">✉️ <a href="mailto:travel@safaris.com">travel@safaris.com</a></div>
              <div class="ts-footer-contact-line">📍 Kenrail Towers, Nairobi</div>
            </div>

            <div class="ts-footer-col">
              <h4>Explore</h4>
              <ul class="ts-footer-links">
                <li><a href="home.html">Dashboard</a></li>
                <li><a href="destination.html">Destinations</a></li>
                <li><a href="safaris.html">Safaris &amp; Tours</a></li>
                <li><a href="matches.html">Find Travel Matches</a></li>
                <li><a href="plan.html">Plan your trip</a></li>
                <li><a href="contact.html">Get in touch</a></li>
              </ul>
            </div>

            <div class="ts-footer-col">
              <h4>Account</h4>
              <ul class="ts-footer-links">
                <li><a href="register.html">Create account</a></li>
                <li><a href="login.html">Log in</a></li>
                <li><a href="plan.html">My plan &amp; budget</a></li>
                <li><a href="contact.html">Send a message</a></li>
              </ul>
            </div>

          </div>

          <div class="ts-footer-bottom">
            <p>© ${new Date().getFullYear()} Travel Safari. Built to help you plan better trips.</p>
            <div class="ts-footer-bottom-links">
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="contact.html">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    `;

    const placeholder = document.getElementById('footer');
    if (placeholder) placeholder.innerHTML = html;
  }

  injectStyles();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();