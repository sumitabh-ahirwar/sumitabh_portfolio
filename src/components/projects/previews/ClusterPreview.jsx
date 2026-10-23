// Illustrative Data2Model cluster: API → Redis queue → workers under a 512 MB cap,
// plus an Optuna-style search plot. Shapes only — no real telemetry.
const workers = [
  { id: 'worker-1', fill: 0.62, d: '7s' },
  { id: 'worker-2', fill: 0.48, d: '9s' },
  { id: 'worker-n', fill: 0.71, d: '8s' },
];

// Deterministic scatter for the tuning plot
const trials = Array.from({ length: 26 }, (_, i) => {
  const x = 20 + i * 13.2;
  // Loss-like objective: improves (moves down the chart) as trials accumulate.
  const base = 26 + Math.log(i + 2) * 24;
  const y = Math.min(118, base + ((i * 37) % 29) - 14);
  return { x, y, i };
});
let best = -Infinity;
const bestPath = trials
  .map((t) => {
    best = Math.max(best, t.y);
    return `${t.x},${best}`;
  })
  .join(' ');

export default function ClusterPreview() {
  return (
    <div className="cp">
      <div className="cp__flow">
        <div className="cp__node">
          <p className="pv-label">API</p>
          <b>FastAPI</b>
          <small>enqueue · status · logs</small>
        </div>
        <div className="cp__wire">
          <i />
        </div>
        <div className="cp__queue">
          <p className="pv-label">Redis queue</p>
          <div className="cp__slots">
            {Array.from({ length: 5 }).map((_, i) => (
              <i key={i} style={{ '--i': i }} />
            ))}
          </div>
        </div>
        <div className="cp__wire">
          <i />
        </div>
        <div className="cp__workers">
          {workers.map((w) => (
            <div className="cp__worker" key={w.id}>
              <div className="cp__wh">
                <span className="cp__led" />
                <b>{w.id}</b>
                <small>celery</small>
              </div>
              <div className="cp__mem" style={{ '--f': w.fill, '--d': w.d }}>
                <i />
                <span className="cp__cap" />
              </div>
              <div className="cp__memlabel">
                <small>memory</small>
                <small>512 MB cap</small>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="cp__bottom">
        <div className="cp__panel cp__plot">
          <div className="cp__ph">
            <p className="pv-label">Hyperparameter search</p>
            <small>Optuna · trials</small>
          </div>
          <svg viewBox="0 0 370 130" preserveAspectRatio="none">
            {[30, 65, 100].map((y) => (
              <line key={y} x1="0" x2="370" y1={y} y2={y} className="cp__grid" />
            ))}
            <polyline points={bestPath} className="cp__best" />
            {trials.map((t) => (
              <circle key={t.i} cx={t.x} cy={t.y} r="3.2" className="cp__trial" style={{ '--i': t.i }} />
            ))}
          </svg>
        </div>
        <div className="cp__panel cp__pipeline">
          <p className="pv-label">Training job</p>
          <ol>
            <li className="is-done">Gemini constraints</li>
            <li className="is-done">Preprocess dataset</li>
            <li className="is-run">Optuna search</li>
            <li>Train final model</li>
            <li>Package artifacts</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
