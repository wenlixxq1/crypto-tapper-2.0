export class Achievements {
  constructor(achievementService) {
    this.achievementService = achievementService;
    this.element = this.createAchievementsElement();
    this.setupEventListeners();
    
    // Подписываемся на новые достижения
    this.achievementService.addListener(this.handleNewAchievements.bind(this));
  }

  createAchievementsElement() {
    const element = document.createElement('div');
    element.className = 'achievements-component';
    
    const achievements = this.achievementService.getAllAchievements();
    const unlockedCount = achievements.filter(a => a.unlocked).length;
    const totalCount = achievements.length;
    
    element.innerHTML = `
      <h2 class="achievements-title">Достижения</h2>
      <div class="achievements-progress">
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${(unlockedCount / totalCount) * 100}%"></div>
        </div>
        <div class="progress-text">${unlockedCount} / ${totalCount}</div>
      </div>
      
      <div class="achievements-filter">
        <button class="filter-btn active" data-filter="all">Все</button>
        <button class="filter-btn" data-filter="unlocked">Разблокированные</button>
        <button class="filter-btn" data-filter="locked">Заблокированные</button>
      </div>
      
      <div class="achievements-list">
        ${this.renderAchievementsList(achievements)}
      </div>
    `;
    
    return element;
  }

  renderAchievementsList(achievements) {
    if (achievements.length === 0) {
      return '<p class="no-achievements">Нет доступных достижений</p>';
    }
    
    return achievements.map(achievement => `
      <div class="achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}" data-id="${achievement.id}">
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-info">
          <h3 class="achievement-name">${achievement.name}</h3>
          <p class="achievement-description">${achievement.description}</p>
        </div>
        <div class="achievement-status">
          ${achievement.unlocked ? 
            '<span class="status-badge unlocked">Получено</span>' : 
            '<span class="status-badge locked">Не получено</span>'}
        </div>
      </div>
    `).join('');
  }

  setupEventListeners() {
    // Фильтрация достижений
    this.element.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.element.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const filter = btn.dataset.filter;
        const achievements = this.achievementService.getAllAchievements();
        let filtered = achievements;
        
        if (filter === 'unlocked') {
          filtered = achievements.filter(a => a.unlocked);
        } else if (filter === 'locked') {
          filtered = achievements.filter(a => !a.unlocked);
        }
        
        this.element.querySelector('.achievements-list').innerHTML = this.renderAchievementsList(filtered);
      });
    });
  }

  handleNewAchievements(achievements) {
    // Показываем уведомление о новых достижениях
    achievements.forEach(achievement => {
      this.showAchievementNotification(achievement);
    });
    
    // Обновляем список достижений
    this.updateAchievementsList();
  }

  showAchievementNotification(achievement) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    
    notification.innerHTML = `
      <div class="notification-icon">${achievement.icon}</div>
      <div class="notification-content">
        <h3>Достижение разблокировано!</h3>
        <p>${achievement.name}</p>
        <p class="reward-text">Награда: ${this.formatReward(achievement.reward)}</p>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Анимация появления
    setTimeout(() => {
      notification.classList.add('show');
      
      // Анимация исчезновения через 5 секунд
      setTimeout(() => {
        notification.classList.add('hide');
        setTimeout(() => notification.remove(), 500);
      }, 5000);
    }, 100);
  }

  formatReward(reward) {
    switch (reward.type) {
      case 'crypto':
        return `${reward.value} ${reward.currency}`;
      case 'tapPower':
        return `+${reward.value} к силе тапа`;
      case 'passiveIncome':
        return `+${reward.value} к пассивному доходу`;
      case 'bonus':
        return `Бонус: ${reward.name}`;
      default:
        return 'Неизвестная награда';
    }
  }

  updateAchievementsList() {
    const achievements = this.achievementService.getAllAchievements();
    const unlockedCount = achievements.filter(a => a.unlocked).length;
    const totalCount = achievements.length;
    
    // Обновляем прогресс
    this.element.querySelector('.progress-fill').style.width = `${(unlockedCount / totalCount) * 100}%`;
    this.element.querySelector('.progress-text').textContent = `${unlockedCount} / ${totalCount}`;
    
    // Обновляем список в соответствии с текущим фильтром
    const currentFilter = this.element.querySelector('.filter-btn.active').dataset.filter;
    let filtered = achievements;
    
    if (currentFilter === 'unlocked') {
      filtered = achievements.filter(a => a.unlocked);
    } else if (currentFilter === 'locked') {
      filtered = achievements.filter(a => !a.unlocked);
    }
    
    this.element.querySelector('.achievements-list').innerHTML = this.renderAchievementsList(filtered);
  }

  getElement() {
    return this.element;
  }
}