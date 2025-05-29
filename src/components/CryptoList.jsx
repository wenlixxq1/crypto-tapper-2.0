jsx
import React, { useState, useEffect } from 'react';
import '../styles/CryptoList.css';

const CryptoList = ({ onTap, balance }) => {
  const [coins, setCoins] = useState([
    { id: 'btc', name: 'Bitcoin', symbol: 'BTC', value: 0, price: 0 },
    { id: 'eth', name: 'Ethereum', symbol: 'ETH', value: 0, price: 0 },
    { id: 'ton', name: 'Toncoin', symbol: 'TON', value: 0, price: 0 },
    { id: 'usdt', name: 'Tether', symbol: 'USDT', value: 0, price: 1 }
  ]);

  // Загрузка данных о ценах (заглушка)
  useEffect(() => {
    const fetchPrices = async () => {
      // В реальном приложении здесь будет API запрос
      const updatedCoins = coins.map(coin => {
        let price = coin.price;
        if (coin.id !== 'usdt') {
          price = Math.random() * 30000 + 10000; // Рандомная цена для демонстрации
        }
        return { ...coin, price: parseFloat(price.toFixed(2)) };
      });
      setCoins(updatedCoins);
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 30000); // Обновление цен каждые 30 сек

    return () => clearInterval(interval);
  }, []);

  // Загрузка сохраненного состояния
  useEffect(() => {
    const savedState = localStorage.getItem('crypto-tapper-state');
    if (savedState) {
      const { coins: savedCoins } = JSON.parse(savedState);
      setCoins(prevCoins => 
        prevCoins.map(coin => {
          const savedCoin = savedCoins.find(c => c.id === coin.id);
          return savedCoin ? { ...coin, value: savedCoin.value } : coin;
        })
      );
    }
  }, []);

  const handleTap = (coinId) => {
    setCoins(prevCoins => 
      prevCoins.map(coin => 
        coin.id === coinId 
          ? { ...coin, value: coin.value + 1 }
          : coin
      )
    );
    
    const tappedCoin = coins.find(c => c.id === coinId);
    if (tappedCoin && onTap) {
      onTap(tappedCoin.price * 0.1); // Начисляем 10% от цены
    }

    // Тактильная отдача в Telegram
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
  };

  return (
    <div className="crypto-list">
      <div className="balance-display">
        Ваш баланс: <span className="balance-amount">${balance.toFixed(2)}</span>
      </div>
      
      {coins.map(coin => (
        <div key={coin.id} className="crypto-item">
          <div className="crypto-info">
            <div className="crypto-name">
              <span className="crypto-symbol">{coin.symbol}</span>
              {coin.name}
            </div>
            <div className="crypto-price">${coin.price.toFixed(2)}</div>
          </div>
          
          <div className="crypto-stats">
            <div className="tap-count">Тапов: {coin.value}</div>
            <button 
              className="tap-button"
              onClick={() => handleTap(coin.id)}
            >
              ТАПНУТЬ
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CryptoList;