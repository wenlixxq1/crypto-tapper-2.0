// Локальная аналитика вместо Firebase

class Analytics {
  constructor() {
    this.initialized = false;
    this.userId = null;
    this.sessionId = this.generateSessionId();
    this.events = [];
    this.maxQueueSize = 20;
    
    // Инициализируем аналитику при создании экземпляра
    this.init();
  }

  /**
   * Инициализирует аналитику
   */
  async init() {
    try {
      // Загружаем сохраненные события
      this.loadEvents();
      this.initialized = true;
      console.log('Local analytics initialized');
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
    }
  }

  /**
   * Генерирует уникальный идентификатор сессии
   */
  generateSessionId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  /**
   * Устанавливает идентификатор пользователя
   * @param {string} userId - Идентификатор пользователя
   */
  setUserId(userId) {
    this.userId = userId;
  }

  /**
   * Отслеживает событие
   * @param {string} eventName - Название события
   * @param {Object} params - Параметры события
   */
  track(eventName, params = {}) {
    // Создаем событие
    const eventParams = {
      ...params,
      timestamp: Date.now(),
      sessionId: this.sessionId
    };
    
    // Если установлен идентификатор пользователя, добавляем его
    if (this.userId) {
      eventParams.userId = this.userId;
    }
    
    // Добавляем событие в очередь
    this.queueEvent(eventName, eventParams);
    
    // Если очередь достигла максимального размера, отправляем события
    if (this.events.length >= this.maxQueueSize) {
      this.flushEvents();
    }
    
    // В режиме отладки выводим событие в консоль
    if (localStorage.getItem('DEBUG_MODE') === 'true') {
      console.log('Analytics event:', eventName, eventParams);
    }
  }

  /**
   * Добавляет событие в очередь
   * @param {string} eventName - Название события
   * @param {Object} params - Параметры события
   */
  queueEvent(eventName, params) {
    this.events.push({ name: eventName, params });
    
    // Сохраняем события в localStorage
    this.saveEvents();
  }

  /**
   * Сохраняет события в localStorage
   */
  saveEvents() {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('analytics_events', JSON.stringify(this.events));
      } catch (error) {
        console.error('Failed to save events to localStorage:', error);
      }
    }
  }

  /**
   * Загружает события из localStorage
   */
  loadEvents() {
    if (typeof localStorage !== 'undefined') {
      try {
        const events = localStorage.getItem('analytics_events');
        if (events) {
          this.events = JSON.parse(events);
        }
      } catch (error) {
        console.error('Failed to load events from localStorage:', error);
      }
    }
  }

  /**
   * Отправляет накопленные события
   */
  async flushEvents() {
    if (!this.initialized || this.events.length === 0) {
      return;
    }
    
    try {
      // Сохраняем события в localStorage
      this.saveEvents();
      
      // В режиме отладки выводим статистику
      if (localStorage.getItem('DEBUG_MODE') === 'true') {
        console.log('Analytics stats:', this.getStats());
      }
    } catch (error) {
      console.error('Failed to flush events:', error);
    }
  }

  /**
   * Отслеживает просмотр экрана
   * @param {string} screenName - Название экрана
   * @param {Object} params - Дополнительные параметры
   */
  trackScreen(screenName, params = {}) {
    this.track('screen_view', {
      screen_name: screenName,
      ...params
    });
  }

  /**
   * Отслеживает ошибку
   * @param {Error|string} error - Объект ошибки или сообщение
   * @param {Object} params - Дополнительные параметры
   */
  trackError(error, params = {}) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : null;
    
    this.track('error', {
      error_message: errorMessage,
      error_stack: errorStack,
      ...params
    });
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
const analytics = new Analytics();
export default analytics;