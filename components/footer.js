document.addEventListener('DOMContentLoaded', function () {
    const currentYear = new Date().getFullYear();

    if (!document.getElementById('site-footer-style')) {
        const style = document.createElement('style');
        style.id = 'site-footer-style';
        style.textContent = `
            .site-footer {
                margin-top: 64px;
                padding: 28px 18px;
                background: rgba(25, 16, 11, 0.72);
                border-top: 1px solid rgba(255, 241, 215, 0.14);
                backdrop-filter: blur(10px);
                font-family: 'Montserrat', 'Century Gothic', sans-serif;
                color: #e9dbc2;
            }

            .site-footer-inner {
                max-width: 1160px;
                margin: 0 auto;
                display: grid;
                grid-template-columns: 1.2fr 1fr auto;
                gap: 20px;
                align-items: center;
            }

            .site-footer-brand {
                display: grid;
                gap: 8px;
            }

            .site-footer-title {
                margin: 0;
                color: #fff8ed;
                font-size: 1.05rem;
                font-weight: 800;
                letter-spacing: 0.03em;
            }

            .site-footer-tagline {
                margin: 0;
                color: #d8c7ab;
                font-size: 0.84rem;
                line-height: 1.7;
            }

            .site-footer-links {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
            }

            .site-footer-link {
                text-decoration: none;
                color: #f6e9d4;
                font-size: 0.8rem;
                font-weight: 700;
                padding: 8px 12px;
                border-radius: 999px;
                border: 1px solid rgba(255, 241, 215, 0.14);
                background: rgba(255, 248, 236, 0.06);
                transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
            }

            .site-footer-link:hover {
                color: #3d2413;
                background: linear-gradient(90deg, #f1c589 0%, #dda563 100%);
                border-color: rgba(241, 197, 137, 0.4);
            }

            .site-footer-copy {
                margin: 0;
                text-align: right;
                color: #cab89a;
                font-size: 0.78rem;
                line-height: 1.7;
            }

            @media (max-width: 900px) {
                .site-footer-inner {
                    grid-template-columns: 1fr;
                    text-align: center;
                }

                .site-footer-links {
                    justify-content: center;
                }

                .site-footer-copy {
                    text-align: center;
                }
            }
        `;
        document.head.appendChild(style);
    }

    const footerHTML = `
        <footer class="site-footer">
            <div class="site-footer-inner">
                <div class="site-footer-brand">
                    <h3 class="site-footer-title">Travel Companion Finder</h3>
                    <p class="site-footer-tagline">Curating safari moments, cultural stories, and practical planning tools for unforgettable journeys.</p>
                </div>

                <nav class="site-footer-links" aria-label="Footer quick links">
                    <a href="home.html" class="site-footer-link">Home</a>
                    <a href="destination.html" class="site-footer-link">Destinations</a>
                    <a href="safaris.html" class="site-footer-link">Safaris</a>
                    <a href="contact.html" class="site-footer-link">Contact</a>
                </nav>

                <p class="site-footer-copy">
                    &copy; ${currentYear} Travel Companion Finder.<br>
                    All rights reserved.
                </p>
            </div>
        </footer>
    `;

    const footerPlaceholder = document.getElementById('footer');
    if (footerPlaceholder) {
        footerPlaceholder.innerHTML = footerHTML;
    }
});