# 📈 TradeLab

### Trading Strategy Simulator | Learn • Build • Test • Analyse

<p align="center">
  <b>
    A full-stack web application for creating, testing, and analysing
    trading strategies using simulated market data.
  </b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Vite-Build%20Tool-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-REST%20API-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/Firebase-Auth%20%26%20Database-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" />
  <img src="https://img.shields.io/badge/Recharts-Data%20Visualization-8884D8?style=for-the-badge" />
</p>

<p align="center">
  🌐 <b>Live Demo</b> • 💻 <b>GitHub Repository</b>
</p>

---

## 💡 About TradeLab

**TradeLab** is a full-stack trading strategy simulation platform developed during my internship at **ElevanceSkills**.

The application provides an educational environment where users can create, customise, test, and analyse trading strategies using simulated market data without using real money.

TradeLab combines:

- 📊 Market data simulation
- 📈 Technical indicators
- ⚙️ Strategy building
- 🧪 Backtesting
- 💼 Portfolio simulation
- 🕯️ Candlestick pattern recognition
- 📊 Multi-asset visualization
- 📈 Advanced analytics
- 🔐 Firebase authentication
- 💾 Firestore data persistence
- 🔄 Live simulated market updates

> ⚠️ **Note:** TradeLab uses randomly generated/simulated market data. It is intended for educational and experimental purposes only and does not execute real trades or provide financial advice.

---

# ✨ Key Features

## 🔐 1. Authentication & User Management

TradeLab uses Firebase Authentication to provide user-specific access.

### Features

- 🔑 User registration
- 🔓 User login
- 🚪 User logout
- 🔐 Firebase Authentication
- 💾 User-specific data
- ☁️ Firestore persistence
- 📚 Saved backtest history

---

# 📊 2. Simulated Market Data

TradeLab generates simulated market data instead of connecting to real financial markets.

The generated dataset contains:

- Open price
- High price
- Low price
- Close price
- Volume
- Date

Users can generate a completely new simulated market dataset whenever required.

### 🔄 Live Market Simulation

TradeLab also supports continuously changing simulated prices.

Users can:

- ▶️ Start live updates
- ⏸️ Pause live updates
- 📈 Observe changing prices
- 🟢 Monitor live simulation status

---

# 📈 3. Technical Indicators

TradeLab provides multiple technical-analysis indicators.

### Available Indicators

| Indicator | Purpose |
|---|---|
| SMA 20 | Short-term moving average |
| SMA 50 | Longer-term moving average |
| EMA 20 | Exponential moving average |
| RSI 14 | Momentum analysis |
| Bollinger Bands | Price volatility and range analysis |

These indicators can be visualised directly on the trading chart.

---

# ⚙️ 4. Strategy Builder

Users can create customised BUY and SELL trading rules.

### Supported Conditions

```text
Greater Than
Less Than
Greater Than or Equal
Less Than or Equal
Cross Above
Cross Below