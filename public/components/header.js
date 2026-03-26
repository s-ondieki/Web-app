document.addEventListener('DOMContentLoaded', function () {
    const currentPath = window.location.pathname.split('/').pop() || 'home.html';
    const navLinks = [
        { href: 'home.html', label: 'Home' },
        { href: 'destination.html', label: 'Destinations' },
        { href: 'safaris.html', label: 'Safaris & Tours' },
        { href: 'contact.html', label: 'Contact' }
    ];

    const linksHTML = navLinks
        .map(function (link) {
            const isActive =
                currentPath === link.href ||
                (link.href === 'contact.html' && currentPath === 'G.html');

            return `<a href="${link.href}" class="site-nav-link${isActive ? ' is-active' : ''}">${link.label}</a>`;
        })
        .join('');

    if (!document.getElementById('site-header-style')) {
        const style = document.createElement('style');
        style.id = 'site-header-style';
        style.textContent = `
            .site-header {
                position: sticky;
                top: 0;
                z-index: 40;
                padding: 14px 18px;
                background: rgba(25, 16, 11, 0.56);
                backdrop-filter: blur(10px);
                border-bottom: 1px solid rgba(255, 241, 215, 0.14);
                box-shadow: 0 14px 30px rgba(12, 8, 5, 0.22);
                font-family: 'Montserrat', 'Century Gothic', sans-serif;
            }

            .site-header-inner {
                max-width: 1160px;
                margin: 0 auto;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 16px;
                flex-wrap: wrap;
            }

            .site-brand {
                display: inline-flex;
                align-items: center;
                gap: 12px;
                text-decoration: none;
            }

            .site-brand-mark {
                width: 38px;
                height: 38px;
                border-radius: 12px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(145deg, #f1c589 0%, #a86539 100%);
                color: #3d2413;
                font-size: 1.15rem;
                font-weight: 800;
                box-shadow: 0 8px 18px rgba(168, 101, 57, 0.3);
            }

            .site-brand-text {
                display: grid;
                line-height: 1.15;
            }

            .site-brand-title {
                color: #fff8ed;
                font-size: 1rem;
                font-weight: 800;
                letter-spacing: 0.03em;
            }

            .site-brand-subtitle {
                color: #e8d7ba;
                font-size: 0.72rem;
                text-transform: uppercase;
                letter-spacing: 0.13em;
                font-weight: 700;
            }

            .site-nav {
                display: flex;
                align-items: center;
                gap: 8px;
                flex-wrap: wrap;
            }

            .site-header-actions {
                display: inline-flex;
                align-items: center;
                gap: 10px;
            }

            .site-nav-link {
                text-decoration: none;
                color: #f6e9d4;
                font-size: 0.88rem;
                font-weight: 700;
                letter-spacing: 0.02em;
                padding: 9px 12px;
                border-radius: 999px;
                border: 1px solid transparent;
                transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
            }

            .site-nav-link:hover {
                color: #fffaf2;
                background: rgba(255, 248, 236, 0.12);
                border-color: rgba(255, 241, 215, 0.16);
            }

            .site-nav-link.is-active {
                color: #3d2413;
                background: linear-gradient(90deg, #f1c589 0%, #dda563 100%);
                border-color: rgba(241, 197, 137, 0.5);
            }

            .site-cta {
                text-decoration: none;
                color: #3d2413;
                background: linear-gradient(90deg, #f1c589 0%, #dda563 100%);
                padding: 10px 16px;
                border-radius: 999px;
                font-size: 0.82rem;
                font-weight: 800;
                letter-spacing: 0.05em;
                text-transform: uppercase;
                box-shadow: 0 10px 20px rgba(241, 197, 137, 0.24);
                transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
            }

            .site-cta:hover {
                transform: translateY(-1px);
                box-shadow: 0 14px 24px rgba(241, 197, 137, 0.3);
                filter: brightness(1.03);
            }

            .site-logout {
                text-decoration: none;
                color: #fff6eb;
                background: linear-gradient(90deg, #ab5b39 0%, #7a3a24 100%);
                padding: 10px 16px;
                border-radius: 999px;
                border: 1px solid rgba(255, 231, 205, 0.2);
                font-size: 0.82rem;
                font-weight: 800;
                letter-spacing: 0.05em;
                text-transform: uppercase;
                box-shadow: 0 10px 20px rgba(20, 12, 8, 0.24);
                transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
            }

            .site-logout:hover {
                transform: translateY(-1px);
                box-shadow: 0 14px 24px rgba(20, 12, 8, 0.3);
                filter: brightness(1.03);
            }

            @media (max-width: 760px) {
                .site-header {
                    padding: 12px 14px;
                }

                .site-header-inner {
                    justify-content: center;
                }

                .site-nav {
                    justify-content: center;
                }

                .site-header-actions {
                    width: 100%;
                    justify-content: center;
                }
            }
        `;
        document.head.appendChild(style);
    }

    const headerHTML = `
        <header class="site-header">
            <div class="site-header-inner">
                <a href="home.html" class="site-brand" aria-label="Travel Safari  home">
                    <span class="site-brand-mark">🦁</span>
                    <span class="site-brand-text">
                        <span class="site-brand-title">Travel Safari </span>
                        <span class="site-brand-subtitle"></span>
                    </span>
                </a>

                <nav class="site-nav" aria-label="Primary">
                    ${linksHTML}
                </nav>

                <div class="site-header-actions">
                    <a href="plan.html" class="site-cta">Plan Budget</a>
                    <a href="login.html" class="site-logout">Logout</a>
                </div>
            </div>
        </header>
    `;

    const headerPlaceholder = document.getElementById('header');
    if (headerPlaceholder) {
        headerPlaceholder.innerHTML = headerHTML;
    }
});