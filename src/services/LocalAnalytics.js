/**
 * Простой сервис аналитики, работающий локально без Firebase
 */
class LocalAnalytics {
  constructor() {
    this.events = [];
    this.maxEvents = 1000; // Максимальное количество событий для хранения
    this.storageKey = 'crypto_tapper_analytics';
    this.sessionId = this.generateSessionId();
    this.userId = this.getUserId();
    
    // Загружаем сохраненные события
    this.loadEvents();
    
    // Настраиваем автоматическое сохранение
    this.setupAutoSave();
  }

  /**
   * Генерирует уникальный идентификатор сессии
   */
  generateSessionId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  /**
   * Получает или создает идентификатор пользователя
   */
  getUserId() {
    let userId = localStorage.getItem('crypto_tapper_user_id');
    
    if (!userId) {
      userId = 'user_' + Date.now().toString(36) + Math.random().toString(36).substring(2);
      localStorage.setItem('crypto_tapper_user_id', userId);
    }
    
    return userId;
  }

  /**
   * Настраивает автоматическое сохранение событий
   */
  setupAutoSave() {
    // Сохраняем события перед закрытием страницы
    window.addEventListener('beforeunload', () => {
      this.saveEvents();
    });
    
    // Периодически сохраняем события
    setInterval(() => {
      this.saveEvents();
    }, 60000); // Каждую минуту
  }

  /**
   * Отслеживает событие
   * @param {string} eventName - Название события
   * @param {Object} params - Параметры события
   */
  track(eventName, params = {}) {
    // Создаем событие
    const event = {
      name: eventName,
      params: {
        ...params,
        timestamp: Date.now(),
        sessionId: this.sessionId,
        userId: this.userId
      }
    };
    
    // Добавляем событие в массив
    this.events.push(event);
    
    // Если достигли максимального количества событий, удаляем самые старые
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }
    
    // Выводим событие в консоль в режиме отладки
    if (localStorage.getItem('DEBUG_MODE') === 'true') {
      console.log('Analytics event:', event);
    }
    
    // Возвращаем событие для возможного использования
    return event;
  }

  /**
   * Сохраняет события в localStorage
   */
  saveEvents() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.events));
    } catch (error) {
      console.error('Failed to save analytics events:', error);
    }
  }

  /**
   * Загружает события из localStorage
   */
  loadEvents() {
    try {
      const savedEvents = localStorage.getItem(this.storageKey);
      if (savedEvents) {
        this.events = JSON.parse(savedEvents);
      }
    } catch (error) {
      console.error('Failed to load analytics events:', error);
      this.events = [];
    }
  }

  /**
   * Очищает все события
   */
  clearEvents() {
    this.events = [];
    localStorage.removeItem(this.storageKey);
  }

  /**
   * Получает все события
   * @returns {Array} Массив событий
   */
  getEvents() {
    return [...this.events];
  }

  /**
   * Получает события определенного типа
   * @param {string} eventName - Название события
   * @returns {Array} Массив событий
   */
  getEventsByName(eventName) {
    return this.events.filter(event => event.name === eventName);
  }

  /**
   * Получает статистику по событиям
   * @returns {Object} Статистика
   */
  getStats() {
    const stats = {
      totalEvents: this.events.length,
      eventTypes: {},
      sessionCount: new Set(this.events.map(e => e.params.sessionId)).size,
      firstEventTime: this.events.length > 0 ? Math.min(...this.events.map(e => e.params.timestamp)) : null,
      lastEventTime: this.events.length > 0 ? Math.max(...this.events.map(e => e.params.timestamp)) : null
    };
    
    // Подсчитываем количество событий каждого типа
    this.events.forEach(event => {
      if (!stats.eventTypes[event.name]) {
        stats.eventTypes[event.name] = 0;
      }
      stats.eventTypes[event.name]++;
    });
    
    return stats;
  }
}

// Экспортируем singleton
const analytics = new LocalAnalytics();
export default analytics;