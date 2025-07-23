import { Tapper } from './components/Tapper.jsx';
import { Shop } from './components/Shop.jsx';
import { Wallet } from './components/Wallet.jsx';
import { Referral } from './components/Referral.jsx';
import { Achievements } from './components/Achievements.jsx';
import { CryptoMiner } from './components/CryptoMiner.jsx';
import { CryptoService } from './services/CryptoService.js';
import UserService from './services/UserService.js';
import AchievementService from './services/AchievementService.js';

export class App {
  constructor() {
    this.initServices();
    this.initComponents();
    this.setupTelegramWebApp();
    this.setupEventListeners();
    this.renderApp();
    this.checkDailyBonus();
  }

  initServices() {
    this.cryptoService = new CryptoService();
    this.userService = UserService;
    this.achievementService = new AchievementService(this.userService);
  }

  initComponents() {
    this.tapper = new Tapper(this.userService, this.cryptoService);
    this.shop = new Shop(this.userService);
    this.wallet = new Wallet(this.userService, this.cryptoService);
    this.referral = new Referral(this.userService);
    this.achievements = new Achievements(this.achievementService);
    this.cryptoMiner = new CryptoMiner(this.userService, this.cryptoService);
    
    this.components = {
      tapper: this.tapper,
      shop: this.shop,
      wallet: this.wallet,
      referral: this.referral,
      achievements: this.achievements,
      miner: this.cryptoMiner
    };
    
    this.activeComponent = 'tapper';
  }

  setupTelegramWebApp() {
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.expand();
      window.Telegram.WebApp.ready();
      
      // Обработка реферальной ссылки
      const initData = window.Telegram.WebApp.initData;
      if (initData) {
        const refMatch = initData.match(/start=ref_(\w+)/);
        if (refMatch) {
          const refCode = refMatch[1];
          this.userService.handleReferral(refCode);
        }
      }
      
      // Настройка темы
      const colorScheme = window.Telegram.WebApp.colorScheme;
      document.body.classList.add(colorScheme);
    }
  }

  setupEventListeners() {
    // Навигация между вкладками
    document.addEventListener('click', (e) => {
      if (e.target.closest('.nav-tab')) {
        const tab = e.target.closest('.nav-tab').dataset.tab;
        this.switchTab(tab);
      }
    });
    
    // Проверка достижений при каждом тапе
    document.addEventListener('tap', () => {
      this.achievementService.checkAchievements();
    });
  }

  renderApp() {
    const app = document.getElementById('app');
    app.innerHTML = '';
    
    // Создаем навигацию
    const navigation = document.createElement('div');
    navigation.className = 'navigation';
    navigation.innerHTML = `
      <div class="nav-tab ${this.activeComponent === 'tapper' ? 'active' : ''}" data-tab="tapper">
        <span class="nav-icon">🎮</span>
        <span class="nav-text">Тапер</span>
      </div>
      <div class="nav-tab ${this.activeComponent === 'miner' ? 'active' : ''}" data-tab="miner">
        <span class="nav-icon">⛏️</span>
        <span class="nav-text">Майнер</span>
      </div>
      <div class="nav-tab ${this.activeComponent === 'shop' ? 'active' : ''}" data-tab="shop">
        <span class="nav-icon">🛒</span>
        <span class="nav-text">Магазин</span>
      </div>
      <div class="nav-tab ${this.activeComponent === 'wallet' ? 'active' : ''}" data-tab="wallet">
        <span class="nav-icon">💰</span>
        <span class="nav-text">Кошелек</span>
      </div>
      <div class="nav-tab ${this.activeComponent === 'achievements' ? 'active' : ''}" data-tab="achievements">
        <span class="nav-icon">🏆</span>
        <span class="nav-text">Достижения</span>
      </div>
      <div class="nav-tab ${this.activeComponent === 'referral' ? 'active' : ''}" data-tab="referral">
        <span class="nav-icon">👥</span>
        <span class="nav-text">Рефералы</span>
      </div>
    `;
    
    // Создаем контейнер для контента
    const content = document.createElement('div');
    content.className = 'content';
    content.appendChild(this.components[this.activeComponent].getElement());
    
    app.appendChild(content);
    app.appendChild(navigation);
  }

  switchTab(tab) {
    if (this.activeComponent === tab) return;
    
    this.activeComponent = tab;
    this.renderApp();
    
    // Тактильная отдача в Telegram
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
  }

  checkDailyBonus() {
    const lastLogin = this.userService.getLastLogin();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const lastLoginDate = new Date(lastLogin).getTime();
    
    // Если последний вход был не сегодня
    if (lastLoginDate < today) {
      // Проверяем, был ли вход вчера для подсчета серии
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayTime = yesterday.getTime();
      
      if (lastLoginDate >= yesterdayTime) {
        // Увеличиваем серию дней
        this.userService.incrementDailyStreak();
      } else {
        // Сбрасываем серию дней
        this.userService.resetDailyStreak();
      }
      
      // Показываем бонус за ежедневный вход
      this.showDailyBonus();
      
      // Обновляем дату последнего входа
      this.userService.updateLastLogin();
    }
  }

  showDailyBonus() {
    const streak = this.userService.getDailyStreak();
    let bonus = 0.0001; // Базовый бонус
    
    // Увеличиваем бонус в зависимости от серии дней
    if (streak >= 7) {
      bonus = 0.001; // Бонус за неделю
    } else if (streak >= 3) {
      bonus = 0.0005; // Бонус за 3 дня
    }
    
    // Добавляем бонус
    this.userService.addCrypto('BTC', bonus);
    
    // Создаем модальное окно с бонусом
    const modal = document.createElement('div');
    modal.className = 'modal daily-bonus-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Ежедневный бонус!</h3>
          <button class="close-modal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="bonus-icon">🎁</div>
          <h4>День ${streak}</h4>
          <p>Вы получили <strong>${bonus} BTC</strong> за ежедневный вход!</p>
          <div class="streak-info">
            <p>Серия входов: ${streak} ${streak === 1 ? 'день' : streak < 5 ? 'дня' : 'дней'}</p>
            <div class="streak-progress">
              ${Array(7).fill(0).map((_, i) => `
                <div class="streak-day ${i < streak ? 'active' : ''}"></div>
              `).join('')}
            </div>
            <p class="streak-hint">Приходите каждый день для увеличения бонуса!</p>
          </div>
          <button class="claim-bonus-btn">Забрать бонус</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Обработчик закрытия модального окна
    modal.querySelector('.close-modal').addEventListener('click', () => {
      modal.remove();
    });
    
    // Обработчик кнопки получения бонуса
    modal.querySelector('.claim-bonus-btn').addEventListener('click', () => {
      modal.remove();
      
      // Показываем анимацию получения бонуса
      const bonusEffect = document.createElement('div');
      bonusEffect.className = 'bonus-effect';
      bonusEffect.innerHTML = `+${bonus} BTC`;
      document.body.appendChild(bonusEffect);
      
      setTimeout(() => {
        bonusEffect.classList.add('fade-out');
        setTimeout(() => bonusEffect.remove(), 1000);
      }, 2000);
    });
  }
}

// Примечание: инициализация перенесена в main.js
