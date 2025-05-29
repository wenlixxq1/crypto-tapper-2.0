javascript
export class Shop {
  constructor(userService) {
    this.userService = userService;
    this.element = this.createShopElement();
    this.setupEventListeners();
  }

  createShopElement() {
    const element = document.createElement('div');
    element.className = 'shop-component';
    
    const upgrades = this.getAvailableUpgrades();
    const balance = this.userService.getBalance();
    
    element.innerHTML = `
      <h2 class="shop-title">Магазин улучшений</h2>
      <div class="balance-display">Ваш баланс: ${balance.toFixed(2)} USD</div>
      
      <div class="upgrade-categories">
        <button class="category-btn active" data-category="all">Все</button>
        <button class="category-btn" data-category="tap">Тапы</button>
        <button class="category-btn" data-category="auto">Автоматика</button>
        <button class="category-btn" data-category="boost">Бусты</button>
      </div>
      
      <div class="upgrades-list">
        ${this.renderUpgradesList(upgrades)}
      </div>
    `;
    
    return element;
  }

  getAvailableUpgrades() {
    return [
      {
        id: 'tap_power_1',
        name: 'Усиленный тап I',
        description: '+1 к силе каждого тапа',
        price: 100,
        category: 'tap',
        owned: this.userService.hasUpgrade('tap_power_1'),
        icon: '💪'
      },
      {
        id: 'tap_power_2',
        name: 'Усиленный тап II',
        description: '+3 к силе каждого тапа',
        price: 300,
        category: 'tap',
        requires: 'tap_power_1',
        owned: this.userService.hasUpgrade('tap_power_2'),
        icon: '💪💪'
      },
      {
        id: 'auto_tap',
        name: 'Авто-тапер',
        description: 'Автоматически тапает 1 раз в секунду',
        price: 500,
        category: 'auto',
        owned: this.userService.hasUpgrade('auto_tap'),
        icon: '⏱️'
      },
      {
        id: 'crypto_boost',
        name: 'Крипто-буст',
        description: '+10% к заработку от всех источников',
        price: 1000,
        category: 'boost',
        owned: this.userService.hasUpgrade('crypto_boost'),
        icon: '🚀'
      },
      {
        id: 'luck_boost',
        name: 'Удача',
        description: 'Увеличивает шанс выпадения редкой крипты',
        price: 800,
        category: 'boost',
        owned: this.userService.hasUpgrade('luck_boost'),
        icon: '🍀'
      },
      {
        id: 'multi_tap',
        name: 'Мульти-тап',
        description: '25% шанс сделать двойной тап',
        price: 1200,
        category: 'tap',
        requires: 'tap_power_2',
        owned: this.userService.hasUpgrade('multi_tap'),
        icon: '✖️'
      }
    ];
  }

  renderUpgradesList(upgrades) {
    if (upgrades.length === 0) {
      return '<p class="no-upgrades">Нет доступных улучшений</p>';
    }
    
    return upgrades.map(upgrade => `
      <div class="upgrade-item ${upgrade.owned ? 'owned' : ''} ${this.canBuyUpgrade(upgrade) ? '' : 'locked'}" 
           data-id="${upgrade.id}">
        <div class="upgrade-icon">${upgrade.icon}</div>
        <div class="upgrade-info">
          <h3 class="upgrade-name">${upgrade.name}</h3>
          <p class="upgrade-description">${upgrade.description}</p>
          ${upgrade.requires ? `<div class="upgrade-requires">Требуется: ${this.getUpgradeName(upgrade.requires)}</div>` : ''}
        </div>
        <div class="upgrade-price">
          ${upgrade.owned ? 
            '<span class="owned-badge">Куплено</span>' : 
            `${upgrade.price.toFixed(2)} USD`}
        </div>
      </div>
    `).join('');
  }

  canBuyUpgrade(upgrade) {
    if (upgrade.owned) return false;
    if (upgrade.requires && !this.userService.hasUpgrade(upgrade.requires)) return false;
    return this.userService.getBalance() >= upgrade.price;
  }

  getUpgradeName(id) {
    const upgrades = this.getAvailableUpgrades();
    const upgrade = upgrades.find(u => u.id === id);
    return upgrade ? upgrade.name : id;
  }

  setupEventListeners() {
    // Фильтрация по категориям
    this.element.querySelectorAll('.category-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.element.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const category = btn.dataset.category;
        const upgrades = this.getAvailableUpgrades();
        const filtered = category === 'all' 
          ? upgrades 
          : upgrades.filter(u => u.category === category);
        
        this.element.querySelector('.upgrades-list').innerHTML = this.renderUpgradesList(filtered);
        this.setupUpgradeClickHandlers();
      });
    });
    
    this.setupUpgradeClickHandlers();
  }

  setupUpgradeClickHandlers() {
    this.element.querySelectorAll('.upgrade-item:not(.owned)').forEach(item => {
      item.addEventListener('click', () => {
        if (item.classList.contains('locked')) return;
        
        const upgradeId = item.dataset.id;
        const upgrade = this.getAvailableUpgrades().find(u => u.id === upgradeId);
        
        if (this.userService.getBalance() >= upgrade.price) {
          this.userService.purchaseUpgrade(upgradeId, upgrade.price);
          this.updateShopDisplay();
          this.showPurchaseEffect(item);
        } else {
          this.showNotEnoughMoneyEffect();
        }
      });
    });
  }

  updateShopDisplay() {
    const balance = this.userService.getBalance();
    this.element.querySelector('.balance-display').textContent = `Ваш баланс: ${balance.toFixed(2)} USD`;
    
    const currentCategory = this.element.querySelector('.category-btn.active').dataset.category;
    const upgrades = this.getAvailableUpgrades();
    const filtered = currentCategory === 'all' 
      ? upgrades 
      : upgrades.filter(u => u.category === currentCategory);
    
    this.element.querySelector('.upgrades-list').innerHTML = this.renderUpgradesList(filtered);
    this.setupUpgradeClickHandlers();
  }

  showPurchaseEffect(element) {
    const effect = document.createElement('div');
    effect.className = 'purchase-effect';
    effect.innerHTML = 'Успешно куплено!';
    element.appendChild(effect);
    
    setTimeout(() => {
      effect.classList.add('fade-out');
      setTimeout(() => effect.remove(), 500);
    }, 1000);
  }

  showNotEnoughMoneyEffect() {
    const balanceDisplay = this.element.querySelector('.balance-display');
    balanceDisplay.classList.add('shake');
    
    setTimeout(() => {
      balanceDisplay.classList.remove('shake');
    }, 500);
  }

  getElement() {
    return this.element;
  }
}