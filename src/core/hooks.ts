import { useState, useCallback } from 'preact/hooks';

export function useRender() {
  const setCount = useState(0)[1];
  let count = 1;
  const render = useCallback(() => {
    setCount(count++);
  }, [setCount]);

  return render;
}
