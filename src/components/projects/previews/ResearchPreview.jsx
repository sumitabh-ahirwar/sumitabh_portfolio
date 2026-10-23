// Illustrative ResearchOS workspace: question → agent pipeline → cited report.
const agents = [
  { name: 'Query Planner', kind: 'fn' },
  { name: 'Web Search', kind: 'llm', branch: 'a' },
  { name: 'PDF Retriever', kind: 'fn', branch: 'b' },
  { name: 'Analyzer', kind: 'fn' },
  { name: 'Report Writer', kind: 'llm' },
  { name: 'Citation Checker', kind: 'fn' },
  { name: 'Critic', kind: 'llm' },
];

export default function ResearchPreview() {
  return (
    <div className="rp">
      <div className="rp__left">
        <p className="pv-label">Research question</p>
        <div className="rp__query">
          <span className="rp__typed">How do chunking strategies affect citation accuracy in long PDFs?</span>
          <span className="rp__caret" />
        </div>
        <div className="rp__modes">
          <span>Web</span>
          <span>PDF</span>
          <span className="is-on">Hybrid</span>
        </div>
        <p className="pv-label">Evidence</p>
        <div className="rp__src">
          <i className="rp__ico rp__ico--pdf" />
          <div>
            <b>paper.pdf</b>
            <small>chunked · embedded · ChromaDB</small>
          </div>
        </div>
        <div className="rp__src">
          <i className="rp__ico rp__ico--web" />
          <div>
            <b>Web search</b>
            <small>Tavily · scraped pages</small>
          </div>
        </div>
        <div className="rp__retrieve">
          <p className="pv-label">Semantic retrieval</p>
          <div className="rp__chunks">
            {Array.from({ length: 12 }).map((_, i) => (
              <i key={i} className={[1, 4, 6, 9].includes(i) ? 'is-hit' : ''} style={{ '--i': i }} />
            ))}
          </div>
        </div>
      </div>

      <div className="rp__mid">
        <p className="pv-label">Agent pipeline</p>
        <ol className="rp__pipe">
          {agents.map((a, i) => (
            <li key={a.name} className={`rp__agent rp__agent--${a.kind}${a.branch ? ` rp__agent--branch-${a.branch}` : ''}`} style={{ '--i': i }}>
              <span className="rp__dot" />
              <span className="rp__name">{a.name}</span>
              <span className="rp__state">{a.kind === 'llm' ? 'LLM' : 'fn'}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="rp__right">
        <div className="rp__doc">
          <p className="rp__h">Report</p>
          <p className="rp__sub">Structured · Markdown</p>
          <div className="rp__lines">
            <i style={{ width: '92%' }} />
            <i style={{ width: '84%' }} />
            <i className="is-cite" style={{ width: '70%' }}>
              <em>[1] p.12</em>
            </i>
            <i style={{ width: '88%' }} />
            <i style={{ width: '60%' }} />
          </div>
          <p className="rp__h2">Findings</p>
          <div className="rp__lines">
            <i style={{ width: '90%' }} />
            <i className="is-cite" style={{ width: '76%' }}>
              <em>[2] web</em>
            </i>
            <i style={{ width: '82%' }} />
          </div>
        </div>
        <div className="rp__cites">
          <div className="rp__cite">
            <b>[1]</b> paper.pdf <span>page 12</span>
          </div>
          <div className="rp__cite">
            <b>[2]</b> web source <span>url</span>
          </div>
        </div>
      </div>
    </div>
  );
}
