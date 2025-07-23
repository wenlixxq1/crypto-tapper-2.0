# Игровые механики

## Основные механики

### Тапы

Основная механика игры - тапы (нажатия) на кнопку, которые приносят игроку криптовалюту.

- **Сила тапа** - количество криптовалюты, получаемое за один тап
- **Кулдаун** - небольшая задержка между тапами для предотвращения спама
- **Мульти-тап** - шанс получить двойную награду за тап

```javascript
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
```

### Криптовалюты

В игре представлены различные криптовалюты с разными курсами и волатильностью.

- **Курс** - стоимость криптовалюты в USD
- **Волатильность** - степень изменчивости курса
- **Разблокировка** - некоторые криптовалюты становятся доступны при достижении определенного баланса

```javascript
const cryptos = {
  BTC: {
    name: "Bitcoin",
    symbol: "₿",
    icon: "🟠",
    rate: 50000, // USD за 1 BTC
    volatility: 0.05,
    unlockAt: 0
  },
  ETH: {
    name: "Ethereum",
    symbol: "Ξ",
    icon: "🔷",
    rate: 3000,
    volatility: 0.07,
    unlockAt: 1000
  }
  // ...другие криптовалюты
};
```

### Улучшения

Игрок может покупать улучшения для увеличения заработка.

- **Усиление тапа** - увеличивает силу тапа
- **Авто-тапер** - автоматически тапает раз в секунду
- **Крипто-буст** - увеличивает заработок от всех источников
- **Удача** - увеличивает шанс выпадения редкой криптовалюты
- **Мульти-тап** - дает шанс на двойной тап

```javascript
const upgrades = [
  {
    id: 'tap_power_1',
    name: 'Усиленный тап I',
    description: '+1 к силе каждого тапа',
    price: 100,
    category: 'tap',
    owned: false,
    icon: '💪'
  },
  // ...другие улучшения
];
```

### Пассивный доход

Игрок может получать пассивный доход даже когда не играет.

- **Авто-тапер** - автоматически тапает раз в секунду
- **Крипто-майнер** - добывает криптовалюту с определенной скоростью
- **Бонусы** - временные усилители пассивного дохода

```javascript
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
}
```

## Дополнительные механики

### Достижения

Игрок может получать достижения за выполнение определенных условий.

- **Условия** - требования для получения достижения
- **Награды** - бонусы за выполнение достижения
- **Прогресс** - отслеживание прогресса выполнения

```javascript
const achievements = [
  {
    id: 'first_tap',
    name: 'Первый тап',
    description: 'Сделайте свой первый тап',
    icon: '🎯',
    condition: (stats) => stats.totalTaps >= 1,
    reward: { type: 'tapPower', value: 1 }
  },
  // ...другие достижения
];
```

### Крипто-майнер

Мини-игра для добычи криптовалюты.

- **Мощность майнинга** - скорость добычи криптовалюты
- **Сложность** - параметр, влияющий на скорость добычи
- **Улучшения** - возможность улучшить майнер

```javascript
updateMiningProgress() {
  // Увеличиваем прогресс в зависимости от мощности
  const difficulty = this.miningDifficulty[this.miningCrypto];
  const progressIncrement = (this.miningPower / difficulty) * 100;
  
  this.miningProgress += progressIncrement;
  
  // Если достигли 100%, добываем криптовалюту
  if (this.miningProgress >= 100) {
    this.mineCrypto();
    this.miningProgress = 0;
  }
}
```

### Ежедневные бонусы

Игрок получает бонусы за ежедневный вход в игру.

- **Серия входов** - количество дней подряд, когда игрок заходил в игру
- **Бонусы** - награды за серию входов
- **Сброс** - серия сбрасывается, если игрок пропустил день

```javascript
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
```

### Реферальная система

Игрок может приглашать друзей и получать за это бонусы.

- **Реферальный код** - уникальный код для приглашения
- **Награды** - бонусы за приглашенных друзей
- **Статистика** - отслеживание количества приглашенных друзей

```javascript
handleReferral(referralCode) {
  if (this.user.referrals.includes(referralCode)) return;
  
  this.user.referrals.push(referralCode);
  this.user.stats.referralsCount += 1;
  
  const reward = getReferralReward(this.user.subscription);
  this.addCrypto('BTC', reward);
  
  analytics.track('referral_applied', { code: referralCode, reward });
  return this.saveUser();
}
```

### Бонусы

Временные усилители, которые увеличивают заработок.

- **Длительность** - время действия бонуса
- **Множитель** - коэффициент усиления
- **Кулдаун** - время до следующего бонуса

```javascript
activateBonus(bonusName, value, duration = null) {
  this.user.bonuses[bonusName] = {
    value,
    expiresAt: duration ? Date.now() + duration : null
  };
  
  analytics.track('bonus_activated', { bonusName, value, duration });
  return this.saveUser();
}
```

## Формулы и балансировка

### Заработок за тап

```
earnings = tapPower * cryptoMultiplier * bonusMultiplier * subscriptionMultiplier
```

- `tapPower` - базовая сила тапа (начинается с 1)
- `cryptoMultiplier` - множитель в зависимости от криптовалюты
- `bonusMultiplier` - множитель от активных бонусов
- `subscriptionMultiplier` - множитель от подписки

### Стоимость улучшений

```
upgradeCost = baseCost * (1.5 ^ upgradeLevel)
```

- `baseCost` - базовая стоимость улучшения
- `upgradeLevel` - текущий уровень улучшения

### Скорость майнинга

```
miningSpeed = miningPower / difficulty
```

- `miningPower` - мощность майнинга
- `difficulty` - сложность майнинга для конкретной криптовалюты

### Волатильность криптовалют

```
newRate = currentRate * (1 + (random * 2 - 1) * volatility)
```

- `currentRate` - текущий курс криптовалюты
- `random` - случайное число от 0 до 1
- `volatility` - волатильность криптовалюты

## Прогрессия

Игра построена на постепенном увеличении заработка и открытии новых возможностей:

1. **Начало игры**
   - Доступна только BTC
   - Базовая сила тапа = 1
   - Нет пассивного дохода

2. **Ранняя игра**
   - Открываются ETH и USDT
   - Покупка первых улучшений силы тапа
   - Разблокировка авто-таппера

3. **Средняя игра**
   - Открываются SOL, BNB и другие криптовалюты
   - Разблокировка крипто-майнера
   - Значительное увеличение силы тапа

4. **Поздняя игра**
   - Все криптовалюты доступны
   - Высокий пассивный доход
   - Фокус на оптимизации и максимизации заработка