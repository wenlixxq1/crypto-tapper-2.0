// Простой компонент для проверки работы приложения

export class SimpleComponent {
  constructor() {
    this.element = this.createSimpleElement();
  }

  createSimpleElement() {
    const element = document.createElement('div');
    element.className = 'simple-component';
    element.innerHTML = `
      <h2>Простой компонент</h2>
      <p>Если вы видите этот текст, значит приложение работает правильно!</p>
      <button class="test-button">Нажми меня</button>
    `;

    // Добавляем обработчик события
    element.querySelector('.test-button').addEventListener('click', () => {
      alert('Кнопка работает!');
    });

    return element;
  }

  getElement() {
    return this.element;
  }
}

export default SimpleComponent;