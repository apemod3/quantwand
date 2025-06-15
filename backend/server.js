const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Keys
const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const COINGECKO_KEY = process.env.COINGECKO_API_KEY;
const FMP_KEY = process.env.FMP_API_KEY;

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'QuantWand API is running!', timestamp: new Date() });
});

// Stock price endpoint - Alpha Vantage
app.get('/api/stocks/price/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_KEY}`;
    
    const response = await axios.get(url);
    const data = response.data['Global Quote'];
    
    if (!data) {
      return res.status(404).json({ error: 'Stock not found' });
    }
    
    res.json({
      symbol: data['01. symbol'],
      price: parseFloat(data['05. price']),
      change: parseFloat(data['09. change']),
      changePercent: data['10. change percent'],
      volume: parseInt(data['06. volume']),
      latestTradingDay: data['07. latest trading day']
    });
  } catch (error) {
    console.error('Error fetching stock price:', error);
    res.status(500).json({ error: 'Failed to fetch stock price' });
  }
});

// Crypto price endpoint - CoinGecko
app.get('/api/crypto/price/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd&include_24hr_change=true&${COINGECKO_KEY}`;
    
    const response = await axios.get(url);
    const data = response.data[id];
    
    if (!data) {
      return res.status(404).json({ error: 'Crypto not found' });
    }
    
    res.json({
      id,
      price: data.usd,
      change24h: data.usd_24h_change
    });
  } catch (error) {
    console.error('Error fetching crypto price:', error);
    res.status(500).json({ error: 'Failed to fetch crypto price' });
  }
});

// Financial statements endpoint - FMP
app.get('/api/financials/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const url = `https://financialmodelingprep.com/api/v3/income-statement/${symbol}?limit=5&apikey=${FMP_KEY}`;
    
    console.log('Fetching from URL:', url); // Add this for debugging
    
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching financials:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch financial data' });
  }
});

// Portfolio optimization endpoint (placeholder for now)
app.post('/api/portfolio/optimize', async (req, res) => {
  try {
    const { assets, constraints } = req.body;
    
    // TODO: Implement Modern Portfolio Theory optimization
    // For now, return equal weight portfolio
    const equalWeight = 1 / assets.length;
    const optimizedWeights = assets.map(asset => ({
      symbol: asset,
      weight: equalWeight
    }));
    
    res.json({
      optimizedWeights,
      expectedReturn: 0.08, // Placeholder
      risk: 0.15, // Placeholder
      sharpeRatio: 0.53 // Placeholder
    });
  } catch (error) {
    console.error('Error optimizing portfolio:', error);
    res.status(500).json({ error: 'Failed to optimize portfolio' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`QuantWand API running on http://localhost:${PORT}`);
});