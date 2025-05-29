javascript
/**
 * Утилиты для работы с криптовалютами
 * - Конвертация между валютами
 * - Форматирование значений
 * - Валидация адресов
 */

// Актуальные курсы (можно заменить на API)
const DEFAULT_RATES = {
  btc: 50000, // 1 BTC = 50000 USDT
  eth: 3000,  // 1 ETH = 3000 USDT
  ton: 5,     // 1 TON = 5 USDT
  usdt: 1     // 1 USDT = 1 USDT
};

// Иконки криптовалют (можно использовать emoji или SVG)
const CRYPTO_ICONS = {
  btc: '💰',
  eth: '⚡',
  ton: '🟡',
  usdt: '💵'
};

// Кол-во знаков после запятой для форматирования
const DECIMALS = {
  btc: 8,
  eth: 6,
  ton: 2,
  usdt: 2
};

/**
 * Конвертирует сумму между криптовалютами
 * @param {number} amount - Исходная сумма
 * @param {string} from - Исходная валюта (btc, eth, ton, usdt)
 * @param {string} to - Целевая валюта
 * @param {object} rates - Объект с курсами (опционально)
 * @returns {number} - Результат конвертации
 */
export function convertCrypto(amount, from, to, rates = DEFAULT_RATES) {
  if (!rates[from] || !rates[to]) {
    console.error(`Unknown currency: ${from} or ${to}`);
    return 0;
  }

  // Конвертация через USDT (1 BTC → USDT → 1 ETH)
  const usdtValue = amount * rates[from];
  return usdtValue / rates[to];
}

/**
 * Форматирует сумму криптовалюты для отображения
 * @param {number} amount - Сумма
 * @param {string} currency - Валюта (btc, eth, ton, usdt)
 * @returns {string} - Отформатированная строка (0.001234 BTC)
 */
export function formatCrypto(amount, currency) {
  const decimals = DECIMALS[currency] || 4;
  const fixed = amount.toFixed(decimals).replace(/\.?0+$/, '');
  return `${fixed} ${currency.toUpperCase()}`;
}

/**
 * Возвращает иконку для валюты
 * @param {string} currency - Код валюты
 * @returns {string} - Emoji или символ
 */
export function getCryptoIcon(currency) {
  return CRYPTO_ICONS[currency.toLowerCase()] || '❓';
}

/**
 * Генерирует случайный крипто-адрес (для демо)
 * @param {string} currency - Валюта
 * @returns {string} - Адрес кошелька
 */
export function generateCryptoAddress(currency) {
  const prefixes = {
    btc: '1',
    eth: '0x',
    ton: 'EQ',
    usdt: '0x' // USDT-ERC20
  };

  const chars = '0123456789ABCDEF';
  const prefix = prefixes[currency] || '';
  let address = prefix;

  for (let i = 0; i < 10; i++) {
    address += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return address;
}

/**
 * Проверяет валидность адреса (базовая проверка)
 * @param {string} address - Адрес кошелька
 * @param {string} currency - Валюта
 * @returns {boolean} - true если адрес валиден
 */
export function validateAddress(address, currency) {
  if (!address) return false;

  const patterns = {
    btc: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
    eth: /^0x[a-fA-F0-9]{40}$/,
    ton: /^EQ[a-zA-Z0-9]{48}$/,
    usdt: /^0x[a-fA-F0-9]{40}$/ // USDT-ERC20
  };

  const regex = patterns[currency];
  return regex ? regex.test(address) : false;
}

/**
 * Рассчитывает комиссию для перевода
 * @param {string} currency - Валюта
 * @param {number} amount - Сумма перевода
 * @returns {number} - Размер комиссии
 */
export function calculateFee(currency, amount = 0) {
  const fees = {
    btc: 0.0005,
    eth: 0.001,
    ton: 0.05,
    usdt: 0.001
  };

  return fees[currency] || 0;
}

// Пример использования (для тестов)
/*
console.log(convertCrypto(1, 'btc', 'eth')); // → 16.666...
console.log(formatCrypto(0.00012345, 'btc')); // → "0.000123 BTC"
console.log(generateCryptoAddress('eth')); // → "0x7F1b2..."
console.log(validateAddress('0x5AEDA...', 'eth')); // → true
*/