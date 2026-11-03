import { useEffect, useRef } from 'react';

/** Reveal a content block once it enters the viewport. */
export default function RevealOnScroll({ children, className = '' }) {
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return undefined;

    if (!('IntersectionObserver' in window)) {
      element.classList.add('is-visible');
      return undefined;
    }

    const bounds = element.getBoundingClientRect();
    const isAlreadyVisible = bounds.top < window.innerHeight && bounds.bottom > 0;
    if (isAlreadyVisible) {
      element.classList.add('is-visible');
      return undefined;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }, { threshold: 0, rootMargin: '0px' });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={`reveal-on-scroll ${className}`.trim()} ref={elementRef}>
      {children}
    </div>
  );
}
