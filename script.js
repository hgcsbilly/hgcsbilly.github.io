document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    const coinsList = document.getElementById('coins-list');
    const chartCtx = document.getElementById('chart').getContext('2d');
    let chart;

    const fetchFuturesCoins = () => {
        fetch('https://fapi.binance.com/fapi/v1/ticker/price')
            .then(response => response.json())
            .then(data => {
                const usdtFuturesCoins = data.filter(coin => coin.symbol.endsWith('USDT'));
                usdtFuturesCoins.forEach(coin => {
                    const listItem = document.createElement('li');
                    listItem.textContent = `${coin.symbol}: Precio: ${coin.price}`;
                    listItem.dataset.symbol = coin.symbol;
                    listItem.addEventListener('click', () => fetchChartData(coin.symbol));
                    coinsList.appendChild(listItem);
                });
            });
    };

    const fetchChartData = (symbol) => {
        fetch(`https://fapi.binance.com/fapi/v1/klines?symbol=${symbol}&interval=1d&limit=100`)
            .then(response => response.json())
            .then(data => {
                const candles = data.map(entry => ({
                    t: entry[0], // timestamp
                    o: parseFloat(entry[1]), // open
                    h: parseFloat(entry[2]), // high
                    l: parseFloat(entry[3]), // low
                    c: parseFloat(entry[4]) // close
                }));

                if (chart) {
                    chart.destroy();
                }

                chart = new Chart(chartCtx, {
                    type: 'candlestick',
                    data: {
                        datasets: [{
                            label: `${symbol} Candlestick`,
                            data: candles,
                            borderColor: 'rgba(255, 99, 132, 1)',
                            borderWidth: 1,
                            fill: false
                        }]
                    },
                    options: {
                        scales: {
                            x: {
                                type: 'time',
                                time: {
                                    unit: 'day'
                                }
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: 'Price'
                                }
                            }
                        }
                    }
                });
            });
    };

    fetchFuturesCoins();
});
