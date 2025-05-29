javascript
export class Tapper {
  constructor(userService, cryptoService) {
    this.userService = userService;
    this.cryptoService = cryptoService;
    this.element = this.createTapperElement();
    this.setupEventListeners();
    this.setupAutoTapper();
    this.animationFrame = null;
    this.lastUpdateTime = 0;
    this.updateInterval = 1000 / 60; // 60 FPS
  }

  createTapperElement() {
    const element = document.createElement('div');
    element.className = 'tapper-container';
    
    const tapPower = this.userService.getTapPower();
    const passiveIncome = this.userService.getPassiveIncome();
    
    element.innerHTML = `
      <div class="tapper-header">
        <div class="stats">
          <div class="stat">
            <span class="stat-label">Сила тапа:</span>
            <span class="stat-value tap-power">${tapPower}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Пассивный доход:</span>
            <span class="stat-value passive-income">${passiveIncome}/сек</span>
          </div>
        </div>
        <div class="total-balance">
          <span class="balance-label">Всего:</span>
          <span class="balance-value">${this.userService.getFormattedBalance()}</span>
        </div>
      </div>
      
      <div class="tapper-main">
        <div class="tap-area">
          <button class="tap-button">
            <span class="tap-button-text">TAP!</span>
            <span class="tap-button-subtext">Зарабатывай крипту</span>
          </button>
          <div class="tap-effects"></div>
        </div>
        
        <div class="crypto-display">
          <div class="crypto-ticker">
            ${this.renderCryptoTicker()}
          </div>
          <div class="recent-earnings">
            <h3>Последние заработки:</h3>
            <div class="earnings-list"></div>
          </div>
        </div>
      </div>
      
      <div class="bonus-section">
        <div class="bonus-timer">
          <div class="bonus-progress"></div>
          <span class="bonus-time">00:00</span>
        </div>
        <button class="bonus-button" disabled>Бонус скоро будет доступен</button>
      </div>
    `;
    
    return element;
  }

  renderCryptoTicker() {
    const cryptoBalances = this.userService.getCryptoBalances();
    return Object.entries(cryptoBalances)
      .map(([crypto, amount]) => `
        <div class="crypto-item">
          <span class="crypto-amount">${amount.toFixed(4)}</span>
          <span class="crypto-name">${this.cryptoService.getCryptoName(crypto)}</span>
          <span class="crypto-symbol">${crypto}</span>
        </div>
      `)
      .join('');
  }

  setupEventListeners() {
    // Основная кнопка тапа
    this.tapButton = this.element.querySelector('.tap-button');
    this.tapButton.addEventListener('click', () => this.handleTap());
    
    // Кнопка бонуса
    this.bonusButton = this.element.querySelector('.bonus-button');
    this.bonusButton.addEventListener('click', () => this.claimBonus());
    
    // Запускаем игровой цикл
    this.startGameLoop();
  }

  setupAutoTapper() {
    if (this.userService.hasAutoTapper()) {
      this.autoTapperInterval = setInterval(() => {
        this.handleAutoTap();
      }, 1000); // Авто-тап каждую секунду
    }
  }

  startGameLoop() {
    const loop = (timestamp) => {
      if (!this.lastUpdateTime) this.lastUpdateTime = timestamp;
      const deltaTime = timestamp - this.lastUpdateTime;
      
      if (deltaTime >= this.updateInterval) {
        this.update(deltaTime);
        this.lastUpdateTime = timestamp - (deltaTime % this.updateInterval);
      }
      
      this.animationFrame = requestAnimationFrame(loop);
    };
    
    this.animationFrame = requestAnimationFrame(loop);
  }

  update(deltaTime) {
    // Обновляем пассивный доход
    if (this.userService.hasPassiveIncome()) {
      this.passiveIncomeAccumulator += this.userService.getPassiveIncome() * (deltaTime / 1000);
      if (this.passiveIncomeAccumulator >= 1) {
        const amount = Math.floor(this.passiveIncomeAccumulator);
        this.userService.addPassiveIncome(amount);
        this.passiveIncomeAccumulator -= amount;
        this.updateUI();
      }
    }
    
    // Обновляем таймер бонуса
    this.updateBonusTimer(deltaTime);
  }

  handleTap() {
    if (this.isTapCooldown) return;
    
    this.isTapCooldown = true;
    setTimeout(() => { this.isTapCooldown = false; }, 100);
    
    // Рассчитываем заработок
    const crypto = this.cryptoService.getRandomCrypto();
    const amount = this.calculateEarnings();
    
    // Добавляем заработок
    this.userService.addCrypto(crypto, amount);
    
    // Создаем визуальный эффект
    this.createTapEffect(amount, crypto);
    
    // Обновляем UI
    this.updateUI();
    
    // Увеличиваем счетчик тапов для достижений
    this.userService.incrementTapCount();
  }

  handleAutoTap() {
    if (this.userService.hasAutoTapper()) {
      const crypto = this.cryptoService.getRandomCrypto();
      const amount = this.calculateEarnings() * 0.5; // Авто-тапы слабее
      
      this.userService.addCrypto(crypto, amount);
      this.createAutoTapEffect(amount, crypto);
      this.updateUI();
    }
  }

  calculateEarnings() {
    let amount = this.userService.getTapPower();
    
    // Применяем модификаторы
    if (this.userService.hasMultiTap()) {
      if (Math.random() < 0.25) amount *= 2; // 25% шанс на двойной тап
    }
    
    if (this.userService.hasSubscription()) {
      amount *= this.userService.getSubscriptionMultiplier();
    }
    
    if (this.isBonusActive) {
      amount *= this.bonusMultiplier;
    }
    
    return Math.floor(amount);
  }

  createTapEffect(amount, crypto) {
    const tapArea = this.element.querySelector('.tap-effects');
    const effect = document.createElement('div');
    effect.className = 'tap-effect';
    
    const symbol = this.cryptoService.getCryptoSymbol(crypto);
    effect.innerHTML = `
      <span class="earn-amount">+${amount.toFixed(2)}</span>
      <span class="crypto-symbol">${symbol}</span>
    `;
    
    // Случайная позиция вокруг кнопки
    const angle = Math.random() * Math.PI * 2;
    const distance = 30 + Math.random() * 50;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    
    effect.style.left = `calc(50% + ${x}px)`;
    effect.style.top = `calc(50% + ${y}px)`;
    
    tapArea.appendChild(effect);
    
    // Анимация
    setTimeout(() => {
      effect.style.transform = `translate(${x * 2}px, ${y * 2 - 100}px)`;
      effect.style.opacity = '0';
      
      setTimeout(() => {
        effect.remove();
      }, 1000);
    }, 10);
    
    // Добавляем в список последних заработков
    this.addToEarningsList(amount, crypto);
  }

  createAutoTapEffect(amount, crypto) {
    const tapArea = this.element.querySelector('.tap-effects');
    const effect = document.createElement('div');
    effect.className = 'tap-effect auto-tap';
    
    const symbol = this.cryptoService.getCryptoSymbol(crypto);
    effect.innerHTML = `
      <span class="earn-amount">+${amount.toFixed(2)}</span>
      <span class="crypto-symbol">${symbol}</span>
    `;
    
    // Позиция внизу экрана для авто-тапов
    effect.style.left = `${10 + Math.random() * 80}%`;
    effect.style.bottom = '10%';
    
    tapArea.appendChild(effect);
    
    // Анимация
    setTimeout(() => {
      effect.style.transform = 'translateY(-100px)';
      effect.style.opacity = '0';
      
      setTimeout(() => {
        effect.remove();
      }, 1000);
    }, 10);
  }

  addToEarningsList(amount, crypto) {
    const earningsList = this.element.querySelector('.earnings-list');
    const item = document.createElement('div');
    item.className = 'earnings-item';
    
    const symbol = this.cryptoService.getCryptoSymbol(crypto);
    item.innerHTML = `
      <span class="earn-amount">+${amount.toFixed(4)}</span>
      <span class="crypto-symbol">${symbol}</span>
      <span class="earn-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
    `;
    
    earningsList.prepend(item);
    
    // Ограничиваем список 10 элементами
    if (earningsList.children.length > 10) {
      earningsList.removeChild(earningsList.lastChild);
    }
  }

  updateBonusTimer(deltaTime) {
    if (!this.bonusStartTime) {
      this.bonusStartTime = Date.now();
      this.bonusCooldown = 5 * 60 * 1000; // 5 минут в миллисекундах
    }
    
    const elapsed = Date.now() - this.bonusStartTime;
    const remaining = Math.max(0, this.bonusCooldown - elapsed);
    
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    
    const timerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    this.element.querySelector('.bonus-time').textContent = timerText;
    
    const progressPercent = 100 - (remaining / this.bonusCooldown * 100);
    this.element.querySelector('.bonus-progress').style.width = `${progressPercent}%`;
    
    if (remaining <= 0 && !this.isBonusActive) {
      this.enableBonus();
    }
  }

  enableBonus() {
    this.isBonusActive = true;
    this.bonusMultiplier = 2; // 2x множитель
    this.bonusButton.disabled = false;
    this.bonusButton.textContent = 'Получить 2x бонус на 30 сек!';
    this.bonusButton.classList.add('active');
    
    // Сбрасываем таймер
    this.bonusStartTime = null;
  }

  claimBonus() {
    if (!this.isBonusActive) return;
    
    this.isBonusActive = false;
    this.bonusButton.disabled = true;
    this.bonusButton.textContent = 'Бонус активен!';
    this.bonusButton.classList.remove('active');
    
    // Активируем бонус на 30 секунд
    this.userService.activateBonus(this.bonusMultiplier, 30000);
    
    // Запускаем таймер бонуса
    setTimeout(() => {
      this.bonusButton.textContent = 'Бонус скоро будет доступен';
      this.bonusStartTime = Date.now();
    }, 30000);
  }

  updateUI() {
    // Обновляем баланс
    this.element.querySelector('.balance-value').textContent = this.userService.getFormattedBalance();
    
    // Обновляем крипто-балансы
    this.element.querySelector('.crypto-ticker').innerHTML = this.renderCryptoTicker();
    
    // Обновляем статистику
    this.element.querySelector('.tap-power').textContent = this.userService.getTapPower();
    this.element.querySelector('.passive-income').textContent = 
      `${this.userService.getPassiveIncome()}/сек`;
  }

  destroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    
    if (this.autoTapperInterval) {
      clearInterval(this.autoTapperInterval);
    }
  }

  getElement() {
    return this.element;
  }
}