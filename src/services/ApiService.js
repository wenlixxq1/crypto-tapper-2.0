import { cryptoApiConfig } from '../utils/config.js';

class ApiService {
  constructor() {
    this.apiUrl = cryptoApiConfig.apiUrl;
    this.endpoints = cryptoApiConfig.endpoints;
    this.defaultParams = cryptoApiConfig.defaultParams;
  }

  /**
   * Выполняет GET-запрос к API
   * @param {string} endpoint - Конечная точка API
   * @param {Object} params - Параметры запроса
   * @returns {Promise<Object>} - Результат запроса
   */
  async get(endpoint, params = {}) {
    try {
      const url = new URL(`${this.apiUrl}${endpoint}`);
      
      // Добавляем параметры запроса
      Object.keys(params).forEach(key => {
        url.searchParams.append(key, params[key]);
      });
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  /**
   * Получает текущие цены криптовалют
   * @param {Array<string>} cryptoIds - Идентификаторы криптовалют (например, ['bitcoin', 'ethereum'])
   * @returns {Promise<Object>} - Цены криптовалют
   */
  async getPrices(cryptoIds) {
    const ids = cryptoIds.join(',');
    
    return this.get(this.endpoints.assets, {
      ids
    });
  }

  /**
   * Получает информацию о криптовалютах
   * @param {Object} params - Параметры запроса
   * @returns {Promise<Array>} - Список криптовалют
   */
  async getCoins(params = {}) {
    const requestParams = {
      ...this.defaultParams,
      ...params
    };
    
    return this.get(this.endpoints.coins, requestParams);
  }

  /**
   * Получает историю цен криптовалюты
   * @param {string} coinId - Идентификатор криптовалюты
   * @param {string} interval - Интервал (m1, m5, m15, m30, h1, h2, h6, h12, d1)
   * @param {number} start - Начальная дата в миллисекундах
   * @param {number} end - Конечная дата в миллисекундах
   * @returns {Promise<Object>} - История цен
   */
  async getCoinHistory(coinId, interval = 'd1', start = Date.now() - 7 * 24 * 60 * 60 * 1000, end = Date.now()) {
    const endpoint = this.endpoints.history.replace('{id}', coinId);
    
    return this.get(endpoint, {
      interval,
      start,
      end
    });
  }

  /**
   * Получает текущие курсы для списка криптовалют
   * @param {Array<string>} symbols - Символы криптовалют (BTC, ETH и т.д.)
   * @returns {Promise<Object>} - Курсы криптовалют
   */
  async getCurrentRates(symbols = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'DOGE', 'USDT']) {
    // Маппинг символов на идентификаторы CoinCap
    const symbolToId = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'SOL': 'solana',
      'BNB': 'binance-coin',
      'XRP': 'xrp',
      'ADA': 'cardano',
      'DOGE': 'dogecoin',
      'USDT': 'tether'
    };
    
    const ids = symbols.map(symbol => symbolToId[symbol]).filter(id => id);
    
    try {
      const response = await this.getPrices(ids);
      
      // Преобразуем результат в формат { BTC: 50000, ETH: 3000, ... }
      const rates = {};
      if (response.data) {
        response.data.forEach(coin => {
          const symbol = Object.keys(symbolToId).find(key => symbolToId[key] === coin.id);
          if (symbol) {
            rates[symbol] = parseFloat(coin.priceUsd);
          }
        });
      }
      
      return rates;
    } catch (error) {
      console.error('Failed to get current rates:', error);
      
      // Возвращаем фиксированные курсы в случае ошибки
      return {
        'BTC': 50000,
        'ETH': 3000,
        'SOL': 150,
        'BNB': 400,
        'XRP': 0.5,
        'ADA': 0.6,
        'DOGE': 0.1,
        'USDT': 1
      };
    }
  }
}

// Экспортируем singleton
const apiService = new ApiService();
export default apiService;