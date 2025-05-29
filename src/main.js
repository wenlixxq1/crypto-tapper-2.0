javascript
// Инициализация Telegram WebApp
const tg = window.Telegram?.WebApp;

// Состояние приложения
const state = {
  coins: [
    { id: 'btc', name: 'Bitcoin (BTC)', value: 0, price: 0 },
    { id: 'eth', name: 'Ethereum (ETH)', value: 0, price: 0 },
    { id: 'ton', name: 'Toncoin (TON)', value: 0, price: 0 },
    { id: 'usdt', name: 'Tether (USDT)', value: 0, price: 1 }
  ],
  totalTaps: 0,
  balance: 0
};

// DOM элементы
const elements = {
  app: null,
  balance: null
};

// Инициализация приложения
function init() {
  // Создаем структуру HTML
  document.body.innerHTML = `
    <div class="container">
      <h1>Крипто Тапер</h1>
      <div class="balance">Баланс: $<span id="balance">0</span></div>
      <div class="stats">Всего тапов: <span id="total-taps">0</span></div>
      <div id="coins-container" class="coins-container"></div>
      <button id="cashout" class="cashout-btn">Вывести</button>
    </div>
  `;

  // Получаем DOM элементы
  elements.app = document.getElementById('coins-container');
  elements.balance = document.getElementById('balance');
  elements.totalTaps = document.getElementById('total-taps');
  elements.cashoutBtn = document.getElementById('cashout');

  // Загружаем сохраненные данные
  loadState();
  
  // Инициализируем Telegram WebApp
  if (tg) {
    tg.expand();
    tg.ready();
    tg.BackButton.hide();
    
    // Обработчик кнопки "Назад" в Telegram
    tg.onEvent('backButtonClicked', () => {
      tg.close();
    });
  }

  // Обработчик кнопки вывода
  elements.cashoutBtn.addEventListener('click', handleCashout);

  // Рендерим начальное состояние
  render();
}

// Загрузка состояния из localStorage
function loadState() {
  const savedState = localStorage.getItem('crypto-tapper-state');
  if (savedState) {
    const parsed = JSON.parse(savedState);
    state.coins = parsed.coins || state.coins;
    state.totalTaps = parsed.totalTaps || 0;
    state.balance = parsed.balance || 0;
  }
}

// Сохранение состояния в localStorage
function saveState() {
  localStorage.setItem('crypto-tapper-state', JSON.stringify({
    coins: state.coins,
    totalTaps: state.totalTaps,
    balance: state.balance
  }));
}

// Рендер списка криптовалют
function render() {
  elements.app.innerHTML = state.coins.map(coin => `
    <div class="coin" data-coin="${coin.id}">
      <div class="coin-info">
        <h2>${coin.name}</h2>
        <div class="price">$${coin.price.toFixed(2)}</div>
      </div>
      <div class="coin-controls">
        <div class="counter">Тапов: ${coin.value}</div>
        <button class="tap-btn">Тапнуть</button>
      </div>
    </div>
  `).join('');

  // Обновляем баланс и общие тапы
  elements.balance.textContent = state.balance.toFixed(2);
  elements.totalTaps.textContent = state.totalTaps;

  // Добавляем обработчики для кнопок
  document.querySelectorAll('.tap-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const coinId = e.target.closest('.coin').dataset.coin;
      handleTap(coinId);
    });
  });
}

// Обработка тапа по криптовалюте
function handleTap(coinId) {
  const coin = state.coins.find(c => c.id === coinId);
  if (!coin) return;

  // Увеличиваем счетчики
  coin.value += 1;
  state.totalTaps += 1;
  state.balance += coin.price * 0.1; // Начисляем 10% от цены за тап

  // Тактильная отдача в Telegram
  if (tg?.HapticFeedback) {
    tg.HapticFeedback.impactOccurred('light');
  }

  // Сохраняем и рендерим
  saveState();
  render();
}

// Обработка вывода средств
function handleCashout() {
  if (state.balance <= 0) {
    alert('Недостаточно средств для вывода!');
    return;
  }

  if (tg?.showPopup) {
    tg.showPopup({
      title: 'Вывод средств',
      message: `Вы уверены, что хотите вывести $${state.balance.toFixed(2)}?`,
      buttons: [
        { id: 'confirm', type: 'ok', text: 'Подтвердить' },
        { type: 'cancel' }
      ]
    }, (btnId) => {
      if (btnId === 'confirm') {
        // Здесь можно добавить логику вывода через Telegram Bot API
        alert(`Вывод $${state.balance.toFixed(2)} выполнен!`);
        state.balance = 0;
        saveState();
        render();
      }
    });
  } else {
    if (confirm(`Вы уверены, что хотите вывести $${state.balance.toFixed(2)}?`)) {
      alert(`Вывод $${state.balance.toFixed(2)} выполнен!`);
      state.balance = 0;
      saveState();
      render();
    }
  }
}

// Получение актуальных цен криптовалют (заглушка)
async function fetchPrices() {
  // В реальном приложении здесь будет запрос к API
  state.coins.forEach(coin => {
    // Рандомные значения для демонстрации
    if (coin.id !== 'usdt') {
      coin.price = Math.random() * 10000 + 1000;
    }
  });
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', async () => {
  await fetchPrices();
  init();
});