# Архитектура проекта

## Обзор

Крипто Тапер построен на модульной архитектуре с использованием объектно-ориентированного подхода. Проект разделен на компоненты, сервисы и утилиты, что обеспечивает хорошую организацию кода и возможность его повторного использования.

## Основные компоненты

### Компоненты (components/)

Компоненты представляют собой визуальные элементы игры, которые отвечают за отображение и взаимодействие с пользователем.

- **Tapper** - основной игровой экран с кнопкой тапа
- **Shop** - магазин улучшений
- **Wallet** - кошелек с криптовалютами
- **Referral** - реферальная система
- **Achievements** - система достижений
- **CryptoMiner** - мини-игра для майнинга криптовалют

Каждый компонент имеет следующую структуру:
```javascript
export class ComponentName {
  constructor(dependencies) {
    // Инициализация компонента
  }

  createElement() {
    // Создание DOM-элемента
  }

  setupEventListeners() {
    // Настройка обработчиков событий
  }

  updateUI() {
    // Обновление интерфейса
  }

  getElement() {
    // Возвращает DOM-элемент компонента
  }
}
```

### Сервисы (services/)

Сервисы отвечают за бизнес-логику и взаимодействие с внешними API.

- **UserService** - управление данными пользователя
- **CryptoService** - работа с криптовалютами и их курсами
- **ApiService** - взаимодействие с внешними API
- **AchievementService** - система достижений
- **LocalAnalytics** - локальная аналитика и отслеживание событий
- **StorageService** - локальное хранение данных
- **TelegramService** - интеграция с Telegram WebApp

Сервисы реализованы как синглтоны:
```javascript
class ServiceName {
  constructor() {
    // Инициализация сервиса
  }

  // Методы сервиса
}

const serviceName = new ServiceName();
export default serviceName;
```

### Утилиты (utils/)

Утилиты содержат вспомогательные функции и константы.

- **config.js** - конфигурация приложения
- **helpers.js** - вспомогательные функции
- **formatters.js** - функции форматирования
- **storage.js** - работа с локальным хранилищем

## Диаграмма зависимостей

```
App
├── Tapper
│   ├── UserService
│   └── CryptoService
├── Shop
│   └── UserService
├── Wallet
│   ├── UserService
│   └── CryptoService
├── Referral
│   └── UserService
├── Achievements
│   └── AchievementService
│       └── UserService
└── CryptoMiner
    ├── UserService
    └── CryptoService

UserService
└── LocalAnalytics

CryptoService
└── ApiService

StorageService

TelegramService
└── config
```

## Поток данных

1. Пользователь взаимодействует с компонентами (например, нажимает на кнопку тапа)
2. Компоненты вызывают методы сервисов (например, UserService.addCrypto())
3. Сервисы обрабатывают данные и обновляют состояние приложения
4. Компоненты обновляют UI на основе нового состояния

## Хранение данных

### Локальное хранилище

Данные пользователя хранятся в localStorage для обеспечения работы в офлайн-режиме:
```javascript
// Сохранение данных
localStorage.setItem('crypto_tapper_user', JSON.stringify(userData));

// Загрузка данных
const userData = JSON.parse(localStorage.getItem('crypto_tapper_user'));
```

### Экспорт и импорт данных

Для переноса данных между устройствами используется экспорт и импорт данных:
```javascript
// Экспорт данных
const userData = storageService.exportUserData();
const dataStr = JSON.stringify(userData);

// Импорт данных
const userData = JSON.parse(dataStr);
storageService.importUserData(userData);
```

## Обработка событий

Для обработки событий используется паттерн "Наблюдатель" (Observer):
```javascript
// Добавление слушателя
service.addListener(callback);

// Уведомление слушателей
notifyListeners(data) {
  this.listeners.forEach(listener => listener(data));
}
```

## Асинхронные операции

Для асинхронных операций используются Promise и async/await:
```javascript
async function fetchData() {
  try {
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}
```

## Оптимизация производительности

- Использование requestAnimationFrame для анимаций
- Ограничение частоты обновления UI
- Кэширование данных
- Ленивая загрузка компонентов

## Расширяемость

Архитектура проекта позволяет легко добавлять новые компоненты и функциональность:
1. Создайте новый компонент в директории components/
2. Добавьте необходимые сервисы и утилиты
3. Интегрируйте компонент в App.js

## Тестирование

Для тестирования используется Jest:
```javascript
// Пример теста
test('addCrypto adds crypto to balance', () => {
  const userService = new UserService();
  userService.addCrypto('BTC', 1);
  expect(userService.getCryptoBalance('BTC')).toBe(1);
});
```