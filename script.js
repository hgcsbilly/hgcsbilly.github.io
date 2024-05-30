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

const calculateSMMA = (values, period) => {
    let smma = [];
    let smaSum = 0;

    // Calcular el primer valor de SMMA como SMA
    for (let i = 0; i < period; i++) {
        smaSum += values[i].value;
    }
    smma.push({ value: smaSum / period, time: values[period - 1].time });

    // Calcular los siguientes valores de SMMA
    for (let i = period; i < values.length; i++) {
        const previousSMMA = smma[smma.length - 1].value;
        const currentSMMA = ((previousSMMA * (period - 1)) + values[i].value) / period;
        smma.push({ value: currentSMMA, time: values[i].time });
    }

    return smma;
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
        const rsi = calculateRSI(prices, 14);
        const smoothedRSI = calculateSMMA(rsi, 14);
        const latestRSI = rsi.slice(-1)[0];
        const latestSmoothedRSI = smoothedRSI.slice(-1)[0];
        const price = prices.slice(-1)[0].close;
        const lastCross = new Date(latestRSI.time).toLocaleString();

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${symbol}</td>
            <td>${price.toFixed(2)}</td>
            <td>${latestRSI.value.toFixed(2)}</td>
            <td>${latestSmoothedRSI.value.toFixed(2)}</td>
            <td>${(latestRSI.value > latestSmoothedRSI.value ? 'Sí' : 'No')}</td>
            <td>${lastCross}</td>
        `;

        if (latestRSI.value > latestSmoothedRSI.value) {
            overboughtTable.appendChild(row);
        } else {
            oversoldTable.appendChild(row);
        }
    }
};

updateTables();
setInterval(updateTables, 60000); // Update every minute
