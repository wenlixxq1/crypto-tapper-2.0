javascript
/**
 * Сервис аналитики для Crypto Tapper
 * Отслеживает: тапы, покупки, рефералы и другие события
 */

class AnalyticsService {
  constructor() {
    this.tapCount = 0;
    this.sessionStart = Date.now();
    this.isTelegram = typeof Telegram !== 'undefined' && Telegram.WebApp;
  }

  /**
   * Отправка события
   * @param {string} eventName - Название события
   * @param {object} eventData - Дополнительные данные
   */
  track(eventName, eventData = {}) {
    const event = {
      name: eventName,
      timestamp: Date.now(),
      ...eventData,
      platform: this.isTelegram ? 'telegram' : 'web',
      userId: this.getUserId(),
      sessionDuration: this.getSessionDuration()
    };

    // 1. Отправка в Telegram WebApp (если доступно)
    if (this.isTelegram) {
      Telegram.WebApp.sendData(JSON.stringify(event));
    }

    // 2. Отправка на ваш сервер аналитики
    this.sendToServer(event);

    // 3. Локальное сохранение (для отладки)
    console.log('[Analytics]', event);
  }

  /**
   * Отправка данных на сервер
   * @param {object} data 
   */
  async sendToServer(data) {
    try {
      // Замените URL на ваш endpoint
      const response = await fetch('https://your-analytics-api.com/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) throw new Error('Analytics send failed');
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }

  /**
   * Уникальный ID пользователя
   */
  getUserId() {
    if (this.isTelegram) {
      return Telegram.WebApp.initDataUnsafe.user?.id || 'unknown';
    }
    
    let userId = localStorage.getItem('analytics_user_id');
    if (!userId) {
      userId = 'web_' + Math.random().toString(36).substring(2, 11);
      localStorage.setItem('analytics_user_id', userId);
    }
    return userId;
  }

  /**
   * Длительность текущей сессии
   */
  getSessionDuration() {
    return (Date.now() - this.sessionStart) / 1000;
  }

  // === Специальные методы для трекинга ===

  trackTap(cryptoType, amount) {
    this.tapCount++;
    this.track('tap', {
      crypto: cryptoType,
      amount: amount,
      tapCount: this.tapCount
    });
  }

  trackPurchase(itemId, price) {
    this.track('purchase', {
      item: itemId,
      price: price,
      currency: 'TON'
    });
  }

  trackReferral(referralCode) {
    this.track('referral_apply', {
      code: referralCode
    });
  }

  trackSubscription(tier) {
    this.track('subscription', {
      tier: tier
    });
  }
}

// Создаем singleton экземпляр
const analytics = new AnalyticsService();

export default analytics;