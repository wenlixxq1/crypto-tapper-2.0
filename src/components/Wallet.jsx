javascript
export class Wallet {
  constructor(userService, cryptoService) {
    this.userService = userService;
    this.cryptoService = cryptoService;
    this.element = this.createWalletElement();
    this.setupEventListeners();
    this.updateInterval = this.setupAutoUpdate();
  }

  createWalletElement() {
    const element = document.createElement('div');
    element.className = 'wallet-component';
    
    const cryptoBalances = this.userService.getCryptoBalances();
    const totalValue = this.calculateTotalValue(cryptoBalances);
    
    element.innerHTML = `
      <div class="wallet-header">
        <h2 class="wallet-title">Мой крипто-кошелек</h2>
        <div class="total-value">
          <span class="total-label">Общая стоимость:</span>
          <span class="total-amount">${totalValue.toFixed(2)} USD</span>
        </div>
      </div>
      
      <div class="wallet-controls">
        <div class="search-box">
          <input type="text" class="search-input" placeholder="Поиск криптовалюты...">
          <button class="search-button">🔍</button>
        </div>
        <div class="sort-options">
          <select class="sort-select">
            <option value="value">По стоимости</option>
            <option value="name">По названию</option>
            <option value="amount">По количеству</option>
          </select>
        </div>
      </div>
      
      <div class="crypto-list">
        ${this.renderCryptoList(cryptoBalances)}
      </div>
      
      <div class="wallet-actions">
        <button class="action-button convert-button">Конвертировать</button>
        <button class="action-button withdraw-button">Вывести</button>
      </div>
    `;
    
    return element;
  }

  renderCryptoList(balances) {
    const cryptos = Object.entries(balances)
      .filter(([_, amount]) => amount > 0)
      .map(([crypto, amount]) => ({
        symbol: crypto,
        name: this.cryptoService.getCryptoName(crypto),
        amount,
        value: this.cryptoService.getCryptoValue(crypto, amount),
        change: this.cryptoService.getCryptoChange(crypto),
        icon: this.cryptoService.getCryptoIcon(crypto)
      }));
    
    if (cryptos.length === 0) {
      return `
        <div class="empty-wallet">
          <div class="empty-icon">💸</div>
          <h3>Кошелек пуст</h3>
          <p>Начните тапать, чтобы заработать криптовалюту!</p>
        </div>
      `;
    }
    
    return cryptos.map(crypto => `
      <div class="crypto-item" data-symbol="${crypto.symbol}">
        <div class="crypto-icon">${crypto.icon}</div>
        <div class="crypto-info">
          <div class="crypto-name">${crypto.name}</div>
          <div class="crypto-symbol">${crypto.symbol}</div>
        </div>
        <div class="crypto-amount">
          <div class="amount">${crypto.amount.toFixed(6)}</div>
          <div class="value">${crypto.value.toFixed(2)} USD</div>
        </div>
        <div class="crypto-change ${crypto.change >= 0 ? 'positive' : 'negative'}">
          ${crypto.change >= 0 ? '↑' : '↓'} ${Math.abs(crypto.change)}%
        </div>
      </div>
    `).join('');
  }

  calculateTotalValue(balances) {
    return Object.entries(balances).reduce((total, [crypto, amount]) => {
      return total + this.cryptoService.getCryptoValue(crypto, amount);
    }, 0);
  }

  setupEventListeners() {
    // Поиск криптовалют
    this.element.querySelector('.search-input').addEventListener('input', (e) => {
      this.filterCryptoList(e.target.value);
    });
    
    // Сортировка
    this.element.querySelector('.sort-select').addEventListener('change', (e) => {
      this.sortCryptoList(e.target.value);
    });
    
    // Действия с кошельком
    this.element.querySelector('.convert-button').addEventListener('click', () => {
      this.showConvertModal();
    });
    
    this.element.querySelector('.withdraw-button').addEventListener('click', () => {
      this.showWithdrawModal();
    });
    
    // Клик по криптовалюте
    this.element.querySelectorAll('.crypto-item').forEach(item => {
      item.addEventListener('click', () => {
        const symbol = item.dataset.symbol;
        this.showCryptoDetails(symbol);
      });
    });
  }

  filterCryptoList(searchTerm) {
    const items = this.element.querySelectorAll('.crypto-item');
    const term = searchTerm.toLowerCase();
    
    items.forEach(item => {
      const name = item.querySelector('.crypto-name').textContent.toLowerCase();
      const symbol = item.querySelector('.crypto-symbol').textContent.toLowerCase();
      const matches = name.includes(term) || symbol.includes(term);
      item.style.display = matches ? 'flex' : 'none';
    });
  }

  sortCryptoList(sortBy) {
    const cryptoList = this.element.querySelector('.crypto-list');
    const items = Array.from(this.element.querySelectorAll('.crypto-item'));
    
    items.sort((a, b) => {
      const aSymbol = a.dataset.symbol;
      const bSymbol = b.dataset.symbol;
      
      switch (sortBy) {
        case 'name':
          return a.querySelector('.crypto-name').textContent.localeCompare(
            b.querySelector('.crypto-name').textContent
          );
        
        case 'amount':
          const aAmount = parseFloat(a.querySelector('.amount').textContent);
          const bAmount = parseFloat(b.querySelector('.amount').textContent);
          return bAmount - aAmount;
        
        case 'value':
        default:
          const aValue = parseFloat(a.querySelector('.value').textContent);
          const bValue = parseFloat(b.querySelector('.value').textContent);
          return bValue - aValue;
      }
    });
    
    // Очищаем и пересобираем список
    cryptoList.innerHTML = '';
    items.forEach(item => cryptoList.appendChild(item));
  }

  showCryptoDetails(symbol) {
    const crypto = {
      symbol,
      name: this.cryptoService.getCryptoName(symbol),
      amount: this.userService.getCryptoBalance(symbol),
      value: this.cryptoService.getCryptoValue(symbol, this.userService.getCryptoBalance(symbol)),
      change: this.cryptoService.getCryptoChange(symbol),
      icon: this.cryptoService.getCryptoIcon(symbol)
    };
    
    const modal = document.createElement('div');
    modal.className = 'modal crypto-details-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>${crypto.icon} ${crypto.name} (${crypto.symbol})</h3>
          <button class="close-modal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="crypto-stats">
            <div class="stat">
              <span class="stat-label">Количество:</span>
              <span class="stat-value">${crypto.amount.toFixed(6)}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Стоимость:</span>
              <span class="stat-value">${crypto.value.toFixed(2)} USD</span>
            </div>
            <div class="stat">
              <span class="stat-label">Изменение (24ч):</span>
              <span class="stat-value ${crypto.change >= 0 ? 'positive' : 'negative'}">
                ${crypto.change >= 0 ? '↑' : '↓'} ${Math.abs(crypto.change)}%
              </span>
            </div>
          </div>
          
          <div class="crypto-chart">
            <canvas id="crypto-chart"></canvas>
          </div>
          
          <div class="crypto-actions">
            <button class="action-button convert-single-button" data-symbol="${crypto.symbol}">
              Конвертировать
            </button>
            <button class="action-button withdraw-single-button" data-symbol="${crypto.symbol}">
              Вывести
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Инициализация графика
    this.initChart(symbol, modal.querySelector('#crypto-chart'));
    
    // Закрытие модального окна
    modal.querySelector('.close-modal').addEventListener('click', () => {
      modal.remove();
    });
    
    // Действия в модальном окне
    modal.querySelector('.convert-single-button').addEventListener('click', () => {
      modal.remove();
      this.showConvertModal(symbol);
    });
    
    modal.querySelector('.withdraw-single-button').addEventListener('click', () => {
      modal.remove();
      this.showWithdrawModal(symbol);
    });
  }

  initChart(symbol, canvas) {
    // Здесь должна быть логика загрузки данных и отрисовки графика
    // Для примера используем простую имитацию
    const ctx = canvas.getContext('2d');
    const data = {
      labels: Array(24).fill(0).map((_, i) => `${i}:00`),
      datasets: [{
        label: `${symbol} Price`,
        data: Array(24).fill(0).map((_, i) => {
          const baseValue = this.cryptoService.getCryptoValue(symbol, 1);
          return baseValue * (0.95 + Math.random() * 0.1);
        }),
        borderColor: '#6c5ce7',
        tension: 0.1,
        fill: true,
        backgroundColor: 'rgba(108, 92, 231, 0.1)'
      }]
    };
    
    new Chart(ctx, {
      type: 'line',
      data: data,
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: false
          }
        }
      }
    });
  }

  showConvertModal(fromSymbol = null) {
    const modal = document.createElement('div');
    modal.className = 'modal convert-modal';
    
    const cryptos = Object.keys(this.userService.getCryptoBalances())
      .filter(symbol => this.userService.getCryptoBalance(symbol) > 0);
    
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Конвертация криптовалюты</h3>
          <button class="close-modal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="convert-form">
            <div class="convert-from">
              <label>Отдаете:</label>
              <div class="input-group">
                <select class="crypto-select" ${fromSymbol ? 'disabled' : ''}>
                  ${fromSymbol 
                    ? `<option value="${fromSymbol}">${fromSymbol}</option>`
                    : cryptos.map(symbol => `
                      <option value="${symbol}">${symbol} - ${this.cryptoService.getCryptoName(symbol)}</option>
                    `).join('')}
                </select>
                <input type="number" class="amount-input" placeholder="0.00" step="0.000001">
              </div>
            </div>
            
            <div class="convert-arrow">⇅</div>
            
            <div class="convert-to">
              <label>Получаете:</label>
              <div class="input-group">
                <select class="crypto-select">
                  ${cryptos.map(symbol => `
                    <option value="${symbol}">${symbol} - ${this.cryptoService.getCryptoName(symbol)}</option>
                  `).join('')}
                </select>
                <input type="number" class="amount-input" placeholder="0.00" readonly>
              </div>
            </div>
          </div>
          
          <div class="convert-rate">
            <span class="rate-label">Курс:</span>
            <span class="rate-value">1 BTC = 15.5 ETH</span>
          </div>
          
          <div class="convert-fee">
            Комиссия конвертации: 1%
          </div>
          
          <button class="action-button confirm-convert-button">Подтвердить конвертацию</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Обновление курса при изменении выбора
    const updateRate = () => {
      const fromCrypto = modal.querySelector('.convert-from .crypto-select').value;
      const toCrypto = modal.querySelector('.convert-to .crypto-select').value;
      const fromValue = this.cryptoService.getCryptoValue(fromCrypto, 1);
      const toValue = this.cryptoService.getCryptoValue(toCrypto, 1);
      const rate = fromValue / toValue;
      
      modal.querySelector('.rate-value').textContent = 
        `1 ${fromCrypto} = ${rate.toFixed(6)} ${toCrypto}`;
      
      // Обновляем сумму получения
      const amount = parseFloat(modal.querySelector('.convert-from .amount-input').value) || 0;
      const received = (amount * rate) * 0.99; // Учитываем комиссию 1%
      modal.querySelector('.convert-to .amount-input').value = received.toFixed(6);
    };
    
    modal.querySelectorAll('.crypto-select').forEach(select => {
      select.addEventListener('change', updateRate);
    });
    
    modal.querySelector('.convert-from .amount-input').addEventListener('input', updateRate);
    
    // Закрытие модального окна
    modal.querySelector('.close-modal').addEventListener('click', () => {
      modal.remove();
    });
    
    // Подтверждение конвертации
    modal.querySelector('.confirm-convert-button').addEventListener('click', () => {
      const fromCrypto = modal.querySelector('.convert-from .crypto-select').value;
      const toCrypto = modal.querySelector('.convert-to .crypto-select').value;
      const amount = parseFloat(modal.querySelector('.convert-from .amount-input').value);
      
      if (amount <= 0 || isNaN(amount)) {
        alert('Введите корректную сумму для конвертации');
        return;
      }
      
      if (amount > this.userService.getCryptoBalance(fromCrypto)) {
        alert('Недостаточно средств для конвертации');
        return;
      }
      
      // Выполняем конвертацию
      const rate = this.cryptoService.getCryptoValue(fromCrypto, 1) / 
                   this.cryptoService.getCryptoValue(toCrypto, 1);
      const received = (amount * rate) * 0.99;
      
      this.userService.convertCrypto(fromCrypto, toCrypto, amount, received);
      this.updateWallet();
      modal.remove();
      
      // Показываем уведомление об успехе
      this.showNotification(
        `Успешно конвертировано ${amount.toFixed(6)} ${fromCrypto} → ${received.toFixed(6)} ${toCrypto}`
      );
    });
  }

  showWithdrawModal(symbol = null) {
    const modal = document.createElement('div');
    modal.className = 'modal withdraw-modal';
    
    const cryptos = Object.keys(this.userService.getCryptoBalances())
      .filter(symbol => this.userService.getCryptoBalance(symbol) > 0);
    
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Вывод криптовалюты</h3>
          <button class="close-modal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="withdraw-form">
            <div class="form-group">
              <label>Криптовалюта:</label>
              <select class="crypto-select" ${symbol ? 'disabled' : ''}>
                ${symbol 
                  ? `<option value="${symbol}">${symbol}</option>`
                  : cryptos.map(symbol => `
                    <option value="${symbol}">${symbol} - ${this.cryptoService.getCryptoName(symbol)}</option>
                  `).join('')}
              </select>
            </div>
            
            <div class="form-group">
              <label>Количество:</label>
              <input type="number" class="amount-input" placeholder="0.00" step="0.000001">
              <div class="balance-hint">
                Доступно: <span class="available-balance">0.00</span>
                <button class="max-button">MAX</button>
              </div>
            </div>
            
            <div class="form-group">
              <label>Адрес кошелька:</label>
              <input type="text" class="address-input" placeholder="Введите адрес кошелька">
            </div>
            
            <div class="form-group">
              <label>Сеть:</label>
              <select class="network-select">
                <option value="mainnet">Основная сеть (Mainnet)</option>
                <option value="testnet">Тестовая сеть (Testnet)</option>
                <option value="binance">Binance Smart Chain</option>
                <option value="polygon">Polygon</option>
              </select>
            </div>
            
            <div class="withdraw-fee">
              Комиссия вывода: <span class="fee-amount">0.0005</span>
            </div>
            
            <div class="withdraw-summary">
              Вы получите: <span class="received-amount">0.00</span>
            </div>
          </div>
          
          <button class="action-button confirm-withdraw-button">Подтвердить вывод</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Обновление доступного баланса
    const updateBalance = () => {
      const selectedCrypto = modal.querySelector('.crypto-select').value;
      const balance = this.userService.getCryptoBalance(selectedCrypto);
      modal.querySelector('.available-balance').textContent = balance.toFixed(6);
    };
    
    // Обновление суммы получения
    const updateReceived = () => {
      const amount = parseFloat(modal.querySelector('.amount-input').value) || 0;
      const fee = parseFloat(modal.querySelector('.fee-amount').textContent);
      const received = Math.max(0, amount - fee);
      modal.querySelector('.received-amount').textContent = received.toFixed(6);
    };
    
    modal.querySelector('.crypto-select').addEventListener('change', updateBalance);
    modal.querySelector('.amount-input').addEventListener('input', updateReceived);
    
    // Кнопка MAX
    modal.querySelector('.max-button').addEventListener('click', () => {
      const selectedCrypto = modal.querySelector('.crypto-select').value;
      const balance = this.userService.getCryptoBalance(selectedCrypto);
      modal.querySelector('.amount-input').value = balance.toFixed(6);
      updateReceived();
    });
    
    // Закрытие модального окна
    modal.querySelector('.close-modal').addEventListener('click', () => {
      modal.remove();
    });
    
    // Подтверждение вывода
    modal.querySelector('.confirm-withdraw-button').addEventListener('click', () => {
      const crypto = modal.querySelector('.crypto-select').value;
      const amount = parseFloat(modal.querySelector('.amount-input').value);
      const address = modal.querySelector('.address-input').value.trim();
      const network = modal.querySelector('.network-select').value;
      const fee = parseFloat(modal.querySelector('.fee-amount').textContent);
      
      if (amount <= 0 || isNaN(amount)) {
        alert('Введите корректную сумму для вывода');
        return;
      }
      
      if (amount > this.userService.getCryptoBalance(crypto)) {
        alert('Недостаточно средств для вывода');
        return;
      }
      
      if (!address) {
        alert('Введите адрес кошелька');
        return;
      }
      
      // Выполняем вывод (в реальном приложении здесь был бы API запрос)
      this.userService.withdrawCrypto(crypto, amount, address, network, fee);
      this.updateWallet();
      modal.remove();
      
      // Показываем уведомление об успехе
      this.showNotification(
        `Запрос на вывод ${amount.toFixed(6)} ${crypto} отправлен!`
      );
    });
    
    // Инициализация значений
    updateBalance();
    updateReceived();
  }

  showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => notification.remove(), 500);
    }, 3000);
  }

  setupAutoUpdate() {
    return setInterval(() => {
      this.updateWallet();
    }, 60000); // Обновляем каждую минуту
  }

  updateWallet() {
    const cryptoBalances = this.userService.getCryptoBalances();
    const totalValue = this.calculateTotalValue(cryptoBalances);
    
    // Обновляем общую стоимость
    this.element.querySelector('.total-amount').textContent = `${totalValue.toFixed(2)} USD`;
    
    // Обновляем список криптовалют
    this.element.querySelector('.crypto-list').innerHTML = this.renderCryptoList(cryptoBalances);
    
    // Переустанавливаем обработчики событий
    this.element.querySelectorAll('.crypto-item').forEach(item => {
      item.addEventListener('click', () => {
        const symbol = item.dataset.symbol;
        this.showCryptoDetails(symbol);
      });
    });
  }

  destroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  getElement() {
    return this.element;
  }
}