import { useEffect, useState } from "react";

const useFetch = <T>(fetchFunction: (...args: any[]) => Promise<T>, autoFetch: boolean) => {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = async (...args: any[]) => {
        try {
            setLoading(true);
            setError(null);
            
            const result = await fetchFunction(...args);
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setData(null);
        setError(null);
        setLoading(false);
    };

    useEffect(() => {
        if (autoFetch) {
            fetchData();
        }
    }, []);

    return { data, loading, error, refetch: fetchData, reset };
};

export default useFetch;

