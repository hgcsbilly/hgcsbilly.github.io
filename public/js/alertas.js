const variacion = 5;
const variacion_100 = 7;
const variacionfast = 2;

const wsUrl = 'wss://fstream.binance.com/ws';
const ticks = [];
const klines = {};

function humanFormat(volume) {
  const units = ['', 'K', 'M', 'G', 'T', 'P'];
  let magnitude = 0;

  while (Math.abs(volume) >= 1000) {
    magnitude++;
    volume /= 1000.0;
  }

  return volume.toFixed(2) + units[magnitude];
}

function calcularVariacion(inicial, final) {
  return ((final - inicial) / inicial) * 100;
}

function checkVariations() {
  const alertsContainer = document.getElementById('alerts');
  alertsContainer.innerHTML = '';

  ticks.forEach((tick) => {
    const tickKlines = klines[tick];

    if (tickKlines && tickKlines.length > 0) {
      const initialPrice = parseFloat(tickKlines[0].c);
      const finalPrice = parseFloat(tickKlines[tickKlines.length - 1].c);

      const variation = calcularVariacion(initialPrice, finalPrice);

      if (variation >= variacion) {
        const alert = document.createElement('li');
        alert.textContent = `LONG: ${tick} - Variación: ${variation.toFixed(2)}%`;
        alertsContainer.appendChild(alert);
      } else if (variation <= -variacion) {
        const alert = document.createElement('li');
        alert.textContent = `SHORT: ${tick} - Variación: ${variation.toFixed(2)}%`;
        alertsContainer.appendChild(alert);
      }

      if (tickKlines.length >= 3) {
        const initialFastPrice = parseFloat(tickKlines[tickKlines.length - 3].c);
        const finalFastPrice = parseFloat(tickKlines[tickKlines.length - 1].c);
        const fastVariation = calcularVariacion(initialFastPrice, finalFastPrice);

        if (fastVariation >= variacionfast) {
          const alert = document.createElement('li');
          alert.textContent = `FAST: ${tick} - Variación: ${fastVariation.toFixed(2)}%`;
          alertsContainer.appendChild(alert);
        }
      }
    }
  });
}

function startWebSocket() {
  const ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    ws.send(
      JSON.stringify({
        method: 'SUBSCRIBE',
        params: ['!ticker@arr'],
        id: 1,
      })
    );
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (Array.isArray(data)) {
      data.forEach((tick) => {
        if (tick.s.endsWith('USDT')) {
          if (!ticks.includes(tick.s)) {
            ticks.push(tick.s);
          }
        }
      });
    } else if (data.k) {
      const { s: symbol, k: kline } = data;
      if (!klines[symbol]) {
        klines[symbol] = [];
      }
      klines[symbol].push(kline);
      if (klines[symbol].length > 30) {
        klines[symbol].shift();
      }
    }
  };

  setInterval(checkVariations, 30000);
}

document.addEventListener('DOMContentLoaded', startWebSocket);
