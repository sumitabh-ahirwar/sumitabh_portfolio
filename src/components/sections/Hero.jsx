import { useLayoutEffect, useRef } from 'react';
import { ArrowRight, Download } from 'lucide-react';
import { profile, socials } from '../../data/profile';
import { ratings } from '../../data/achievements';
import { education } from '../../data/profile';
import { gsap, EASE, MOTION_OK_QUERY } from '../../lib/motion';
import HeroScene from '../effects/HeroScene';
import SplitText from '../ui/SplitText';
import Button from '../ui/Button';
import { GitHubIcon, LinkedInIcon } from '../ui/Icons';
import { navigateTo } from '../../lib/navigation';
import './Hero.css';

const meta = [
  { k: 'LeetCode', v: `${ratings[0].title} · ${ratings[0].value} peak` },
  { k: 'Codeforces', v: `${ratings[1].title} · ${ratings[1].value} peak` },
  { k: 'MNNIT', v: `CPI ${education[0].metric.value}` },
];

export default function Hero({ ready }) {
  const rootRef = useRef(null);

  useLayoutEffect(() => {
    if (!ready) return undefined;
    const mm = gsap.matchMedia(rootRef);
    mm.add(MOTION_OK_QUERY, () => {
      const tl = gsap.timeline({ defaults: { ease: EASE.out } });
      tl.from('.hero__status', { y: 14, autoAlpha: 0, duration: 0.9 }, 0.15)
        .from('.hero__label', { clipPath: 'inset(0 100% 0 0)', duration: 1.3, ease: EASE.inOut }, 0.15)
        .from('.hero__name .split-inner', { yPercent: 115, duration: 1, stagger: 0.06 }, 0.3)
        .from('.hero__line--a .split-char', { yPercent: 118, duration: 1.25, stagger: 0.016 }, 0.42)
        .from('.hero__line--b .split-inner', { yPercent: 118, duration: 1.25, stagger: 0.07 }, 0.75)
        .from('.hero__sub', { y: 22, autoAlpha: 0, duration: 1 }, 0.7)
        .from('.hero__ctas > *', { y: 20, autoAlpha: 0, duration: 0.9, stagger: 0.07 }, 0.85)
        .from('.hero__meta li', { y: 14, autoAlpha: 0, duration: 0.8, stagger: 0.07 }, 1.05)
        .from('.hero__cue', { autoAlpha: 0, y: -10, duration: 0.8 }, 1.35);

      // Content drifts up and fades as the visitor scrolls on.
      gsap.to('.hero__content', {
        yPercent: -14,
        autoAlpha: 0.15,
        ease: 'none',
        scrollTrigger: { trigger: rootRef.current, start: 'top top', end: 'bottom top', scrub: true },
      });
    });
    return () => mm.revert();
  }, [ready]);

  return (
    <section className="hero" id="top" ref={rootRef} tabIndex={-1} aria-labelledby="hero-title">
      <HeroScene active={ready} />

      <div className="hero__content container">
        <p className="hero__status">
          <span className="hero__pulse" aria-hidden="true" />
          {profile.status}
        </p>
        <p className="hero__label eyebrow">{profile.label}</p>

        <h1 className="hero__title" id="hero-title">
          <SplitText className="hero__name" text={profile.name.toUpperCase()} />
          <SplitText className="hero__line hero__line--a" text={profile.headline[0]} by="chars" />
          <SplitText className="hero__line hero__line--b" text={profile.headline[1]} />
        </h1>

        <p className="hero__sub">{profile.summary}</p>

        <div className="hero__ctas">
          <Button
            href="#projects"
            magnetic
            icon={ArrowRight}
            onClick={(e) => {
              e.preventDefault();
              navigateTo('projects');
            }}
          >
            Explore My Work
          </Button>
          <Button href={profile.resume.href} download={profile.resume.fileName} variant="ghost" icon={Download} iconDir="down" magnetic>
            Download Resume
          </Button>
          <div className="hero__social">
            <a className="btn btn--icon" href={socials.github.href} target="_blank" rel="noreferrer" aria-label="GitHub profile (opens in a new tab)">
              <GitHubIcon size={19} />
            </a>
            <a className="btn btn--icon" href={socials.linkedin.href} target="_blank" rel="noreferrer" aria-label="LinkedIn profile (opens in a new tab)">
              <LinkedInIcon size={18} />
            </a>
          </div>
        </div>
      </div>

      <ul className="hero__meta container mono" aria-label="Highlights">
        {meta.map((m) => (
          <li key={m.k}>
            <span>{m.k}</span>
            {m.v}
          </li>
        ))}
      </ul>

      <a
        href="#about"
        className="hero__cue"
        onClick={(e) => {
          e.preventDefault();
          navigateTo('about');
        }}
      >
        <span className="mono">Scroll</span>
        <span className="hero__cue-line" aria-hidden="true" />
      </a>
    </section>
  );
}
