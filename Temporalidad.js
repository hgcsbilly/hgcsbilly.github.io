// server.js
const express = require('express');
const { default: axios } = require('axios');
const app = express();
const port = 3000;

app.get('/api/tickers', async (req, res) => {
    try {
        const response = await axios.get('https://api.binance.com/api/v3/ticker/price');
        const tickers = response.data.filter(ticker => ticker.symbol.endsWith('USDT'));
        res.json(tickers);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener tickers');
    }
});

app.get('/api/klines', async (req, res) => {
    const { symbol } = req.query;
    try {
        const response = await axios.get(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=15m&limit=1`);
        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener klines');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
