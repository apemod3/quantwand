import { useState } from 'react';
import { Calculator, Plus, Trash2, PieChart, TrendingUp } from 'lucide-react';
import axios from 'axios';
import { PieChart as RechartsPC, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const API_BASE = 'https://quantwand.onrender.com/api';

function PortfolioOptimizer() {
  const [assets, setAssets] = useState([
    { symbol: 'AAPL', allocation: 25 },
    { symbol: 'GOOGL', allocation: 25 },
    { symbol: 'MSFT', allocation: 25 },
    { symbol: 'AMZN', allocation: 25 }
  ]);
  const [newAsset, setNewAsset] = useState('');
  const [optimizing, setOptimizing] = useState(false);
  const [results, setResults] = useState(null);

  const COLORS = ['#FF6900', '#1E3A8A', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const addAsset = () => {
    if (newAsset && !assets.find(a => a.symbol === newAsset.toUpperCase())) {
      const equalAllocation = 100 / (assets.length + 1);
      const updatedAssets = assets.map(a => ({ ...a, allocation: equalAllocation }));
      setAssets([...updatedAssets, { symbol: newAsset.toUpperCase(), allocation: equalAllocation }]);
      setNewAsset('');
    }
  };

  const removeAsset = (symbol) => {
    const newAssets = assets.filter(a => a.symbol !== symbol);
    const equalAllocation = 100 / newAssets.length;
    setAssets(newAssets.map(a => ({ ...a, allocation: equalAllocation })));
  };

  const updateAllocation = (symbol, value) => {
    setAssets(assets.map(a => 
      a.symbol === symbol ? { ...a, allocation: parseFloat(value) || 0 } : a
    ));
  };

  const optimizePortfolio = async () => {
    setOptimizing(true);
    try {
      const response = await axios.post(`${API_BASE}/portfolio/optimize`, {
        assets: assets.map(a => a.symbol),
        constraints: {
          minWeight: 0.05,
          maxWeight: 0.40
        }
      });
      
      setResults(response.data);
      
      // Update allocations with optimized weights
      const optimizedWeights = response.data.optimizedWeights;
      setAssets(assets.map((asset, idx) => ({
        ...asset,
        allocation: (optimizedWeights[idx]?.weight * 100) || 0
      })));
    } catch (error) {
      console.error('Optimization failed:', error);
    } finally {
      setOptimizing(false);
    }
  };

  const pieData = assets.map(asset => ({
    name: asset.symbol,
    value: asset.allocation
  }));

  const totalAllocation = assets.reduce((sum, a) => sum + a.allocation, 0);

  return (
    <div className="space-y-6">
      {/* Portfolio Input Section */}
      <div className="bg-bloomberg-gray rounded border border-gray-800 p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Calculator className="w-5 h-5 mr-2 text-bloomberg-orange" />
          Portfolio Configuration
        </h2>

        {/* Add Asset */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newAsset}
            onChange={(e) => setNewAsset(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addAsset()}
            placeholder="Add ticker symbol (e.g., TSLA)"
            className="flex-1 px-4 py-2 bg-black border border-gray-700 rounded focus:border-bloomberg-orange focus:outline-none"
          />
          <button
            onClick={addAsset}
            className="px-4 py-2 bg-bloomberg-orange text-white rounded hover:bg-orange-600 flex items-center"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </button>
        </div>

        {/* Assets List */}
        <div className="space-y-2 mb-4">
          {assets.map((asset) => (
            <div key={asset.symbol} className="flex items-center gap-4 p-3 bg-black rounded border border-gray-700">
              <span className="font-mono font-medium w-20">{asset.symbol}</span>
              <input
                type="number"
                value={asset.allocation}
                onChange={(e) => updateAllocation(asset.symbol, e.target.value)}
                className="w-24 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-right"
                min="0"
                max="100"
              />
              <span className="text-gray-400">%</span>
              <button
                onClick={() => removeAsset(asset.symbol)}
                className="ml-auto text-red-400 hover:text-red-300"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Total Allocation */}
        <div className={`text-sm mb-4 ${Math.abs(totalAllocation - 100) < 0.01 ? 'text-green-400' : 'text-red-400'}`}>
          Total Allocation: {totalAllocation.toFixed(2)}%
        </div>

        {/* Optimize Button */}
        <button
          onClick={optimizePortfolio}
          disabled={optimizing || Math.abs(totalAllocation - 100) > 0.01}
          className="w-full px-4 py-2 bg-bloomberg-orange text-white rounded hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {optimizing ? (
            <>Loading...</>
          ) : (
            <>
              <TrendingUp className="w-4 h-4 mr-2" />
              Optimize Portfolio (Modern Portfolio Theory)
            </>
          )}
        </button>
      </div>

      {/* Results Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-bloomberg-gray rounded border border-gray-800 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <PieChart className="w-5 h-5 mr-2 text-bloomberg-orange" />
            Portfolio Allocation
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPC>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPC>
          </ResponsiveContainer>
        </div>

        {/* Optimization Results */}
        {results && (
          <div className="bg-bloomberg-gray rounded border border-gray-800 p-6">
            <h3 className="text-lg font-semibold mb-4">Optimization Results</h3>
            <div className="space-y-3">
              <div className="flex justify-between p-3 bg-black rounded">
                <span className="text-gray-400">Expected Annual Return</span>
                <span className="font-mono text-green-400">
                  {(results.expectedReturn * 100).toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between p-3 bg-black rounded">
                <span className="text-gray-400">Portfolio Risk (σ)</span>
                <span className="font-mono text-yellow-400">
                  {(results.risk * 100).toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between p-3 bg-black rounded">
                <span className="text-gray-400">Sharpe Ratio</span>
                <span className="font-mono text-bloomberg-orange">
                  {results.sharpeRatio.toFixed(3)}
                </span>
              </div>
              <div className="mt-4 p-3 bg-blue-900 bg-opacity-20 rounded border border-blue-800">
                <p className="text-sm text-blue-300">
                  📊 A Sharpe ratio above 1.0 is considered good, above 2.0 is very good, 
                  and above 3.0 is excellent.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PortfolioOptimizer;