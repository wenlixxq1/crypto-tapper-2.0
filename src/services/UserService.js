javascript
import { generateReferralCode, getReferralReward } from '../utils/helpers.js';
import analytics from './Analytics.js';

// Дефолтные настройки пользователя
const DEFAULT_USER = {
  balance: { btc: 0, eth: 0, ton: 0, usdt: 0 },
  tapPower: 1,
  referralCode: generateReferralCode(),
  referrals: [],
  subscription: 'free',
  lastLogin: Date.now(),
  stats: {
    totalTaps: 0,
    earned: { btc: 0, eth: 0, ton: 0, usdt: 0 }
  }
};

class UserService {
  constructor() {
    this.user = this.loadUser();
  }

  /**
   * Загружает пользователя из localStorage
   */
  loadUser() {
    try {
      const saved = localStorage.getItem('crypto_tapper_user');
      return saved ? JSON.parse(saved) : { ...DEFAULT_USER };
    } catch (e) {
      console.error('Failed to load user', e);
      return { ...DEFAULT_USER };
    }
  }

  /**
   * Сохраняет пользователя в localStorage
   */
  saveUser() {
    localStorage.setItem('crypto_tapper_user', JSON.stringify(this.user));
    return this.user;
  }

  /**
   * Обновляет баланс пользователя
   * @param {string} currency - btc, eth, ton, usdt
   * @param {number} amount - Может быть отрицательным
   */
  updateBalance(currency, amount) {
    if (!this.user.balance[currency]) this.user.balance[currency] = 0;
    this.user.balance[currency] += amount;
    
    // Обновляем статистику
    if (amount > 0) {
      this.user.stats.earned[currency] += amount;
    }

    analytics.track('balance_update', { currency, amount });
    return this.saveUser();
  }

  /**
   * Улучшает мощность тапа
   * @param {number} value - На сколько увеличить (например, 1)
   * @param {string} currency - Валюта оплаты
   * @param {number} cost - Стоимость улучшения
   */
  upgradeTapPower(value, currency, cost) {
    if (this.user.balance[currency] < cost) {
      throw new Error('Недостаточно средств');
    }

    this.updateBalance(currency, -cost);
    this.user.tapPower += value;
    
    analytics.track('upgrade_power', { value, cost });
    return this.saveUser();
  }

  /**
   * Оформление подписки
   * @param {string} tier - free, pro, premium
   * @param {object} payment - { currency: 'ton', amount: 10 }
   */
  setSubscription(tier, payment = null) {
    if (payment) {
      this.updateBalance(payment.currency, -payment.amount);
    }

    this.user.subscription = tier;
    analytics.track('subscription', { tier });
    return this.saveUser();
  }

  /**
   * Обработка реферала
   * @param {string} referralCode - Код пригласившего
   */
  handleReferral(referralCode) {
    if (this.user.referrals.includes(referralCode)) return;
    
    this.user.referrals.push(referralCode);
    const reward = getReferralReward(this.user.subscription);
    this.updateBalance('ton', reward);
    
    analytics.track('referral_apply', { code: referralCode, reward });
    return this.saveUser();
  }

  /**
   * Сброс данных (для тестов)
   */
  reset() {
    this.user = { ...DEFAULT_USER };
    return this.saveUser();
  }

  // Геттеры
  getBalance(currency) {
    return this.user.balance[currency] || 0;
  }

  getReferralCode() {
    return this.user.referralCode;
  }

  getSubscriptionTier() {
    return this.user.subscription;
  }
}

// Экспортируем singleton
const userService = new UserService();
export default userService;