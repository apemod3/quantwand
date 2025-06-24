# QuantWand - Professional Financial Analytics Terminal

![QuantWand Logo](https://img.shields.io/badge/QuantWand-Professional%20Trading%20Terminal-orange?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSIjRkY2OTAwIi8+Cjwvc3ZnPgo=)

A sophisticated financial analytics terminal built with React and Express.js, designed for professional traders and quantitative analysts. Features real-time market data, advanced portfolio optimization using Modern Portfolio Theory, risk analytics, and market crash simulation.

## 🚀 Live Demo

- **Frontend**: [QuantWand Terminal](https://quantwand.vercel.app/)
- **Backend API**: [QuantWand API](https://quantwand.onrender.com/api)

## 📊 Features

### 🏪 Market Overview
- **Real-time Stock Prices** via Alpha Vantage API
- **Cryptocurrency Tracking** via CoinGecko API
- **Customizable Watchlists** with localStorage persistence
- **Market Summary Dashboard** with key indices
- **Rate Limit Management** for API efficiency

### 🧠 Advanced Portfolio Optimizer
- **Monte Carlo Simulation** (10,000 iterations)
- **Modern Portfolio Theory** implementation
- **Efficient Frontier** visualization
- **Sharpe Ratio Optimization**
- **Correlation Matrix** analysis
- **Risk-Return Visualization**
- **Interactive Asset Allocation**

### ⚠️ Risk Analytics
- **Value at Risk (VaR)** calculations (95% & 99% confidence)
- **Maximum Drawdown** analysis
- **Portfolio Beta** measurement
- **Monte Carlo Risk Forecasting**
- **Historical VaR Backtesting**
- **Position-level Risk Breakdown**

### 📈 Financial Statement Analysis
- **Income Statement Visualization**
- **Key Financial Metrics** (Revenue Growth, Profit Margin, EPS)
- **Historical Performance Charts**
- **Multi-period Comparison**
- **FMP API Integration**

### 💥 Market Crash Simulator
- **8 Crisis Scenarios** (COVID-19, 2008 Crisis, AI Takeover, Zombie Apocalypse, etc.)
- **Real-time Asset Impact** visualization
- **Multi-asset Class Simulation** (Stocks, Crypto, Gold, Oil, Real Estate, Forex)
- **Interactive Timeline Control**
- **Custom Scenario Builder**
- **Recovery Time Analysis**

## 🛠️ Technology Stack

### Frontend
- **React 19.1.0** with Hooks and modern patterns
- **Vite** for fast development and building
- **Tailwind CSS** for responsive design
- **Recharts** for financial data visualization
- **Lucide React** for consistent iconography
- **Axios** for API communication

### Backend
- **Express.js 5.1.0** with modern middleware
- **Node.js** runtime environment
- **Axios** for external API calls
- **CORS** enabled for cross-origin requests
- **dotenv** for environment configuration
- **node-cron** for scheduled tasks
- **mathjs** and **simple-statistics** for quantitative calculations

### External APIs
- **Alpha Vantage** - Real-time stock data
- **CoinGecko** - Cryptocurrency prices
- **Financial Modeling Prep** - Financial statements

## 🏗️ Project Architecture

```
quantwand/
├── backend/
│   ├── server.js              # Main Express server
│   ├── portfolioOptimizer.js  # Monte Carlo & MPT implementation
│   ├── package.json
│   └── .env                   # API keys (not committed)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── MarketOverview.jsx
│   │   │   ├── EnhancedPortfolioOptimizer.jsx
│   │   │   ├── RiskAnalytics.jsx
│   │   │   ├── FinancialStatements.jsx
│   │   │   └── MarketCrashSimulator.jsx
│   │   ├── App.jsx            # Main application component
│   │   ├── main.jsx           # React entry point
│   │   └── index.css          # Global styles
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- API keys for Alpha Vantage, CoinGecko, and FMP

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/quantwand.git
cd quantwand
```

2. **Backend Setup**
```bash
cd backend
npm install

# Create .env file
echo "ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key" >> .env
echo "COINGECKO_API_KEY=your_coingecko_key" >> .env
echo "FMP_API_KEY=your_fmp_key" >> .env
echo "PORT=5000" >> .env

# Start development server
npm run dev
```

3. **Frontend Setup**
```bash
cd ../frontend
npm install
npm run dev
```

4. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 🔧 API Configuration

### Required API Keys

1. **Alpha Vantage** (Stock Data)
   - Get free key: https://www.alphavantage.co/support/#api-key
   - Free tier: 5 requests/minute, 500 requests/day

2. **CoinGecko** (Crypto Data)
   - Free tier available with rate limits
   - Optional API key for higher limits

3. **Financial Modeling Prep** (Financial Statements)
   - Get free key: https://financialmodelingprep.com/developer/docs
   - Free tier: 250 requests/day

### Environment Variables

```env
# Backend (.env)
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
COINGECKO_API_KEY=your_coingecko_key  # Optional
FMP_API_KEY=your_fmp_key
PORT=5000
```

## 📚 API Documentation

### Endpoints

#### Stock Data
```http
GET /api/stocks/price/:symbol
```
Returns real-time stock price data including price, change, volume.

#### Cryptocurrency Data
```http
GET /api/crypto/price/:id
```
Returns cryptocurrency price and 24h change data.

#### Portfolio Optimization
```http
POST /api/portfolio/optimize
Content-Type: application/json

{
  "assets": ["AAPL", "GOOGL", "MSFT"],
  "constraints": {
    "minWeight": 0.05,
    "maxWeight": 0.40
  }
}
```

#### Financial Statements
```http
GET /api/financials/:symbol
```
Returns income statement data for the specified symbol.

## 🧮 Mathematical Models

### Portfolio Optimization

The application implements **Modern Portfolio Theory** with:

- **Expected Return**: μp = Σ(wi × μi)
- **Portfolio Variance**: σp² = Σ Σ (wi × wj × σij)
- **Sharpe Ratio**: (μp - rf) / σp
- **Monte Carlo Simulation**: 10,000 random portfolio combinations

### Risk Metrics

- **Value at Risk (VaR)**: Historical simulation method
- **Conditional VaR**: Expected shortfall beyond VaR
- **Maximum Drawdown**: Peak-to-trough decline
- **Beta**: Correlation with market benchmark

## 🎨 UI/UX Design

### Bloomberg Terminal Inspired
- **Dark Theme** with professional color scheme
- **Monospace Fonts** (JetBrains Mono) for data readability
- **Orange Accent Color** (#FF6900) for branding
- **Responsive Grid Layouts** for multi-screen compatibility
- **Real-time Updates** with loading states

### Key Design Elements
- Bloomberg-style data tables
- Professional charting with Recharts
- Interactive controls and sliders
- Context-sensitive tooltips
- Color-coded performance indicators

## 🔄 Development Timeline

### Commit History & Feature Evolution

**Jun 15, 2025 - Initial Foundation**
```bash
37a5fb8 - Initial Commit (9 days ago)
```
- Project scaffold with React + Express
- Basic file structure setup
- Initial configuration files

**Jun 15, 2025 - Production Deployment**
```bash
8049a46 - Update API URLs for production (9 days ago)
```
- Configured API endpoints for live deployment
- Environment setup for Vercel and Render hosting

**Jun 18, 2025 - Market Crash Simulator Launch**
```bash
6d7dedf - Added Market Crash Simulator Component (5 days ago)
46d2153 - Trigger Vercel MCRASH Deployment (5 days ago)
```
- **NEW FEATURE**: Market Crash Simulator with 8+ scenarios
- Crisis simulation engine (COVID-19, 2008 Crisis, AI Takeover, Zombie Apocalypse)
- Real-time multi-asset impact visualization
- Interactive timeline controls and scenario builder

**Jun 19, 2025 - Portfolio Optimization Revolution**
```bash
fe9f123 - Added Enhanced Portfolio Optimizer functionality (5 days ago)
d9c0b63 - Added Enhanced Portfolio Optimizer functionality (5 days ago) 
78cd8af - Added Enhanced Portfolio Optimizer functionality (5 days ago)
c8f0e0d - Added EnhancedPortfolioOptimizer Functionality (5 days ago)
```
**Major Development Day - Multiple iterations:**
- **16:28**: Backend portfolio optimizer engine created (`portfolioOptimizer.js`)
- **16:41**: Frontend integration with App.jsx
- **16:54**: Enhanced component architecture
- **17:10**: Advanced UI features and visualizations

**Key Features Added:**
- Monte Carlo simulation (10,000 iterations)
- Modern Portfolio Theory implementation
- Efficient frontier visualization
- Correlation matrix analysis
- Multi-tab interface (Overview, Frontier, Correlation, Statistics)
- Mathematical optimization algorithms

**Jun 24, 2025 - Watchlist Enhancement**
```bash
2b2cfb3 - Added increased functionality for watchlist (7 minutes ago)
```
- **LATEST**: Enhanced market overview watchlist
- Improved rate limit handling for Alpha Vantage API
- Custom stock/crypto tracking with localStorage persistence
- Better error handling and user feedback

### Development Velocity Analysis

**Sprint 1 (Jun 15)**: Foundation & Infrastructure
- Project initialization and deployment setup

**Sprint 2 (Jun 18)**: Innovation Phase  
- Market crash simulator (major feature)
- Crisis scenario modeling

**Sprint 3 (Jun 19)**: Quantitative Finance Focus
- **Intense development day**: 4 commits in ~3 hours
- Portfolio optimization engine built from scratch
- Advanced mathematical implementations

**Sprint 4 (Jun 24)**: User Experience Polish
- Watchlist functionality improvements
- Production stability enhancements

### Key Files Created/Modified by Commit

**Initial Setup (37a5fb8)**
- Complete project structure
- Backend and frontend scaffolding
- Package configurations

**Portfolio Optimization Engine (fe9f123)**
```
A  backend/portfolioOptimizer.js     # Core optimization algorithms
M  backend/package.json              # Added mathjs, simple-statistics  
M  backend/server.js                 # Portfolio optimization endpoint
A  frontend/src/components/EnhancedPortfolioOptimizer.jsx
M  frontend/src/App.jsx              # Tab navigation integration
```

**Market Crash Simulator (6d7dedf)**
```
A  frontend/src/components/MarketCrashSimulator.jsx  # Crisis simulation engine
M  frontend/src/App.jsx                              # New tab integration
```

**Watchlist Enhancements (2b2cfb3)**
```
M  frontend/src/components/MarketOverview.jsx        # Enhanced functionality
```

### Development Insights

1. **Rapid Feature Development**: The portfolio optimizer was built in a single intensive session with 4+ commits
2. **Component-Based Architecture**: Each major feature is self-contained in its own component
3. **API-First Design**: Backend algorithms developed before frontend interfaces
4. **Iterative Refinement**: Multiple commits show continuous improvement pattern
5. **Production Stability**: Recent commits focus on rate limiting and error handling

## 📊 Performance Considerations

### API Rate Limiting
- **Alpha Vantage**: 12-second delays between stock requests
- **Smart Caching**: localStorage for watchlist persistence
- **Error Handling**: Graceful degradation on API failures
- **Loading States**: User feedback during data fetching

### Optimization Techniques
- **Component Memoization**: React.memo for expensive renders
- **Lazy Loading**: Code splitting for large components
- **Data Structures**: Efficient correlation matrix calculations
- **Batch Processing**: Multiple API calls with proper sequencing

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
# Deploy to Vercel
```

### Backend (Render)
```bash
cd backend
# Configure environment variables in Render dashboard
# Deploy from GitHub repository
```

### Environment Configuration
Ensure all API keys are properly configured in deployment environments.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow ESLint configuration
- Write descriptive commit messages
- Test API integrations thoroughly
- Maintain Bloomberg terminal aesthetic
- Document new mathematical models

## 📝 License

This project is licensed under the ISC License - see the package.json files for details.

## 🙏 Acknowledgments

- **Bloomberg Terminal** for UI/UX inspiration
- **Alpha Vantage** for reliable stock market data
- **CoinGecko** for comprehensive cryptocurrency data
- **Financial Modeling Prep** for financial statement access
- **Recharts** for beautiful financial visualizations
- **Tailwind CSS** for rapid UI development

## 📞 Support

For support, email your-email@example.com or create an issue in the GitHub repository.

---

**Disclaimer**: This application is for educational and research purposes only. Not intended as financial advice. Always consult with qualified financial professionals before making investment decisions.
