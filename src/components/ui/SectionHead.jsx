import SplitText from './SplitText';

export default function SectionHead({ index, label, title, lede, id }) {
  return (
    <header className="section-head">
      <p className="section-index" data-reveal="fade">
        <b>{index}</b>
        <span>{label}</span>
        <span className="signal-line" aria-hidden="true" />
      </p>
      <h2 className="section-title" id={id} data-reveal="heading">
        <SplitText text={title} />
      </h2>
      {lede ? (
        <p className="section-lede" data-reveal="fade">
          {lede}
        </p>
      ) : null}
    </header>
  );
}
