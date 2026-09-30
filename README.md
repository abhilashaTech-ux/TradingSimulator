# TradeLab — Trading Strategy Simulator

A full-stack web-based trading strategy simulator designed to help users understand, build, test, and analyse algorithmic trading strategies using simulated market data.

TradeLab combines technical indicators, crossover-based trading strategies, backtesting, portfolio simulation, candlestick pattern recognition, multi-asset visualization, advanced analytics, Firebase authentication, and live market simulation in a single interactive dashboard.

> **Disclaimer:** TradeLab is an educational simulation project. It does not execute real trades, use real-money accounts, or provide financial advice.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Project Objectives](#project-objectives)
- [Project Workflow](#project-workflow)
- [System Architecture](#system-architecture)
- [Core Features](#core-features)
- [Market Data Simulation](#market-data-simulation)
- [Technical Indicators](#technical-indicators)
- [Strategy Builder](#strategy-builder)
- [Crossover Strategy](#crossover-strategy)
- [Backtesting Engine](#backtesting-engine)
- [Portfolio Simulation](#portfolio-simulation)
- [Candlestick Pattern Recognition](#candlestick-pattern-recognition)
- [Multi-Asset Visualization](#multi-asset-visualization)
- [Advanced Analytics](#advanced-analytics)
- [Live Market Simulation](#live-market-simulation)
- [Firebase Integration](#firebase-integration)
- [Frontend Architecture](#frontend-architecture)
- [Backend Architecture](#backend-architecture)
- [API Endpoints](#api-endpoints)
- [Technology Stack](#technology-stack)
- [Development Tools](#development-tools)
- [Project Structure](#project-structure)
- [Application Flow](#application-flow)
- [Installation](#installation)
- [Running the Project](#running-the-project)
- [Production Build](#production-build)
- [Testing](#testing)
- [Deployment](#deployment)
- [Challenges and Solutions](#challenges-and-solutions)
- [Security and Data Handling](#security-and-data-handling)
- [Project Limitations](#project-limitations)
- [Future Scope](#future-scope)
- [Learning Outcomes](#learning-outcomes)
- [Project Information](#project-information)
- [Project Links](#project-links)
- [Developer](#developer)
- [Disclaimer](#disclaimer)

---

# Project Overview

TradeLab is a full-stack trading strategy simulator developed as an internship project.

The application allows users to generate simulated market data, apply technical indicators, create BUY and SELL rules, execute backtests, analyse trading performance, and monitor a simulated portfolio.

The project is designed around the workflow of a simplified algorithmic trading system:

```text
Market Data
     ↓
Technical Indicators
     ↓
Trading Strategy
     ↓
BUY / SELL Conditions
     ↓
Backtesting
     ↓
Trade Execution
     ↓
Portfolio Calculation
     ↓
Performance Analysis
     ↓
Results & Analytics