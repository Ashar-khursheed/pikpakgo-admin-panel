type StorageAction = 'set' | 'get' | 'remove';

export const useLocalStorage = <T = unknown>(
  key: string,
  type: StorageAction,
  valueToStore?: T
): T | null | undefined => {
  if (type === 'set') {
    if (valueToStore === undefined) {
      console.warn('Value to store is required for "set" operation');
      return;
    }
    try {
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  } else if (type === 'get') {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  } else if (type === 'remove') {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }
};