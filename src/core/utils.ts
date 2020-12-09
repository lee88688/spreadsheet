export function throttle<T, A extends unknown[]>(this: T, func: Function, wait: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: A ) => {
    if (timeout !== null) {
      timeout = setTimeout(() => {
        timeout = null;
        func.apply(this, args);
      }, wait);
    }
  };
}
