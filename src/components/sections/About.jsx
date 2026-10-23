import { useLayoutEffect, useRef } from 'react';
import { gsap, MOTION_OK_QUERY } from '../../lib/motion';
import { useSectionReveal } from '../../hooks/useSectionReveal';
import SectionHead from '../ui/SectionHead';
import Intersection from './Intersection';
import './About.css';

const lead =
  'I’m a Computer Science and Engineering student at MNNIT Allahabad with a strong interest in AI engineering, backend development, distributed systems, and algorithmic problem-solving.';

const principles = [
  {
    k: 'Ground every answer',
    v: 'AI output should be traceable to evidence — sources, pages, citations.',
    ref: 'ResearchOS',
  },
  {
    k: 'Design for the constraint',
    v: 'A 512 MB memory limit is a specification, not an excuse.',
    ref: 'Data2Model',
  },
  {
    k: 'Ship the whole feature',
    v: 'Auth, state, storage and UX are part of the product, not afterthoughts.',
    ref: 'JobPortal',
  },
  {
    k: 'Keep the fundamentals sharp',
    v: 'Contests keep algorithmic thinking fast and honest.',
    ref: 'Competitive programming',
  },
];

const highlights = [
  { v: '7', l: 'agent research pipeline' },
  { v: '512 MB', l: 'distributed training target' },
  { v: '3', l: 'role recruitment platform' },
  { v: '2169', l: 'peak LeetCode rating' },
];

export default function About() {
  const ref = useRef(null);
  useSectionReveal(ref);

  // The lead paragraph lights up word by word as it scrolls through the viewport.
  useLayoutEffect(() => {
    const mm = gsap.matchMedia(ref);
    mm.add(MOTION_OK_QUERY, () => {
      gsap.fromTo(
        '.about__lead .split-inner',
        { opacity: 0.16 },
        {
          opacity: 1,
          stagger: 0.05,
          ease: 'none',
          scrollTrigger: { trigger: '.about__lead', start: 'top 80%', end: 'bottom 45%', scrub: true },
        },
      );
    });
    return () => mm.revert();
  }, []);

  return (
    <section className="section about" id="about" ref={ref} tabIndex={-1} aria-labelledby="about-title">
      <div className="container about__grid">
        <div className="about__head">
          <SectionHead index="01" label="About" id="about-title" title="Understanding systems from the inside out." />
          <div className="about__visual" data-reveal="fade">
            <Intersection />
          </div>
        </div>

        <div className="about__body">
          <p className="about__lead">
            <span className="sr-only">{lead}</span>
            <span aria-hidden="true">
              {lead.split(' ').map((w, i) => (
                <span key={i}>
                  <span className="split-inner">{w}</span>{' '}
                </span>
              ))}
            </span>
          </p>
          <div className="about__copy" data-reveal="stagger">
            <p>
              My projects explore how intelligent applications can be made more useful, scalable and reliable — from
              multi-agent research workflows and retrieval-augmented generation to distributed model training and
              full-stack recruitment platforms.
            </p>
            <p>
              I enjoy understanding systems from the inside out, solving challenging problems, and translating technical
              ideas into working products.
            </p>
          </div>

          <div className="about__principles">
            <p className="eyebrow" data-reveal="fade">
              Engineering principles
            </p>
            <ol data-reveal="stagger">
              {principles.map((p, i) => (
                <li key={p.k}>
                  <span className="about__pi mono">0{i + 1}</span>
                  <div>
                    <h3>{p.k}</h3>
                    <p>{p.v}</p>
                  </div>
                  <span className="about__pref mono">{p.ref}</span>
                </li>
              ))}
            </ol>
          </div>

          <ul className="about__stats" data-reveal="stagger" aria-label="Selected highlights">
            {highlights.map((h) => (
              <li key={h.l}>
                <strong>{h.v}</strong>
                <span>{h.l}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
