javascript
/**
 * Работа с localStorage (обёртка для удобства + JSON-сериализация)
 */

// Ключи для хранения данных
const STORAGE_KEYS = {
  USER: 'crypto_tapper_user',
  SETTINGS: 'crypto_tapper_settings',
  REFERRALS: 'crypto_tapper_referrals',
  STATS: 'crypto_tapper_stats',
};

// ===== Основные методы =====

/**
 * Сохраняет данные в localStorage
 * @param {string} key - Ключ (лучше использовать STORAGE_KEYS)
 * @param {object} data - Данные для сохранения
 */
export function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Storage error:', error);
  }
}

/**
 * Читает данные из localStorage
 * @param {string} key 
 * @returns {object|null} Данные или null, если нет ключа
 */
export function getFromStorage(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Storage read error:', error);
    return null;
  }
}

/**
 * Удаляет данные из localStorage
 * @param {string} key 
 */
export function removeFromStorage(key) {
  localStorage.removeItem(key);
}

// ===== Специализированные методы =====

/**
 * Возвращает текущего пользователя
 * @returns {object} Дефолтный пользователь, если нет данных
 */
export function getUser() {
  const defaultUser = {
    balance: { btc: 0, eth: 0, ton: 0, usdt: 0 },
    tapPower: 1,
    referralCode: generateReferralCode(), // из helpers.js
    subscription: 'free',
    lastTapTime: 0,
  };
  return getFromStorage(STORAGE_KEYS.USER) || defaultUser;
}

/**
 * Сохраняет данные пользователя
 * @param {object} user 
 */
export function saveUser(user) {
  saveToStorage(STORAGE_KEYS.USER, user);
}

/**
 * Обновляет баланс пользователя
 * @param {string} currency - btc, eth, ton, usdt
 * @param {number} amount 
 */
export function updateBalance(currency, amount) {
  const user = getUser();
  if (!user.balance[currency]) user.balance[currency] = 0;
  user.balance[currency] += amount;
  saveUser(user);
}

/**
 * Возвращает настройки приложения
 * @returns {object}
 */
export function getSettings() {
  const defaultSettings = {
    soundEnabled: true,
    theme: 'dark',
    notifications: false,
  };
  return getFromStorage(STORAGE_KEYS.SETTINGS) || defaultSettings;
}

/**
 * Сохраняет реферальные данные
 * @param {string} referrerId - Код пригласившего
 * @param {string} referralId - Код нового пользователя
 */
export function saveReferral(referrerId, referralId) {
  const referrals = getFromStorage(STORAGE_KEYS.REFERRALS) || [];
  referrals.push({ referrerId, referralId, date: Date.now() });
  saveToStorage(STORAGE_KEYS.REFERRALS, referrals);
}

/**
 * Очищает все данные приложения
 */
export function clearAppData() {
  Object.values(STORAGE_KEYS).forEach(key => removeFromStorage(key));
}