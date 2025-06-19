import { useState } from 'react';
import { Calculator, Plus, Trash2, PieChart, TrendingUp, Brain, BarChart, Loader2 } from 'lucide-react';
import axios from 'axios';
import { 
  PieChart as RechartsPC, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line
} from 'recharts';

const API_BASE = 'http://localhost:5000/api';

function EnhancedPortfolioOptimizer() {
  const [assets, setAssets] = useState([
    { symbol: 'AAPL', allocation: 25 },
    { symbol: 'GOOGL', allocation: 25 },
    { symbol: 'MSFT', allocation: 25 },
    { symbol: 'AMZN', allocation: 25 }
  ]);
  const [newAsset, setNewAsset] = useState('');
  const [optimizing, setOptimizing] = useState(false);
  const [results, setResults] = useState(null);
  const [activeView, setActiveView] = useState('overview'); // overview, frontier, correlation, monte-carlo

  const COLORS = ['#FF6900', '#1E3A8A', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

  const addAsset = () => {
    if (newAsset && !assets.find(a => a.symbol === newAsset.toUpperCase())) {
      const equalAllocation = 100 / (assets.length + 1);
      const updatedAssets = assets.map(a => ({ ...a, allocation: equalAllocation }));
      setAssets([...updatedAssets, { symbol: newAsset.toUpperCase(), allocation: equalAllocation }]);
      setNewAsset('');
    }
  };

  const removeAsset = (symbol) => {
    if (assets.length <= 2) {
      alert('Need at least 2 assets for optimization');
      return;
    }
    const newAssets = assets.filter(a => a.symbol !== symbol);
    const equalAllocation = 100 / newAssets.length;
    setAssets(newAssets.map(a => ({ ...a, allocation: equalAllocation })));
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
      alert('Optimization failed. Please try again.');
    } finally {
      setOptimizing(false);
    }
  };

  // Prepare data for correlation heatmap
  const getCorrelationHeatmapData = () => {
    if (!results?.correlationMatrix) return [];
    
    const data = [];
    const { assets: assetNames } = results.statistics;
    
    for (let i = 0; i < assetNames.length; i++) {
      for (let j = 0; j < assetNames.length; j++) {
        data.push({
          x: assetNames[j],
          y: assetNames[i],
          value: results.correlationMatrix[i][j]
        });
      }
    }
    
    return data;
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
          <Brain className="w-5 h-5 mr-2 text-bloomberg-orange" />
          Advanced Portfolio Optimizer
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
              <div className="flex-1">
                <div className="text-xs text-gray-400 mb-1">
                  Current: {asset.allocation.toFixed(2)}%
                </div>
                <input
                  type="range"
                  value={asset.allocation}
                  onChange={(e) => {
                    const newValue = parseFloat(e.target.value);
                    setAssets(assets.map(a => 
                      a.symbol === asset.symbol ? { ...a, allocation: newValue } : a
                    ));
                  }}
                  className="w-full"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
              <button
                onClick={() => removeAsset(asset.symbol)}
                className="text-red-400 hover:text-red-300"
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
          disabled={optimizing || assets.length < 2}
          className="w-full px-4 py-2 bg-bloomberg-orange text-white rounded hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {optimizing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Running Monte Carlo Simulation...
            </>
          ) : (
            <>
              <TrendingUp className="w-4 h-4 mr-2" />
              Optimize Portfolio (Advanced Analysis)
            </>
          )}
        </button>
      </div>

      {/* Results Tabs */}
      {results && (
        <div className="bg-bloomberg-gray rounded border border-gray-800">
          <div className="flex border-b border-gray-700">
            {['overview', 'frontier', 'correlation', 'statistics'].map(view => (
              <button
                key={view}
                onClick={() => setActiveView(view)}
                className={`px-6 py-3 capitalize ${
                  activeView === view 
                    ? 'bg-bloomberg-orange text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {view}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeView === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pie Chart */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <PieChart className="w-5 h-5 mr-2 text-bloomberg-orange" />
                    Optimized Allocation
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

                {/* Metrics */}
                <div>
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
                        📊 Based on historical data and 10,000 Monte Carlo simulations. 
                        This portfolio maximizes risk-adjusted returns.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Efficient Frontier Tab */}
            {activeView === 'frontier' && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <BarChart className="w-5 h-5 mr-2 text-bloomberg-orange" />
                  Efficient Frontier
                </h3>
                <ResponsiveContainer width="100%" height={400}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="risk" 
                      name="Risk" 
                      unit="%" 
                      stroke="#9CA3AF"
                      tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                    />
                    <YAxis 
                      dataKey="return" 
                      name="Return" 
                      unit="%" 
                      stroke="#9CA3AF"
                      tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                    />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      formatter={(value) => `${(value * 100).toFixed(2)}%`}
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                    />
                    <Scatter 
                      name="Portfolios" 
                      data={results.efficientFrontier?.slice(0, 1000) || []} 
                      fill="#4B5563"
                      fillOpacity={0.6}
                    />
                    <Scatter 
                      name="Optimal Portfolio" 
                      data={[{ risk: results.risk, return: results.expectedReturn }]} 
                      fill="#FF6900"
                    />
                    <Scatter 
                      name="Min Variance" 
                      data={[{ 
                        risk: results.minVariancePortfolio?.risk || 0, 
                        return: results.minVariancePortfolio?.return || 0 
                      }]} 
                      fill="#10B981"
                    />
                  </ScatterChart>
                </ResponsiveContainer>
                <p className="text-xs text-gray-400 mt-2">
                  Each dot represents a possible portfolio. Orange = Optimal (highest Sharpe ratio), 
                  Green = Minimum variance. Your portfolio is optimized along the efficient frontier.
                </p>
              </div>
            )}

            {/* Correlation Matrix Tab */}
            {activeView === 'correlation' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Asset Correlation Matrix</h3>
                {results.correlationMatrix && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr>
                          <th className="p-2 text-left">Asset</th>
                          {results.statistics.assets.map(asset => (
                            <th key={asset} className="p-2 text-center">{asset}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {results.statistics.assets.map((asset, i) => (
                          <tr key={asset}>
                            <td className="p-2 font-medium">{asset}</td>
                            {results.correlationMatrix[i].map((corr, j) => {
                              const color = corr > 0.7 ? 'bg-red-900' : 
                                           corr > 0.3 ? 'bg-yellow-900' : 
                                           corr < -0.3 ? 'bg-blue-900' : 
                                           'bg-gray-800';
                              return (
                                <td key={j} className={`p-2 text-center ${color} text-xs`}>
                                  {corr.toFixed(2)}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-4">
                  Correlation measures how assets move together. Red = strong positive correlation, 
                  Blue = negative correlation. Diversification works best with low/negative correlations.
                </p>
              </div>
            )}

            {/* Statistics Tab */}
            {activeView === 'statistics' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Individual Asset Statistics</h3>
                <div className="space-y-4">
                  {results.statistics.assets.map((asset, idx) => (
                    <div key={asset} className="bg-black p-4 rounded">
                      <h4 className="font-medium mb-2">{asset}</h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Annual Return: </span>
                          <span className="text-green-400">
                            {(results.statistics.meanReturns[idx] * 100).toFixed(2)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Volatility: </span>
                          <span className="text-yellow-400">
                            {(results.statistics.volatilities[idx] * 100).toFixed(2)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Weight: </span>
                          <span className="text-bloomberg-orange">
                            {(results.optimizedWeights[idx].weight * 100).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Educational Note */}
      <div className="bg-blue-900 bg-opacity-20 border border-blue-800 rounded p-4">
        <h4 className="text-sm font-semibold text-blue-300 mb-2">🎓 How This Works</h4>
        <p className="text-xs text-blue-200">
          This optimizer uses: <strong>1)</strong> Real historical price data from Alpha Vantage API, 
          <strong> 2)</strong> Correlation matrix calculation to measure asset relationships,
          <strong> 3)</strong> Monte Carlo simulation (10,000 portfolios) to find the efficient frontier,
          <strong> 4)</strong> Modern Portfolio Theory to maximize the Sharpe ratio (risk-adjusted returns).
          The result is a mathematically optimal portfolio based on historical performance.
        </p>
      </div>
    </div>
  );
}

export default EnhancedPortfolioOptimizer;