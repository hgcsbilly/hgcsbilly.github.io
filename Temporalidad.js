document.addEventListener('DOMContentLoaded', () => {
    const toggleThemeBtn = document.getElementById('toggle-theme');
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);

    toggleThemeBtn.textContent = currentTheme === 'dark' ? 'Modo Claro' : 'Modo Oscuro';

    toggleThemeBtn.addEventListener('click', () => {
        const newTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        toggleThemeBtn.textContent = newTheme === 'dark' ? 'Modo Claro' : 'Modo Oscuro';
    });

    displayResults();
});

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

    return results;
}

async function displayResults() {
    const results = await analyzeTickers();
    const resultsDiv = document.getElementById('results');
    
    let table = `
        <table>
            <thead>
                <tr>
                    <th data-sort="ticker">TICK</th>
                    <th data-sort="oldClose">OLD</th>
                    <th data-sort="newClose">NEW</th>
                    <th data-sort="percentage">PORCENTAJE</th>
                </tr>
            </thead>
            <tbody>
                ${results.map(result => `
                    <tr>
                        <td>${result.ticker}</td>
                        <td>${result.oldClose}</td>
                        <td>${result.newClose}</td>
                        <td>${result.percentage}%</td>
                    </tr>`).join('')}
            </tbody>
        </table>
    `;

    resultsDiv.innerHTML = table;

    document.querySelectorAll('th').forEach(header => {
        header.addEventListener('click', () => {
            const sortBy = header.getAttribute('data-sort');
            sortTable(resultsDiv.querySelector('table'), sortBy);
        });
    });
}

function sortTable(table, sortBy) {
    const rows = Array.from(table.querySelector('tbody').rows);
    const isNumeric = ['oldClose', 'newClose', 'percentage'].includes(sortBy);
    const compare = (a, b) => {
        const aValue = a.cells.namedItem(sortBy).textContent;
        const bValue = b.cells.namedItem(sortBy).textContent;
        return isNumeric ? parseFloat(aValue) - parseFloat(bValue) : aValue.localeCompare(bValue);
    };
    rows.sort(compare);

    const tbody = table.querySelector('tbody');
    tbody.innerHTML = '';
    rows.forEach(row => tbody.appendChild(row));
}
