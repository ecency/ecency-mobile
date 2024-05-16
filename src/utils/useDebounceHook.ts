import { useEffect, useRef } from 'react';

/**
 * custom debounce hook returns a method which debounces first method and always call the second method
 */
export const useDebounce = () => {
  const timeoutToClear = useRef<any>(null);

  useEffect(() => {
    return () => {
      clearTimeout(timeoutToClear?.current as any);
    };
  }, []);

  /**
   * custom debounce method which debounces first method and always call the second method
   * @param {function which needs to be debounced} callback
   * @param {this function would be called always} alwaysCall
   * @param {debounce delay in ms} ms
   */
  const debounce = (callback, alwaysCall, ms) => {
    return (...args) => {
      alwaysCall(...args);
      clearTimeout(timeoutToClear?.current as any);
      timeoutToClear.current = setTimeout(() => {
        callback(...args);
      }, ms);
    };
  };

  return {
    debounce,
  };
};

export default useDebounce;
