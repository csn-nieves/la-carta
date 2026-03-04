import { useEffect, useRef, useCallback } from 'react';
import { TEXTAREA_MAX_HEIGHT } from '../constants';

export function useAutoGrowTextarea(value: string) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (el && value) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, TEXTAREA_MAX_HEIGHT) + 'px';
    }
  }, []);

  const onChangeGrow = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, TEXTAREA_MAX_HEIGHT) + 'px';
  }, []);

  return { ref, onChangeGrow };
}
