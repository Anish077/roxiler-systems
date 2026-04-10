import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

/**
 * Generic hook for API calls with loading / error state management.
 *
 * Usage:
 *   const { data, loading, error, execute } = useApi(adminAPI.getDashboard);
 *   useEffect(() => { execute(); }, [execute]);
 */
export function useApi(apiFn, options = {}) {
  const { onSuccess, onError, showErrorToast = true, initialData = null } = options;
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiFn(...args);
        const result = res.data?.data ?? res.data;
        setData(result);
        if (onSuccess) onSuccess(result);
        return result;
      } catch (err) {
        const msg = err.response?.data?.message || err.message || 'Something went wrong';
        setError(msg);
        if (showErrorToast) toast.error(msg);
        if (onError) onError(err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [apiFn, onSuccess, onError, showErrorToast]
  );

  return { data, loading, error, execute, setData };
}

export default useApi;
