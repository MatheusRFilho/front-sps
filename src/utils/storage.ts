export class StorageManager {
  private static isStorageAvailable(type: 'localStorage' | 'sessionStorage'): boolean {
    try {
      const storage = window[type];
      const test = '__storage_test__';
      storage.setItem(test, test);
      storage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  static setItem(key: string, value: unknown, useSession = false): boolean {
    const storageType = useSession ? 'sessionStorage' : 'localStorage';
    
    if (!this.isStorageAvailable(storageType)) {
      return false;
    }

    try {
      const storage = window[storageType];
      const serializedValue = JSON.stringify(value);
      storage.setItem(key, serializedValue);
      return true;
    } catch (error) {
      return false;
    }
  }

  static getItem<T>(key: string, defaultValue: T | null = null, useSession = false): T | null {
    const storageType = useSession ? 'sessionStorage' : 'localStorage';
    
    if (!this.isStorageAvailable(storageType)) {
      return defaultValue;
    }

    try {
      const storage = window[storageType];
      const item = storage.getItem(key);
      
      if (item === null) {
        return defaultValue;
      }

      return JSON.parse(item) as T;
    } catch (error) {
      return defaultValue;
    }
  }

  static removeItem(key: string, useSession = false): boolean {
    const storageType = useSession ? 'sessionStorage' : 'localStorage';
    
    if (!this.isStorageAvailable(storageType)) {
      return false;
    }

    try {
      const storage = window[storageType];
      storage.removeItem(key);
      return true;
    } catch (error) {
      return false;
    }
  }

  static clear(useSession = false): boolean {
    const storageType = useSession ? 'sessionStorage' : 'localStorage';
    
    if (!this.isStorageAvailable(storageType)) {
      return false;
    }

    try {
      const storage = window[storageType];
      storage.clear();
      return true;
    } catch (error) {
      return false;
    }
  }

  static getAllKeys(useSession = false): string[] {
    const storageType = useSession ? 'sessionStorage' : 'localStorage';
    
    if (!this.isStorageAvailable(storageType)) {
      return [];
    }

    try {
      const storage = window[storageType];
      return Object.keys(storage);
    } catch (error) {
      return [];
    }
  }
}