import { telegramConfig } from '../utils/config.js';

class TelegramService {
  constructor() {
    this.botToken = telegramConfig.botToken;
    this.apiUrl = `https://api.telegram.org/bot${this.botToken}`;
    this.webApp = null;
    
    // Инициализируем Telegram WebApp
    this.initWebApp();
  }

  /**
   * Инициализирует Telegram WebApp
   */
  initWebApp() {
    if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
      this.webApp = window.Telegram.WebApp;
      console.log('Telegram WebApp initialized');
      
      // Расширяем WebApp на весь экран
      this.webApp.expand();
      
      // Сообщаем Telegram, что приложение готово
      this.webApp.ready();
    }
  }

  /**
   * Получает данные инициализации WebApp
   */
  getInitData() {
    if (!this.webApp) return null;
    return this.webApp.initData;
  }

  /**
   * Получает информацию о пользователе из WebApp
   */
  getUser() {
    if (!this.webApp) return null;
    return this.webApp.initDataUnsafe.user;
  }

  /**
   * Получает параметры запуска из WebApp
   */
  getStartParams() {
    if (!this.webApp) return {};
    
    try {
      // Пытаемся получить параметры из initDataUnsafe
      if (this.webApp.initDataUnsafe && this.webApp.initDataUnsafe.start_param) {
        return { start: this.webApp.initDataUnsafe.start_param };
      }
      
      // Если не удалось, пытаемся распарсить из initData
      const initData = this.getInitData();
      if (initData) {
        const startMatch = initData.match(/start=([^&]+)/);
        if (startMatch) {
          return { start: startMatch[1] };
        }
      }
    } catch (error) {
      console.error('Failed to parse start params:', error);
    }
    
    return {};
  }

  /**
   * Получает реферальный код из параметров запуска
   */
  getReferralCode() {
    const startParams = this.getStartParams();
    
    if (startParams.start) {
      // Проверяем формат ref_CODE
      const refMatch = startParams.start.match(/^ref_(.+)$/);
      if (refMatch) {
        return refMatch[1];
      }
    }
    
    return null;
  }

  /**
   * Показывает всплывающее уведомление
   * @param {string} message - Текст уведомления
   */
  showPopup(message) {
    if (!this.webApp) return;
    
    this.webApp.showPopup({
      title: 'Крипто Тапер',
      message,
      buttons: [{ type: 'close' }]
    });
  }

  /**
   * Показывает всплывающее уведомление с подтверждением
   * @param {string} message - Текст уведомления
   * @param {Function} onConfirm - Функция, вызываемая при подтверждении
   */
  showConfirmPopup(message, onConfirm) {
    if (!this.webApp) return;
    
    this.webApp.showPopup({
      title: 'Подтверждение',
      message,
      buttons: [
        { id: 'cancel', type: 'cancel' },
        { id: 'confirm', type: 'default', text: 'Подтвердить' }
      ]
    }, (buttonId) => {
      if (buttonId === 'confirm' && onConfirm) {
        onConfirm();
      }
    });
  }

  /**
   * Вызывает тактильную отдачу
   * @param {string} style - Стиль отдачи ('light', 'medium', 'heavy', 'rigid', 'soft')
   */
  hapticFeedback(style = 'light') {
    if (!this.webApp || !this.webApp.HapticFeedback) return;
    
    this.webApp.HapticFeedback.impactOccurred(style);
  }

  /**
   * Закрывает WebApp
   */
  close() {
    if (!this.webApp) return;
    this.webApp.close();
  }

  /**
   * Отправляет данные в родительский бот
   * @param {Object} data - Данные для отправки
   */
  sendData(data) {
    if (!this.webApp) return;
    
    try {
      this.webApp.sendData(JSON.stringify(data));
    } catch (error) {
      console.error('Failed to send data to Telegram:', error);
    }
  }

  /**
   * Создает ссылку для приглашения друзей
   * @param {string} referralCode - Реферальный код
   * @returns {string} Ссылка для приглашения
   */
  createReferralLink(referralCode) {
    // Получаем имя бота из токена
    const botName = this.getBotName();
    
    if (botName) {
      return `https://t.me/${botName}?start=ref_${referralCode}`;
    }
    
    // Если не удалось получить имя бота, возвращаем общую ссылку
    return `https://t.me/share/url?url=https://t.me/crypto_tapper_bot?start=ref_${referralCode}`;
  }

  /**
   * Получает имя бота из токена
   * @returns {string|null} Имя бота
   */
  getBotName() {
    // Это заглушка, в реальном приложении нужно получать имя бота из API
    return 'crypto_tapper_bot';
  }
}

// Экспортируем singleton
const telegramService = new TelegramService();
export default telegramService;