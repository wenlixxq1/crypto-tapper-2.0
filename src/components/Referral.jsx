javascript
export class Referral {
  constructor(userService) {
    this.userService = userService;
    this.element = this.createReferralElement();
    this.setupEventListeners();
  }

  createReferralElement() {
    const element = document.createElement('div');
    element.className = 'referral-component';
    
    const referralData = this.userService.getReferralData();
    const referralLink = this.generateReferralLink();
    
    element.innerHTML = `
      <h2 class="referral-title">Реферальная система</h2>
      <div class="referral-box">
        <p class="referral-description">Приглашайте друзей и получайте бонусы!</p>
        <div class="referral-link-container">
          <input type="text" class="referral-link-input" value="${referralLink}" readonly>
          <button class="copy-referral-button">Копировать</button>
        </div>
        <p class="referral-hint">За каждого приглашенного друга вы получите 10 USD и 5% от его заработка!</p>
      </div>
      
      <div class="referral-stats">
        <div class="stat-card">
          <div class="stat-name">Приглашено</div>
          <div class="stat-value">${referralData.totalReferrals}</div>
        </div>
        <div class="stat-card">
          <div class="stat-name">Заработано</div>
          <div class="stat-value">${referralData.earned} USD</div>
        </div>
        <div class="stat-card">
          <div class="stat-name">Активные</div>
          <div class="stat-value">${referralData.activeReferrals}</div>
        </div>
      </div>
      
      <h3 class="referral-list-title">Ваши рефералы</h3>
      <div class="referral-list">
        ${this.renderReferralList(referralData.referrals)}
      </div>
    `;
    
    return element;
  }

  renderReferralList(referrals) {
    if (referrals.length === 0) {
      return '<p class="no-referrals">У вас пока нет рефералов</p>';
    }
    
    return `
      <table class="referral-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Дата</th>
            <th>Заработано</th>
            <th>Статус</th>
          </tr>
        </thead>
        <tbody>
          ${referrals.map(ref => `
            <tr>
              <td>${ref.id.substring(0, 8)}...</td>
              <td>${new Date(ref.date).toLocaleDateString()}</td>
              <td>${ref.earned} USD</td>
              <td class="status-${ref.active ? 'active' : 'inactive'}">
                ${ref.active ? 'Активен' : 'Неактивен'}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  generateReferralLink() {
    const userId = this.userService.getUserId();
    return `https://t.me/${this.userService.getBotUsername()}?start=ref_${userId}`;
  }

  setupEventListeners() {
    this.element.querySelector('.copy-referral-button').addEventListener('click', () => {
      const input = this.element.querySelector('.referral-link-input');
      input.select();
      document.execCommand('copy');
      
      // Показываем уведомление о копировании
      this.showCopyNotification();
    });
  }

  showCopyNotification() {
    const notification = document.createElement('div');
    notification.className = 'copy-notification';
    notification.textContent = 'Ссылка скопирована!';
    this.element.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => notification.remove(), 500);
    }, 2000);
  }

  updateReferralStats() {
    const referralData = this.userService.getReferralData();
    
    // Обновляем статистику
    const statValues = this.element.querySelectorAll('.stat-value');
    if (statValues.length >= 3) {
      statValues[0].textContent = referralData.totalReferrals;
      statValues[1].textContent = `${referralData.earned} USD`;
      statValues[2].textContent = referralData.activeReferrals;
    }
    
    // Обновляем список рефералов
    const referralList = this.element.querySelector('.referral-list');
    if (referralList) {
      referralList.innerHTML = this.renderReferralList(referralData.referrals);
    }
  }

  getElement() {
    return this.element;
  }
}