import { useRef } from 'react';
import { useMagnetic } from '../../hooks/useMagnetic';
import './Button.css';

/**
 * Link-or-button with optional magnetic hover.
 * variant: 'primary' | 'ghost' | 'icon'
 */
export default function Button({
  href,
  onClick,
  variant = 'primary',
  size,
  magnetic = false,
  icon: Icon,
  iconLeft: IconLeft,
  iconDir,
  children,
  className = '',
  ...rest
}) {
  const ref = useRef(null);
  useMagnetic(ref, { enabled: magnetic });
  const cls = `btn btn--${variant}${size === 'sm' ? ' btn--sm' : ''} ${className}`;
  const inner = (
    <>
      <span className="btn__sheen" aria-hidden="true" />
      {IconLeft ? <IconLeft className="btn__icon btn__icon--left" size={17} aria-hidden="true" /> : null}
      {children ? <span className="btn__label">{children}</span> : null}
      {Icon ? <Icon className="btn__icon" data-dir={iconDir} size={17} aria-hidden="true" /> : null}
    </>
  );
  if (href) {
    return (
      <a ref={ref} href={href} onClick={onClick} className={cls} {...rest}>
        {inner}
      </a>
    );
  }
  return (
    <button ref={ref} type="button" onClick={onClick} className={cls} {...rest}>
      {inner}
    </button>
  );
}
