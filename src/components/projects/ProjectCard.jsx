import { useEffect, useLayoutEffect, useRef } from 'react';
import { ArrowUpRight, ExternalLink } from 'lucide-react';
import { gsap, MOTION_OK_QUERY, isFinePointer, prefersReducedMotion } from '../../lib/motion';
import { useInView } from '../../hooks/useInView';
import Button from '../ui/Button';
import { GitHubIcon } from '../ui/Icons';
import ProjectPreview from './ProjectPreview';
import './ProjectCard.css';

export default function ProjectCard({ project, index, onOpen }) {
  const ref = useRef(null);
  const frameRef = useRef(null);
  const tiltRef = useRef(null);
  const chipRef = useRef(null);
  const live = useInView(frameRef, { rootMargin: '100px' });
  const open = () => onOpen(project.id);

  // Scroll choreography: the preview un-masks and settles (text reveal is data-reveal, see useSectionReveal).
  useLayoutEffect(() => {
    const mm = gsap.matchMedia(ref);
    mm.add(MOTION_OK_QUERY, () => {
      const frame = frameRef.current;
      const scrub = { trigger: frame, start: 'top 98%', end: 'top 40%', scrub: 0.6 };
      gsap.fromTo(tiltRef.current, { clipPath: 'inset(10% 7% 10% 7% round 22px)' }, { clipPath: 'inset(0% 0% 0% 0% round 22px)', ease: 'none', scrollTrigger: scrub });
      gsap.fromTo(tiltRef.current.firstElementChild, { scale: 1.12 }, { scale: 1, ease: 'none', scrollTrigger: scrub });
    });
    return () => mm.revert();
  }, []);

  // Hover: subtle perspective tilt + a label that follows the cursor (desktop only).
  useEffect(() => {
    const frame = frameRef.current;
    const tilt = tiltRef.current;
    const chip = chipRef.current;
    if (!frame || !isFinePointer() || prefersReducedMotion()) return undefined;
    const rx = gsap.quickTo(tilt, 'rotationX', { duration: 0.8, ease: 'power3.out' });
    const ry = gsap.quickTo(tilt, 'rotationY', { duration: 0.8, ease: 'power3.out' });
    const cx = gsap.quickTo(chip, 'x', { duration: 0.45, ease: 'power3.out' });
    const cy = gsap.quickTo(chip, 'y', { duration: 0.45, ease: 'power3.out' });
    const move = (e) => {
      const r = frame.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      ry(px * 7);
      rx(-py * 6);
      cx(e.clientX - r.left);
      cy(e.clientY - r.top);
    };
    const enter = (e) => {
      const r = frame.getBoundingClientRect();
      gsap.set(chip, { x: e.clientX - r.left, y: e.clientY - r.top });
      frame.classList.add('is-hover');
    };
    const leave = () => {
      rx(0);
      ry(0);
      frame.classList.remove('is-hover');
    };
    frame.addEventListener('pointerenter', enter);
    frame.addEventListener('pointermove', move);
    frame.addEventListener('pointerleave', leave);
    return () => {
      frame.removeEventListener('pointerenter', enter);
      frame.removeEventListener('pointermove', move);
      frame.removeEventListener('pointerleave', leave);
      gsap.killTweensOf([tilt, chip]);
    };
  }, []);

  const titleId = `project-${project.id}-title`;
  return (
    <article className={`pcard${index % 2 ? ' pcard--flip' : ''}`} ref={ref} aria-labelledby={titleId} data-accent={project.accent}>
      <div className="pcard__text" data-reveal="stagger">
        <span className="pcard__num mono" aria-hidden="true">
          {project.number}
        </span>
        <p className="eyebrow pcard__kicker">{project.title}</p>
        <h3 className="pcard__title" id={titleId}>
          {project.name}
        </h3>
        <p className="pcard__summary">{project.summary}</p>
        <ul className="tag-list" aria-label="Technologies">
          {project.tech.map((t) => (
            <li key={t} className="tag">
              {t}
            </li>
          ))}
        </ul>
        <div className="pcard__actions">
          <Button onClick={open} icon={ArrowUpRight} iconDir="diag" magnetic aria-haspopup="dialog">
            Explore Case Study
          </Button>
          {project.links.github ? (
            <Button variant="ghost" href={project.links.github} target="_blank" rel="noreferrer" iconLeft={GitHubIcon} aria-label={`${project.name} source code on GitHub (opens in a new tab)`}>
              Code
            </Button>
          ) : null}
          {project.links.live ? (
            <Button variant="ghost" href={project.links.live} target="_blank" rel="noreferrer" icon={ExternalLink} aria-label={`${project.name} live demo (opens in a new tab)`}>
              Live demo
            </Button>
          ) : null}
        </div>
      </div>

      <div className="pcard__media">
        {/* Mouse shortcut to the case study; keyboard and screen-reader users use the button above. */}
        <div className="pcard__frame" ref={frameRef} onClick={open} aria-hidden="true">
          <div className="pcard__tilt" ref={tiltRef}>
            <ProjectPreview project={project} live={live} />
          </div>
          <span className="pcard__chip mono" ref={chipRef} aria-hidden="true">
            Explore case study <ArrowUpRight size={14} />
          </span>
        </div>
        <p className="illustrative pcard__note">
          {project.screenshots?.length ? 'Product screenshot' : 'Illustrative interface · not live data'}
        </p>
      </div>
    </article>
  );
}
