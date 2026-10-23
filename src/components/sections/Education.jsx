import { useRef } from 'react';
import { education, responsibilities } from '../../data/profile';
import { useSectionReveal } from '../../hooks/useSectionReveal';
import './Education.css';

export default function Education() {
  const ref = useRef(null);
  useSectionReveal(ref);
  return (
    <section className="section edu" id="education" ref={ref} tabIndex={-1} aria-labelledby="edu-title">
      <div className="container edu__grid">
        <header className="edu__head">
          <p className="section-index" data-reveal="fade">
            <b>06</b>
            <span>Education</span>
          </p>
          <h2 id="edu-title" className="edu__title" data-reveal="fade">
            Academic profile
          </h2>
          <div className="edu__resp" data-reveal="fade">
            <p className="eyebrow">Positions of responsibility</p>
            {responsibilities.map((r) => (
              <p key={r.org}>
                {r.role}, {r.org} <span className="mono">· {r.period}</span>
              </p>
            ))}
          </div>
        </header>

        <ol className="edu__list" data-reveal="stagger">
          {education.map((e) => (
            <li key={e.period} className="edu__row">
              <span className="edu__period mono">{e.period}</span>
              <div>
                <h3>{e.school}</h3>
                <p>{e.degree}</p>
              </div>
              <div className="edu__metric">
                <strong>{e.metric.value}</strong>
                <span>
                  {e.metric.label}
                  {e.metric.note ? ` · ${e.metric.note}` : ''}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
