const axios = require('axios');
const ss = require('simple-statistics');

class PortfolioOptimizer {
  constructor(alphaVantageKey) {
    this.apiKey = alphaVantageKey;
    this.cache = new Map(); // Cache API responses
  }

  // Fetch historical prices for a symbol
  async fetchHistoricalData(symbol, outputSize = 'compact') {
    // Check cache first
    const cacheKey = `${symbol}-${outputSize}`;
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < 3600000) { // 1 hour cache
        return cached.data;
      }
    }

    try {
      const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${symbol}&outputsize=${outputSize}&apikey=${this.apiKey}`;
      const response = await axios.get(url);
      
      if (response.data['Error Message'] || response.data['Note']) {
        throw new Error('API limit reached or invalid symbol');
      }

      const timeSeries = response.data['Time Series (Daily)'];
      if (!timeSeries) {
        throw new Error('No data available for ' + symbol);
      }

      // Convert to array of prices
      const prices = Object.entries(timeSeries)
        .map(([date, values]) => ({
          date,
          price: parseFloat(values['5. adjusted close'])
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      // Cache the result
      this.cache.set(cacheKey, {
        data: prices,
        timestamp: Date.now()
      });

      return prices;
    } catch (error) {
      console.error(`Error fetching data for ${symbol}:`, error.message);
      
      // Return mock data if API fails
      return this.generateMockHistoricalData(symbol);
    }
  }

  // Generate mock historical data as fallback
  generateMockHistoricalData(symbol) {
    const mockParams = {
      'AAPL': { base: 150, volatility: 0.02, trend: 0.0003 },
      'GOOGL': { base: 130, volatility: 0.025, trend: 0.0002 },
      'MSFT': { base: 300, volatility: 0.018, trend: 0.0004 },
      'AMZN': { base: 140, volatility: 0.03, trend: 0.0001 },
      'TSLA': { base: 250, volatility: 0.05, trend: 0.0005 },
      'DEFAULT': { base: 100, volatility: 0.025, trend: 0.0002 }
    };

    const params = mockParams[symbol] || mockParams['DEFAULT'];
    const prices = [];
    let currentPrice = params.base;

    // Generate 252 trading days (1 year)
    for (let i = 0; i < 252; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (252 - i));
      
      // Random walk with trend
      const randomReturn = (Math.random() - 0.5) * params.volatility + params.trend;
      currentPrice *= (1 + randomReturn);
      
      prices.push({
        date: date.toISOString().split('T')[0],
        price: currentPrice
      });
    }

    return prices;
  }

  // Calculate daily returns from price data
  calculateReturns(prices) {
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i].price - prices[i-1].price) / prices[i-1].price);
    }
    return returns;
  }

  // Calculate correlation matrix
  calculateCorrelationMatrix(assetsReturns) {
    const n = assetsReturns.length;
    const correlationMatrix = Array(n).fill(null).map(() => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) {
          correlationMatrix[i][j] = 1;
        } else if (j > i) {
          // Calculate correlation only for upper triangle
          const correlation = ss.sampleCorrelation(assetsReturns[i], assetsReturns[j]);
          correlationMatrix[i][j] = correlation;
          correlationMatrix[j][i] = correlation; // Mirror for lower triangle
        }
      }
    }

    return correlationMatrix;
  }

  // Calculate covariance matrix from correlation matrix and standard deviations
  calculateCovarianceMatrix(correlationMatrix, standardDeviations) {
    const n = correlationMatrix.length;
    const covarianceMatrix = Array(n).fill(null).map(() => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        covarianceMatrix[i][j] = correlationMatrix[i][j] * standardDeviations[i] * standardDeviations[j];
      }
    }

    return covarianceMatrix;
  }

  // Calculate portfolio variance
  calculatePortfolioVariance(weights, covarianceMatrix) {
    let variance = 0;
    const n = weights.length;

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        variance += weights[i] * weights[j] * covarianceMatrix[i][j];
      }
    }

    return variance;
  }

  // Generate random portfolio weights
  generateRandomWeights(n) {
    const weights = Array(n).fill(0).map(() => Math.random());
    const sum = weights.reduce((a, b) => a + b, 0);
    return weights.map(w => w / sum);
  }

  // Calculate Sharpe ratio
  calculateSharpeRatio(returns, risk, riskFreeRate = 0.04) {
    const annualizedReturn = returns * 252; // Annualize daily returns
    const annualizedRisk = risk * Math.sqrt(252);
    return (annualizedReturn - riskFreeRate) / annualizedRisk;
  }

  // Monte Carlo simulation for efficient frontier
  async monteCarloSimulation(assets, numSimulations = 5000) {
    // Fetch historical data for all assets
    const historicalData = await Promise.all(
      assets.map(symbol => this.fetchHistoricalData(symbol))
    );

    // Calculate returns for each asset
    const assetsReturns = historicalData.map(data => this.calculateReturns(data));

    // Calculate statistics
    const meanReturns = assetsReturns.map(returns => ss.mean(returns));
    const stdDeviations = assetsReturns.map(returns => ss.standardDeviation(returns));

    // Calculate correlation and covariance matrices
    const correlationMatrix = this.calculateCorrelationMatrix(assetsReturns);
    const covarianceMatrix = this.calculateCovarianceMatrix(correlationMatrix, stdDeviations);

    // Run Monte Carlo simulation
    const portfolios = [];
    
    for (let i = 0; i < numSimulations; i++) {
      const weights = this.generateRandomWeights(assets.length);
      
      // Calculate portfolio return
      const portfolioReturn = weights.reduce((sum, w, idx) => 
        sum + w * meanReturns[idx], 0
      );
      
      // Calculate portfolio risk
      const portfolioVariance = this.calculatePortfolioVariance(weights, covarianceMatrix);
      const portfolioRisk = Math.sqrt(portfolioVariance);
      
      // Calculate Sharpe ratio
      const sharpeRatio = this.calculateSharpeRatio(portfolioReturn, portfolioRisk);
      
      portfolios.push({
        weights,
        return: portfolioReturn * 252, // Annualized
        risk: portfolioRisk * Math.sqrt(252), // Annualized
        sharpeRatio
      });
    }

    // Find optimal portfolio (highest Sharpe ratio)
    const optimalPortfolio = portfolios.reduce((best, current) => 
      current.sharpeRatio > best.sharpeRatio ? current : best
    );

    // Find minimum variance portfolio
    const minVariancePortfolio = portfolios.reduce((best, current) => 
      current.risk < best.risk ? current : best
    );

    return {
      optimalPortfolio,
      minVariancePortfolio,
      efficientFrontier: portfolios,
      correlationMatrix,
      statistics: {
        meanReturns: meanReturns.map(r => r * 252), // Annualized
        volatilities: stdDeviations.map(s => s * Math.sqrt(252)), // Annualized
        assets
      }
    };
  }

  // Calculate portfolio metrics for given weights
  calculatePortfolioMetrics(weights, meanReturns, covarianceMatrix) {
    // Portfolio return
    const portfolioReturn = weights.reduce((sum, w, idx) => 
      sum + w * meanReturns[idx], 0
    );

    // Portfolio variance and risk
    const portfolioVariance = this.calculatePortfolioVariance(weights, covarianceMatrix);
    const portfolioRisk = Math.sqrt(portfolioVariance);

    // Sharpe ratio
    const sharpeRatio = this.calculateSharpeRatio(portfolioReturn, portfolioRisk);

    return {
      return: portfolioReturn * 252, // Annualized
      risk: portfolioRisk * Math.sqrt(252), // Annualized
      sharpeRatio
    };
  }

  // Optimize portfolio using efficient frontier
  async optimizePortfolio(assets, constraints = {}) {
    const { minWeight = 0, maxWeight = 1 } = constraints;
    
    // Run Monte Carlo simulation
    const simulationResults = await this.monteCarloSimulation(assets, 10000);
    
    // Filter portfolios based on constraints
    const validPortfolios = simulationResults.efficientFrontier.filter(portfolio =>
      portfolio.weights.every(w => w >= minWeight && w <= maxWeight)
    );

    // If no valid portfolios, use the optimal one
    const selectedPortfolio = validPortfolios.length > 0 
      ? validPortfolios.reduce((best, current) => 
          current.sharpeRatio > best.sharpeRatio ? current : best)
      : simulationResults.optimalPortfolio;

    // Format weights with asset symbols
    const optimizedWeights = assets.map((symbol, idx) => ({
      symbol,
      weight: selectedPortfolio.weights[idx]
    }));

    return {
      optimizedWeights,
      expectedReturn: selectedPortfolio.return,
      risk: selectedPortfolio.risk,
      sharpeRatio: selectedPortfolio.sharpeRatio,
      correlationMatrix: simulationResults.correlationMatrix,
      efficientFrontier: simulationResults.efficientFrontier.map(p => ({
        return: p.return,
        risk: p.risk
      })),
      minVariancePortfolio: {
        weights: simulationResults.minVariancePortfolio.weights,
        return: simulationResults.minVariancePortfolio.return,
        risk: simulationResults.minVariancePortfolio.risk
      },
      statistics: simulationResults.statistics
    };
  }
}

module.exports = PortfolioOptimizer;