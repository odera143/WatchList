import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '../auth/useAuthStore';

type FetchResult<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

const useApiFetch = (url: string): FetchResult<any> => {
  const token = useAuthStore((state) => state.token);

  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const fetchData = async () => {
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const json = await response.json();
      setData(json);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Unknown error');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    return () => {
      abortRef.current?.abort();
    };
  }, [url, token]);

  return { data, loading, error };
};

export default useApiFetch;
