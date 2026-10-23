import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, ExternalLink, Network, X } from 'lucide-react';
import { projects, getProject } from '../../data/projects';
import { gsap, prefersReducedMotion } from '../../lib/motion';
import { lockScroll, unlockScroll } from '../../lib/scroll';
import { trapTab } from '../../lib/focusTrap';
import Button from '../ui/Button';
import { GitHubIcon } from '../ui/Icons';
import ProjectPreview from './ProjectPreview';
import './ProjectDetails.css';

/**
 * Full-screen case-study dialog.
 * Escape closes, ←/→ switch projects, focus is trapped and restored, page scroll is locked.
 */
export default function ProjectDetails({ id, onClose, onNavigate, onShowArchitecture }) {
  const project = getProject(id);
  const idx = projects.findIndex((p) => p.id === id);
  const prev = projects[(idx - 1 + projects.length) % projects.length];
  const next = projects[(idx + 1) % projects.length];

  const rootRef = useRef(null);
  const scrollRef = useRef(null);
  const titleRef = useRef(null);
  // Captured during the first render — before any effect moves focus into the dialog.
  const [returnFocus] = useState(() => document.activeElement);
  const closing = useRef(false);
  const [entered, setEntered] = useState(prefersReducedMotion);
  const cbs = useRef({});
  useEffect(() => {
    cbs.current = { onClose, onNavigate, prev, next };
  });

  const requestClose = useCallback((after) => {
    if (closing.current) return;
    closing.current = true;
    const done = () => (after ? after() : cbs.current.onClose());
    if (prefersReducedMotion()) return done();
    gsap
      .timeline({ onComplete: done })
      .to('.pd__panel', { y: 40, autoAlpha: 0, duration: 0.45, ease: 'power3.in' }, 0)
      .to('.pd__backdrop', { autoAlpha: 0, duration: 0.5 }, 0.1);
  }, []);

  // Mount: lock scroll, remember focus, wire keys
  useEffect(() => {
    lockScroll();
    const root = rootRef.current;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        requestClose();
        return;
      }
      const typing = /input|textarea|select/i.test(document.activeElement?.tagName || '');
      if (!typing && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
        e.preventDefault();
        cbs.current.onNavigate((e.key === 'ArrowRight' ? cbs.current.next : cbs.current.prev).id);
        return;
      }
      trapTab(e, root);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      unlockScroll();
      if (returnFocus && document.contains(returnFocus)) returnFocus.focus({ preventScroll: true });
    };
  }, [requestClose, returnFocus]);

  // Entrance
  useLayoutEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const ctx = gsap.context(() => {
      gsap
        .timeline({ onComplete: () => setEntered(true) })
        // opacity (not autoAlpha): a visibility:hidden panel could not receive focus
        .from('.pd__backdrop', { opacity: 0, duration: 0.5 }, 0)
        .from('.pd__panel', { y: 70, opacity: 0, duration: 0.9, ease: 'expo.out' }, 0.05);
    }, rootRef);
    return () => ctx.revert();
  }, []);

  // Each project: reset scroll, move focus to the title, stagger content in
  useLayoutEffect(() => {
    scrollRef.current?.scrollTo(0, 0);
    titleRef.current?.focus({ preventScroll: true });
    if (prefersReducedMotion()) return undefined;
    const ctx = gsap.context(() => {
      gsap.from('.pd__hero > *, .pd__preview', { y: 26, opacity: 0, duration: 0.8, stagger: 0.05, ease: 'power3.out', delay: 0.15 });
    }, rootRef);
    return () => ctx.revert();
  }, [id]);

  // Later sections fade in as they scroll into view inside the dialog
  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller || prefersReducedMotion()) return undefined;
    const items = scroller.querySelectorAll('.pd__sec');
    items.forEach((el) => el.classList.add('is-pending'));
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.remove('is-pending');
            io.unobserve(en.target);
          }
        }),
      { root: scroller, rootMargin: '0px 0px -8% 0px' },
    );
    items.forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      items.forEach((el) => el.classList.remove('is-pending'));
    };
  }, [id]);

  if (!project) return null;
  const cs = project.caseStudy;

  return (
    <div className="pd" ref={rootRef} role="dialog" aria-modal="true" aria-labelledby="pd-title" data-accent={project.accent}>
      <div className="pd__backdrop" onClick={() => requestClose()} aria-hidden="true" />
      <div className="pd__panel">
        <header className="pd__bar">
          <span className="mono pd__count">
            {project.number} <span>/ 0{projects.length}</span>
          </span>
          <span className="pd__barname">{project.name} — case study</span>
          <div className="pd__nav">
            <button type="button" className="btn btn--icon btn--sm" onClick={() => onNavigate(prev.id)} aria-label={`Previous project: ${prev.name}`}>
              <ArrowLeft size={17} aria-hidden="true" />
            </button>
            <button type="button" className="btn btn--icon btn--sm" onClick={() => onNavigate(next.id)} aria-label={`Next project: ${next.name}`}>
              <ArrowRight size={17} aria-hidden="true" />
            </button>
            <button type="button" className="btn btn--icon btn--sm pd__close" onClick={() => requestClose()} aria-label="Close case study">
              <X size={18} aria-hidden="true" />
            </button>
          </div>
        </header>

        <div className="pd__scroll" ref={scrollRef} data-lenis-prevent>
          <article className="pd__content" key={project.id}>
            <section className="pd__hero">
              <p className="eyebrow pd__kicker">
                {project.number} · {project.title}
              </p>
              <h2 id="pd-title" ref={titleRef} tabIndex={-1}>
                {project.name}
              </h2>
              <p className="pd__tagline">{project.tagline}</p>
              <div className="pd__links">
                {project.links.github ? (
                  <Button href={project.links.github} target="_blank" rel="noreferrer" iconLeft={GitHubIcon} size="sm">
                    View source
                  </Button>
                ) : null}
                {project.links.live ? (
                  <Button href={project.links.live} target="_blank" rel="noreferrer" variant="ghost" icon={ExternalLink} size="sm">
                    Live demo
                  </Button>
                ) : null}
                <Button variant="ghost" size="sm" iconLeft={Network} onClick={() => requestClose(() => onShowArchitecture(project.id))}>
                  Architecture explorer
                </Button>
              </div>
              {project.liveNote ? <p className="pd__livenote">{project.liveNote}</p> : null}
            </section>

            <div className="pd__preview">
              <ProjectPreview project={project} live={entered} />
              <p className="illustrative">Illustrative interface · not live data</p>
            </div>

            <section className="pd__sec pd__split">
              <h3 className="pd__h">Problem &amp; motivation</h3>
              <p className="pd__lead">{cs.problem}</p>
            </section>

            <section className="pd__sec">
              <h3 className="pd__h">{cs.modesTitle}</h3>
              <ul className="pd__modes">
                {cs.modes.map((m, i) => (
                  <li key={m.name}>
                    <span className="mono">0{i + 1}</span>
                    <b>{m.name}</b>
                    <p>{m.body}</p>
                  </li>
                ))}
              </ul>
            </section>

            <section className="pd__sec pd__split">
              <h3 className="pd__h">What I built</h3>
              <ol className="pd__impl">
                {cs.implementation.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ol>
            </section>

            <section className="pd__sec">
              <h3 className="pd__h">Engineering challenges &amp; trade-offs</h3>
              <div className="pd__challenges">
                {cs.challenges.map((c) => (
                  <div key={c.title} className="pd__challenge">
                    <h4>{c.title}</h4>
                    <p>{c.body}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="pd__sec">
              <h3 className="pd__h">Outcomes</h3>
              <ul className="pd__outcomes">
                {cs.outcomes.map((o) => (
                  <li key={o.label}>
                    <strong>{o.value}</strong>
                    <span>{o.label}</span>
                    <small>{o.note}</small>
                  </li>
                ))}
              </ul>
              <p className="illustrative">From my resume and the project’s README</p>
            </section>

            <section className="pd__sec pd__split">
              <h3 className="pd__h">Stack</h3>
              <ul className="tag-list">
                {cs.stack.map((t) => (
                  <li key={t} className="tag">
                    {t}
                  </li>
                ))}
              </ul>
            </section>

            <footer className="pd__sec pd__next">
              <button type="button" onClick={() => onNavigate(next.id)}>
                <span className="eyebrow">Next case study</span>
                <span className="pd__nextname">
                  <span className="mono">{next.number}</span> {next.name}
                </span>
                <ArrowUpRight size={28} aria-hidden="true" />
              </button>
            </footer>
          </article>
        </div>
      </div>
    </div>
  );
}
