const apiUrl = "https://api.binance.com/api/v3/klines";
const symbols = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "SOLUSDT", "DOTUSDT", "LTCUSDT", "BCHUSDT"];
const interval = "1h";

const fetchData = async (symbol) => {
    const response = await fetch(`${apiUrl}?symbol=${symbol}&interval=${interval}&limit=100`);
    const data = await response.json();
    return data.map(d => parseFloat(d[4])); // closing prices
};

const calculateSMA = (prices, period) => {
    let sma = [];
    for (let i = 0; i <= prices.length - period; i++) {
        const sum = prices.slice(i, i + period).reduce((a, b) => a + b, 0);
        sma.push(sum / period);
    }
    return sma;
};

const calculateRSI = (prices, period) => {
    let gains = [];
    let losses = [];
    for (let i = 1; i < prices.length; i++) {
        const change = prices[i] - prices[i - 1];
        if (change > 0) {
            gains.push(change);
            losses.push(0);
        } else {
            gains.push(0);
            losses.push(-change);
        }
    }
    const avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
    const avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;
    let rs = avgGain / avgLoss;
    let rsi = [100 - (100 / (1 + rs))];
    for (let i = period; i < gains.length; i++) {
        rs = ((avgGain * (period - 1)) + gains[i]) / ((avgLoss * (period - 1)) + losses[i]);
        rsi.push(100 - (100 / (1 + rs)));
    }
    return rsi;
};

const createChart = (ctx, labels, data1, data2, label1, label2) => {
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: label1,
                    data: data1,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    fill: false
                },
                {
                    label: label2,
                    data: data2,
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 1,
                    fill: false
                }
            ]
        },
        options: {
            scales: {
                x: {
                    display: false
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });
};

const updateTables = async () => {
    const overboughtTable = document.querySelector("#overboughtTable tbody");
    const oversoldTable = document.querySelector("#oversoldTable tbody");

    overboughtTable.innerHTML = "";
    oversoldTable.innerHTML = "";

    for (const symbol of symbols) {
        const prices = await fetchData(symbol);
        const sma = calculateSMA(prices, 14).slice(-1)[0];
        const rsi = calculateRSI(prices, 14).slice(-1)[0];
        const price = prices.slice(-1)[0];

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${symbol}</td>
            <td>${price.toFixed(2)}</td>
            <td>${rsi.toFixed(2)}</td>
            <td>${sma.toFixed(2)}</td>
            <td>${(rsi > sma ? 'Sí' : 'No')}</td>
            <td><canvas id="${symbol}" class="chart-container"></canvas></td>
        `;

        const ctx = row.querySelector("canvas").getContext("2d");
        createChart(ctx, Array.from({ length: 100 }, (_, i) => i + 1), calculateRSI(prices, 14), calculateSMA(prices, 14), 'RSI', 'SMA');

        if (rsi > sma) {
            overboughtTable.appendChild(row);
        } else {
            oversoldTable.appendChild(row);
        }
    }
};

updateTables();
setInterval(updateTables, 60000); // Update every minute
