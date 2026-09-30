# 📈 TradeLab

## Trading Strategy Simulator

<p align="center">
  <b>Simulate • Strategize • Backtest • Analyse • Learn</b>
</p>

<p align="center">
  A full-stack web application for creating, testing, visualizing and analysing
  trading strategies using simulated market data.
</p>

<p align="center">

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-Frontend-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-REST_API-000000?style=for-the-badge&logo=express&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Authentication_&_Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Recharts](https://img.shields.io/badge/Recharts-Data_Visualization-8884D8?style=for-the-badge)

</p>

<p align="center">

🌐 **Live Demo:**  
https://trading-simulator-flame.vercel.app/

💻 **GitHub:**  
https://github.com/abhilashaTech-ux/TradingSimulator

</p>

---

# 📑 Table of Contents

- [About the Project](#-about-the-project)
- [Project Objective](#-project-objective)
- [Problem Statement](#-problem-statement)
- [Project Workflow](#-project-workflow)
- [System Architecture](#-system-architecture)
- [Core Features](#-core-features)
- [Market Data Simulation](#-market-data-simulation)
- [Technical Indicators](#-technical-indicators)
- [Strategy Builder](#-strategy-builder)
- [Crossover Strategy](#-crossover-strategy)
- [Backtesting Engine](#-backtesting-engine)
- [Portfolio Simulation](#-portfolio-simulation)
- [Candlestick Pattern Recognition](#-candlestick-pattern-recognition)
- [Multi-Asset Visualization](#-multi-asset-visualization)
- [Advanced Analytics](#-advanced-analytics)
- [Live Market Simulation](#-live-market-simulation)
- [Firebase Integration](#-firebase-integration)
- [Frontend](#-frontend-architecture)
- [Backend](#-backend-architecture)
- [API](#-api-endpoints)
- [Technology Stack](#-technology-stack)
- [Development Tools](#-development-tools)
- [Project Structure](#-project-structure)
- [Application Flow](#-application-flow)
- [Installation](#-installation)
- [Running the Project](#-running-the-project)
- [Production Build](#-production-build)
- [Testing](#-testing)
- [Challenges and Solutions](#-challenges-and-solutions)
- [Security and Data Handling](#-security-and-data-handling)
- [Project Limitations](#-project-limitations)
- [Future Scope](#-future-scope)
- [Learning Outcomes](#-learning-outcomes)
- [Project Information](#-project-information)
- [Project Links](#-project-links)
- [Developer](#-developer)
- [Disclaimer](#-disclaimer)

---

# 💡 About the Project

**TradeLab** is a full-stack trading strategy simulation platform developed as an internship project at **ElevanceSkills**.

The application provides an interactive environment where users can experiment with trading strategies without using real financial funds.

Instead of connecting to real stock-market APIs, TradeLab generates **simulated OHLCV market data** and uses that data for technical analysis, strategy execution, backtesting and portfolio simulation.

The application combines:

- Frontend development
- Backend development
- REST API communication
- Data visualization
- Technical analysis
- Trading strategy logic
- Backtesting
- Portfolio simulation
- Firebase Authentication
- Firestore persistence
- Candlestick pattern recognition
- Multi-asset visualization
- Market analytics

---

# 🎯 Project Objective

The main objective of TradeLab is to provide a practical learning environment for understanding how trading-analysis systems work.

The project focuses on:

- Creating simulated financial datasets
- Applying technical indicators
- Building customizable trading rules
- Detecting indicator crossovers
- Running trading strategy backtests
- Calculating trading performance
- Simulating portfolio transactions
- Identifying candlestick patterns
- Comparing multiple simulated assets
- Analysing price trends and volatility
- Persisting user-specific data
- Connecting frontend and backend systems

---

# ❓ Problem Statement

Understanding trading strategies theoretically can be difficult without a practical environment for experimentation.

Real financial markets also involve financial risk, making them unsuitable for unrestricted experimentation.

TradeLab addresses this problem by providing a **simulated trading environment** where users can:

```text
Generate Data
     ↓
Analyse Market
     ↓
Create Strategy
     ↓
Generate BUY / SELL Signals
     ↓
Backtest Strategy
     ↓
Simulate Portfolio
     ↓
Analyse Performance