javascript
export class PaymentService {
  constructor(userService, telegramWebApp) {
    this.userService = userService;
    this.telegramWebApp = telegramWebApp;
    this.subscriptionPlans = this.getSubscriptionPlans();
    this.paymentProviders = this.initPaymentProviders();
  }

  getSubscriptionPlans() {
    return [
      {
        id: 'basic',
        name: 'Basic',
        price: 5,
        duration: 30, // days
        benefits: [
          '+10% к заработку',
          'Ежедневный бонус',
          'Без рекламы'
        ],
        features: {
          earningsMultiplier: 1.1,
          dailyBonus: 10,
          noAds: true
        }
      },
      {
        id: 'pro',
        name: 'Pro',
        price: 15,
        duration: 30,
        benefits: [
          '+30% к заработку',
          'Ежедневный бонус x2',
          'Эксклюзивные криптовалюты',
          'Без рекламы'
        ],
        features: {
          earningsMultiplier: 1.3,
          dailyBonus: 20,
          noAds: true,
          exclusiveCryptos: ['DOGE', 'ADA']
        }
      },
      {
        id: 'premium',
        name: 'Premium',
        price: 30,
        duration: 30,
        benefits: [
          '+50% к заработку',
          'Ежедневный бонус x3',
          'Все эксклюзивные криптовалюты',
          'Приоритетная поддержка',
          'Без рекламы'
        ],
        features: {
          earningsMultiplier: 1.5,
          dailyBonus: 30,
          noAds: true,
          exclusiveCryptos: ['DOGE', 'ADA', 'XRP'],
          prioritySupport: true
        }
      }
    ];
  }

  initPaymentProviders() {
    return {
      telegram: {
        processPayment: async (planId, userId) => {
          if (!this.telegramWebApp) {
            console.error('Telegram WebApp not available');
            return false;
          }

          const plan = this.getPlanById(planId);
          if (!plan) return false;

          // В реальном приложении здесь должен быть запрос к вашему бэкенду
          // для создания инвойса. Это примерная реализация:
          const invoiceUrl = `https://your-backend.com/create-invoice?plan=${planId}&user=${userId}`;
          
          return new Promise((resolve) => {
            this.telegramWebApp.openInvoice(invoiceUrl, (status) => {
              resolve(status === 'paid');
            });
          });
        }
      },
      stripe: {
        processPayment: async (planId, userEmail) => {
          // Реализация через Stripe.js
          // В реальном приложении здесь должен быть запрос к вашему бэкенду
          console.log(`Processing Stripe payment for plan ${planId}`);
          return true; // Заглушка для демонстрации
        }
      },
      crypto: {
        processPayment: async (planId, walletAddress) => {
          // Реализация приема криптовалюты
          console.log(`Processing Crypto payment for plan ${planId}`);
          return true; // Заглушка для демонстрации
        }
      }
    };
  }

  getPlanById(planId) {
    return this.subscriptionPlans.find(plan => plan.id === planId);
  }

  async purchaseSubscription(planId, paymentMethod = 'telegram') {
    const plan = this.getPlanById(planId);
    if (!plan) {
      throw new Error('Subscription plan not found');
    }

    const userId = this.userService.getUserId();
    if (!userId) {
      throw new Error('User not identified');
    }

    const provider = this.paymentProviders[paymentMethod];
    if (!provider) {
      throw new Error('Payment provider not supported');
    }

    let paymentSuccessful = false;

    try {
      switch (paymentMethod) {
        case 'telegram':
          paymentSuccessful = await provider.processPayment(planId, userId);
          break;
        case 'stripe':
          const userEmail = this.userService.getUserEmail();
          paymentSuccessful = await provider.processPayment(planId, userEmail);
          break;
        case 'crypto':
          const walletAddress = this.userService.getWalletAddress();
          paymentSuccessful = await provider.processPayment(planId, walletAddress);
          break;
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      throw new Error('Payment processing failed');
    }

    if (paymentSuccessful) {
      this.activateSubscription(plan);
      return true;
    }

    return false;
  }

  activateSubscription(plan) {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + plan.duration);

    this.userService.updateSubscription({
      planId: plan.id,
      expirationDate: expirationDate.toISOString(),
      features: plan.features
    });

    // Разблокируем эксклюзивные криптовалюты
    if (plan.features.exclusiveCryptos) {
      plan.features.exclusiveCryptos.forEach(crypto => {
        this.userService.unlockCrypto(crypto);
      });
    }
  }

  checkSubscriptionStatus() {
    const subscription = this.userService.getSubscription();
    if (!subscription) return false;

    const now = new Date();
    const expirationDate = new Date(subscription.expirationDate);

    if (now > expirationDate) {
      this.userService.cancelSubscription();
      return false;
    }

    return true;
  }

  getRemainingSubscriptionDays() {
    const subscription = this.userService.getSubscription();
    if (!subscription) return 0;

    const now = new Date();
    const expirationDate = new Date(subscription.expirationDate);
    const diffTime = expirationDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  }

  async processDonation(amount, currency = 'USD', paymentMethod = 'telegram') {
    const provider = this.paymentProviders[paymentMethod];
    if (!provider) {
      throw new Error('Payment provider not supported');
    }

    // В реальном приложении здесь должен быть запрос к вашему бэкенду
    console.log(`Processing donation of ${amount} ${currency}`);
    return true; // Заглушка для демонстрации
  }

  getPaymentHistory() {
    return this.userService.getPaymentHistory() || [];
  }

  async requestRefund(paymentId) {
    // В реальном приложении здесь должен быть запрос к вашему бэкенду
    console.log(`Requesting refund for payment ${paymentId}`);
    return true; // Заглушка для демонстрации
  }
}