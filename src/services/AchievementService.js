export class AchievementService {
  constructor(userService) {
    this.userService = userService;
    this.achievements = this.defineAchievements();
    this.listeners = [];
  }

  defineAchievements() {
    return [
      {
        id: 'first_tap',
        name: 'Первый тап',
        description: 'Сделайте свой первый тап',
        icon: '🎯',
        condition: (stats) => stats.totalTaps >= 1,
        reward: { type: 'tapPower', value: 1 }
      },
      {
        id: 'tap_10',
        name: 'Начинающий таппер',
        description: 'Сделайте 10 тапов',
        icon: '👆',
        condition: (stats) => stats.totalTaps >= 10,
        reward: { type: 'crypto', currency: 'BTC', value: 0.0001 }
      },
      {
        id: 'tap_100',
        name: 'Опытный таппер',
        description: 'Сделайте 100 тапов',
        icon: '👊',
        condition: (stats) => stats.totalTaps >= 100,
        reward: { type: 'crypto', currency: 'ETH', value: 0.001 }
      },
      {
        id: 'tap_1000',
        name: 'Тап-мастер',
        description: 'Сделайте 1000 тапов',
        icon: '💪',
        condition: (stats) => stats.totalTaps >= 1000,
        reward: { type: 'crypto', currency: 'BTC', value: 0.001 }
      },
      {
        id: 'earn_btc',
        name: 'Биткоин-энтузиаст',
        description: 'Заработайте 0.01 BTC',
        icon: '₿',
        condition: (stats) => stats.earned.BTC >= 0.01,
        reward: { type: 'tapPower', value: 2 }
      },
      {
        id: 'earn_eth',
        name: 'Эфириум-фанат',
        description: 'Заработайте 0.1 ETH',
        icon: 'Ξ',
        condition: (stats) => stats.earned.ETH >= 0.1,
        reward: { type: 'tapPower', value: 2 }
      },
      {
        id: 'earn_all',
        name: 'Крипто-коллекционер',
        description: 'Заработайте все виды криптовалют',
        icon: '🏆',
        condition: (stats) => {
          const cryptos = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'DOGE', 'USDT'];
          return cryptos.every(crypto => stats.earned[crypto] > 0);
        },
        reward: { type: 'bonus', name: 'multiTap', value: true }
      },
      {
        id: 'daily_streak_3',
        name: 'Постоянный игрок',
        description: 'Играйте 3 дня подряд',
        icon: '📅',
        condition: (stats) => stats.dailyStreak >= 3,
        reward: { type: 'crypto', currency: 'DOGE', value: 10 }
      },
      {
        id: 'daily_streak_7',
        name: 'Недельный марафон',
        description: 'Играйте 7 дней подряд',
        icon: '🗓️',
        condition: (stats) => stats.dailyStreak >= 7,
        reward: { type: 'passiveIncome', value: 1 }
      },
      {
        id: 'referral_1',
        name: 'Приведи друга',
        description: 'Пригласите 1 друга по реферальной ссылке',
        icon: '👥',
        condition: (stats) => stats.referrals >= 1,
        reward: { type: 'crypto', currency: 'BTC', value: 0.0005 }
      }
    ];
  }

  checkAchievements() {
    const stats = this.userService.getStats();
    const unlockedAchievements = this.userService.getUnlockedAchievements();
    const newAchievements = [];

    this.achievements.forEach(achievement => {
      // Проверяем, не разблокировано ли уже достижение
      if (!unlockedAchievements.includes(achievement.id)) {
        // Проверяем условие достижения
        if (achievement.condition(stats)) {
          // Разблокируем достижение
          this.userService.unlockAchievement(achievement.id);
          
          // Выдаем награду
          this.giveReward(achievement.reward);
          
          // Добавляем в список новых достижений
          newAchievements.push(achievement);
        }
      }
    });

    // Если есть новые достижения, уведомляем слушателей
    if (newAchievements.length > 0) {
      this.notifyListeners(newAchievements);
    }

    return newAchievements;
  }

  giveReward(reward) {
    switch (reward.type) {
      case 'crypto':
        this.userService.addCrypto(reward.currency, reward.value);
        break;
      case 'tapPower':
        this.userService.increaseTapPower(reward.value);
        break;
      case 'passiveIncome':
        this.userService.increasePassiveIncome(reward.value);
        break;
      case 'bonus':
        this.userService.activateBonus(reward.name, reward.value);
        break;
    }
  }

  getAchievement(id) {
    return this.achievements.find(a => a.id === id);
  }

  getAllAchievements() {
    const unlockedAchievements = this.userService.getUnlockedAchievements();
    
    return this.achievements.map(achievement => ({
      ...achievement,
      unlocked: unlockedAchievements.includes(achievement.id)
    }));
  }

  addListener(callback) {
    this.listeners.push(callback);
  }

  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  notifyListeners(achievements) {
    this.listeners.forEach(listener => listener(achievements));
  }
}

// Экспортируем класс
export default AchievementService;