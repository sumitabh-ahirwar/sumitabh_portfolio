import { useRef, useState } from 'react';
import { ArrowUpRight, Check, Copy, Download, Mail, Send } from 'lucide-react';
import { profile, socials } from '../../data/profile';
import { useSectionReveal } from '../../hooks/useSectionReveal';
import SplitText from '../ui/SplitText';
import Button from '../ui/Button';
import SignalScope from '../effects/SignalScope';
import { GitHubIcon, LinkedInIcon } from '../ui/Icons';
import './Contact.css';

const SUBJECT = 'Hello from your portfolio';
// Gmail's web composer works in any browser, with no desktop mail app required.
const gmailHref = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(profile.email)}&su=${encodeURIComponent(SUBJECT)}`;
const mailtoHref = `mailto:${profile.email}?subject=${encodeURIComponent(SUBJECT)}`;

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Older browsers / insecure contexts
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
    document.body.appendChild(ta);
    ta.select();
    let ok;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    ta.remove();
    return ok;
  }
}

const links = [
  { href: socials.github.href, icon: <GitHubIcon size={20} />, title: 'GitHub', sub: `@${socials.github.handle}`, external: true },
  { href: socials.linkedin.href, icon: <LinkedInIcon size={19} />, title: 'LinkedIn', sub: `in/${socials.linkedin.handle}`, external: true },
  { href: socials.leetcode.href, icon: <span className="contact__glyph mono">LC</span>, title: 'LeetCode', sub: `@${socials.leetcode.handle}`, external: true },
];

export default function Contact() {
  const ref = useRef(null);
  const scope = useRef(null);
  const [copyState, setCopyState] = useState('idle'); // idle | copied | failed
  useSectionReveal(ref);

  const pulse = (n = 0.5) => scope.current?.pulse(n);

  const onCopy = async () => {
    pulse(1);
    const ok = await copyText(profile.email);
    setCopyState(ok ? 'copied' : 'failed');
    setTimeout(() => setCopyState('idle'), 2400);
  };

  return (
    <section className="section contact" id="contact" ref={ref} tabIndex={-1} aria-labelledby="contact-title">
      <div className="contact__glow" aria-hidden="true" />
      <div className="container">
        <p className="section-index" data-reveal="fade">
          <b>07</b>
          <span>Contact</span>
          <span className="signal-line" aria-hidden="true" />
        </p>
        <h2 className="contact__title" id="contact-title" data-reveal="heading">
          <SplitText text="Have an interesting problem to solve?" />
        </h2>
        <p className="contact__lede" data-reveal="fade">
          I’m interested in building useful software, exploring challenging engineering problems, and collaborating on
          ideas that make a real impact.
        </p>

        <div className="contact__grid">
          <div className="beacon" data-reveal="fade" onPointerEnter={() => pulse(0.6)}>
            <div className="beacon__bar">
              <span className="beacon__led" aria-hidden="true" />
              <h3 className="mono">Direct line</h3>
              <span className="mono beacon__to">email</span>
            </div>
            <SignalScope ref={scope} />
            <div className="beacon__body">
              <p className="eyebrow">Write to me at</p>
              <a href={mailtoHref} className="beacon__address" onFocus={() => pulse(0.4)}>
                {profile.email}
              </a>
              <div className="beacon__actions">
                <Button href={gmailHref} target="_blank" rel="noreferrer" icon={Send} magnetic onFocus={() => pulse(0.4)} onClick={() => pulse(1.2)}>
                  Write in Gmail
                </Button>
                <Button variant="ghost" onClick={onCopy} iconLeft={copyState === 'copied' ? Check : Copy}>
                  {copyState === 'copied' ? 'Copied' : 'Copy address'}
                </Button>
                <Button variant="ghost" href={mailtoHref} iconLeft={Mail} onClick={() => pulse(1.2)}>
                  Mail app
                </Button>
              </div>
              <p className="beacon__hint" role="status" aria-live="polite">
                {copyState === 'copied'
                  ? 'Address copied to your clipboard.'
                  : copyState === 'failed'
                    ? 'Couldn’t copy automatically — select the address above instead.'
                    : 'Gmail opens in a new tab. “Mail app” uses your default email program.'}
              </p>
            </div>
          </div>

          <div className="contact__channels" data-reveal="stagger">
            {links.map((l) => (
              <a key={l.title} className="contact__link" href={l.href} target="_blank" rel="noreferrer">
                {l.icon}
                <span>
                  <b>{l.title}</b>
                  <small>{l.sub}</small>
                </span>
                <ArrowUpRight size={18} aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            ))}
            <a className="contact__link" href={profile.resume.href} download={profile.resume.fileName}>
              <Download size={19} aria-hidden="true" />
              <span>
                <b>Resume</b>
                <small>PDF · download</small>
              </span>
              <ArrowUpRight size={18} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
