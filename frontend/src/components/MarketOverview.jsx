import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Bitcoin, Euro, Loader2 } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'https://quantwand.onrender.com/api';

function MarketOverview() {
  const [marketData, setMarketData] = useState({
    stocks: [],
    crypto: [],
    loading: true,
    error: null
  });

  const watchlist = {
    stocks: ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN'],
    crypto: ['bitcoin', 'ethereum', 'binancecoin', 'cardano', 'solana']
  };

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchMarketData = async () => {
    try {
      // Fetch stock data
      const stockPromises = watchlist.stocks.map(symbol => 
        axios.get(`${API_BASE}/stocks/price/${symbol}`)
          .then(res => res.data)
          .catch(err => ({ symbol, error: true }))
      );

      // Fetch crypto data
      const cryptoPromises = watchlist.crypto.map(id => 
        axios.get(`${API_BASE}/crypto/price/${id}`)
          .then(res => res.data)
          .catch(err => ({ id, error: true }))
      );

      const [stocks, crypto] = await Promise.all([
        Promise.all(stockPromises),
        Promise.all(cryptoPromises)
      ]);

      setMarketData({
        stocks: stocks.filter(s => !s.error),
        crypto: crypto.filter(c => !c.error),
        loading: false,
        error: null
      });
    } catch (error) {
      setMarketData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to fetch market data'
      }));
    }
  };

  if (marketData.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-bloomberg-orange" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Market Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-bloomberg-gray p-4 rounded border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">S&P 500</p>
              <p className="text-2xl font-bold">4,783.24</p>
              <p className="text-green-400 text-sm flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +1.23%
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-bloomberg-orange" />
          </div>
        </div>

        <div className="bg-bloomberg-gray p-4 rounded border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">EUR/USD</p>
              <p className="text-2xl font-bold">1.0934</p>
              <p className="text-red-400 text-sm flex items-center">
                <TrendingDown className="w-4 h-4 mr-1" />
                -0.15%
              </p>
            </div>
            <Euro className="w-8 h-8 text-bloomberg-orange" />
          </div>
        </div>

        <div className="bg-bloomberg-gray p-4 rounded border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">BTC/USD</p>
              <p className="text-2xl font-bold">52,147</p>
              <p className="text-green-400 text-sm flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +3.47%
              </p>
            </div>
            <Bitcoin className="w-8 h-8 text-bloomberg-orange" />
          </div>
        </div>
      </div>

      {/* Stocks Table */}
      <div className="bg-bloomberg-gray rounded border border-gray-800">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-bloomberg-orange" />
            Stock Watchlist
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-700">
              <tr className="text-left text-sm text-gray-400">
                <th className="p-4">Symbol</th>
                <th className="p-4">Price</th>
                <th className="p-4">Change</th>
                <th className="p-4">Change %</th>
                <th className="p-4">Volume</th>
              </tr>
            </thead>
            <tbody>
              {marketData.stocks.map((stock, idx) => (
                <tr key={stock.symbol} className="border-b border-gray-700 hover:bg-gray-800">
                  <td className="p-4 font-medium">{stock.symbol}</td>
                  <td className="p-4 font-mono">${stock.price?.toFixed(2) || 'N/A'}</td>
                  <td className={`p-4 font-mono ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {stock.change >= 0 ? '+' : ''}{stock.change?.toFixed(2) || 'N/A'}
                  </td>
                  <td className={`p-4 font-mono ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {stock.changePercent || 'N/A'}
                  </td>
                  <td className="p-4 font-mono text-sm">
                    {stock.volume ? (stock.volume / 1000000).toFixed(2) + 'M' : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Crypto Table */}
      <div className="bg-bloomberg-gray rounded border border-gray-800">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold flex items-center">
            <Bitcoin className="w-5 h-5 mr-2 text-bloomberg-orange" />
            Crypto Watchlist
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-700">
              <tr className="text-left text-sm text-gray-400">
                <th className="p-4">Asset</th>
                <th className="p-4">Price</th>
                <th className="p-4">24h Change</th>
              </tr>
            </thead>
            <tbody>
              {marketData.crypto.map((crypto) => (
                <tr key={crypto.id} className="border-b border-gray-700 hover:bg-gray-800">
                  <td className="p-4 font-medium capitalize">{crypto.id}</td>
                  <td className="p-4 font-mono">${crypto.price?.toLocaleString() || 'N/A'}</td>
                  <td className={`p-4 font-mono ${crypto.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {crypto.change24h >= 0 ? '+' : ''}{crypto.change24h?.toFixed(2) || 'N/A'}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default MarketOverview;