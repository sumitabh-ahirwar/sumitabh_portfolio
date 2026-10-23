import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { skillGroups, skillFilters } from '../../data/skills';
import { gsap, MOTION_OK_QUERY, isFinePointer } from '../../lib/motion';
import { useSectionReveal } from '../../hooks/useSectionReveal';
import SectionHead from '../ui/SectionHead';
import './Skills.css';

const USE_LABEL = Object.fromEntries(skillFilters.map((f) => [f.id, f.label]));

export default function Skills() {
  const ref = useRef(null);
  const gridRef = useRef(null);
  const [filter, setFilter] = useState('all');
  useSectionReveal(ref);

  // The grid tilts up into place as it enters.
  useLayoutEffect(() => {
    const mm = gsap.matchMedia(ref);
    mm.add(MOTION_OK_QUERY, () => {
      gsap.fromTo(
        gridRef.current,
        { rotationX: 14, y: 60, transformPerspective: 1400, transformOrigin: '50% 0%' },
        { rotationX: 0, y: 0, ease: 'none', scrollTrigger: { trigger: gridRef.current, start: 'top 95%', end: 'top 40%', scrub: 0.6 } },
      );
    });
    return () => mm.revert();
  }, []);

  // Cursor spotlight on panels (desktop only)
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || !isFinePointer()) return undefined;
    const move = (e) => {
      const panel = e.target.closest('.skills__panel');
      if (!panel) return;
      const r = panel.getBoundingClientRect();
      panel.style.setProperty('--mx', `${e.clientX - r.left}px`);
      panel.style.setProperty('--my', `${e.clientY - r.top}px`);
    };
    grid.addEventListener('pointermove', move);
    return () => grid.removeEventListener('pointermove', move);
  }, []);

  const litCount = filter === 'all' ? null : skillGroups.flatMap((g) => g.skills).filter((s) => s.uses.includes(filter)).length;

  return (
    <section className="section skills" id="skills" ref={ref} tabIndex={-1} aria-labelledby="skills-title">
      <div className="container">
        <SectionHead
          index="04"
          label="Skills"
          id="skills-title"
          title="A toolkit shaped by what I build."
          lede="Filter by project to see which tools each system is built with. No ratings or percentages — the projects are the evidence."
        />

        <div className="skills__filters" data-reveal="fade" role="group" aria-label="Highlight skills used in">
          {skillFilters.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`skills__filter${filter === f.id ? ' is-on' : ''}`}
              data-use={f.id}
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
            >
              {f.id !== 'all' ? <span className="skills__swatch" aria-hidden="true" /> : null}
              {f.label}
            </button>
          ))}
          <p className="skills__count mono" aria-live="polite">
            {litCount === null ? `${skillGroups.reduce((n, g) => n + g.skills.length, 0)} skills` : `${litCount} used in ${USE_LABEL[filter]}`}
          </p>
        </div>

        <div className={`skills__grid${filter !== 'all' ? ' is-filtering' : ''}`} ref={gridRef} data-reveal="stagger">
          {skillGroups.map((g) => (
            <article key={g.id} className={`skills__panel skills__panel--${g.id}`} aria-labelledby={`skills-${g.id}`}>
              <header>
                <span className="mono">{g.index}</span>
                <h3 id={`skills-${g.id}`}>{g.title}</h3>
              </header>
              <p className="skills__blurb">{g.blurb}</p>
              <ul className="skills__list">
                {g.skills.map((s) => {
                  const lit = filter !== 'all' && s.uses.includes(filter);
                  return (
                    <li key={s.name} className={`skill${lit ? ' is-lit' : ''}`}>
                      <span className="skill__name">{s.name}</span>
                      {s.uses.length ? (
                        <span className="skill__uses" aria-hidden="true">
                          {s.uses.map((u) => (
                            <i key={u} data-use={u} />
                          ))}
                        </span>
                      ) : null}
                      {s.uses.length ? <span className="sr-only">, used in {s.uses.map((u) => USE_LABEL[u]).join(', ')}</span> : null}
                    </li>
                  );
                })}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
