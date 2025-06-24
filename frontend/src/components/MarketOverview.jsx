import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Bitcoin, Euro, Loader2, Plus, X, Settings, RefreshCw } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

function MarketOverview() {
  // Load watchlist from localStorage or use defaults
  const getInitialWatchlist = () => {
    const saved = localStorage.getItem('quantwand-watchlist');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      stocks: ['AAPL', 'GOOGL', 'MSFT'],  // Reduced to 3 to avoid rate limits
      crypto: ['bitcoin', 'ethereum', 'binancecoin', 'cardano', 'solana']
    };
  };

  const [watchlist, setWatchlist] = useState(getInitialWatchlist());
  const [marketData, setMarketData] = useState({
    stocks: [],
    crypto: [],
    loading: true,
    error: null
  });
  const [showSettings, setShowSettings] = useState(false);
  const [newStock, setNewStock] = useState('');
  const [newCrypto, setNewCrypto] = useState('');
  const [fetchingSymbol, setFetchingSymbol] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Save watchlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('quantwand-watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  // Fetch data when component mounts
  useEffect(() => {
    fetchMarketData();
  }, []);

  // Don't auto-refresh due to rate limits - manual refresh only
  
  const fetchMarketData = async () => {
  setRefreshing(true);
  try {
    const stocks = [];
    
    // Fetch stocks ONE BY ONE with 12-second delays
    for (let i = 0; i < watchlist.stocks.length; i++) {
      setFetchingSymbol(watchlist.stocks[i]);
      
      // Wait 12 seconds between requests (except for the first one)
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 12000));
      }
      
      try {
        const response = await axios.get(`${API_BASE}/stocks/price/${watchlist.stocks[i]}`);
        stocks.push(response.data);
      } catch (err) {
        console.error(`Failed to fetch ${watchlist.stocks[i]}:`, err);
        stocks.push({ 
          symbol: watchlist.stocks[i], 
          error: true,
          message: err.response?.status === 429 ? 'Rate limit' : 'Failed'
        });
      }
    }
    
    setFetchingSymbol(null);

    // Fetch crypto data (no rate limit)
    const cryptoPromises = watchlist.crypto.map(id => 
      axios.get(`${API_BASE}/crypto/price/${id}`)
        .then(res => res.data)
        .catch(err => ({ id, error: true }))
    );
    const crypto = await Promise.all(cryptoPromises);

    setMarketData({
      stocks: stocks,
      crypto: crypto.filter(c => !c.error),
      loading: false,
      error: null
    });
    
    setLastFetchTime(new Date());
  } catch (error) {
    setMarketData(prev => ({
      ...prev,
      loading: false,
      error: 'Failed to fetch market data'
    }));
  } finally {
    setRefreshing(false);
    setFetchingSymbol(null);
  }
};

  const addStock = () => {
    const symbol = newStock.toUpperCase().trim();
    if (symbol && !watchlist.stocks.includes(symbol)) {
      if (watchlist.stocks.length >= 5) {
        alert('Maximum 5 stocks allowed due to API rate limits');
        return;
      }
      setWatchlist(prev => ({
        ...prev,
        stocks: [...prev.stocks, symbol]
      }));
      setNewStock('');
    }
  };

  const removeStock = (symbol) => {
    setWatchlist(prev => ({
      ...prev,
      stocks: prev.stocks.filter(s => s !== symbol)
    }));
    // Remove from market data
    setMarketData(prev => ({
      ...prev,
      stocks: prev.stocks.filter(s => s.symbol !== symbol)
    }));
  };

  const addCrypto = () => {
    const id = newCrypto.toLowerCase().trim();
    if (id && !watchlist.crypto.includes(id)) {
      setWatchlist(prev => ({
        ...prev,
        crypto: [...prev.crypto, id]
      }));
      setNewCrypto('');
    }
  };

  const removeCrypto = (id) => {
    setWatchlist(prev => ({
      ...prev,
      crypto: prev.crypto.filter(c => c !== id)
    }));
    // Remove from market data
    setMarketData(prev => ({
      ...prev,
      crypto: prev.crypto.filter(c => c.id !== id)
    }));
  };

  const canRefresh = () => {
    if (!lastFetchTime) return true;
    const timeSinceLastFetch = new Date() - lastFetchTime;
    const minimumWaitTime = watchlist.stocks.length * 12000; // 12 seconds per stock
    return timeSinceLastFetch >= minimumWaitTime;
  };

  if (marketData.loading && !refreshing) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-bloomberg-orange" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Settings */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Market Overview</h2>
          {fetchingSymbol && (
            <p className="text-sm text-gray-400">Fetching {fetchingSymbol}...</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchMarketData}
            disabled={!canRefresh() || refreshing}
            className={`p-2 rounded flex items-center gap-2 ${
              canRefresh() && !refreshing
                ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                : 'text-gray-600 cursor-not-allowed'
            }`}
            title={canRefresh() ? 'Refresh data' : `Wait ${Math.ceil((watchlist.stocks.length * 12 - (new Date() - lastFetchTime) / 1000))} seconds`}
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-bloomberg-gray rounded border border-gray-800 p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg">Customize Watchlist</h3>
            <X 
              className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" 
              onClick={() => setShowSettings(false)}
            />
          </div>
          
          {/* API Rate Limit Warning */}
          <div className="bg-yellow-900 bg-opacity-30 border border-yellow-700 rounded p-3 text-sm">
            <p className="text-yellow-200">
              ⚠️ Alpha Vantage free tier: 5 requests/minute. Each stock counts as 1 request.
              Keep watchlist small to avoid rate limits!
            </p>
          </div>
          
          {/* Stock Settings */}
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-2">
              Stocks ({watchlist.stocks.length}/5)
            </h4>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newStock}
                onChange={(e) => setNewStock(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addStock()}
                placeholder="Add symbol (e.g., NVDA)"
                className="flex-1 px-3 py-1 bg-black border border-gray-700 rounded text-sm focus:border-bloomberg-orange focus:outline-none"
              />
              <button
                onClick={addStock}
                disabled={watchlist.stocks.length >= 5}
                className="px-3 py-1 bg-bloomberg-orange text-white rounded text-sm hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1">
              {watchlist.stocks.map(symbol => (
                <div key={symbol} className="flex justify-between items-center p-2 bg-black rounded">
                  <span className="font-mono text-sm">{symbol}</span>
                  <button
                    onClick={() => removeStock(symbol)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          {/* Crypto Settings */}
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-2">Cryptocurrencies</h4>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newCrypto}
                onChange={(e) => setNewCrypto(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCrypto()}
                placeholder="Add crypto (e.g., dogecoin)"
                className="flex-1 px-3 py-1 bg-black border border-gray-700 rounded text-sm focus:border-bloomberg-orange focus:outline-none"
              />
              <button
                onClick={addCrypto}
                className="px-3 py-1 bg-bloomberg-orange text-white rounded text-sm hover:bg-orange-600"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1">
              {watchlist.crypto.map(id => (
                <div key={id} className="flex justify-between items-center p-2 bg-black rounded">
                  <span className="text-sm capitalize">{id}</span>
                  <button
                    onClick={() => removeCrypto(id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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

      {/* Error Messages */}
      {marketData.error && (
        <div className="bg-red-900 bg-opacity-30 border border-red-700 rounded p-3">
          <p className="text-red-200 text-sm">{marketData.error}</p>
        </div>
      )}

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
              {marketData.stocks.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-gray-500">
                    No stocks in watchlist or data loading...
                  </td>
                </tr>
              ) : (
                marketData.stocks.map((stock) => (
                  <tr key={stock.symbol} className="border-b border-gray-700 hover:bg-gray-800">
                    <td className="p-4 font-medium">
                      {stock.symbol}
                      {stock.error && (
                        <span className="ml-2 text-xs text-red-400">({stock.message})</span>
                      )}
                    </td>
                    <td className="p-4 font-mono">
                      {stock.error ? 'N/A' : `$${stock.price?.toFixed(2)}`}
                    </td>
                    <td className={`p-4 font-mono ${!stock.error && stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {stock.error ? 'N/A' : `${stock.change >= 0 ? '+' : ''}${stock.change?.toFixed(2)}`}
                    </td>
                    <td className={`p-4 font-mono ${!stock.error && stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {stock.error ? 'N/A' : stock.changePercent}
                    </td>
                    <td className="p-4 font-mono text-sm">
                      {stock.error ? 'N/A' : stock.volume ? (stock.volume / 1000000).toFixed(2) + 'M' : 'N/A'}
                    </td>
                  </tr>
                ))
              )}
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
              {marketData.crypto.length === 0 ? (
                <tr>
                  <td colSpan="3" className="p-4 text-center text-gray-500">
                    No cryptocurrencies in watchlist
                  </td>
                </tr>
              ) : (
                marketData.crypto.map((crypto) => (
                  <tr key={crypto.id} className="border-b border-gray-700 hover:bg-gray-800">
                    <td className="p-4 font-medium capitalize">{crypto.id}</td>
                    <td className="p-4 font-mono">${crypto.price?.toLocaleString() || 'N/A'}</td>
                    <td className={`p-4 font-mono ${crypto.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {crypto.change24h >= 0 ? '+' : ''}{crypto.change24h?.toFixed(2) || 'N/A'}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default MarketOverview;