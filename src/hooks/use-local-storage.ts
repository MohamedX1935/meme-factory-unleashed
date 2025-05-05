
import { useState, useEffect, useCallback } from "react";

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  // Get from local storage then parse stored json
  const readValue = useCallback((): T => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      // Check if we have a value stored
      if (item) {
        try {
          // Handle case of very large JSON data
          return JSON.parse(item) as T;
        } catch (parseError) {
          console.warn(`Error parsing localStorage key "${key}":`, parseError);
          // If the JSON is too large/corrupt, remove it
          window.localStorage.removeItem(key);
        }
      }
      return initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [key, initialValue]);

  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue: React.Dispatch<React.SetStateAction<T>> = useCallback((value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to local storage
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (storageError) {
          // Handle storage quota errors
          if (storageError instanceof DOMException && 
              (storageError.name === 'QuotaExceededError' || 
               storageError.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
            console.warn('Storage quota exceeded. Some data may not be saved.');
            
            // Try to store a minimal version or clear other items if needed
            // For now, just notify the user
          } else {
            console.error('Error storing data in localStorage:', storageError);
          }
        }
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  useEffect(() => {
    setStoredValue(readValue());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key) {
        setStoredValue(readValue());
      }
    };

    // Listen for changes to this local storage key
    window.addEventListener("storage", handleStorageChange);

    // Clean up
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, readValue]);

  return [storedValue, setValue];
}
