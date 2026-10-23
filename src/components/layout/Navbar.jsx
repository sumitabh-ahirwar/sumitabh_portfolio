import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Download, Menu, X, ArrowUpRight } from 'lucide-react';
import { navItems, profile, socials } from '../../data/profile';
import { lockScroll, unlockScroll } from '../../lib/scroll';
import { navigateTo } from '../../lib/navigation';
import { gsap, EASE, prefersReducedMotion } from '../../lib/motion';
import { trapTab } from '../../lib/focusTrap';
import { Mark, GitHubIcon, LinkedInIcon } from '../ui/Icons';
import './Navbar.css';

// Sections without their own nav item light up their nearest parent item.
const SECTION_TO_NAV = { about: 'about', projects: 'projects', architecture: 'projects', skills: 'skills', achievements: 'achievements', education: 'achievements', contact: 'contact' };

export default function Navbar({ ready, sectionsReady }) {
  // `current` is the section in the middle of the viewport ('top' = hero); nav items map onto it.
  const [current, setCurrent] = useState(null);
  const active = current && current !== 'top' ? SECTION_TO_NAV[current] ?? null : null;
  const [hashSync, setHashSync] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef(null);
  const listRef = useRef(null);
  const indicatorRef = useRef(null);
  const menuRef = useRef(null);
  const burgerRef = useRef(null);

  // Active section tracking
  useEffect(() => {
    const ids = Object.keys(SECTION_TO_NAV);
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setCurrent(entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    els.forEach((el) => io.observe(el));
    const hero = document.getElementById('top');
    const heroIo = new IntersectionObserver(([e]) => e.isIntersecting && setCurrent('top'), { rootMargin: '-45% 0px -50% 0px' });
    if (hero) heroIo.observe(hero);
    return () => {
      io.disconnect();
      heroIo.disconnect();
    };
  }, [sectionsReady]);

  // Keep the URL hash in step with the section being read, so copying or refreshing the URL
  // returns to the same place. Starts only after the page is shown and any #hash from the
  // initial URL has been applied, so a shared link isn't overwritten before it jumps.
  useEffect(() => {
    if (!ready || !sectionsReady) return undefined;
    const t = setTimeout(() => setHashSync(true), 700);
    return () => clearTimeout(t);
  }, [ready, sectionsReady]);

  useEffect(() => {
    if (!hashSync || !current) return;
    if (location.hash.startsWith('#case-')) return; // a case study is open — its link wins
    const next = current === 'top' ? '' : `#${current}`;
    if (location.hash === next) return;
    try {
      history.replaceState(null, '', `${location.pathname}${location.search}${next}`);
    } catch {
      /* ignore */
    }
  }, [current, hashSync]);

  // Hide on scroll down, reveal on scroll up
  useEffect(() => {
    let last = window.scrollY;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = window.scrollY;
        setScrolled(y > 24);
        const focusInside = navRef.current?.contains(document.activeElement);
        if (Math.abs(y - last) > 6) {
          setHidden(y > last && y > 640 && !focusInside);
          last = y;
        }
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Sliding active indicator
  useLayoutEffect(() => {
    const list = listRef.current;
    const ind = indicatorRef.current;
    if (!list || !ind) return undefined;
    const place = () => {
      const link = active && list.querySelector(`[data-id="${active}"]`);
      if (!link) {
        ind.style.opacity = '0';
        return;
      }
      ind.style.opacity = '1';
      ind.style.width = `${link.offsetWidth}px`;
      ind.style.transform = `translateX(${link.offsetLeft}px)`;
    };
    place();
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, [active]);

  // Entrance once the loader lifts
  useLayoutEffect(() => {
    if (!ready || prefersReducedMotion()) return undefined;
    const ctx = gsap.context(() => {
      gsap.from('.nav__bar > *', { y: -18, autoAlpha: 0, duration: 1, ease: EASE.out, stagger: 0.08, delay: 0.5 });
    }, navRef);
    return () => ctx.revert();
  }, [ready]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  // Mobile menu: lock scroll, animate, trap focus, Escape to close
  useEffect(() => {
    if (!menuOpen) return undefined;
    lockScroll();
    const menu = menuRef.current;
    const reduce = prefersReducedMotion();
    const tl = gsap.timeline();
    if (!reduce) {
      tl.fromTo(menu, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.7, ease: 'expo.inOut' })
        .from(menu.querySelectorAll('.menu__link'), { yPercent: 100, autoAlpha: 0, stagger: 0.06, duration: 0.7, ease: EASE.out }, '-=0.3')
        .from(menu.querySelectorAll('.menu__foot > *'), { autoAlpha: 0, y: 10, stagger: 0.05, duration: 0.5 }, '-=0.4');
    }
    menu.querySelector('.menu__link')?.focus({ preventScroll: true });
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        burgerRef.current?.focus();
      } else trapTab(e, menu.parentElement);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      tl.kill();
      gsap.set(menu, { clearProps: 'all' });
      document.removeEventListener('keydown', onKey);
      unlockScroll();
    };
  }, [menuOpen]);

  const onNav = (e, id) => {
    e.preventDefault();
    const wasOpen = menuOpen;
    closeMenu();
    // Let the menu release the scroll lock before scrolling.
    if (wasOpen) requestAnimationFrame(() => navigateTo(id));
    else navigateTo(id);
  };

  return (
    <header className={`nav${scrolled ? ' is-scrolled' : ''}${hidden && !menuOpen ? ' is-hidden' : ''}${menuOpen ? ' is-open' : ''}`} ref={navRef}>
      <div className="nav__bar container">
        <a href="#top" className="nav__logo" onClick={(e) => onNav(e, 'top')} aria-label={`${profile.name} — back to top`}>
          <Mark size={30} />
          <span className="nav__name">
            {profile.firstName} <span>{profile.lastName}</span>
          </span>
        </a>

        <nav className="nav__links" aria-label="Primary">
          <div className="nav__track" ref={listRef}>
            <span className="nav__indicator" ref={indicatorRef} aria-hidden="true" />
            <ul>
            {navItems.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  data-id={item.id}
                  className={active === item.id ? 'is-active' : undefined}
                  aria-current={active === item.id ? 'location' : undefined}
                  onClick={(e) => onNav(e, item.id)}
                >
                  {item.label}
                </a>
              </li>
            ))}
            </ul>
          </div>
        </nav>

        <div className="nav__actions">
          <a className="nav__resume" href={profile.resume.href} download={profile.resume.fileName} aria-label="Download resume (PDF)">
            <Download size={15} aria-hidden="true" />
            <span>Resume</span>
          </a>
          <button
            ref={burgerRef}
            type="button"
            className="nav__burger"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div className="menu" id="mobile-menu" ref={menuRef}>
          <nav aria-label="Mobile">
            <ol className="menu__list">
              {navItems.map((item, i) => (
                <li key={item.id}>
                  <a className="menu__link" href={`#${item.id}`} onClick={(e) => onNav(e, item.id)}>
                    <span className="mono">0{i + 1}</span>
                    {item.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <div className="menu__foot">
            <a href={`mailto:${profile.email}`}>{profile.email}</a>
            <div className="menu__social">
              <a href={socials.github.href} target="_blank" rel="noreferrer" aria-label="GitHub (opens in a new tab)">
                <GitHubIcon size={18} />
              </a>
              <a href={socials.linkedin.href} target="_blank" rel="noreferrer" aria-label="LinkedIn (opens in a new tab)">
                <LinkedInIcon size={18} />
              </a>
              <a href={profile.resume.href} download={profile.resume.fileName}>
                Resume <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
