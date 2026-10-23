/**
 * Renders text split into masked words (and optionally characters) for GSAP reveals.
 * Screen readers get the plain sentence; the split spans are aria-hidden.
 * Without JavaScript animation the text simply displays normally.
 */
export default function SplitText({ text, by = 'words', className = '', as: Tag = 'span' }) {
  const words = text.split(' ');
  return (
    <Tag className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, i) => (
          <span key={`${word}-${i}`}>
            <span className="split-word">
              {by === 'chars' ? (
                [...word].map((ch, j) => (
                  <span key={j} className="split-inner split-char">
                    {ch}
                  </span>
                ))
              ) : (
                <span className="split-inner">{word}</span>
              )}
            </span>
            {i < words.length - 1 ? ' ' : null}
          </span>
        ))}
      </span>
    </Tag>
  );
}
