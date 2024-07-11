async function fetchTickers() {
    try {
        const response = await fetch('https://api.binance.com/api/v3/ticker/price');
        const tickers = await response.json();
        return tickers.filter(ticker => ticker.symbol.endsWith('USDT')).map(ticker => ticker.symbol);
    } catch (error) {
        console.error('Error al obtener tickers:', error);
    }
}

async function fetchKlines(ticker, interval) {
    try {
        const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${ticker}&interval=${interval}&limit=1`);
        const klines = await response.json();
        return klines;
    } catch (error) {
        console.error(`Error al obtener klines para ${ticker}:`, error);
    }
}

async function analyzeTickers(interval) {
    const tickers = await fetchTickers();
    const results = [];

    for (let i = 0; i < tickers.length; i++) {
        const ticker = tickers[i];
        const klines = await fetchKlines(ticker, interval);
        if (klines && klines.length > 0) {
            const oldClose = parseFloat(klines[0][1]);
            const newClose = parseFloat(klines[0][4]);
            const percentage = ((newClose - oldClose) / oldClose * 100).toFixed(2);
            results.push({ ticker, oldClose, newClose, percentage });
        }

        // Update progress bar
        updateProgressBar((i + 1) / tickers.length * 100);
    }

    return results.sort((a, b) => b.percentage - a.percentage);
}

async function displayResults() {
    const interval = document.getElementById('interval').value;
    const results = await analyzeTickers(interval);

    // Display number of analyzed coins
    document.getElementById('coin-count').textContent = `Number of analyzed coins: ${results.length}`;

    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = results.map(result => `
        <p>TICK: ${result.ticker} OLD: ${result.oldClose} NEW: ${result.newClose} PORCENTAJE: ${result.percentage}%</p>
    `).join('');

    // Hide progress bar after completion
    document.getElementById('progress-bar').style.display = 'none';
}

function updateProgressBar(percentage) {
    const progressBar = document.getElementById('progress-bar');
    progressBar.style.display = 'block';
    progressBar.style.width = `${percentage}%`;
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('interval').addEventListener('change', displayResults);
    displayResults();
});
