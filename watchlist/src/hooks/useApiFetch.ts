import { useEffect, useRef, useState } from 'react';

type FetchResult<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

const useApiFetch = <T,>(url: string): FetchResult<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            accept: 'application/json',
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const json = (await response.json()) as T;
        setData(json);
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }

        setError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    void fetchData();

    return () => {
      controller.abort();
    };
  }, [url]);

  return { data, loading, error };
};

export default useApiFetch;
