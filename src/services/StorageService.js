/**
 * Сервис для хранения данных пользователя локально
 * Заменяет функциональность Firebase
 */
class StorageService {
  constructor() {
    this.storageKey = 'crypto_tapper_data';
    this.syncInterval = 30000; // 30 секунд
    this.setupAutoSync();
  }

  /**
   * Настраивает автоматическую синхронизацию данных
   */
  setupAutoSync() {
    if (typeof window !== 'undefined') {
      // Синхронизация при изменении вкладки (пользователь вернулся в игру)
      window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.syncFromStorage();
        }
      });

      // Синхронизация перед закрытием страницы
      window.addEventListener('beforeunload', () => {
        this.syncToStorage();
      });

      // Периодическая синхронизация
      setInterval(() => {
        this.syncToStorage();
      }, this.syncInterval);
    }
  }

  /**
   * Сохраняет данные в localStorage
   * @param {string} key - Ключ для хранения
   * @param {any} data - Данные для сохранения
   */
  saveData(key, data) {
    try {
      const storageKey = `${this.storageKey}_${key}`;
      const serializedData = JSON.stringify(data);
      localStorage.setItem(storageKey, serializedData);
      return true;
    } catch (error) {
      console.error('Failed to save data:', error);
      return false;
    }
  }

  /**
   * Загружает данные из localStorage
   * @param {string} key - Ключ для загрузки
   * @param {any} defaultValue - Значение по умолчанию
   * @returns {any} Загруженные данные или значение по умолчанию
   */
  loadData(key, defaultValue = null) {
    try {
      const storageKey = `${this.storageKey}_${key}`;
      const serializedData = localStorage.getItem(storageKey);
      
      if (serializedData === null) {
        return defaultValue;
      }
      
      return JSON.parse(serializedData);
    } catch (error) {
      console.error('Failed to load data:', error);
      return defaultValue;
    }
  }

  /**
   * Удаляет данные из localStorage
   * @param {string} key - Ключ для удаления
   */
  removeData(key) {
    try {
      const storageKey = `${this.storageKey}_${key}`;
      localStorage.removeItem(storageKey);
      return true;
    } catch (error) {
      console.error('Failed to remove data:', error);
      return false;
    }
  }

  /**
   * Очищает все данные приложения из localStorage
   */
  clearAllData() {
    try {
      const keys = Object.keys(localStorage);
      
      for (const key of keys) {
        if (key.startsWith(this.storageKey)) {
          localStorage.removeItem(key);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Failed to clear all data:', error);
      return false;
    }
  }

  /**
   * Синхронизирует данные из памяти в localStorage
   */
  syncToStorage() {
    // Этот метод будет вызываться из UserService
    // для сохранения текущего состояния игры
  }

  /**
   * Синхронизирует данные из localStorage в память
   */
  syncFromStorage() {
    // Этот метод будет вызываться из UserService
    // для загрузки сохраненного состояния игры
  }

  /**
   * Экспортирует все данные пользователя
   * @returns {Object} Данные пользователя
   */
  exportUserData() {
    try {
      const keys = Object.keys(localStorage);
      const userData = {};
      
      for (const key of keys) {
        if (key.startsWith(this.storageKey)) {
          const shortKey = key.replace(`${this.storageKey}_`, '');
          userData[shortKey] = JSON.parse(localStorage.getItem(key));
        }
      }
      
      return userData;
    } catch (error) {
      console.error('Failed to export user data:', error);
      return {};
    }
  }

  /**
   * Импортирует данные пользователя
   * @param {Object} userData - Данные пользователя
   */
  importUserData(userData) {
    try {
      // Сначала очищаем текущие данные
      this.clearAllData();
      
      // Импортируем новые данные
      for (const [key, value] of Object.entries(userData)) {
        this.saveData(key, value);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import user data:', error);
      return false;
    }
  }
}

// Экспортируем singleton
const storageService = new StorageService();
export default storageService;