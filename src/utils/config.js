// Загрузка и экспорт конфигурационных параметров

// Функция для получения переменных окружения
function getEnvVariable(name, defaultValue = '') {
  // В браузере переменные окружения могут быть добавлены через window.__ENV__
  if (typeof window !== 'undefined' && window.__ENV__ && window.__ENV__[name]) {
    return window.__ENV__[name];
  }
  
  // Для разработки можно использовать локальные значения
  const devValues = {
    APP_VERSION: '2.0.1-dev',
    DEBUG_MODE: 'true'
  };
  
  return devValues[name] || defaultValue;
}

// Конфигурация API для криптовалют
export const cryptoApiConfig = {
  apiUrl: 'https://api.coincap.io/v2',
  
  // Методы API
  endpoints: {
    assets: '/assets',
    history: '/assets/{id}/history'
  },
  
  // Параметры по умолчанию
  defaultParams: {}
};

// Telegram конфигурация
export const telegramConfig = {
  botToken: getEnvVariable('TELEGRAM_BOT_TOKEN')
};

// Общие настройки приложения
export const appConfig = {
  version: getEnvVariable('APP_VERSION', '2.0.0'),
  debugMode: getEnvVariable('DEBUG_MODE', 'false') === 'true',
  
  // Настройки игры
  game: {
    initialTapPower: 1,
    tapCooldown: 100, // мс
    autosaveInterval: 30000, // 30 секунд
    bonusCooldown: 300000, // 5 минут
    maxDailyBonus: 7 // максимальное количество дней для серии
  },
  
  // Настройки хранения данных
  storage: {
    userDataKey: 'crypto_tapper_user',
    analyticsKey: 'crypto_tapper_analytics',
    settingsKey: 'crypto_tapper_settings'
  }
};

// Экспорт всех конфигураций
export default {
  crypto: cryptoApiConfig,
  telegram: telegramConfig,
  app: appConfig
};