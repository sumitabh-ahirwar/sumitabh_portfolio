// Illustrative JobPortal recruiter view: role switcher, applicants, AI resume analysis.
const applicants = [
  { n: 'Applicant A', s: 0.86 },
  { n: 'Applicant B', s: 0.74 },
  { n: 'Applicant C', s: 0.61 },
  { n: 'Applicant D', s: 0.52 },
];

export default function PortalPreview() {
  return (
    <div className="jp">
      <aside className="jp__side">
        <p className="pv-label">Role</p>
        <span>Applicant</span>
        <span className="is-on">Recruiter</span>
        <span>Admin</span>
        <p className="pv-label jp__gap">Workspace</p>
        <span className="is-sub">Jobs</span>
        <span className="is-sub">Companies</span>
        <span className="is-sub is-on2">Applicants</span>
        <div className="jp__jwt">
          <small>JWT · role: recruiter</small>
        </div>
      </aside>

      <section className="jp__main">
        <div className="jp__head">
          <div>
            <p className="pv-label">Applicants for</p>
            <b>Backend Developer</b>
          </div>
          <span className="jp__gen">✦ Generate JD</span>
        </div>
        <ul className="jp__list">
          {applicants.map((a, i) => (
            <li key={a.n} className={i === 0 ? 'is-sel' : ''}>
              <span className="jp__av">{a.n.slice(-1)}</span>
              <span className="jp__nm">{a.n}</span>
              <span className="jp__bar" style={{ '--s': a.s, '--i': i }}>
                <i />
              </span>
            </li>
          ))}
        </ul>
        <div className="jp__jobs">
          {['Backend Developer', 'ML Engineer', 'Frontend Developer'].map((j) => (
            <div key={j} className="jp__job">
              <b>{j}</b>
              <small>Full-time · Applications open</small>
            </div>
          ))}
        </div>
      </section>

      <aside className="jp__ai">
        <p className="pv-label">AI resume analysis</p>
        <div className="jp__ring">
          <svg viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" className="jp__track" />
            <circle cx="50" cy="50" r="42" className="jp__arc" pathLength="100" />
          </svg>
          <span>
            Skill
            <br />
            match
          </span>
        </div>
        <p className="pv-label">Matched skills</p>
        <div className="jp__chips">
          <i className="is-yes">Node.js</i>
          <i className="is-yes">Express</i>
          <i className="is-yes">MongoDB</i>
          <i className="is-yes">REST</i>
          <i>Docker</i>
        </div>
        <div className="jp__parse">
          <small>Parsed by Gemini</small>
          <div className="rp__lines">
            <i style={{ width: '90%' }} />
            <i style={{ width: '70%' }} />
          </div>
        </div>
      </aside>
    </div>
  );
}
