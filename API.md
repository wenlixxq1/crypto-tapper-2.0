# API и интеграции

В проекте Крипто Тапер используются следующие API и интеграции:

## CoinCap API

[CoinCap](https://docs.coincap.io/) предоставляет бесплатные данные о криптовалютах, включая текущие курсы, историю цен и другую информацию без необходимости регистрации и получения API ключа.

### Используемые эндпоинты:

1. **Получение текущих цен**
   - URL: `https://api.coincap.io/v2/assets`
   - Параметры:
     - `ids`: список идентификаторов криптовалют (например, `bitcoin,ethereum`)
   - Пример ответа:
     ```json
     {
       "data": [
         {
           "id": "bitcoin",
           "rank": "1",
           "symbol": "BTC",
           "name": "Bitcoin",
           "supply": "19000000.0000000000000000",
           "maxSupply": "21000000.0000000000000000",
           "marketCapUsd": "1000000000000",
           "volumeUsd24Hr": "50000000000",
           "priceUsd": "50000.0000000000000000",
           "changePercent24Hr": "5.0000000000000000",
           "vwap24Hr": "49000.0000000000000000"
         }
       ]
     }
     ```

2. **Получение информации о конкретной криптовалюте**
   - URL: `https://api.coincap.io/v2/assets/{id}`
   - Пример ответа:
     ```json
     {
       "data": {
         "id": "bitcoin",
         "rank": "1",
         "symbol": "BTC",
         "name": "Bitcoin",
         "supply": "19000000.0000000000000000",
         "maxSupply": "21000000.0000000000000000",
         "marketCapUsd": "1000000000000",
         "volumeUsd24Hr": "50000000000",
         "priceUsd": "50000.0000000000000000",
         "changePercent24Hr": "5.0000000000000000",
         "vwap24Hr": "49000.0000000000000000"
       }
     }
     ```

3. **Получение истории цен**
   - URL: `https://api.coincap.io/v2/assets/{id}/history`
   - Параметры:
     - `interval`: интервал (m1, m5, m15, m30, h1, h2, h6, h12, d1)
     - `start`: начальная дата в миллисекундах
     - `end`: конечная дата в миллисекундах
   - Пример ответа:
     ```json
     {
       "data": [
         {
           "priceUsd": "29000.0000000000000000",
           "time": 1609459200000
         },
         {
           "priceUsd": "30000.0000000000000000",
           "time": 1609545600000
         }
       ]
     }
     ```

### Преимущества:

1. **Бесплатный доступ** - не требуется регистрация или API ключ
2. **Высокая скорость** - быстрые ответы и актуальные данные
3. **Простой API** - понятные эндпоинты и формат ответов

## Локальное хранение данных

Вместо Firebase в проекте используется локальное хранение данных через localStorage браузера.

### Используемые функции:

1. **Хранение данных пользователя**
   - Сохранение прогресса игры
   - Настройки пользователя
   - Статистика и достижения

2. **Локальная аналитика**
   - Отслеживание событий
   - Сбор статистики использования

3. **Автоматическая синхронизация**
   - Периодическое сохранение данных
   - Синхронизация при изменении вкладки
   - Сохранение перед закрытием страницы

## Telegram Bot API

[Telegram Bot API](https://core.telegram.org/bots/api) используется для интеграции с Telegram и создания Telegram Mini App.

### Используемые функции:

1. **WebApp**
   - Интеграция с Telegram WebApp
   - Получение данных пользователя
   - Отправка данных в бота

2. **Бот-команды**
   - Запуск WebApp
   - Обработка реферальных ссылок
   - Отправка уведомлений

### Настройка:

1. Создайте бота через [@BotFather](https://t.me/BotFather)
2. Получите токен бота и добавьте его в файл `.env`:
   ```
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
   ```
3. Настройте WebApp URL в BotFather, указав URL вашего приложения
4. Добавьте кнопку для запуска WebApp в меню бота

## Примеры использования API в коде

### CoinCap API

```javascript
import { cryptoApiConfig } from '../utils/config.js';

// Получение текущих курсов криптовалют
async function getCurrentRates(symbols = ['BTC', 'ETH']) {
  // Маппинг символов на идентификаторы CoinCap
  const symbolToId = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum'
  };
  
  const ids = symbols.map(symbol => symbolToId[symbol]).join(',');
  const url = new URL(`${cryptoApiConfig.apiUrl}/assets`);
  url.searchParams.append('ids', ids);
  
  const response = await fetch(url.toString());
  const result = await response.json();
  
  // Преобразуем результат в формат { BTC: 50000, ETH: 3000 }
  const rates = {};
  if (result.data) {
    result.data.forEach(coin => {
      const symbol = Object.keys(symbolToId).find(key => symbolToId[key] === coin.id);
      if (symbol) {
        rates[symbol] = parseFloat(coin.priceUsd);
      }
    });
  }
  
  return rates;
}
```

### Локальное хранение данных

```javascript
import storageService from '../services/StorageService.js';

// Сохранение данных пользователя
function saveUserData(userData) {
  storageService.saveData('user', userData);
}

// Загрузка данных пользователя
function loadUserData() {
  return storageService.loadData('user', defaultUserData);
}

// Отслеживание событий
function trackEvent(eventName, eventData) {
  const analytics = storageService.loadData('analytics', { events: [] });
  analytics.events.push({
    name: eventName,
    data: eventData,
    timestamp: Date.now()
  });
  storageService.saveData('analytics', analytics);
}
```

### Telegram Bot API

```javascript
import { telegramConfig } from '../utils/config.js';

// Получение данных пользователя
function getTelegramUser() {
  if (window.Telegram && window.Telegram.WebApp) {
    return window.Telegram.WebApp.initDataUnsafe.user;
  }
  return null;
}

// Отправка данных в бота
function sendDataToBot(data) {
  if (window.Telegram && window.Telegram.WebApp) {
    window.Telegram.WebApp.sendData(JSON.stringify(data));
  }
}
```