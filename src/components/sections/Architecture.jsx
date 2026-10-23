import { useRef } from 'react';
import { projects } from '../../data/projects';
import { useSectionReveal } from '../../hooks/useSectionReveal';
import SectionHead from '../ui/SectionHead';
import SystemDiagram from '../projects/SystemDiagram';
import './Architecture.css';

export default function Architecture({ active, onChange }) {
  const ref = useRef(null);
  const tabsRef = useRef(null);
  useSectionReveal(ref);
  const current = projects.find((p) => p.id === active) ?? projects[0];

  const onTabKey = (e, i) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft' && e.key !== 'Home' && e.key !== 'End') return;
    e.preventDefault();
    let next = i;
    if (e.key === 'ArrowRight') next = (i + 1) % projects.length;
    if (e.key === 'ArrowLeft') next = (i - 1 + projects.length) % projects.length;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = projects.length - 1;
    onChange(projects[next].id);
    tabsRef.current?.querySelectorAll('[role="tab"]')[next]?.focus();
  };

  return (
    <section className="section arch" id="architecture" ref={ref} tabIndex={-1} aria-labelledby="arch-title">
      <div className="container">
        <SectionHead
          index="03"
          label="Architecture"
          id="arch-title"
          title="From intelligent workflows to scalable systems."
          lede="How each project fits together. Select any component to see what it does and why it is there."
        />

        <div className="arch__tabs" role="tablist" aria-label="Choose a system" ref={tabsRef} data-reveal="fade">
          {projects.map((p, i) => {
            const on = p.id === current.id;
            return (
              <button
                key={p.id}
                type="button"
                role="tab"
                id={`arch-tab-${p.id}`}
                aria-selected={on}
                aria-controls="arch-panel"
                tabIndex={on ? 0 : -1}
                className={`arch__tab${on ? ' is-on' : ''}`}
                data-accent={p.accent}
                onClick={() => onChange(p.id)}
                onKeyDown={(e) => onTabKey(e, i)}
              >
                <span className="mono">{p.number}</span>
                <b>{p.name}</b>
                <small>{p.architecture.title.replace(`${p.name} `, '')}</small>
              </button>
            );
          })}
        </div>

        <div className="arch__panel" role="tabpanel" id="arch-panel" aria-labelledby={`arch-tab-${current.id}`} data-reveal="fade">
          <SystemDiagram key={current.id} arch={current.architecture} accent={current.accent} idPrefix={`sd-${current.id}`} />
        </div>
      </div>
    </section>
  );
}
