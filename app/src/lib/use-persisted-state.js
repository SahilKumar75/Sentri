import { useEffect, useRef, useState } from 'react';
import { getStoredJson, setStoredJson } from './device-store';

export function usePersistedState(key, fallback) {
  const [value, setValue] = useState(fallback);
  const [hydrated, setHydrated] = useState(false);
  const persistEnabledRef = useRef(false);

  useEffect(() => {
    let active = true;

    void getStoredJson(key, fallback).then((stored) => {
      if (!active) {
        return;
      }
      setValue(stored);
      setHydrated(true);
      persistEnabledRef.current = true;
    });

    return () => {
      active = false;
    };
  }, [fallback, key]);

  useEffect(() => {
    if (!persistEnabledRef.current) {
      return;
    }
    void setStoredJson(key, value);
  }, [key, value]);

  return {
    value,
    setValue,
    hydrated,
  };
}
