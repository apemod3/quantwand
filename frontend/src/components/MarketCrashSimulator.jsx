import { useState, useEffect, useRef } from 'react';
import { Zap, TrendingDown, AlertTriangle, Skull, Globe, DollarSign, Bitcoin, Home, BarChart3, Play, Pause, RotateCcw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

console.log("MarketCrashSimulator loaded!");

// Predefined scenarios with their impact matrices
const SCENARIOS = {
  covid19: {
    name: "COVID-19 Pandemic",
    icon: "🦠",
    description: "Global health crisis with lockdowns",
    impacts: {
      stocks: { initial: -35, month: -20, year: +15 },
      crypto: { initial: -50, month: -30, year: +200 },
      gold: { initial: +5, month: +15, year: +25 },
      oil: { initial: -70, month: -50, year: -20 },
      realEstate: { initial: -15, month: -10, year: +10 },
      usdEur: { initial: -2, month: -1, year: +3 }
    }
  },
  financial2008: {
    name: "2008 Financial Crisis",
    icon: "🏦",
    description: "Banking system collapse",
    impacts: {
      stocks: { initial: -45, month: -40, year: -35 },
      crypto: { initial: 0, month: 0, year: 0 }, // Didn't exist
      gold: { initial: +15, month: +25, year: +30 },
      oil: { initial: -60, month: -50, year: -40 },
      realEstate: { initial: -30, month: -35, year: -40 },
      usdEur: { initial: +5, month: +8, year: +10 }
    }
  },
  alienInvasion: {
    name: "Alien Invasion",
    icon: "👽",
    description: "Extraterrestrial contact & conflict",
    impacts: {
      stocks: { initial: -60, month: -40, year: +100 }, // Defense stocks boom
      crypto: { initial: -90, month: -80, year: -50 }, // Who needs crypto?
      gold: { initial: +200, month: +300, year: +500 }, // Ultimate safe haven
      oil: { initial: -80, month: -70, year: +50 }, // Alien tech?
      realEstate: { initial: -70, month: -60, year: -40 }, // Cities destroyed
      usdEur: { initial: 0, month: 0, year: 0 } // Money is meaningless
    }
  },
  aiTakeover: {
    name: "AI Takeover",
    icon: "🤖",
    description: "Artificial General Intelligence achieved",
    impacts: {
      stocks: { initial: +50, month: +100, year: +300 }, // Tech boom
      crypto: { initial: -70, month: -50, year: -90 }, // AI controls money
      gold: { initial: -20, month: -30, year: -50 }, // Physical assets less relevant
      oil: { initial: -40, month: -60, year: -80 }, // AI efficiency
      realEstate: { initial: -10, month: -20, year: -30 }, // Virtual worlds preferred
      usdEur: { initial: -5, month: -10, year: -20 }
    }
  },
  zombieApocalypse: {
    name: "Zombie Apocalypse",
    icon: "🧟",
    description: "Undead outbreak worldwide",
    impacts: {
      stocks: { initial: -95, month: -98, year: -99 }, // Society collapses
      crypto: { initial: -100, month: -100, year: -100 }, // No internet
      gold: { initial: -50, month: -80, year: -90 }, // Can't eat gold
      oil: { initial: -90, month: -95, year: -99 }, // No infrastructure
      realEstate: { initial: -95, month: -98, year: -99 }, // Overrun by zombies
      usdEur: { initial: -100, month: -100, year: -100 } // Money worthless
    }
  },
  ww3: {
    name: "World War 3",
    icon: "💣",
    description: "Global military conflict",
    impacts: {
      stocks: { initial: -50, month: -60, year: -40 },
      crypto: { initial: -70, month: -60, year: -30 },
      gold: { initial: +100, month: +150, year: +200 },
      oil: { initial: +150, month: +200, year: +100 },
      realEstate: { initial: -40, month: -50, year: -60 },
      usdEur: { initial: +20, month: +30, year: +15 }
    }
  },
  hyperinflation: {
    name: "Hyperinflation",
    icon: "💸",
    description: "Currency collapse, 1000%+ inflation",
    impacts: {
      stocks: { initial: +20, month: +50, year: +200 }, // Nominal gains
      crypto: { initial: +300, month: +500, year: +1000 }, // Inflation hedge
      gold: { initial: +400, month: +600, year: +1200 },
      oil: { initial: +200, month: +300, year: +400 },
      realEstate: { initial: +100, month: +200, year: +500 },
      usdEur: { initial: -50, month: -70, year: -90 }
    }
  },
  cyberAttack: {
    name: "Global Cyber Attack",
    icon: "💻",
    description: "Banking & infrastructure hack",
    impacts: {
      stocks: { initial: -25, month: -15, year: -5 },
      crypto: { initial: -40, month: -20, year: +50 }, // Blockchain survives
      gold: { initial: +30, month: +40, year: +20 },
      oil: { initial: -15, month: -10, year: 0 },
      realEstate: { initial: -5, month: -3, year: 0 },
      usdEur: { initial: -10, month: -5, year: 0 }
    }
  }
};

// Asset configuration
const ASSETS = {
  stocks: { name: "S&P 500", icon: "📈", color: "#FF6900", baseValue: 4800 },
  crypto: { name: "Bitcoin", icon: "₿", color: "#F7931A", baseValue: 45000 },
  gold: { name: "Gold", icon: "🥇", color: "#FFD700", baseValue: 2050 },
  oil: { name: "Oil", icon: "🛢️", color: "#000000", baseValue: 75 },
  realEstate: { name: "REITs", icon: "🏠", color: "#4CAF50", baseValue: 100 },
  usdEur: { name: "USD/EUR", icon: "💱", color: "#003399", baseValue: 1.05 }
};

function MarketCrashSimulator() {
  const [selectedScenario, setSelectedScenario] = useState('covid19');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [chartData, setChartData] = useState([]);
  const [customScenario, setCustomScenario] = useState({
    trigger: 'pandemic',
    severity: 'moderate',
    duration: 'months',
    region: 'global'
  });
  const intervalRef = useRef(null);

  // Generate time series data for the crash
  const generateCrashData = (scenario) => {
    const impacts = SCENARIOS[scenario].impacts;
    const data = [];
    
    // Generate 365 data points (1 year)
    for (let day = 0; day <= 365; day++) {
      const dataPoint = { day, time: day === 0 ? 'Start' : day === 1 ? 'Day 1' : day === 30 ? 'Month 1' : day === 365 ? 'Year 1' : `Day ${day}` };
      
      Object.keys(ASSETS).forEach(asset => {
        const impact = impacts[asset];
        let change;
        
        if (day === 0) {
          change = 0;
        } else if (day <= 1) {
          // Initial shock
          change = impact.initial * (day / 1);
        } else if (day <= 30) {
          // Transition from initial to month
          const progress = (day - 1) / 29;
          change = impact.initial + (impact.month - impact.initial) * progress;
        } else {
          // Transition from month to year
          const progress = (day - 30) / 335;
          change = impact.month + (impact.year - impact.month) * progress;
        }
        
        // Add some volatility
        const volatility = (Math.random() - 0.5) * 5;
        dataPoint[asset] = Number((change + volatility).toFixed(2));
      });
      
      data.push(dataPoint);
    }
    
    return data;
  };

  // Initialize chart data
  useEffect(() => {
    const data = generateCrashData(selectedScenario);
    setChartData(data);
    setCurrentTime(0);
    setIsPlaying(false);
  }, [selectedScenario]);

  // Animation logic
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= 365) {
            setIsPlaying(false);
            return prev;
          }
          return prev + speed;
        });
      }, 50); // Update every 50ms
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, speed]);

  // Get current values
  const getCurrentValues = () => {
    const currentData = chartData[Math.min(Math.floor(currentTime), 365)] || chartData[0];
    const results = {};
    
    Object.keys(ASSETS).forEach(asset => {
      const baseValue = ASSETS[asset].baseValue;
      const percentChange = currentData[asset] || 0;
      const newValue = baseValue * (1 + percentChange / 100);
      
      results[asset] = {
        value: newValue,
        change: percentChange,
        volatility: Math.abs(percentChange) * 0.3, // Simplified volatility
        recoveryTime: percentChange < 0 ? Math.abs(percentChange) * 5 : 0, // Days to recover
        safeHavenRating: percentChange > 0 ? Math.min(percentChange / 10, 10) : 0
      };
    });
    
    return results;
  };

if (chartData.length === 0) {
return <div className="text-center p-8">Loading...</div>;
}

  const currentValues = getCurrentValues();
  const visibleData = chartData.slice(0, Math.floor(currentTime) + 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-bloomberg-gray rounded border border-gray-800 p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <AlertTriangle className="w-8 h-8 mr-3 text-red-500" />
          Market Crash Simulator
        </h2>
        <p className="text-gray-400">
          Simulate how different crisis scenarios impact various asset classes. Watch markets crash (or boom) in real-time!
        </p>
      </div>

      {/* Scenario Selector */}
      <div className="bg-bloomberg-gray rounded border border-gray-800 p-6">
        <h3 className="text-lg font-semibold mb-4">Select Crisis Scenario</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {Object.entries(SCENARIOS).map(([key, scenario]) => (
            <button
              key={key}
              onClick={() => setSelectedScenario(key)}
              className={`p-4 rounded border transition-all ${
                selectedScenario === key
                  ? 'border-bloomberg-orange bg-bloomberg-orange bg-opacity-20'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="text-3xl mb-2">{scenario.icon}</div>
              <div className="text-sm font-medium">{scenario.name}</div>
            </button>
          ))}
        </div>

        {/* Custom Scenario Builder */}
        <div className="border-t border-gray-700 pt-4 mt-4">
          <h4 className="text-sm font-medium mb-3 text-gray-400">Or Build Your Own Crisis:</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <select 
              className="bg-black border border-gray-700 rounded px-3 py-2 text-sm"
              value={customScenario.trigger}
              onChange={(e) => setCustomScenario({...customScenario, trigger: e.target.value})}
            >
              <option value="pandemic">Pandemic</option>
              <option value="war">War</option>
              <option value="financial">Financial</option>
              <option value="tech">Tech Collapse</option>
              <option value="natural">Natural Disaster</option>
            </select>
            
            <select 
              className="bg-black border border-gray-700 rounded px-3 py-2 text-sm"
              value={customScenario.severity}
              onChange={(e) => setCustomScenario({...customScenario, severity: e.target.value})}
            >
              <option value="mild">Mild</option>
              <option value="moderate">Moderate</option>
              <option value="severe">Severe</option>
              <option value="apocalyptic">Apocalyptic</option>
            </select>
            
            <select 
              className="bg-black border border-gray-700 rounded px-3 py-2 text-sm"
              value={customScenario.duration}
              onChange={(e) => setCustomScenario({...customScenario, duration: e.target.value})}
            >
              <option value="weeks">Weeks</option>
              <option value="months">Months</option>
              <option value="years">Years</option>
            </select>
            
            <select 
              className="bg-black border border-gray-700 rounded px-3 py-2 text-sm"
              value={customScenario.region}
              onChange={(e) => setCustomScenario({...customScenario, region: e.target.value})}
            >
              <option value="usa">USA</option>
              <option value="europe">Europe</option>
              <option value="asia">Asia</option>
              <option value="global">Global</option>
            </select>
          </div>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="bg-bloomberg-gray rounded border border-gray-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-3 bg-bloomberg-orange text-white rounded hover:bg-orange-600 transition-colors"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            
            <button
              onClick={() => {
                setCurrentTime(0);
                setIsPlaying(false);
              }}
              className="p-3 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Speed:</span>
              <select
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="bg-black border border-gray-700 rounded px-2 py-1 text-sm"
              >
                <option value="1">1x</option>
                <option value="2">2x</option>
                <option value="5">5x</option>
                <option value="10">10x</option>
              </select>
            </div>
          </div>
          
          <div className="text-sm">
            <span className="text-gray-400">Time: </span>
            <span className="font-mono text-bloomberg-orange">
              {currentTime === 0 ? 'Start' : 
               currentTime <= 1 ? 'Day 1' : 
               currentTime <= 30 ? `Day ${Math.floor(currentTime)}` : 
               currentTime <= 365 ? `Month ${Math.floor(currentTime / 30)}` : 
               'Year 1'}
            </span>
          </div>
        </div>
        
        {/* Timeline Slider */}
        <div className="mt-4">
          <input
            type="range"
            min="0"
            max="365"
            value={currentTime}
            onChange={(e) => setCurrentTime(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Start</span>
            <span>Day 1</span>
            <span>Month 1</span>
            <span>Year 1</span>
          </div>
        </div>
      </div>

      {/* Live Chart */}
      <div className="bg-bloomberg-gray rounded border border-gray-800 p-6">
        <h3 className="text-lg font-semibold mb-4">Real-Time Impact Visualization</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={visibleData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="time" 
              stroke="#9CA3AF"
              interval={Math.floor(visibleData.length / 10)}
            />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
              labelStyle={{ color: '#9CA3AF' }}
              formatter={(value) => `${value > 0 ? '+' : ''}${value}%`}
            />
            <Legend />
            {Object.entries(ASSETS).map(([key, asset]) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                name={asset.name}
                stroke={asset.color}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Current Values Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(ASSETS).map(([key, asset]) => {
          const data = currentValues[key];
          const isPositive = data.change >= 0;
          
          return (
            <div key={key} className="bg-bloomberg-gray rounded border border-gray-800 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <span className="text-2xl mr-2">{asset.icon}</span>
                  <h4 className="font-semibold">{asset.name}</h4>
                </div>
                <TrendingDown className={`w-5 h-5 ${isPositive ? 'text-green-400' : 'text-red-400'}`} />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Value</span>
                  <span className="font-mono">
                    {key === 'usdEur' ? data.value.toFixed(4) : 
                     key === 'oil' ? `$${data.value.toFixed(2)}` :
                     key === 'crypto' ? `$${data.value.toLocaleString()}` :
                     data.value.toFixed(2)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Change</span>
                  <span className={`font-mono ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {isPositive ? '+' : ''}{data.change.toFixed(2)}%
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Volatility</span>
                  <span className="font-mono text-yellow-400">
                    {data.volatility.toFixed(1)}%
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Recovery Time</span>
                  <span className="font-mono text-blue-400">
                    {data.recoveryTime.toFixed(0)} days
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Safe Haven</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < data.safeHavenRating / 2 ? 'text-yellow-400' : 'text-gray-600'}>
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Scenario Description */}
      <div className="bg-bloomberg-gray rounded border border-gray-800 p-6">
        <h3 className="text-lg font-semibold mb-2">{SCENARIOS[selectedScenario].name}</h3>
        <p className="text-gray-400 mb-4">{SCENARIOS[selectedScenario].description}</p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Best Performer: </span>
            <span className="text-green-400 font-medium">
              {(() => {
                const best = Object.entries(currentValues).reduce((a, b) => 
                  currentValues[a[0]].change > currentValues[b[0]].change ? a : b
                );
                return ASSETS[best[0]].name;
              })()}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Worst Performer: </span>
            <span className="text-red-400 font-medium">
              {(() => {
                const worst = Object.entries(currentValues).reduce((a, b) => 
                  currentValues[a[0]].change < currentValues[b[0]].change ? a : b
                );
                return ASSETS[worst[0]].name;
              })()}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Portfolio Impact: </span>
            <span className="text-bloomberg-orange font-medium">
              {(Object.values(currentValues).reduce((sum, asset) => sum + asset.change, 0) / 6).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Disclaimer Footer */}
      <div className="text-center text-xs text-gray-500 mt-8 pb-4 border-t border-gray-800 pt-4">
        <p>
          <strong>Disclaimer:</strong> This market crash simulator is for educational and entertainment purposes only. 
          Not financial advice. Hypothetical scenarios do not predict actual market behavior.
        </p>
      </div>        

    </div>
  );
}

export default MarketCrashSimulator;