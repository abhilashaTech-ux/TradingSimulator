# 📈 TradeLab

## Full-Stack Trading Strategy Simulator & Financial Analytics Platform

<p align="center">

**Build • Analyse • Strategize • Backtest • Simulate • Learn**

A full-stack educational trading simulation platform that allows users to experiment with technical indicators, trading strategies, portfolio management, candlestick patterns, multi-asset analysis and financial analytics using randomly generated market data.

</p>

---

# 🌐 Live Project

### 🚀 Live Application

https://trading-simulator-flame.vercel.app/

### 💻 GitHub Repository

https://github.com/abhilashaTech-ux/TradingSimulator

### ⚙️ Backend API

https://trading-simulator-backend-x6qz.onrender.com/

> **Important:** TradeLab is an educational simulation platform. It does not execute real-money trades and does not connect users to a stock exchange or brokerage account.

---

# 📑 Table of Contents

- [About TradeLab](#-about-tradelab)
- [Project Overview](#-project-overview)
- [Problem Statement](#-problem-statement)
- [Project Objectives](#-project-objectives)
- [Six Internship Tasks](#-six-internship-tasks)
  - [Task 1 - Trading Strategy Simulator](#task-1---trading-strategy-simulator)
  - [Task 2 - Authentication and Data Persistence](#task-2---authentication-and-data-persistence)
  - [Task 3 - Multi-Asset Chart](#task-3---multi-asset-chart)
  - [Task 4 - Candlestick Pattern Recognition](#task-4---candlestick-pattern-recognition)
  - [Task 5 - Advanced Portfolio Simulation](#task-5---advanced-portfolio-simulation)
  - [Task 6 - Advanced Data Analytics Dashboard](#task-6---advanced-data-analytics-dashboard)
- [Complete Application Workflow](#-complete-application-workflow)
- [System Architecture](#-system-architecture)
- [Market Data Simulation](#-market-data-simulation)
- [Technical Indicators](#-technical-indicators)
- [Strategy and Crossover Logic](#-strategy-and-crossover-logic)
- [Backtesting Engine](#-backtesting-engine)
- [Portfolio Management](#-portfolio-management)
- [Candlestick Analysis](#-candlestick-analysis)
- [Multi-Asset Analysis](#-multi-asset-analysis)
- [Advanced Analytics](#-advanced-analytics)
- [Live Market Simulation](#-live-market-simulation)
- [Firebase Integration](#-firebase-integration)
- [Frontend Architecture](#-frontend-architecture)
- [Backend Architecture](#-backend-architecture)
- [API](#-api)
- [Project Structure](#-project-structure)
- [Technology Stack](#-technology-stack)
- [Development Tools](#-development-tools)
- [Installation](#-installation)
- [Running the Project](#-running-the-project)
- [Production Build](#-production-build)
- [Testing](#-testing)
- [Challenges and Solutions](#-challenges-and-solutions)
- [Security and Data Handling](#-security-and-data-handling)
- [Project Limitations](#-project-limitations)
- [Future Scope](#-future-scope)
- [Learning Outcomes](#-learning-outcomes)
- [Internship Task Mapping](#-internship-task-mapping)
- [Project Screenshots](#-project-screenshots)
- [Deployment](#-deployment)
- [Project Information](#-project-information)
- [Developer](#-developer)
- [Disclaimer](#-disclaimer)

---

# 🚀 About TradeLab

**TradeLab** is a full-stack web-based trading simulation and financial analytics platform developed as an educational internship project.

The platform combines technical analysis, trading strategy creation, backtesting, portfolio simulation, candlestick pattern recognition, multi-asset visualization, advanced analytics, Firebase authentication and persistent user data into a single interactive application.

Instead of using real financial market data or real-money trading, TradeLab generates simulated OHLCV market data and allows users to experiment with trading concepts in a controlled environment.

The primary goal of the project is to create a practical learning environment where users can understand how technical indicators, trading strategies, transactions, market movement and portfolio performance interact with one another.

---

# 📊 Project Overview

TradeLab was developed as a full-stack application using a React frontend, Node.js/Express backend and Firebase services.

The application was developed around **six major internship requirements**.

### Core Modules

| Module | Purpose |
|---|---|
| Trading Strategy Simulator | Create and test trading rules |
| Technical Indicators | SMA, EMA, RSI and Bollinger Bands |
| Backtesting Engine | Evaluate strategies on simulated market data |
| Portfolio Simulation | Simulate BUY and SELL transactions |
| Candlestick Recognition | Detect common candlestick formations |
| Multi-Asset Chart | Compare simulated assets |
| Advanced Analytics | Analyse trends, momentum and volatility |
| Authentication | User registration and login |
| Firestore | Persistent cloud data |
| Live Simulation | Dynamically update simulated prices |

---

# ❓ Problem Statement

Understanding financial markets and algorithmic trading concepts can be difficult when users only study theoretical examples.

A practical environment is required where users can:

- Generate market data.
- Apply technical indicators.
- Create trading rules.
- Test strategies.
- Execute simulated trades.
- Track portfolio performance.
- Analyse candlestick patterns.
- Compare multiple assets.
- Study financial indicators.
- Observe how market changes affect portfolio performance.

TradeLab addresses these requirements by combining these concepts into one interactive full-stack application.

---

# 🎯 Project Objectives

The main objectives of TradeLab are:

- Build an interactive trading simulation platform.
- Generate randomized market data.
- Implement technical indicators.
- Allow users to configure trading rules.
- Implement crossover-based trading strategies.
- Provide automated backtesting.
- Display BUY and SELL signals visually.
- Simulate portfolio transactions.
- Calculate simulated profit and loss.
- Recognize common candlestick patterns.
- Compare multiple simulated assets.
- Provide advanced financial analytics.
- Implement Firebase authentication.
- Store user-related application data.
- Provide an intuitive analytical interface.
- Deploy the application using modern cloud platforms.

---

# 🧩 Six Internship Tasks

The project was structured around six major development requirements.

---

# Task 1 - Trading Strategy Simulator

## 📌 Requirement

The first task required the platform to allow users to create and customize trading indicators and apply simple trading strategies to randomly generated market data.

Example strategy rules included:

> Buy when the price crosses the 50-day moving average.

and

> Sell when RSI exceeds 70.

The system was also required to dynamically update charts and portfolio performance based on the applied strategy.

---

## 💡 Implementation

TradeLab implements a strategy simulation and backtesting workflow.

The platform generates simulated market data and calculates technical indicators including:

- SMA20
- SMA50
- EMA20
- RSI14
- Bollinger Bands

Users can configure BUY and SELL rules through the **Strategy Builder**.

The current strategy builder supports crossover conditions:

- **Cross Above**
- **Cross Below**

---

## 🔄 Strategy Workflow

```text
Generated Market Data
        ↓
Calculate Technical Indicators
        ↓
Configure BUY / SELL Rules
        ↓
Select Crossover Condition
        ↓
Run Backtest
        ↓
Generate Trading Signals
        ↓
Execute Simulated Trades
        ↓
Calculate Performance
        ↓
Display Results