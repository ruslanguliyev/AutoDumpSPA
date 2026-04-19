import { useRef, useEffect, useCallback } from 'react';

export const useDragScroll = <T extends HTMLElement>() => {
  const ref = useRef<T>(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const onMouseDown = useCallback((e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    
    isDown.current = true;
    el.style.cursor = 'grabbing';
    startX.current = e.pageX - el.offsetLeft;
    scrollLeft.current = el.scrollLeft;
  }, []);

  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    
    isDown.current = false;
    el.style.cursor = 'grab';
  }, []);

  const onMouseUp = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    
    isDown.current = false;
    el.style.cursor = 'grab';
  }, []);

  const onMouseMove = useCallback((e: MouseEvent) => {
    const el = ref.current;
    if (!el || !isDown.current) return;
    
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    el.scrollLeft = scrollLeft.current - walk;
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.style.cursor = 'grab';
    
    el.addEventListener('mousedown', onMouseDown);
    el.addEventListener('mouseleave', onMouseLeave);
    el.addEventListener('mouseup', onMouseUp);
    el.addEventListener('mousemove', onMouseMove);

    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      el.removeEventListener('mouseleave', onMouseLeave);
      el.removeEventListener('mouseup', onMouseUp);
      el.removeEventListener('mousemove', onMouseMove);
    };
  }, [onMouseDown, onMouseLeave, onMouseUp, onMouseMove]);

  return ref;
};
