javascript
// Данные о криптовалютах
const coins = [
    { id: 'btc', name: 'Bitcoin (BTC)', value: 0 },
    { id: 'eth', name: 'Ethereum (ETH)', value: 0 },
    { id: 'ton', name: 'Toncoin (TON)', value: 0 },
    { id: 'usdt', name: 'Tether (USDT)', value: 0 }
];

// Рендер списка криптовалют
function renderApp() {
    const app = document.getElementById('app');
    app.innerHTML = coins.map(coin => `
        <div class="coin" onclick="tapCoin('${coin.id}')">
            <h2>${coin.name}</h2>
            <p>Тапов: ${coin.value}</p>
        </div>
    `).join('');
}

// Обработка тапа по криптовалюте
function tapCoin(coinId) {
    const coin = coins.find(c => c.id === coinId);
    if (coin) {
        coin.value += 1;
        renderApp();
        // Тактильная отдача в Telegram
        if (window.Telegram.WebApp) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }
    }
}

// Инициализация Telegram WebApp
if (window.Telegram.WebApp) {
    window.Telegram.WebApp.expand();  // Раскрыть на весь экран
    window.Telegram.WebApp.ready();   // Готов к взаимодействию
}

// Старт приложения
renderApp();
