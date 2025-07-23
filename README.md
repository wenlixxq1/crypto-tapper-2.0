# Крипто Тапер 2.0

Игра-кликер, в которой вы зарабатываете виртуальную криптовалюту с помощью тапов. Разработана как Telegram Mini App с поддержкой PWA.

## Особенности

- 🪙 Зарабатывайте различные криптовалюты (BTC, ETH, SOL и другие)
- ⛏️ Используйте крипто-майнер для пассивного дохода
- 🏆 Система достижений с наградами
- 🛒 Магазин улучшений для увеличения заработка
- 🔄 Ежедневные бонусы и серии входов
- 👥 Реферальная система для приглашения друзей
- 📊 Актуальные курсы криптовалют через API
- 💾 Локальное хранение данных и офлайн-режим

## Требования

- Node.js 14+ и npm
- Доступ к [CoinCap API](https://docs.coincap.io/) для получения курсов криптовалют (не требует регистрации)
- [Telegram Bot](https://core.telegram.org/bots) для интеграции с Telegram

## Установка

1. Клонируйте репозиторий:
   ```bash
   git clone https://github.com/yourusername/crypto-tapper.git
   cd crypto-tapper
   ```

2. Установите зависимости:
   ```bash
   npm install
   ```

3. Создайте файл `.env` в корне проекта и заполните его своими API ключами:
   ```
   # API для получения курсов криптовалют
   CRYPTO_API_URL=https://api.coincap.io/v2
   # API ключ не требуется для CoinCap

   # Telegram Bot API
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

   # Настройки приложения
   APP_VERSION=2.0.0
   DEBUG_MODE=false
   ```

## Запуск для разработки

```bash
npm start
```

Приложение будет доступно по адресу [http://localhost:9000](http://localhost:9000).

## Сборка для продакшена

```bash
npm run build
```

Собранные файлы будут находиться в директории `dist/`.

## Деплой

### Деплой на GitHub Pages

```bash
npm run deploy
```

### Деплой на хостинг

Загрузите содержимое директории `dist/` на ваш хостинг.

## Интеграция с Telegram

1. Создайте бота в Telegram через [@BotFather](https://t.me/BotFather)
2. Получите токен бота и добавьте его в файл `.env`
3. Настройте WebApp URL в BotFather, указав URL вашего приложения
4. Добавьте кнопку для запуска WebApp в меню бота

## Структура проекта

```
crypto-tapper/
├── public/              # Статические файлы
│   ├── css/             # CSS стили
│   ├── images/          # Изображения
│   ├── index.html       # Главная HTML страница
│   ├── manifest.json    # Манифест для PWA
│   └── service-worker.js # Service Worker для PWA
├── src/                 # Исходный код
│   ├── components/      # Компоненты игры
│   ├── services/        # Сервисы (API, Firebase и т.д.)
│   ├── utils/           # Вспомогательные функции
│   ├── App.js           # Главный компонент приложения
│   └── main.js          # Точка входа
├── .env                 # Переменные окружения
├── .gitignore           # Игнорируемые файлы Git
├── package.json         # Зависимости и скрипты
├── README.md            # Документация
└── webpack.config.js    # Конфигурация Webpack
```

## Получение API ключей

### CoinCap API
CoinCap API не требует регистрации или API ключа. Просто используйте базовый URL: `https://api.coincap.io/v2`

### Telegram Bot API
1. Создайте бота через [@BotFather](https://t.me/BotFather)
2. Получите токен бота и добавьте его в файл `.env`

## Лицензия

MIT

## Автор

Artem Lovly