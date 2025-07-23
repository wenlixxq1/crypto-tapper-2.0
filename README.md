<<<<<<< HEAD
# Крипто Тапер - Telegram Mini App

Мини-приложение для Telegram, позволяющее "тапать" криптовалюты и зарабатывать виртуальные монеты.

![App Preview](https://example.com/preview.jpg) 

## 🚀 Возможности

- Тапайте популярные криптовалюты (BTC, ETH, TON, USDT)
- Реалистичная симуляция изменения курсов
- Система виртуального баланса
- Сохранение прогресса между сессиями
- Полная интеграция с Telegram WebApp
- Тактильная отдача при тапах

## 📦 Установка и запуск

### Требования
- Node.js v16+
- npm или yarn

### Установка
```bash
git clone https://github.com/yourusername/crypto-tapper.git
cd crypto-tapper
npm install
Запуск в development режиме
bash
npm start
Приложение будет доступно по адресу: http://localhost:9000

Сборка для production
bash
npm run build
Собранные файлы будут в папке dist/

🛠 Технологический стек
Frontend:

React 18

Webpack 5

Babel

CSS Modules

Telegram WebApp API

Утилиты:

ESLint

Prettier

Husky (pre-commit хуки)

📂 Структура проекта
crypto_tapper/
├── public/                  # Статические файлы
│   ├── index.html           # Главная страница мини-приложения
│   ├── css/
│   │   └── style.css        # Стили приложения
│   └── js/
│       └── app.js           # Основной JavaScript файл
│
├── src/
│   ├── components/          # Компоненты приложения
│   │   ├── Tapper.js        # Компонент тапера
│   │   ├── Wallet.js        # Компонент кошелька
│   │   ├── Shop.js          # Магазин улучшений
│   │   └── Referral.js      # Реферальная система
│   │
│   ├── services/
│   │   ├── CryptoService.js # Логика работы с криптовалютами
│   │   ├── UserService.js   # Работа с пользователем
│   │   └── PaymentService.js# Платежи и подписки
│   │
│   ├── utils/
│   │   ├── storage.js       # Работа с локальным хранилищем
│   │   └── helpers.js       # Вспомогательные функции
│   │
│   └── app.js               # Основной файл приложения
│
├── package.json             # Конфигурация проекта
└── README.md                # Описание проекта
🌐 Развертывание
GitHub Pages:

bash
npm run deploy
Netlify/Vercel:

Подключите ваш репозиторий

Укажите команду сборки: npm run build

Укажите папку с результатом: dist

Хостинг Telegram:

Собранные файлы нужно загрузить на любой HTTPS хостинг

Указать URL в настройках бота через @BotFather

🤝 Как внести вклад
Форкните репозиторий

Создайте ветку для вашей фичи (git checkout -b feature/amazing-feature)

Сделайте коммит ваших изменений (git commit -m 'Add some amazing feature')

Запушьте в ветку (git push origin feature/amazing-feature)

Откройте Pull Request

📜 Лицензия
MIT © artem lovly

📞 Контакты
По вопросам сотрудничества:

Telegram: @lovlyhere

Email: whylovlygod@icloud.com