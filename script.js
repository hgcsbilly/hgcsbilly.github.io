const apiUrl = "https://api.binance.com/api/v3/klines";
let symbols = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "SOLUSDT", "DOTUSDT", "LTCUSDT", "BCHUSDT"];
const interval = "1h";

const fetchData = async (symbol) => {
    const response = await fetch(`${apiUrl}?symbol=${symbol}&interval=${interval}&limit=100`);
    const data = await response.json();
    return data.map(d => ({ close: parseFloat(d[4]), time: d[6] })); // closing prices and timestamps
};

const calculateSMA = (prices, period) => {
    let sma = [];
    for (let i = 0; i <= prices.length - period; i++) {
        const sum = prices.slice(i, i + period).reduce((a, b) => a + b.close, 0);
        sma.push({ value: sum / period, time: prices[i + period - 1].time });
    }
    return sma;
};

const calculateRSI = (prices, period) => {
    let gains = [];
    let losses = [];
    for (let i = 1; i < prices.length; i++) {
        const change = prices[i].close - prices[i - 1].close;
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
    let rsi = [{ value: 100 - (100 / (1 + rs)), time: prices[period].time }];
    for (let i = period; i < gains.length; i++) {
        rs = ((avgGain * (period - 1)) + gains[i]) / ((avgLoss * (period - 1)) + losses[i]);
        rsi.push({ value: 100 - (100 / (1 + rs)), time: prices[i].time });
    }
    return rsi;
};

const addPair = () => {
    const pairInput = document.getElementById('pair-input');
    const newPair = pairInput.value.toUpperCase();
    if (newPair && !symbols.includes(newPair)) {
        symbols.push(newPair);
        updateTables();
    }
    pairInput.value = '';
};

const updateTables = async () => {
    const overboughtTable = document.querySelector("#overboughtTable tbody");
    const oversoldTable = document.querySelector("#oversoldTable tbody");

    overboughtTable.innerHTML = "";
    oversoldTable.innerHTML = "";

    for (const symbol of symbols) {
        const prices = await fetchData(symbol);
        const sma = calculateSMA(prices, 14);
        const rsi = calculateRSI(prices, 14);
        const latestSMA = sma.slice(-1)[0];
        const latestRSI = rsi.slice(-1)[0];
        const price = prices.slice(-1)[0].close;

        const row = document.createElement("tr");
        const lastCross = new Date(latestSMA.time).toLocaleString();

        row.innerHTML = `
            <td>${symbol}</td>
            <td>${price.toFixed(2)}</td>
            <td>${latestRSI.value.toFixed(2)}</td>
            <td>${latestSMA.value.toFixed(2)}</td>
            <td>${(latestRSI.value > latestSMA.value ? 'Sí' : 'No')}</td>
            <td>${lastCross}</td>
        `;

        if (latestRSI.value > latestSMA.value) {
            overboughtTable.appendChild(row);
        } else {
            oversoldTable.appendChild(row);
        }
    }
};

updateTables();
setInterval(updateTables, 60000); // Update every minute
