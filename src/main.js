import { App } from './App.js';

// Запускаем приложение при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  new App();
});

// Обработка ошибок
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  
  // Показываем пользователю сообщение об ошибке
  const errorMessage = document.createElement('div');
  errorMessage.className = 'error-message';
  errorMessage.innerHTML = `
    <h3>Произошла ошибка</h3>
    <p>Пожалуйста, перезагрузите приложение</p>
    <button id="reload-app">Перезагрузить</button>
  `;
  
  document.body.appendChild(errorMessage);
  
  // Обработчик кнопки перезагрузки
  document.getElementById('reload-app').addEventListener('click', () => {
    window.location.reload();
  });
});

// Обработка офлайн/онлайн состояния
window.addEventListener('online', () => {
  document.body.classList.remove('offline');
});

window.addEventListener('offline', () => {
  document.body.classList.add('offline');
  
  // Показываем уведомление
  const offlineMessage = document.createElement('div');
  offlineMessage.className = 'offline-message';
  offlineMessage.textContent = 'Нет подключения к интернету';
  
  document.body.appendChild(offlineMessage);
  
  // Удаляем уведомление при восстановлении соединения
  window.addEventListener('online', () => {
    offlineMessage.remove();
  }, { once: true });
});