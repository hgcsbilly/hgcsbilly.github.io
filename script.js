document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    const coinsList = document.getElementById('coins-list');
    const chartCtx = document.getElementById('chart').getContext('2d');
    let chart;

    const calculateRSI = (prices) => {
        let gains = 0;
        let losses = 0;

        for (let i = 1; i < prices.length; i++) {
            const difference = prices[i] - prices[i - 1];
            if (difference >= 0) {
                gains += difference;
            } else {
                losses -= difference;
            }
        }

        const averageGain = gains / prices.length;
        const averageLoss = losses / prices.length;

        const rs = averageGain / averageLoss;
        const rsi = 100 - (100 / (1 + rs));

        return rsi;
    };

    const fetchFuturesCoins = () => {
        fetch('https://fapi.binance.com/fapi/v1/ticker/price')
            .then(response => response.json())
            .then(data => {
                const usdtFuturesCoins = data.filter(coin => coin.symbol.endsWith('USDT'));
                usdtFuturesCoins.forEach(coin => {
                    const listItem = document.createElement('li');
                    listItem.textContent = `${coin.symbol}: Precio: ${coin.price}`;
                    listItem.dataset.symbol = coin.symbol;
                    coinsList.appendChild(listItem);
                });
                setInterval(updatePrices, 60000); // Actualizar precios cada minuto
            });
    };

    const updatePrices = () => {
        fetch('https://fapi.binance.com/fapi/v1/ticker/price')
            .then(response => response.json())
            .then(data => {
                const usdtFuturesCoins = data.filter(coin => coin.symbol.endsWith('USDT'));
                const coinsContainer = document.getElementById('coins-list');
                coinsContainer.innerHTML = ''; // Limpiar la lista antes de actualizar

                const overboughtContainer = document.createElement('div');
                overboughtContainer.classList.add('overbought-container');

                const oversoldContainer = document.createElement('div');
                oversoldContainer.classList.add('oversold-container');

                usdtFuturesCoins.forEach(coin => {
                    const rsi = calculateRSI(getRandomPrices()); // Obtener un valor aleatorio para RSI (para fines de demostración)
                    const listItem = document.createElement('li');
                    listItem.textContent = `${coin.symbol}: Precio: ${coin.price}, RSI: ${rsi.toFixed(2)}`;
                    listItem.dataset.symbol = coin.symbol;
                    if (rsi >= 50) {
                        overboughtContainer.appendChild(listItem);
                    } else {
                        oversoldContainer.appendChild(listItem);
                    }
                });

                coinsContainer.appendChild(overboughtContainer);
                coinsContainer.appendChild(oversoldContainer);
            });
    };

    fetchFuturesCoins();
});

// Función para obtener precios aleatorios (para fines de demostración)
const getRandomPrices = () => {
    const prices = [];
    for (let i = 0; i < 100; i++) {
        prices.push(Math.random() * 1000);
    }
    return prices;
};
