import { generateReferralCode, getReferralReward } from '../utils/helpers.js';
import analytics from './Analytics.js';

// Дефолтные настройки пользователя
const DEFAULT_USER = {
  balance: { BTC: 0, ETH: 0, SOL: 0, BNB: 0, XRP: 0, ADA: 0, DOGE: 0, USDT: 0 },
  tapPower: 1,
  passiveIncome: 0,
  referralCode: generateReferralCode(),
  referrals: [],
  subscription: 'free',
  lastLogin: Date.now(),
  dailyStreak: 0,
  unlockedAchievements: [],
  upgrades: [],
  bonuses: {},
  stats: {
    totalTaps: 0,
    totalEarned: 0,
    dailyTaps: 0,
    referralsCount: 0,
    earned: { BTC: 0, ETH: 0, SOL: 0, BNB: 0, XRP: 0, ADA: 0, DOGE: 0, USDT: 0 }
  }
};

class UserService {
  constructor() {
    this.user = this.loadUser();
    this.initializeUser();
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
   * Инициализирует пользователя, добавляя недостающие поля
   */
  initializeUser() {
    // Проверяем и добавляем новые поля, если они отсутствуют
    if (!this.user.passiveIncome) this.user.passiveIncome = 0;
    if (!this.user.dailyStreak) this.user.dailyStreak = 0;
    if (!this.user.unlockedAchievements) this.user.unlockedAchievements = [];
    if (!this.user.upgrades) this.user.upgrades = [];
    if (!this.user.bonuses) this.user.bonuses = {};
    
    // Обновляем структуру статистики
    if (!this.user.stats.totalEarned) this.user.stats.totalEarned = 0;
    if (!this.user.stats.dailyTaps) this.user.stats.dailyTaps = 0;
    if (!this.user.stats.referralsCount) this.user.stats.referralsCount = 0;
    
    // Обновляем структуру баланса и заработка
    const cryptos = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'DOGE', 'USDT'];
    cryptos.forEach(crypto => {
      if (!this.user.balance[crypto]) this.user.balance[crypto] = 0;
      if (!this.user.stats.earned[crypto]) this.user.stats.earned[crypto] = 0;
    });
    
    // Сохраняем обновленного пользователя
    this.saveUser();
  }

  /**
   * Сохраняет пользователя в localStorage
   */
  saveUser() {
    localStorage.setItem('crypto_tapper_user', JSON.stringify(this.user));
    return this.user;
  }

  /**
   * Добавляет криптовалюту на баланс пользователя
   * @param {string} crypto - BTC, ETH, SOL и т.д.
   * @param {number} amount - Количество
   */
  addCrypto(crypto, amount) {
    if (!this.user.balance[crypto]) this.user.balance[crypto] = 0;
    this.user.balance[crypto] += amount;
    
    // Обновляем статистику
    if (!this.user.stats.earned[crypto]) this.user.stats.earned[crypto] = 0;
    this.user.stats.earned[crypto] += amount;
    this.user.stats.totalEarned += amount;

    analytics.track('crypto_earned', { crypto, amount });
    return this.saveUser();
  }

  /**
   * Тратит криптовалюту
   * @param {string} crypto - BTC, ETH, SOL и т.д.
   * @param {number} amount - Количество
   */
  spendCrypto(crypto, amount) {
    if (!this.user.balance[crypto] || this.user.balance[crypto] < amount) {
      throw new Error('Недостаточно средств');
    }
    
    this.user.balance[crypto] -= amount;
    analytics.track('crypto_spent', { crypto, amount });
    return this.saveUser();
  }

  /**
   * Увеличивает силу тапа
   * @param {number} value - На сколько увеличить
   */
  increaseTapPower(value) {
    this.user.tapPower += value;
    analytics.track('tap_power_increased', { value, newPower: this.user.tapPower });
    return this.saveUser();
  }

  /**
   * Увеличивает пассивный доход
   * @param {number} value - На сколько увеличить
   */
  increasePassiveIncome(value) {
    this.user.passiveIncome += value;
    analytics.track('passive_income_increased', { value, newIncome: this.user.passiveIncome });
    return this.saveUser();
  }

  /**
   * Покупка улучшения
   * @param {string} upgradeId - Идентификатор улучшения
   * @param {number} cost - Стоимость улучшения
   */
  purchaseUpgrade(upgradeId, cost) {
    if (this.getTotalBalance() < cost) {
      throw new Error('Недостаточно средств');
    }

    // Списываем средства (из разных криптовалют пропорционально)
    this.spendBalance(cost);
    
    // Добавляем улучшение
    if (!this.user.upgrades.includes(upgradeId)) {
      this.user.upgrades.push(upgradeId);
    }
    
    analytics.track('upgrade_purchased', { upgradeId, cost });
    return this.saveUser();
  }

  /**
   * Списывает средства с баланса (пропорционально из разных криптовалют)
   * @param {number} amount - Сумма в USD
   */
  spendBalance(amount) {
    const totalBalance = this.getTotalBalance();
    if (totalBalance < amount) {
      throw new Error('Недостаточно средств');
    }
    
    // Списываем средства пропорционально из разных криптовалют
    const cryptos = Object.keys(this.user.balance);
    let remaining = amount;
    
    for (const crypto of cryptos) {
      if (remaining <= 0) break;
      
      const cryptoValue = this.getCryptoValue(crypto);
      if (cryptoValue <= 0) continue;
      
      const proportion = cryptoValue / totalBalance;
      const toSpend = Math.min(this.user.balance[crypto], remaining / this.getCryptoRate(crypto));
      
      this.user.balance[crypto] -= toSpend;
      remaining -= toSpend * this.getCryptoRate(crypto);
    }
    
    analytics.track('balance_spent', { amount });
    return this.saveUser();
  }

  /**
   * Активирует временный бонус
   * @param {string} bonusName - Название бонуса
   * @param {any} value - Значение бонуса
   * @param {number} duration - Длительность в миллисекундах (если временный)
   */
  activateBonus(bonusName, value, duration = null) {
    this.user.bonuses[bonusName] = {
      value,
      expiresAt: duration ? Date.now() + duration : null
    };
    
    analytics.track('bonus_activated', { bonusName, value, duration });
    return this.saveUser();
  }

  /**
   * Проверяет, активен ли бонус
   * @param {string} bonusName - Название бонуса
   */
  hasActiveBonus(bonusName) {
    const bonus = this.user.bonuses[bonusName];
    if (!bonus) return false;
    
    if (bonus.expiresAt && bonus.expiresAt < Date.now()) {
      // Бонус истек, удаляем его
      delete this.user.bonuses[bonusName];
      this.saveUser();
      return false;
    }
    
    return true;
  }

  /**
   * Получает значение бонуса
   * @param {string} bonusName - Название бонуса
   */
  getBonusValue(bonusName) {
    if (!this.hasActiveBonus(bonusName)) return null;
    return this.user.bonuses[bonusName].value;
  }

  /**
   * Разблокирует достижение
   * @param {string} achievementId - Идентификатор достижения
   */
  unlockAchievement(achievementId) {
    if (!this.user.unlockedAchievements.includes(achievementId)) {
      this.user.unlockedAchievements.push(achievementId);
      analytics.track('achievement_unlocked', { achievementId });
      return this.saveUser();
    }
    return this.user;
  }

  /**
   * Обработка реферала
   * @param {string} referralCode - Код пригласившего
   */
  handleReferral(referralCode) {
    if (this.user.referrals.includes(referralCode)) return;
    
    this.user.referrals.push(referralCode);
    this.user.stats.referralsCount += 1;
    
    const reward = getReferralReward(this.user.subscription);
    this.addCrypto('BTC', reward);
    
    analytics.track('referral_applied', { code: referralCode, reward });
    return this.saveUser();
  }

  /**
   * Увеличивает счетчик тапов
   */
  incrementTapCount() {
    this.user.stats.totalTaps += 1;
    this.user.stats.dailyTaps += 1;
    return this.saveUser();
  }

  /**
   * Увеличивает серию ежедневных входов
   */
  incrementDailyStreak() {
    this.user.dailyStreak += 1;
    this.user.stats.dailyTaps = 0; // Сбрасываем счетчик ежедневных тапов
    analytics.track('daily_streak_increased', { streak: this.user.dailyStreak });
    return this.saveUser();
  }

  /**
   * Сбрасывает серию ежедневных входов
   */
  resetDailyStreak() {
    this.user.dailyStreak = 1; // Начинаем с 1, так как пользователь зашел сегодня
    this.user.stats.dailyTaps = 0;
    analytics.track('daily_streak_reset');
    return this.saveUser();
  }

  /**
   * Обновляет время последнего входа
   */
  updateLastLogin() {
    this.user.lastLogin = Date.now();
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
  getCryptoBalance(crypto) {
    return this.user.balance[crypto] || 0;
  }

  getCryptoBalances() {
    return { ...this.user.balance };
  }

  getCryptoRate(crypto) {
    // Этот метод должен получать курс из CryptoService
    // Временная заглушка
    const rates = {
      BTC: 50000,
      ETH: 3000,
      SOL: 150,
      BNB: 400,
      XRP: 0.5,
      ADA: 0.6,
      DOGE: 0.1,
      USDT: 1
    };
    return rates[crypto] || 1;
  }

  getCryptoValue(crypto) {
    return this.getCryptoBalance(crypto) * this.getCryptoRate(crypto);
  }

  getTotalBalance() {
    return Object.keys(this.user.balance).reduce((total, crypto) => {
      return total + this.getCryptoValue(crypto);
    }, 0);
  }

  getFormattedBalance() {
    return `$${this.getTotalBalance().toFixed(2)}`;
  }

  getTapPower() {
    let power = this.user.tapPower;
    
    // Применяем бонусы
    if (this.hasActiveBonus('tapPowerBoost')) {
      power *= this.getBonusValue('tapPowerBoost');
    }
    
    return power;
  }

  getPassiveIncome() {
    let income = this.user.passiveIncome;
    
    // Применяем бонусы
    if (this.hasActiveBonus('passiveIncomeBoost')) {
      income *= this.getBonusValue('passiveIncomeBoost');
    }
    
    return income;
  }

  hasUpgrade(upgradeId) {
    return this.user.upgrades.includes(upgradeId);
  }

  hasAutoTapper() {
    return this.hasUpgrade('auto_tap');
  }

  hasPassiveIncome() {
    return this.user.passiveIncome > 0;
  }

  hasMultiTap() {
    return this.hasUpgrade('multi_tap') || this.hasActiveBonus('multiTap');
  }

  hasSubscription() {
    return this.user.subscription !== 'free';
  }

  getSubscriptionMultiplier() {
    switch (this.user.subscription) {
      case 'pro': return 1.5;
      case 'premium': return 2;
      default: return 1;
    }
  }

  getReferralCode() {
    return this.user.referralCode;
  }

  getLastLogin() {
    return this.user.lastLogin;
  }

  getDailyStreak() {
    return this.user.dailyStreak;
  }

  getUnlockedAchievements() {
    return [...this.user.unlockedAchievements];
  }

  getStats() {
    return { ...this.user.stats, dailyStreak: this.user.dailyStreak };
  }
}

// Экспортируем singleton
const userService = new UserService();
export default userService;