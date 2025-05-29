javascript
// Импорт функций из utils (если используете модули)
// import { formatBalance, getCryptoIcon } from '../src/utils/helpers.js';
// import { getUser, updateBalance } from '../src/utils/storage.js';

// Если не используете модули, объявите функции здесь
const helpers = {
  formatBalance: (amount, currency) => {
    const fixedMap = { btc: 6, eth: 4, ton: 2, usdt: 2 };
    return `${amount.toFixed(fixedMap[currency] || 4)} ${currency.toUpperCase()}`;
  },
  getCryptoIcon: (currency) => {
    const icons = { btc: '💰', eth: '⚡', ton: '🟡', usdt: '💵' };
    return icons[currency.toLowerCase()] || '❓';
  }
};

const storage = {
  getUser: () => {
    const defaultUser = {
      balance: { btc: 0, eth: 0, ton: 0, usdt: 0 },
      tapPower: 1,
      referralCode: 'REF-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      subscription: 'free'
    };
    const user = localStorage.getItem('crypto_tapper_user');
    return user ? JSON.parse(user) : defaultUser;
  },
  updateBalance: (currency, amount) => {
    const user = storage.getUser();
    user.balance[currency] = (user.balance[currency] || 0) + amount;
    localStorage.setItem('crypto_tapper_user', JSON.stringify(user));
    return user;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // Элементы DOM
  const elements = {
    tapperBtn: document.getElementById('tapper-btn'),
    balanceDisplay: document.getElementById('balance'),
    cryptoSelect: document.getElementById('crypto-select'),
    tapPowerDisplay: document.getElementById('tap-power'),
    referralCodeDisplay: document.getElementById('referral-code')
  };

  // Состояние приложения
  const state = {
    currentCrypto: 'btc',
    user: storage.getUser(),
    tapValue: 0.000001,
    init() {
      this.setupEventListeners();
      this.updateUI();
    },
    setupEventListeners() {
      // Обработчик тапа
      elements.tapperBtn.addEventListener('click', () => this.handleTap());

      // Смена криптовалюты
      elements.cryptoSelect.addEventListener('change', (e) => {
        this.currentCrypto = e.target.value;
        this.updateUI();
      });

      // Инициализация Telegram WebApp
      if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.expand();
      }
    },
    handleTap() {
      const earnings = this.tapValue * this.user.tapPower;
      this.user = storage.updateBalance(this.currentCrypto, earnings);
      this.animateTap();
      this.updateUI();
    },
    animateTap() {
      elements.tapperBtn.classList.add('tap-animation');
      setTimeout(() => {
        elements.tapperBtn.classList.remove('tap-animation');
      }, 200);
    },
    updateUI() {
      // Обновление баланса
      elements.balanceDisplay.innerHTML = `
        ${helpers.getCryptoIcon(this.currentCrypto)} 
        ${helpers.formatBalance(this.user.balance[this.currentCrypto], this.currentCrypto)}
      `;

      // Мощность тапа
      elements.tapPowerDisplay.textContent = `x${this.user.tapPower}`;

      // Реферальный код
      if (elements.referralCodeDisplay) {
        elements.referralCodeDisplay.textContent = this.user.referralCode;
      }
    }
  };

  // Инициализация выбора криптовалют
  const cryptos = ['btc', 'eth', 'ton', 'usdt'];
  elements.cryptoSelect.innerHTML = cryptos.map(crypto => 
    `<option value="${crypto}">${helpers.getCryptoIcon(crypto)} ${crypto.toUpperCase()}</option>`
  ).join('');

  // Запуск приложения
  state.init();
});
