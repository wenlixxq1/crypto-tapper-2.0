import SimpleComponent from './components/SimpleComponent';

export class SimpleApp {
  constructor() {
    this.init();
  }

  init() {
    try {
      console.log('Инициализация SimpleApp...');
      this.simpleComponent = new SimpleComponent();
      this.renderApp();
      console.log('SimpleApp инициализирован успешно');
    } catch (error) {
      console.error('Ошибка при инициализации SimpleApp:', error);
      this.showError(error);
    }
  }

  renderApp() {
    try {
      const app = document.getElementById('app');
      if (!app) {
        throw new Error('Элемент #app не найден');
      }
      
      app.innerHTML = '';
      app.appendChild(this.simpleComponent.getElement());
      
      console.log('Приложение отрендерено');
    } catch (error) {
      console.error('Ошибка при рендеринге:', error);
      this.showError(error);
    }
  }

  showError(error) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.innerHTML = `
      <h3>Произошла ошибка</h3>
      <p>${error.message}</p>
      <pre>${error.stack}</pre>
      <button id="reload-app">Перезагрузить</button>
    `;
    
    document.body.appendChild(errorElement);
    
    document.getElementById('reload-app').addEventListener('click', () => {
      window.location.reload();
    });
  }
}

export default SimpleApp;