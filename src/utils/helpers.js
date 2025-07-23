/**
 * Генерирует случайный реферальный код
 * @returns {string} Реферальный код
 */
export function generateReferralCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Возвращает награду за реферала в зависимости от подписки
 * @param {string} subscription - Тип подписки (free, pro, premium)
 * @returns {number} Награда в BTC
 */
export function getReferralReward(subscription) {
  switch (subscription) {
    case 'premium':
      return 0.0005;
    case 'pro':
      return 0.0003;
    default:
      return 0.0001;
  }
}

/**
 * Форматирует число с разделителями тысяч
 * @param {number} number - Число для форматирования
 * @param {number} decimals - Количество десятичных знаков
 * @returns {string} Отформатированное число
 */
export function formatNumber(number, decimals = 2) {
  return number.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * Форматирует криптовалюту с учетом ее особенностей
 * @param {number} amount - Количество криптовалюты
 * @param {string} crypto - Тип криптовалюты (BTC, ETH и т.д.)
 * @returns {string} Отформатированное значение
 */
export function formatCrypto(amount, crypto) {
  if (amount === 0) return '0';
  
  // Определяем количество десятичных знаков в зависимости от криптовалюты
  let decimals = 8;
  if (crypto === 'DOGE') decimals = 2;
  else if (crypto === 'USDT') decimals = 2;
  else if (amount < 0.001) decimals = 8;
  else if (amount < 0.01) decimals = 6;
  else if (amount < 1) decimals = 4;
  else decimals = 2;
  
  return formatNumber(amount, decimals);
}

/**
 * Форматирует время в формате "чч:мм:сс"
 * @param {number} milliseconds - Время в миллисекундах
 * @returns {string} Отформатированное время
 */
export function formatTime(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  const formattedHours = hours.toString().padStart(2, '0');
  const formattedMinutes = (minutes % 60).toString().padStart(2, '0');
  const formattedSeconds = (seconds % 60).toString().padStart(2, '0');
  
  if (hours > 0) {
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  } else {
    return `${formattedMinutes}:${formattedSeconds}`;
  }
}

/**
 * Создает эффект всплывающего числа
 * @param {HTMLElement} parent - Родительский элемент
 * @param {number} amount - Значение
 * @param {string} text - Дополнительный текст
 * @param {object} options - Дополнительные параметры
 */
export function createFloatingText(parent, amount, text = '', options = {}) {
  const element = document.createElement('div');
  element.className = 'floating-text';
  element.innerHTML = `${amount > 0 ? '+' : ''}${amount} ${text}`;
  
  // Применяем пользовательские стили
  if (options.color) element.style.color = options.color;
  if (options.fontSize) element.style.fontSize = options.fontSize;
  
  // Случайное смещение
  const xOffset = options.xOffset || (Math.random() * 100 - 50);
  const yOffset = options.yOffset || -100;
  
  element.style.left = `calc(50% + ${xOffset}px)`;
  element.style.top = `calc(50% + ${yOffset}px)`;
  
  parent.appendChild(element);
  
  // Анимация
  setTimeout(() => {
    element.style.transform = `translate(${xOffset}px, ${yOffset - 50}px)`;
    element.style.opacity = '0';
    
    setTimeout(() => {
      element.remove();
    }, 1000);
  }, 10);
}

/**
 * Вибрирует элемент
 * @param {HTMLElement} element - Элемент для вибрации
 * @param {number} duration - Длительность в миллисекундах
 */
export function shakeElement(element, duration = 500) {
  element.classList.add('shake');
  setTimeout(() => {
    element.classList.remove('shake');
  }, duration);
}

/**
 * Создает пульсирующий эффект на элементе
 * @param {HTMLElement} element - Элемент для эффекта
 */
export function pulseElement(element) {
  element.classList.add('pulse');
  setTimeout(() => {
    element.classList.remove('pulse');
  }, 500);
}

/**
 * Показывает уведомление
 * @param {string} message - Текст уведомления
 * @param {string} type - Тип уведомления (success, error, info)
 * @param {number} duration - Длительность в миллисекундах
 */
export function showNotification(message, type = 'success', duration = 3000) {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
    
    setTimeout(() => {
      notification.classList.add('hide');
      setTimeout(() => notification.remove(), 500);
    }, duration);
  }, 10);
}

/**
 * Генерирует случайное число в диапазоне
 * @param {number} min - Минимальное значение
 * @param {number} max - Максимальное значение
 * @returns {number} Случайное число
 */
export function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Выбирает случайный элемент из массива
 * @param {Array} array - Массив элементов
 * @returns {*} Случайный элемент
 */
export function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Перемешивает массив
 * @param {Array} array - Исходный массив
 * @returns {Array} Перемешанный массив
 */
export function shuffleArray(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Ограничивает число в диапазоне
 * @param {number} value - Значение
 * @param {number} min - Минимальное значение
 * @param {number} max - Максимальное значение
 * @returns {number} Ограниченное значение
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Линейная интерполяция между двумя значениями
 * @param {number} a - Начальное значение
 * @param {number} b - Конечное значение
 * @param {number} t - Коэффициент (0-1)
 * @returns {number} Интерполированное значение
 */
export function lerp(a, b, t) {
  return a + (b - a) * clamp(t, 0, 1);
}

/**
 * Проверяет, поддерживается ли темная тема
 * @returns {boolean} true, если поддерживается
 */
export function isDarkThemeSupported() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Копирует текст в буфер обмена
 * @param {string} text - Текст для копирования
 * @returns {Promise<boolean>} Успешно ли скопировано
 */
export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback для старых браузеров
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const result = document.execCommand('copy');
      document.body.removeChild(textarea);
      return result;
    }
  } catch (error) {
    console.error('Failed to copy text: ', error);
    return false;
  }
}