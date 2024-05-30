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

    const fetchCoins = () => {
        fetch('https://api.binance.com/api/v3/ticker/price')
            .then(response => response.json())
            .then(data => {
                const usdtCoins = data.filter(coin => coin.symbol.endsWith('USDT'));
                usdtCoins.forEach(coin => {
                    const listItem = document.createElement('li');
                    listItem.textContent = `${coin.symbol}: ${coin.price}`;
                    listItem.dataset.symbol = coin.symbol;
                    listItem.addEventListener('click', () => fetchChartData(coin.symbol));
                    coinsList.appendChild(listItem);
                });
            });
    };

    const fetchChartData = (symbol) => {
        fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1d&limit=100`)
            .then(response => response.json())
            .then(data => {
                const prices = data.map(entry => parseFloat(entry[4]));
                const rsi = calculateRSI(prices);

                if (chart) {
                    chart.destroy();
                }

                chart = new Chart(chartCtx, {
                    type: 'line',
                    data: {
                        labels: data.map((_, index) => index + 1),
                        datasets: [{
                            label: `${symbol} Price`,
                            data: prices,
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1,
                            fill: false
                        }]
                    },
                    options: {
                        scales: {
                            x: {
                                display: true,
                                title: {
                                    display: true,
                                    text: 'Días'
                                }
                            },
                            y: {
                                display: true,
                                title: {
                                    display: true,
                                    text: 'Precio'
                                }
                            }
                        }
                    }
                });
            });
    };

    fetchCoins();
});
