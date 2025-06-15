import { useState, useEffect } from 'react';
import { AlertTriangle, TrendingDown, Shield, Activity } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function RiskAnalytics() {
  const [portfolio] = useState({
    totalValue: 50000,
    positions: [
      { symbol: 'AAPL', value: 15000, weight: 0.30 },
      { symbol: 'GOOGL', value: 12500, weight: 0.25 },
      { symbol: 'MSFT', value: 12500, weight: 0.25 },
      { symbol: 'AMZN', value: 10000, weight: 0.20 }
    ]
  });

  const [riskMetrics] = useState({
    var95: 2847,
    var99: 4231,
    cvar95: 3521,
    beta: 1.12,
    maxDrawdown: 0.23,
    volatility: 0.18
  });

  // Generate Monte Carlo simulation data
  const generateMonteCarloData = () => {
    const days = 252; // Trading days in a year
    const simulations = 5;
    const data = [];
    
    for (let day = 0; day <= days; day++) {
      const point = { day };
      
      // Generate multiple simulation paths
      for (let sim = 0; sim < simulations; sim++) {
        const dailyReturn = (Math.random() - 0.5) * 0.04; // ±2% daily
        const previousValue = day === 0 ? portfolio.totalValue : data[day - 1]?.[`sim${sim}`] || portfolio.totalValue;
        point[`sim${sim}`] = previousValue * (1 + dailyReturn);
      }
      
      data.push(point);
    }
    
    return data;
  };

  const [simulationData] = useState(generateMonteCarloData());

  // Generate historical VaR data
  const historicalVaRData = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    var95: 2500 + Math.random() * 1000,
    var99: 3500 + Math.random() * 1500,
    actual: 2400 + Math.random() * 800
  }));

  return (
    <div className="space-y-6">
      {/* Risk Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-bloomberg-gray p-4 rounded border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <span className="text-xs text-gray-400">95% Confidence</span>
          </div>
          <p className="text-sm text-gray-400">Value at Risk (1-day)</p>
          <p className="text-2xl font-bold text-red-400">-${riskMetrics.var95.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">
            {((riskMetrics.var95 / portfolio.totalValue) * 100).toFixed(2)}% of portfolio
          </p>
        </div>

        <div className="bg-bloomberg-gray p-4 rounded border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="w-6 h-6 text-orange-500" />
            <span className="text-xs text-gray-400">Historical</span>
          </div>
          <p className="text-sm text-gray-400">Max Drawdown</p>
          <p className="text-2xl font-bold text-orange-400">
            -{(riskMetrics.maxDrawdown * 100).toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500 mt-1">Peak to trough decline</p>
        </div>

        <div className="bg-bloomberg-gray p-4 rounded border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-6 h-6 text-yellow-500" />
            <span className="text-xs text-gray-400">Annual</span>
          </div>
          <p className="text-sm text-gray-400">Portfolio Volatility</p>
          <p className="text-2xl font-bold text-yellow-400">
            {(riskMetrics.volatility * 100).toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500 mt-1">Standard deviation</p>
        </div>

        <div className="bg-bloomberg-gray p-4 rounded border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <Shield className="w-6 h-6 text-blue-500" />
            <span className="text-xs text-gray-400">Market</span>
          </div>
          <p className="text-sm text-gray-400">Portfolio Beta</p>
          <p className="text-2xl font-bold text-blue-400">{riskMetrics.beta.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">vs S&P 500</p>
        </div>
      </div>

      {/* Monte Carlo Simulation */}
      <div className="bg-bloomberg-gray rounded border border-gray-800 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-bloomberg-orange" />
          Monte Carlo Simulation (1-Year Forecast)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={simulationData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="day" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
              labelStyle={{ color: '#9CA3AF' }}
            />
            {[0, 1, 2, 3, 4].map((i) => (
              <Line
                key={`sim${i}`}
                type="monotone"
                dataKey={`sim${i}`}
                stroke={['#FF6900', '#1E3A8A', '#10B981', '#F59E0B', '#EF4444'][i]}
                strokeWidth={1}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
        <p className="text-xs text-gray-400 mt-2">
          Showing 5 potential portfolio value paths based on historical volatility
        </p>
      </div>

      {/* Historical VaR Chart */}
      <div className="bg-bloomberg-gray rounded border border-gray-800 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-bloomberg-orange" />
          Value at Risk Analysis (30-Day History)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={historicalVaRData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="day" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
              labelStyle={{ color: '#9CA3AF' }}
            />
            <Area
              type="monotone"
              dataKey="var99"
              stackId="1"
              stroke="#EF4444"
              fill="#EF4444"
              fillOpacity={0.3}
              name="99% VaR"
            />
            <Area
              type="monotone"
              dataKey="var95"
              stackId="2"
              stroke="#F59E0B"
              fill="#F59E0B"
              fillOpacity={0.3}
              name="95% VaR"
            />
            <Area
              type="monotone"
              dataKey="actual"
              stackId="3"
              stroke="#10B981"
              fill="#10B981"
              fillOpacity={0.3}
              name="Actual Loss"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Risk Breakdown Table */}
      <div className="bg-bloomberg-gray rounded border border-gray-800">
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold">Position Risk Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-700">
              <tr className="text-left text-sm text-gray-400">
                <th className="p-4">Position</th>
                <th className="p-4">Value</th>
                <th className="p-4">Weight</th>
                <th className="p-4">VaR Contribution</th>
                <th className="p-4">Risk Level</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.positions.map((position) => {
                const varContribution = position.value * 0.05; // Simplified
                const riskLevel = varContribution > 1000 ? 'High' : varContribution > 500 ? 'Medium' : 'Low';
                const riskColor = riskLevel === 'High' ? 'text-red-400' : riskLevel === 'Medium' ? 'text-yellow-400' : 'text-green-400';
                
                return (
                  <tr key={position.symbol} className="border-b border-gray-700 hover:bg-gray-800">
                    <td className="p-4 font-medium">{position.symbol}</td>
                    <td className="p-4 font-mono">${position.value.toLocaleString()}</td>
                    <td className="p-4 font-mono">{(position.weight * 100).toFixed(1)}%</td>
                    <td className="p-4 font-mono text-red-400">-${varContribution.toFixed(0)}</td>
                    <td className={`p-4 font-medium ${riskColor}`}>{riskLevel}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default RiskAnalytics;