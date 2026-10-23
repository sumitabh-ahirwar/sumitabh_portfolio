import { useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { contestResults, ratings } from '../../data/achievements';
import { useSectionReveal } from '../../hooks/useSectionReveal';
import SectionHead from '../ui/SectionHead';
import Counter from '../ui/Counter';
import './Achievements.css';

const timeline = [
  { year: '2025', items: ['AlgoUniversity Graph Contest · Institute rank 6', 'Google BigCode · Round 2, top 1,500', 'LeetCode Biweekly 152 · rank 327 / 30,000+'] },
  { year: '2026', items: ['LeetCode Guardian · peak 2169', 'Codeforces Specialist · peak 1446'] },
];

export default function Achievements() {
  const ref = useRef(null);
  useSectionReveal(ref);
  return (
    <section className="section ach" id="achievements" ref={ref} tabIndex={-1} aria-labelledby="ach-title">
      <div className="container">
        <SectionHead
          index="05"
          label="Achievements"
          id="ach-title"
          title="Problem-solving, measured."
          lede="Competitive programming keeps my fundamentals sharp. Contest placements on the left, peak platform ratings on the right."
        />

        <div className="ach__grid">
          <div className="ach__col">
            <p className="eyebrow ach__colhead" data-reveal="fade">
              Contest results
            </p>
            <ol className="ach__contests" data-reveal="stagger">
              {contestResults.map((c) => (
                <li key={c.id} className="ach__contest">
                  <Counter className="ach__rank" value={c.value} prefix={c.prefix} />
                  <div>
                    <h3>{c.event}</h3>
                    <p>{c.detail}</p>
                  </div>
                  <span className="ach__year mono">{c.year}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="ach__col">
            <p className="eyebrow ach__colhead" data-reveal="fade">
              Peak ratings
            </p>
            <ul className="ach__ratings" data-reveal="stagger">
              {ratings.map((r) => (
                <li key={r.id} className={`ach__rating ach__rating--${r.id}`}>
                  <div className="ach__rtop">
                    <span className="ach__platform">{r.platform}</span>
                    {r.title ? <span className="ach__badge mono">{r.title}</span> : null}
                  </div>
                  <Counter className="ach__value" value={r.value} />
                  <div className="ach__rfoot">
                    <span className="mono">max rating{r.year ? ` · ${r.year}` : ''}</span>
                    <a href={r.href} target="_blank" rel="noreferrer" aria-label={`${r.platform} profile ${r.handle} (opens in a new tab)`}>
                      @{r.handle} <ArrowUpRight size={14} aria-hidden="true" />
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="ach__timeline" data-reveal="fade">
          <div className="ach__track" aria-hidden="true">
            <span data-reveal="line" />
          </div>
          <ol>
            {timeline.map((t) => (
              <li key={t.year}>
                <span className="ach__tyear mono">{t.year}</span>
                <ul>
                  {t.items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>

        <p className="illustrative ach__note">Values as listed on my resume — static, not fetched live.</p>
      </div>
    </section>
  );
}
