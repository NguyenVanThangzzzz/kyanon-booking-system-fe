import { useEffect, useRef, useState } from 'react';

export const useInView = (threshold = 0.2) => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry?.isIntersecting ?? false);
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
};
