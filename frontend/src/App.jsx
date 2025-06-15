import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Bitcoin, PieChart, Activity, BarChart3, LineChart } from 'lucide-react';
import MarketOverview from './components/MarketOverview';
import PortfolioOptimizer from './components/PortfolioOptimizer';
import RiskAnalytics from './components/RiskAnalytics';
import FinancialStatements from './components/FinancialStatements';

function App() {
  const [activeTab, setActiveTab] = useState('market');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const tabs = [
    { id: 'market', name: 'Market Overview', icon: TrendingUp },
    { id: 'portfolio', name: 'Portfolio Optimizer', icon: PieChart },
    { id: 'risk', name: 'Risk Analytics', icon: Activity },
    { id: 'financials', name: 'Financial Statements', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-bloomberg-dark text-white">
      {/* Header */}
      <header className="bg-bloomberg-gray border-b border-gray-800">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-bloomberg-orange">QuantWand</h1>
              <span className="text-xs text-gray-400">Professional Trading Terminal</span>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-sm">
                <span className="text-gray-400">Berlin Time: </span>
                <span className="font-mono text-green-400">
                  {currentTime.toLocaleTimeString('de-DE')}
                </span>
              </div>
              <div className="text-sm">
                <span className="text-gray-400">Date: </span>
                <span className="font-mono">
                  {currentTime.toLocaleDateString('de-DE')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-bloomberg-light-gray border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-bloomberg-orange text-white border-b-2 border-bloomberg-orange'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {activeTab === 'market' && <MarketOverview />}
        {activeTab === 'portfolio' && <PortfolioOptimizer />}
        {activeTab === 'risk' && <RiskAnalytics />}
        {activeTab === 'financials' && <FinancialStatements />}
      </main>

      {/* Footer */}
      <footer className="mt-auto bg-bloomberg-gray border-t border-gray-800 py-4">
        <div className="container mx-auto px-4 text-center text-xs text-gray-500">
          <p>QuantWand Terminal © 2025 | Real-time Financial Analytics | Built with React + Express</p>
        </div>
      </footer>
    </div>
  );
}

export default App;