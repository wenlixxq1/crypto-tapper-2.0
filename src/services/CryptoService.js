javascript
import coinCapService from './CoinCapService.js';

export class CryptoService {
  constructor() {
    this.cryptos = {
      BTC: {
        name: "Bitcoin",
        symbol: "₿",
        icon: "🟠",
        rate: 50000, // USD за 1 BTC
        volatility: 0.05,
        unlockAt: 0
      },
      ETH: {
        name: "Ethereum",
        symbol: "Ξ",
        icon: "🔷",
        rate: 3000,
        volatility: 0.07,
        unlockAt: 1000
      },
      SOL: {
        name: "Solana",
        symbol: "◎",
        icon: "🌀",
        rate: 150,
        volatility: 0.1,
        unlockAt: 5000
      },
      BNB: {
        name: "Binance Coin",
        symbol: "BNB",
        icon: "🟡",
        rate: 400,
        volatility: 0.06,
        unlockAt: 3000
      },
      XRP: {
        name: "Ripple",
        symbol: "✕",
        icon: "✕",
        rate: 0.5,
        volatility: 0.08,
        unlockAt: 2000
      },
      ADA: {
        name: "Cardano",
        symbol: "₳",
        icon: "🔶",
        rate: 0.6,
        volatility: 0.09,
        unlockAt: 2500
      },
      DOGE: {
        name: "Dogecoin",
        symbol: "Ð",
        icon: "🐶",
        rate: 0.1,
        volatility: 0.15,
        unlockAt: 10000
      },
      USDT: {
        name: "Tether",
        symbol: "₮",
        icon: "💵",
        rate: 1,
        volatility: 0.01,
        unlockAt: 500
      }
    };

    this.historicalData = {};
    this.initializeHistoricalData();
    this.lastUpdateTime = Date.now();
    this.updateInterval = 5 * 60 * 1000; // Обновлять курсы каждые 5 минут
    this.startPriceUpdates();
  }

  initializeHistoricalData() {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    Object.keys(this.cryptos).forEach(crypto => {
      this.historicalData[crypto] = [];
      const baseRate = this.cryptos[crypto].rate;
      
      // Генерируем данные за последние 7 дней
      for (let i = 7; i >= 0; i--) {
        const timestamp = now - (i * oneDay);
        const volatility = this.cryptos[crypto].volatility;
        const change = (Math.random() * 2 - 1) * volatility;
        const rate = baseRate * (1 + change);
        
        this.historicalData[crypto].push({
          timestamp,
          rate
        });
      }
    });
  }

  startPriceUpdates() {
    this.updateIntervalId = setInterval(() => {
      this.updateCryptoRates();
    }, this.updateInterval);
    
    // Первое обновление сразу при создании
    this.updateCryptoRates();
    
    // Получаем актуальные курсы с API
    this.fetchRealRates();
  }

  updateCryptoRates() {
    const now = Date.now();
    
    Object.keys(this.cryptos).forEach(crypto => {
      const currentRate = this.cryptos[crypto].rate;
      const volatility = this.cryptos[crypto].volatility;
      
      // Генерируем случайное изменение цены
      const change = (Math.random() * 2 - 1) * volatility;
      const newRate = currentRate * (1 + change);
      
      // Обновляем курс
      this.cryptos[crypto].rate = newRate;
      
      // Добавляем в исторические данные
      this.historicalData[crypto].push({
        timestamp: now,
        rate: newRate
      });
      
      // Ограничиваем исторические данные (сохраняем последние 100 записей)
      if (this.historicalData[crypto].length > 100) {
        this.historicalData[crypto].shift();
      }
    });
    
    this.lastUpdateTime = now;
  }
  
  /**
   * Получает актуальные курсы криптовалют с API
   */
  async fetchRealRates() {
    try {
      const cryptoSymbols = Object.keys(this.cryptos);
      const rates = await coinCapService.getCurrentRates(cryptoSymbols);
      
      // Обновляем курсы в нашем сервисе
      Object.keys(rates).forEach(crypto => {
        if (this.cryptos[crypto]) {
          this.cryptos[crypto].rate = rates[crypto];
        }
      });
      
      console.log('Updated crypto rates from CoinCap API:', rates);
    } catch (error) {
      console.error('Failed to fetch real crypto rates:', error);
      // В случае ошибки продолжаем использовать симулированные курсы
    }
  }

  getAvailableCryptos(userBalance) {
    return Object.entries(this.cryptos)
      .filter(([_, data]) => data.unlockAt <= userBalance)
      .reduce((acc, [symbol, data]) => {
        acc[symbol] = data;
        return acc;
      }, {});
  }

  getRandomCrypto(userBalance = Infinity) {
    const availableCryptos = Object.keys(this.getAvailableCryptos(userBalance));
    if (availableCryptos.length === 0) return 'BTC'; // Fallback
    
    const weights = availableCryptos.map(crypto => {
      // Чем выше волатильность, тем меньше шанс выпадения
      return 1 / (this.cryptos[crypto].volatility * 10);
    });
    
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < availableCryptos.length; i++) {
      if (random < weights[i]) {
        return availableCryptos[i];
      }
      random -= weights[i];
    }
    
    return availableCryptos[0];
  }

  getCryptoName(symbol) {
    return this.cryptos[symbol]?.name || symbol;
  }

  getCryptoSymbol(symbol) {
    return this.cryptos[symbol]?.symbol || symbol;
  }

  getCryptoIcon(symbol) {
    return this.cryptos[symbol]?.icon || "🪙";
  }

  getCryptoValue(symbol, amount = 1) {
    if (!this.cryptos[symbol]) return 0;
    return this.cryptos[symbol].rate * amount;
  }

  getCryptoChange(symbol, period = '24h') {
    if (!this.historicalData[symbol] || this.historicalData[symbol].length < 2) {
      return 0;
    }
    
    const now = Date.now();
    let compareTime;
    
    switch (period) {
      case '1h':
        compareTime = now - 60 * 60 * 1000;
        break;
      case '24h':
      default:
        compareTime = now - 24 * 60 * 60 * 1000;
        break;
      case '7d':
        compareTime = now - 7 * 24 * 60 * 60 * 1000;
        break;
    }
    
    // Находим ближайшую историческую запись
    const historicalRates = this.historicalData[symbol];
    let oldRate = historicalRates[0].rate;
    
    for (const data of historicalRates) {
      if (data.timestamp >= compareTime) {
        break;
      }
      oldRate = data.rate;
    }
    
    const currentRate = this.cryptos[symbol].rate;
    const change = ((currentRate - oldRate) / oldRate) * 100;
    
    return parseFloat(change.toFixed(2));
  }

  getHistoricalRates(symbol, period = '7d') {
    if (!this.historicalData[symbol]) return [];
    
    const now = Date.now();
    let cutoffTime;
    
    switch (period) {
      case '1h':
        cutoffTime = now - 60 * 60 * 1000;
        break;
      case '24h':
        cutoffTime = now - 24 * 60 * 60 * 1000;
        break;
      case '7d':
      default:
        cutoffTime = now - 7 * 24 * 60 * 60 * 1000;
        break;
      case '30d':
        cutoffTime = now - 30 * 24 * 60 * 60 * 1000;
        break;
    }
    
    return this.historicalData[symbol]
      .filter(data => data.timestamp >= cutoffTime)
      .map(data => ({
        time: data.timestamp,
        value: data.rate
      }));
  }

  calculateExchangeRate(fromCrypto, toCrypto) {
    const fromRate = this.cryptos[fromCrypto]?.rate;
    const toRate = this.cryptos[toCrypto]?.rate;
    
    if (!fromRate || !toRate) return 0;
    
    return fromRate / toRate;
  }

  getConversionFee(fromCrypto, toCrypto, amount) {
    // Базовая комиссия 1%
    let feePercent = 0.01;
    
    // Увеличиваем комиссию для стабильных монет
    if (fromCrypto === 'USDT' || toCrypto === 'USDT') {
      feePercent = 0.02;
    }
    
    const rate = this.calculateExchangeRate(fromCrypto, toCrypto);
    const convertedAmount = amount * rate;
    const fee = convertedAmount * feePercent;
    
    return {
      fee,
      received: convertedAmount - fee,
      rate,
      feePercent: feePercent * 100
    };
  }

  getWithdrawalFee(crypto, amount) {
    // Фиксированные комиссии для разных криптовалют
    const fees = {
      BTC: 0.0005,
      ETH: 0.005,
      SOL: 0.01,
      BNB: 0.001,
      XRP: 0.25,
      ADA: 1,
      DOGE: 5,
      USDT: 1
    };
    
    const fixedFee = fees[crypto] || 0.01;
    const minFee = this.getCryptoValue(crypto, fixedFee);
    const percentFee = amount * 0.005; // 0.5%
    const maxFee = this.getCryptoValue(crypto, 10); // Максимум 10 USD в эквиваленте
    
    // Используем наибольшее из: фиксированной комиссии или 0.5% от суммы, но не более maxFee
    const fee = Math.min(Math.max(minFee, percentFee), maxFee);
    
    return {
      fee,
      received: amount - fee
    };
  }

  destroy() {
    if (this.updateIntervalId) {
      clearInterval(this.updateIntervalId);
    }
  }
}