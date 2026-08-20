import { useState, useEffect, useCallback } from 'react'

/**
 * Hook for fetching data with loading and error states
 */
export function useFetch(fetchFn, dependencies = []) {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const execute = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const result = await fetchFn()
            setData(result)
        } catch (err) {
            setError(err.message || 'An error occurred')
        } finally {
            setLoading(false)
        }
    }, [fetchFn])

    useEffect(() => {
        execute()
    }, dependencies)

    return { data, loading, error, refetch: execute }
}

/**
 * Hook for debounced value
 */
export function useDebounce(value, delay = 300) {
    const [debouncedValue, setDebouncedValue] = useState(value)

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay)
        return () => clearTimeout(timer)
    }, [value, delay])

    return debouncedValue
}

/**
 * Hook for local storage
 */
export function useLocalStorage(key, initialValue) {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key)
            return item ? JSON.parse(item) : initialValue
        } catch {
            return initialValue
        }
    })

    const setValue = (value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value
            setStoredValue(valueToStore)
            window.localStorage.setItem(key, JSON.stringify(valueToStore))
        } catch (error) {
            console.error('Error saving to localStorage:', error)
        }
    }

    return [storedValue, setValue]
}
