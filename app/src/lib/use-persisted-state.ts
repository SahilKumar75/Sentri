import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { getStoredJson, setStoredJson } from './device-store';

export function usePersistedState<T>(
  key: string,
  fallback: T
): {
  value: T;
  setValue: Dispatch<SetStateAction<T>>;
  hydrated: boolean;
} {
  const [value, setValue] = useState<T>(fallback);
  const [hydrated, setHydrated] = useState(false);
  const persistEnabledRef = useRef(false);

  useEffect(() => {
    let active = true;

    void getStoredJson<T>(key, fallback).then((stored) => {
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
