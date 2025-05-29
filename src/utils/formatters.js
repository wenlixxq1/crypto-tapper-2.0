javascript
/**
 * Утилиты для форматирования данных
 * - Числа и валюты
 * - Даты и время
 * - Специальные форматы для криптовалют
 */

// Конфигурация форматирования криптовалют
const CRYPTO_FORMATS = {
  btc: { decimals: 8, symbol: '₿' },
  eth: { decimals: 6, symbol: 'Ξ' },
  ton: { decimals: 2, symbol: 'TON' },
  usdt: { decimals: 2, symbol: 'USDT' }
};

/**
 * Форматирует число с разделителями тысяч
 * @param {number} num - Число
 * @param {number} decimals - Количество знаков после запятой
 * @returns {string} - Отформатированная строка (1,234.56)
 */
export function formatNumber(num, decimals = 2) {
  if (isNaN(num)) return '0';
  
  const fixed = num.toFixed(decimals);
  const [integer, fraction] = fixed.split('.');
  
  return `${integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}${fraction ? `.${fraction}` : ''}`;
}

/**
 * Сокращает большие числа (1,234 → 1.2K)
 * @param {number} num - Число
 * @returns {string} - Сокращенная форма
 */
export function abbreviateNumber(num) {
  if (num >= 1e12) return `${(num / 1e12).toFixed(1)}T`;
  if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return num.toString();
}

/**
 * Форматирует сумму криптовалюты
 * @param {number} amount - Сумма
 * @param {string} currency - Код валюты (btc, eth, ton, usdt)
 * @param {boolean} withSymbol - Добавить символ валюты
 * @returns {string} - Отформатированная строка (0.001234 ₿)
 */
export function formatCrypto(amount, currency, withSymbol = true) {
  const config = CRYPTO_FORMATS[currency] || { decimals: 4, symbol: '' };
  const value = amount.toFixed(config.decimals).replace(/\.?0+$/, '');
  return `${value}${withSymbol ? ` ${config.symbol}` : ''}`;
}

/**
 * Форматирует дату в относительный формат (2 часа назад)
 * @param {Date|string} date - Дата
 * @returns {string} - Относительное время
 */
export function formatRelativeTime(date) {
  const now = new Date();
  const diff = now - new Date(date);
  
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds} сек назад`;
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} мин назад`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} час назад`;
  
  const days = Math.floor(hours / 24);
  return `${days} дн назад`;
}

/**
 * Форматирует дату в короткий формат (12.05.2023)
 * @param {Date|string} date - Дата
 * @returns {string} - Дата в формате DD.MM.YYYY
 */
export function formatShortDate(date) {
  const d = new Date(date);
  return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`;
}

/**
 * Форматирует время (14:30)
 * @param {Date|string} date - Дата
 * @returns {string} - Время в формате HH:MM
 */
export function formatTime(date) {
  const d = new Date(date);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

/**
 * Форматирует процентное значение
 * @param {number} value - Значение (0.05 для 5%)
 * @param {number} decimals - Количество знаков
 * @returns {string} - Строка с процентом (5.00%)
 */
export function formatPercent(value, decimals = 2) {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Обрезает строку до указанной длины (для адресов)
 * @param {string} str - Строка
 * @param {number} start - Сколько оставить в начале
 * @param {number} end - Сколько оставить в конце
 * @param {string} separator - Разделитель (...)
 * @returns {string} - Обрезанная строка (0x7F1b...2A4f)
 */
export function truncateString(str, start = 6, end = 4, separator = '...') {
  if (!str || str.length <= start + end) return str;
  return `${str.substring(0, start)}${separator}${str.substring(str.length - end)}`;
}

// Примеры использования:
/*
console.log(formatNumber(1234567.8910)); // "1,234,567.89"
console.log(abbreviateNumber(1234567)); // "1.2M"
console.log(formatCrypto(0.00123456, 'btc')); // "0.00123456 ₿"
console.log(formatRelativeTime(new Date(Date.now() - 3600000))); // "1 час назад"
console.log(truncateString('0x7F1b2A4f3C8e5D6E7F9A0B1C2D3E4F5A6B7C8D9E', 6, 4)); // "0x7F1b...C8D9E"
*/