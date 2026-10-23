import { ArrowUp } from 'lucide-react';
import { profile, socials } from '../../data/profile';
import { Mark } from '../ui/Icons';
import { navigateTo } from '../../lib/navigation';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <Mark size={28} />
          <p>
            Designed &amp; built by {profile.name}.
            <span> React · Three.js · GSAP</span>
          </p>
        </div>
        <ul className="footer__links">
          <li>
            <a href={socials.github.href} target="_blank" rel="noreferrer">
              GitHub
            </a>
          </li>
          <li>
            <a href={socials.linkedin.href} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
          </li>
          <li>
            <a href={socials.leetcode.href} target="_blank" rel="noreferrer">
              LeetCode
            </a>
          </li>
          <li>
            <a href={`mailto:${profile.email}`}>Email</a>
          </li>
        </ul>
        <a
          className="footer__top"
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            navigateTo('top');
          }}
        >
          Back to top <ArrowUp size={15} aria-hidden="true" />
        </a>
      </div>
      <p className="container footer__copy mono">© {new Date().getFullYear()} {profile.name}</p>
    </footer>
  );
}
