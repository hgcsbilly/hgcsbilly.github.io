async function fetchTickers() {
    try {
        const response = await fetch('https://api.binance.com/api/v3/ticker/price');
        const tickers = await response.json();
        return tickers.filter(ticker => ticker.symbol.endsWith('USDT')).map(ticker => ticker.symbol);
    } catch (error) {
        console.error('Error al obtener tickers:', error);
    }
}

async function fetchKlines(ticker) {
    try {
        const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${ticker}&interval=15m&limit=1`);
        const klines = await response.json();
        return klines;
    } catch (error) {
        console.error(`Error al obtener klines para ${ticker}:`, error);
    }
}

async function analyzeTickers() {
    const tickers = await fetchTickers();
    const results = [];

    for (const ticker of tickers) {
        const klines = await fetchKlines(ticker);
        if (klines && klines.length > 0) {
            const oldClose = parseFloat(klines[0][1]);
            const newClose = parseFloat(klines[0][4]);
            const percentage = ((newClose - oldClose) / oldClose * 100).toFixed(2);
            results.push({ ticker, oldClose, newClose, percentage });
        }
    }

    return results.sort((a, b) => b.percentage - a.percentage);
}

async function displayResults() {
    const results = await analyzeTickers();
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = results.map(result => `
        <p>TICK: ${result.ticker} OLD: ${result.oldClose} NEW: ${result.newClose} PORCENTAJE: ${result.percentage}%</p>
    `).join('');
}

document.addEventListener('DOMContentLoaded', displayResults);
