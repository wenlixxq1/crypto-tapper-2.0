/**
 * Сервис для работы с CoinCap API
 * Бесплатный API для получения данных о криптовалютах
 * https://docs.coincap.io/
 */
class CoinCapService {
  constructor() {
    this.apiUrl = 'https://api.coincap.io/v2';
    this.cryptoMap = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'SOL': 'solana',
      'BNB': 'binance-coin',
      'XRP': 'xrp',
      'ADA': 'cardano',
      'DOGE': 'dogecoin',
      'USDT': 'tether'
    };
    this.lastRates = {};
    this.lastUpdateTime = 0;
    this.updateInterval = 60000; // 1 минута
  }

  /**
   * Получает текущие курсы криптовалют
   * @param {Array<string>} symbols - Символы криптовалют (BTC, ETH и т.д.)
   * @returns {Promise<Object>} - Курсы криптовалют
   */
  async getCurrentRates(symbols = Object.keys(this.cryptoMap)) {
    try {
      // Проверяем, нужно ли обновлять данные
      const now = Date.now();
      if (now - this.lastUpdateTime < this.updateInterval && Object.keys(this.lastRates).length > 0) {
        return this.lastRates;
      }

      // Получаем идентификаторы криптовалют
      const ids = symbols.map(symbol => this.cryptoMap[symbol]).filter(id => id);
      
      // Получаем данные о криптовалютах
      const response = await fetch(`${this.apiUrl}/assets?ids=${ids.join(',')}`);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Преобразуем результат в формат { BTC: 50000, ETH: 3000, ... }
      const rates = {};
      data.data.forEach(crypto => {
        const symbol = Object.keys(this.cryptoMap).find(key => this.cryptoMap[key] === crypto.id);
        if (symbol) {
          rates[symbol] = parseFloat(crypto.priceUsd);
        }
      });
      
      // Сохраняем результат
      this.lastRates = rates;
      this.lastUpdateTime = now;
      
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

  /**
   * Получает историю цен криптовалюты
   * @param {string} symbol - Символ криптовалюты (BTC, ETH и т.д.)
   * @param {string} interval - Интервал (m1, m5, m15, m30, h1, h2, h6, h12, d1)
   * @param {string} start - Начальная дата в миллисекундах
   * @param {string} end - Конечная дата в миллисекундах
   * @returns {Promise<Array>} - История цен
   */
  async getPriceHistory(symbol, interval = 'd1', start = null, end = null) {
    try {
      const id = this.cryptoMap[symbol];
      if (!id) {
        throw new Error(`Unknown crypto symbol: ${symbol}`);
      }
      
      // Формируем URL
      let url = `${this.apiUrl}/assets/${id}/history?interval=${interval}`;
      
      if (start) {
        url += `&start=${start}`;
      }
      
      if (end) {
        url += `&end=${end}`;
      }
      
      // Получаем данные
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Преобразуем результат в формат [[timestamp, price], ...]
      return data.data.map(item => [
        parseInt(item.time),
        parseFloat(item.priceUsd)
      ]);
    } catch (error) {
      console.error('Failed to get price history:', error);
      return [];
    }
  }

  /**
   * Получает информацию о криптовалюте
   * @param {string} symbol - Символ криптовалюты (BTC, ETH и т.д.)
   * @returns {Promise<Object>} - Информация о криптовалюте
   */
  async getCryptoInfo(symbol) {
    try {
      const id = this.cryptoMap[symbol];
      if (!id) {
        throw new Error(`Unknown crypto symbol: ${symbol}`);
      }
      
      // Получаем данные
      const response = await fetch(`${this.apiUrl}/assets/${id}`);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return {
        id: data.data.id,
        symbol: data.data.symbol,
        name: data.data.name,
        price: parseFloat(data.data.priceUsd),
        marketCap: parseFloat(data.data.marketCapUsd),
        volume24h: parseFloat(data.data.volumeUsd24Hr),
        change24h: parseFloat(data.data.changePercent24Hr),
        supply: parseFloat(data.data.supply),
        maxSupply: parseFloat(data.data.maxSupply)
      };
    } catch (error) {
      console.error('Failed to get crypto info:', error);
      return null;
    }
  }

  /**
   * Получает список топ криптовалют
   * @param {number} limit - Количество криптовалют
   * @returns {Promise<Array>} - Список криптовалют
   */
  async getTopCryptos(limit = 10) {
    try {
      // Получаем данные
      const response = await fetch(`${this.apiUrl}/assets?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return data.data.map(crypto => ({
        id: crypto.id,
        symbol: crypto.symbol,
        name: crypto.name,
        price: parseFloat(crypto.priceUsd),
        marketCap: parseFloat(crypto.marketCapUsd),
        change24h: parseFloat(crypto.changePercent24Hr)
      }));
    } catch (error) {
      console.error('Failed to get top cryptos:', error);
      return [];
    }
  }
}

// Экспортируем singleton
const coinCapService = new CoinCapService();
export default coinCapService;