import { useState } from 'react';
import { FileText, Search, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const API_BASE = 'https://quantwand.onrender.com/api';

function FinancialStatements() {
  const [symbol, setSymbol] = useState('AAPL');
  const [loading, setLoading] = useState(false);
  const [financialData, setFinancialData] = useState(null);
  const [searchInput, setSearchInput] = useState('');

  const fetchFinancials = async (ticker) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/financials/${ticker}`);
      setFinancialData(response.data);
    } catch (error) {
      console.error('Failed to fetch financials:', error);
      setFinancialData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchInput) {
      setSymbol(searchInput.toUpperCase());
      fetchFinancials(searchInput.toUpperCase());
      setSearchInput('');
    }
  };

  // Calculate key metrics if data exists
  const calculateMetrics = (data) => {
    if (!data || !data[0]) return null;
    
    const latest = data[0];
    const previous = data[1] || latest;
    
    return {
      revenueGrowth: ((latest.revenue - previous.revenue) / previous.revenue * 100).toFixed(2),
      profitMargin: (latest.netIncome / latest.revenue * 100).toFixed(2),
      eps: latest.eps || 0,
      operatingMargin: (latest.operatingIncome / latest.revenue * 100).toFixed(2)
    };
  };

  const metrics = financialData ? calculateMetrics(financialData) : null;

  // Prepare chart data
  const chartData = financialData?.slice(0, 5).reverse().map(item => ({
    period: item.date?.substring(0, 7) || 'N/A',
    revenue: (item.revenue / 1000000000).toFixed(2), // Convert to billions
    netIncome: (item.netIncome / 1000000000).toFixed(2),
    operatingIncome: (item.operatingIncome / 1000000000).toFixed(2)
  })) || [];

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <div className="bg-bloomberg-gray rounded border border-gray-800 p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-bloomberg-orange" />
          Financial Statement Analysis
        </h2>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Enter ticker symbol (e.g., MSFT)"
            className="flex-1 px-4 py-2 bg-black border border-gray-700 rounded focus:border-bloomberg-orange focus:outline-none"
          />
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-bloomberg-orange text-white rounded hover:bg-orange-600 flex items-center"
            disabled={loading}
          >
            <Search className="w-4 h-4 mr-2" />
            {loading ? 'Loading...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Display Current Symbol */}
      {symbol && (
        <div className="bg-bloomberg-gray rounded border border-gray-800 p-4">
          <h3 className="text-2xl font-bold text-bloomberg-orange">{symbol}</h3>
          <p className="text-sm text-gray-400">Financial Overview</p>
        </div>
      )}

      {/* Key Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-bloomberg-gray p-4 rounded border border-gray-800">
            <p className="text-sm text-gray-400 mb-1">Revenue Growth (YoY)</p>
            <p className={`text-2xl font-bold flex items-center ${
              metrics.revenueGrowth > 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {metrics.revenueGrowth > 0 ? <TrendingUp className="w-5 h-5 mr-1" /> : <TrendingDown className="w-5 h-5 mr-1" />}
              {metrics.revenueGrowth}%
            </p>
          </div>
          
          <div className="bg-bloomberg-gray p-4 rounded border border-gray-800">
            <p className="text-sm text-gray-400 mb-1">Profit Margin</p>
            <p className="text-2xl font-bold text-blue-400">{metrics.profitMargin}%</p>
          </div>
          
          <div className="bg-bloomberg-gray p-4 rounded border border-gray-800">
            <p className="text-sm text-gray-400 mb-1">Earnings Per Share</p>
            <p className="text-2xl font-bold text-bloomberg-orange">${metrics.eps}</p>
          </div>
          
          <div className="bg-bloomberg-gray p-4 rounded border border-gray-800">
            <p className="text-sm text-gray-400 mb-1">Operating Margin</p>
            <p className="text-2xl font-bold text-yellow-400">{metrics.operatingMargin}%</p>
          </div>
        </div>
      )}

      {/* Revenue Chart */}
      {chartData.length > 0 && (
        <div className="bg-bloomberg-gray rounded border border-gray-800 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-bloomberg-orange" />
            Historical Performance (in Billions)
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="period" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#9CA3AF' }}
              />
              <Legend />
              <Bar dataKey="revenue" fill="#FF6900" name="Revenue" />
              <Bar dataKey="operatingIncome" fill="#1E3A8A" name="Operating Income" />
              <Bar dataKey="netIncome" fill="#10B981" name="Net Income" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Income Statement Table */}
      {financialData && financialData.length > 0 && (
        <div className="bg-bloomberg-gray rounded border border-gray-800">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold">Income Statement Summary</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-700">
                <tr className="text-left text-sm text-gray-400">
                  <th className="p-4">Period</th>
                  <th className="p-4">Revenue</th>
                  <th className="p-4">Operating Income</th>
                  <th className="p-4">Net Income</th>
                  <th className="p-4">EPS</th>
                </tr>
              </thead>
              <tbody>
                {financialData.slice(0, 5).map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-700 hover:bg-gray-800">
                    <td className="p-4 font-medium">{item.date || 'N/A'}</td>
                    <td className="p-4 font-mono">
                      ${(item.revenue / 1000000000).toFixed(2)}B
                    </td>
                    <td className="p-4 font-mono">
                      ${(item.operatingIncome / 1000000000).toFixed(2)}B
                    </td>
                    <td className="p-4 font-mono">
                      ${(item.netIncome / 1000000000).toFixed(2)}B
                    </td>
                    <td className="p-4 font-mono">${item.eps || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Data Message */}
      {!loading && !financialData && symbol && (
        <div className="bg-bloomberg-gray rounded border border-gray-800 p-8 text-center">
          <p className="text-gray-400">No financial data available. Try searching for a different symbol.</p>
        </div>
      )}
    </div>
  );
}

export default FinancialStatements;