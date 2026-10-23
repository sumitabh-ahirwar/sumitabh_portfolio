import { lazy, startTransition, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { initSmoothScroll, scrollToTarget } from './lib/scroll';
import { getProject } from './data/projects';
import PageLoader from './components/layout/PageLoader';
import Navbar from './components/layout/Navbar';
import { navigateTo } from './lib/navigation';
import Footer from './components/layout/Footer';
import CursorLight from './components/effects/CursorLight';
import Hero from './components/sections/Hero';
import About from './components/sections/About';
import Projects from './components/sections/Projects';
import Architecture from './components/sections/Architecture';
import Skills from './components/sections/Skills';
import Achievements from './components/sections/Achievements';
import Education from './components/sections/Education';
import Contact from './components/sections/Contact';

// The case-study view is only downloaded when someone opens a project.
const ProjectDetails = lazy(() => import('./components/projects/ProjectDetails'));

const SECTION_COUNT = 7;

function setHash(hash) {
  try {
    history.replaceState(null, '', hash ? `#${hash}` : location.pathname);
  } catch {
    /* ignore */
  }
}

export default function App() {
  const [revealed, setRevealed] = useState(false);
  const [loaderDone, setLoaderDone] = useState(false);
  const [openId, setOpenId] = useState(null);
  const [archTab, setArchTab] = useState('researchos');

  // The hero renders first; sections below the fold mount one per idle slot (still behind
  // the loader), so no single task has to style and lay out the whole page.
  const [stage, setStage] = useState(0);
  const restReady = stage >= SECTION_COUNT;
  const hashHandled = useRef(false);

  useEffect(() => initSmoothScroll(), []);

  useEffect(() => {
    if (restReady) return undefined;
    const ric = window.requestIdleCallback || ((cb) => setTimeout(cb, 1));
    const cancel = window.cancelIdleCallback || clearTimeout;
    const id = ric(() => startTransition(() => setStage((s) => s + 1)), { timeout: 300 });
    return () => cancel(id);
  }, [stage, restReady]);

  const handleReveal = useCallback(() => setRevealed(true), []);

  // Once the page is visible and fully mounted, honour any #hash from the URL.
  useEffect(() => {
    if (!revealed || !restReady || hashHandled.current) return undefined;
    hashHandled.current = true;
    const raf = requestAnimationFrame(() => {
      const hash = decodeURIComponent(location.hash.slice(1));
      if (hash.startsWith('case-') && getProject(hash.slice(5))) {
        scrollToTarget('projects', { immediate: true });
        setOpenId(hash.slice(5));
      } else if (hash && document.getElementById(hash)) {
        scrollToTarget(hash, { immediate: true });
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [revealed, restReady]);

  const openProject = useCallback((id) => {
    setOpenId(id);
    setHash(`case-${id}`);
  }, []);

  const closeProject = useCallback(() => {
    setOpenId(null);
    setHash('projects');
  }, []);

  const showArchitecture = useCallback((id) => {
    setOpenId(null);
    setArchTab(id);
    requestAnimationFrame(() => navigateTo('architecture'));
  }, []);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      {!loaderDone ? <PageLoader onReveal={handleReveal} onDone={() => setLoaderDone(true)} /> : null}
      <CursorLight />
      <Navbar ready={revealed} sectionsReady={restReady} />
      <main id="main" tabIndex={-1}>
        <Hero ready={revealed} />
        {stage > 0 ? <About /> : null}
        {stage > 1 ? <Projects onOpen={openProject} /> : null}
        {stage > 2 ? <Architecture active={archTab} onChange={setArchTab} /> : null}
        {stage > 3 ? <Skills /> : null}
        {stage > 4 ? <Achievements /> : null}
        {stage > 5 ? <Education /> : null}
        {stage > 6 ? <Contact /> : null}
      </main>
      {restReady ? <Footer /> : null}
      {openId ? (
        <Suspense fallback={null}>
          <ProjectDetails
            id={openId}
            onClose={closeProject}
            onNavigate={openProject}
            onShowArchitecture={showArchitecture}
          />
        </Suspense>
      ) : null}
    </>
  );
}
