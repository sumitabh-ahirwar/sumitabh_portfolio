import ScaledStage from './ScaledStage';
import ResearchPreview from './previews/ResearchPreview';
import ClusterPreview from './previews/ClusterPreview';
import PortalPreview from './previews/PortalPreview';
import './previews/Preview.css';

const MAP = { researchos: ResearchPreview, data2model: ClusterPreview, jobportal: PortalPreview };
const TITLES = {
  researchos: 'researchos — workspace',
  data2model: 'data2model — training cluster',
  jobportal: 'jobportal — recruiter view',
};

/** Coded, illustrative product preview. Purely decorative (aria-hidden). */
export default function ProjectPreview({ project, live }) {
  if (project.screenshots?.length) {
    const shot = project.screenshots[0];
    return <img className="preview-shot" src={shot.src} alt={shot.alt} loading="lazy" decoding="async" />;
  }
  const Body = MAP[project.id];
  return (
    <ScaledStage width={880} height={560}>
      <div className={`preview preview--${project.accent}${live ? ' is-live' : ''}`} aria-hidden="true">
        <div className="preview__chrome">
          <span className="preview__dots">
            <i />
            <i />
            <i />
          </span>
          <span className="preview__title">{TITLES[project.id]}</span>
          <span className="preview__badge">Illustrative</span>
        </div>
        <div className="preview__body">{Body ? <Body /> : null}</div>
      </div>
    </ScaledStage>
  );
}
