export class CryptoMiner {
  constructor(userService, cryptoService) {
    this.userService = userService;
    this.cryptoService = cryptoService;
    this.element = this.createMinerElement();
    this.setupEventListeners();
    this.setupMiningInterval();
    
    // Состояние майнера
    this.isMining = false;
    this.miningPower = 1;
    this.miningCrypto = 'BTC';
    this.miningDifficulty = {
      'BTC': 100,
      'ETH': 50,
      'SOL': 20,
      'BNB': 30,
      'XRP': 10,
      'ADA': 15,
      'DOGE': 5,
      'USDT': 200
    };
    this.miningProgress = 0;
  }

  createMinerElement() {
    const element = document.createElement('div');
    element.className = 'miner-component';
    
    const availableCryptos = Object.keys(this.cryptoService.getAvailableCryptos(this.userService.getTotalBalance()));
    
    element.innerHTML = `
      <h2 class="miner-title">Крипто-майнер</h2>
      <div class="miner-description">
        Запустите майнер, чтобы получать криптовалюту автоматически!
      </div>
      
      <div class="miner-controls">
        <div class="crypto-selector">
          <label for="mining-crypto">Выберите криптовалюту:</label>
          <select id="mining-crypto">
            ${availableCryptos.map(crypto => `
              <option value="${crypto}">${this.cryptoService.getCryptoName(crypto)} (${crypto})</option>
            `).join('')}
          </select>
        </div>
        
        <div class="mining-stats">
          <div class="stat">
            <span class="stat-label">Мощность майнинга:</span>
            <span class="stat-value mining-power">${this.miningPower}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Сложность:</span>
            <span class="stat-value mining-difficulty">${this.miningDifficulty[this.miningCrypto]}</span>
          </div>
        </div>
        
        <div class="mining-progress-container">
          <div class="mining-progress">
            <div class="progress-bar" style="width: 0%"></div>
          </div>
          <div class="progress-text">0%</div>
        </div>
        
        <button class="mining-button">Начать майнинг</button>
      </div>
      
      <div class="mining-upgrades">
        <h3>Улучшения майнера</h3>
        <div class="upgrades-list">
          <div class="upgrade-item" data-upgrade="power">
            <div class="upgrade-info">
              <h4>Увеличить мощность</h4>
              <p>+1 к мощности майнинга</p>
            </div>
            <button class="upgrade-button" data-cost="100">100 USD</button>
          </div>
          <div class="upgrade-item" data-upgrade="efficiency">
            <div class="upgrade-info">
              <h4>Повысить эффективность</h4>
              <p>-10% к сложности майнинга</p>
            </div>
            <button class="upgrade-button" data-cost="200">200 USD</button>
          </div>
          <div class="upgrade-item" data-upgrade="multicoin">
            <div class="upgrade-info">
              <h4>Мульти-майнинг</h4>
              <p>Шанс получить дополнительную монету</p>
            </div>
            <button class="upgrade-button" data-cost="500">500 USD</button>
          </div>
        </div>
      </div>
      
      <div class="mining-history">
        <h3>История майнинга</h3>
        <div class="history-list"></div>
      </div>
    `;
    
    return element;
  }

  setupEventListeners() {
    // Кнопка майнинга
    this.miningButton = this.element.querySelector('.mining-button');
    this.miningButton.addEventListener('click', () => this.toggleMining());
    
    // Выбор криптовалюты
    this.cryptoSelect = this.element.querySelector('#mining-crypto');
    this.cryptoSelect.addEventListener('change', () => {
      this.miningCrypto = this.cryptoSelect.value;
      this.updateMiningStats();
    });
    
    // Кнопки улучшений
    this.element.querySelectorAll('.upgrade-button').forEach(button => {
      button.addEventListener('click', () => {
        const upgradeType = button.parentElement.dataset.upgrade;
        const cost = parseInt(button.dataset.cost);
        
        if (this.userService.getTotalBalance() >= cost) {
          this.purchaseUpgrade(upgradeType, cost);
          button.dataset.cost = Math.floor(cost * 1.5);
          button.textContent = `${button.dataset.cost} USD`;
        } else {
          this.showNotEnoughMoneyEffect(button);
        }
      });
    });
  }

  setupMiningInterval() {
    this.miningInterval = setInterval(() => {
      if (this.isMining) {
        this.updateMiningProgress();
      }
    }, 1000);
  }

  toggleMining() {
    this.isMining = !this.isMining;
    
    if (this.isMining) {
      this.miningButton.textContent = 'Остановить майнинг';
      this.miningButton.classList.add('active');
      this.cryptoSelect.disabled = true;
    } else {
      this.miningButton.textContent = 'Начать майнинг';
      this.miningButton.classList.remove('active');
      this.cryptoSelect.disabled = false;
    }
  }

  updateMiningProgress() {
    // Увеличиваем прогресс в зависимости от мощности
    const difficulty = this.miningDifficulty[this.miningCrypto];
    const progressIncrement = (this.miningPower / difficulty) * 100;
    
    this.miningProgress += progressIncrement;
    
    // Обновляем визуальный прогресс
    const progressBar = this.element.querySelector('.progress-bar');
    const progressText = this.element.querySelector('.progress-text');
    
    progressBar.style.width = `${Math.min(100, this.miningProgress)}%`;
    progressText.textContent = `${Math.min(100, Math.floor(this.miningProgress))}%`;
    
    // Если достигли 100%, добываем криптовалюту
    if (this.miningProgress >= 100) {
      this.mineCrypto();
      this.miningProgress = 0;
    }
  }

  mineCrypto() {
    // Базовая награда зависит от сложности
    const baseReward = 1 / this.miningDifficulty[this.miningCrypto];
    let reward = baseReward * this.miningPower;
    
    // Добавляем немного случайности (±10%)
    const randomFactor = 0.9 + Math.random() * 0.2;
    reward *= randomFactor;
    
    // Добавляем криптовалюту пользователю
    this.userService.addCrypto(this.miningCrypto, reward);
    
    // Добавляем запись в историю
    this.addToMiningHistory(this.miningCrypto, reward);
    
    // Проверяем мульти-майнинг
    if (this.hasMulticoinUpgrade && Math.random() < 0.2) {
      // 20% шанс получить дополнительную монету
      const availableCryptos = Object.keys(this.cryptoService.getAvailableCryptos(this.userService.getTotalBalance()));
      const randomCrypto = availableCryptos[Math.floor(Math.random() * availableCryptos.length)];
      
      if (randomCrypto !== this.miningCrypto) {
        const bonusReward = (1 / this.miningDifficulty[randomCrypto]) * (this.miningPower / 2);
        this.userService.addCrypto(randomCrypto, bonusReward);
        this.addToMiningHistory(randomCrypto, bonusReward, true);
      }
    }
  }

  addToMiningHistory(crypto, amount, isBonus = false) {
    const historyList = this.element.querySelector('.history-list');
    const item = document.createElement('div');
    item.className = `history-item ${isBonus ? 'bonus' : ''}`;
    
    const symbol = this.cryptoService.getCryptoSymbol(crypto);
    item.innerHTML = `
      <span class="history-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
      <span class="history-amount">+${amount.toFixed(8)}</span>
      <span class="history-crypto">${symbol} ${crypto}</span>
      ${isBonus ? '<span class="bonus-tag">БОНУС</span>' : ''}
    `;
    
    historyList.prepend(item);
    
    // Ограничиваем список 10 элементами
    if (historyList.children.length > 10) {
      historyList.removeChild(historyList.lastChild);
    }
  }

  purchaseUpgrade(type, cost) {
    this.userService.spendBalance(cost);
    
    switch (type) {
      case 'power':
        this.miningPower += 1;
        break;
      case 'efficiency':
        // Уменьшаем сложность на 10%
        Object.keys(this.miningDifficulty).forEach(crypto => {
          this.miningDifficulty[crypto] = Math.max(1, Math.floor(this.miningDifficulty[crypto] * 0.9));
        });
        break;
      case 'multicoin':
        this.hasMulticoinUpgrade = true;
        break;
    }
    
    this.updateMiningStats();
    this.showUpgradePurchasedEffect(type);
  }

  updateMiningStats() {
    this.element.querySelector('.mining-power').textContent = this.miningPower;
    this.element.querySelector('.mining-difficulty').textContent = this.miningDifficulty[this.miningCrypto];
  }

  showNotEnoughMoneyEffect(button) {
    button.classList.add('shake');
    setTimeout(() => button.classList.remove('shake'), 500);
  }

  showUpgradePurchasedEffect(type) {
    const upgradeItem = this.element.querySelector(`[data-upgrade="${type}"]`);
    const effect = document.createElement('div');
    effect.className = 'purchase-effect';
    effect.textContent = 'Улучшено!';
    
    upgradeItem.appendChild(effect);
    
    setTimeout(() => {
      effect.classList.add('fade-out');
      setTimeout(() => effect.remove(), 500);
    }, 1000);
  }

  destroy() {
    if (this.miningInterval) {
      clearInterval(this.miningInterval);
    }
  }

  getElement() {
    return this.element;
  }
}