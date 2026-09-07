import { useMemo, useState } from "react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import "./App.css";


// -----------------------------------
// MARKET DATA
// -----------------------------------

function generateMarketData(days = 200) {
  const data = [];

  let price = 100;

  const startDate =
    new Date("2025-01-01");

  for (let i = 0; i < days; i++) {
    const date =
      new Date(startDate);

    date.setDate(
      startDate.getDate() + i
    );

    const trend = i * 0.15;

    const randomChange =
      Math.sin(i * 0.35) * 4 +
      Math.sin(i * 0.12) * 3 +
      (Math.random() - 0.5) * 6;

    price = Math.max(
      40,
      price +
        randomChange +
        trend * 0.03
    );

    data.push({
      date:
        date
          .toISOString()
          .split("T")[0],

      close:
        Number(
          price.toFixed(2)
        ),
    });
  }

  return data;
}


// -----------------------------------
// INDICATORS FOR CHART
// -----------------------------------

function calculateSMA(
  marketData,
  period
) {
  const result = [];

  for (
    let i = 0;
    i < marketData.length;
    i++
  ) {
    if (i < period - 1) {
      result.push(null);
      continue;
    }

    let sum = 0;

    for (
      let j =
        i - period + 1;
      j <= i;
      j++
    ) {
      sum += Number(
        marketData[j].close
      );
    }

    result.push(
      sum / period
    );
  }

  return result;
}


function calculateEMA(
  marketData,
  period
) {
  const result = [];

  const multiplier =
    2 / (period + 1);

  let previousEMA = null;

  for (
    let i = 0;
    i < marketData.length;
    i++
  ) {
    const price =
      Number(
        marketData[i].close
      );

    if (i < period - 1) {
      result.push(null);
      continue;
    }

    if (
      i === period - 1
    ) {
      let sum = 0;

      for (
        let j = 0;
        j < period;
        j++
      ) {
        sum += Number(
          marketData[j].close
        );
      }

      previousEMA =
        sum / period;

      result.push(
        previousEMA
      );

      continue;
    }

    const ema =
      (price - previousEMA) *
        multiplier +
      previousEMA;

    previousEMA = ema;

    result.push(ema);
  }

  return result;
}


function calculateRSI(
  marketData,
  period
) {
  const result =
    Array(
      marketData.length
    ).fill(null);

  if (
    marketData.length <= period
  ) {
    return result;
  }

  let gains = 0;
  let losses = 0;

  for (
    let i = 1;
    i <= period;
    i++
  ) {
    const change =
      Number(
        marketData[i].close
      ) -
      Number(
        marketData[i - 1].close
      );

    if (change >= 0) {
      gains += change;
    } else {
      losses +=
        Math.abs(change);
    }
  }

  let averageGain =
    gains / period;

  let averageLoss =
    losses / period;

  if (averageLoss === 0) {
    result[period] = 100;
  } else {
    const rs =
      averageGain /
      averageLoss;

    result[period] =
      100 -
      100 / (1 + rs);
  }

  for (
    let i = period + 1;
    i < marketData.length;
    i++
  ) {
    const change =
      Number(
        marketData[i].close
      ) -
      Number(
        marketData[i - 1].close
      );

    const gain =
      change > 0
        ? change
        : 0;

    const loss =
      change < 0
        ? Math.abs(change)
        : 0;

    averageGain =
      (
        averageGain *
          (period - 1) +
        gain
      ) / period;

    averageLoss =
      (
        averageLoss *
          (period - 1) +
        loss
      ) / period;

    if (
      averageLoss === 0
    ) {
      result[i] = 100;
    } else {
      const rs =
        averageGain /
        averageLoss;

      result[i] =
        100 -
        100 / (1 + rs);
    }
  }

  return result;
}


// -----------------------------------
// APP
// -----------------------------------

function App() {

  const [
    marketData,
    setMarketData
  ] = useState(() =>
    generateMarketData(200)
  );


  const [
    initialCapital,
    setInitialCapital
  ] = useState(10000);


  const [
    buyRule,
    setBuyRule
  ] = useState({
    indicator: "SMA20",
    condition: ">",
    compareWith: "SMA50",
    value: 0,
  });


  const [
    sellRule,
    setSellRule
  ] = useState({
    indicator: "SMA20",
    condition: "<",
    compareWith: "SMA50",
    value: 0,
  });


  const [
    backtestResult,
    setBacktestResult
  ] = useState(null);


  const [
    loading,
    setLoading
  ] = useState(false);


  const [
    error,
    setError
  ] = useState("");



  // -----------------------------------
  // INDICATORS
  // -----------------------------------

  const indicators =
    useMemo(() => {

      const sma20 =
        calculateSMA(
          marketData,
          20
        );

      const sma50 =
        calculateSMA(
          marketData,
          50
        );

      const ema20 =
        calculateEMA(
          marketData,
          20
        );

      const rsi14 =
        calculateRSI(
          marketData,
          14
        );

      return marketData.map(
        (item, index) => ({
          ...item,

          SMA20:
            sma20[index],

          SMA50:
            sma50[index],

          EMA20:
            ema20[index],

          RSI14:
            rsi14[index],
        })
      );

    }, [marketData]);



  // -----------------------------------
  // TRADE MARKERS
  // -----------------------------------

  const tradesByIndex =
    useMemo(() => {

      if (
        !backtestResult?.trades
      ) {
        return {};
      }

      const tradeMap = {};

      backtestResult.trades.forEach(
        (trade) => {

          tradeMap[
            trade.index
          ] = trade;

        }
      );

      return tradeMap;

    }, [backtestResult]);



  const chartData =
    useMemo(() => {

      return indicators.map(
        (item, index) => ({
          ...item,

          buy:
            tradesByIndex[index]
              ?.type === "BUY"
              ? item.close
              : null,

          sell:
            tradesByIndex[index]
              ?.type === "SELL"
              ? item.close
              : null,
        })
      );

    }, [
      indicators,
      tradesByIndex
    ]);



  // -----------------------------------
  // RUN BACKTEST API
  // -----------------------------------

  async function handleRunBacktest() {

    try {

      setLoading(true);

      setError("");


      const response =
        await fetch(
          "http://localhost:5000/api/backtest/run",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({

                strategy: {
                  buyRule,
                  sellRule,
                },

                initialCapital:
                  Number(
                    initialCapital
                  ),

                marketData,

              }),
          }
        );


      const data =
        await response.json();


      if (!response.ok) {
        throw new Error(
          data.message ||
            "Backtest failed"
        );
      }


      setBacktestResult(
        data
      );

    } catch (error) {

      console.error(
        "Backtest error:",
        error
      );

      setError(
        error.message ||
          "Unable to connect to backend"
      );

    } finally {

      setLoading(false);

    }
  }



  // -----------------------------------
  // NEW DATASET
  // -----------------------------------

  function handleNewDataset() {

    const newData =
      generateMarketData(200);

    setMarketData(
      newData
    );

    setBacktestResult(
      null
    );

    setError("");
  }



  const currentPrice =
    marketData.length > 0
      ? marketData[
          marketData.length - 1
        ].close
      : 0;


  const startingPrice =
    marketData.length > 0
      ? marketData[0].close
      : 0;



  return (

    <div className="app">


      {/* HEADER */}

      <header className="navbar">

        <div>

          <h2>
            📈 TradeLab
          </h2>

          <p>
            Trading Strategy Simulator
          </p>

        </div>


        <div className="online-status">

          <span
            className="status-dot"
          ></span>

          Simulator Online

        </div>

      </header>



      {/* HERO */}

      <section className="hero">

        <p className="eyebrow">
          TRADING SIMULATION PLATFORM
        </p>


        <h1>
          Build, Test & Analyze
          Trading Strategies
        </h1>


        <p>
          Test Moving Averages,
          RSI and custom trading
          rules against simulated
          market data.
        </p>


        <button
          className="primary-button"
          onClick={
            handleNewDataset
          }
        >
          🔄 Generate New Dataset
        </button>

      </section>



      {/* MARKET CHART */}

      <section className="section">

        <div className="section-heading">

          <div>

            <h2>
              Market Simulation
            </h2>

            <p>
              Simulated market data
              with technical
              indicators.
            </p>

          </div>


          <span className="badge">

            {marketData.length} Days

          </span>

        </div>


        <div className="chart-container">

          <ResponsiveContainer
            width="100%"
            height={400}
          >

            <LineChart
              data={chartData}
            >

              <CartesianGrid
                strokeDasharray="3 3"
              />


              <XAxis
                dataKey="date"
                minTickGap={35}
              />


              <YAxis />


              <Tooltip />


              <Legend />


              <Line
                type="monotone"
                dataKey="close"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
                name="Close Price"
              />


              <Line
                type="monotone"
                dataKey="EMA20"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
                name="EMA 20"
              />


              <Line
                type="monotone"
                dataKey="SMA50"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={false}
                name="SMA 50"
              />


              <Line
                type="monotone"
                dataKey="buy"
                stroke="#16a34a"
                strokeWidth={0}
                dot={{
                  r: 6,
                  fill: "#16a34a",
                }}
                activeDot={false}
                name="BUY"
              />


              <Line
                type="monotone"
                dataKey="sell"
                stroke="#dc2626"
                strokeWidth={0}
                dot={{
                  r: 6,
                  fill: "#dc2626",
                }}
                activeDot={false}
                name="SELL"
              />

            </LineChart>

          </ResponsiveContainer>

        </div>

      </section>



      {/* MARKET STATS */}

      <section className="stats-grid">


        <div className="stat-card">

          <span>
            MARKET DAYS
          </span>

          <strong>
            {marketData.length}
          </strong>

          <small>
            Simulated trading days
          </small>

        </div>



        <div className="stat-card">

          <span>
            STARTING PRICE
          </span>

          <strong>
            ₹
            {Number(
              startingPrice
            ).toFixed(2)}
          </strong>

          <small>
            Day 1 closing price
          </small>

        </div>



        <div className="stat-card">

          <span>
            CURRENT PRICE
          </span>

          <strong>
            ₹
            {Number(
              currentPrice
            ).toFixed(2)}
          </strong>

          <small>
            Latest simulated price
          </small>

        </div>

      </section>



      {/* STRATEGY BUILDER */}

      <section
        className="section strategy-section"
      >

        <div className="section-heading">

          <div>

            <h2>
              Strategy Builder
            </h2>

            <p>
              Define when the
              simulator should buy
              and sell.
            </p>

          </div>

        </div>



        {/* CAPITAL */}

        <div className="capital-box">

          <label>
            Initial Capital
          </label>


          <input
            type="number"
            value={
              initialCapital
            }
            onChange={(e) =>
              setInitialCapital(
                e.target.value
              )
            }
          />

        </div>



        {/* BUY RULE */}

        <div className="rule-box">

          <h3>
            🟢 BUY Rule
          </h3>

          <p>
            Define when the
            simulator should buy.
          </p>


          <div className="rule-grid">


            <select
              value={
                buyRule.indicator
              }
              onChange={(e) =>
                setBuyRule({
                  ...buyRule,
                  indicator:
                    e.target.value,
                })
              }
            >

              <option value="CLOSE">
                Close Price
              </option>

              <option value="SMA20">
                SMA 20
              </option>

              <option value="SMA50">
                SMA 50
              </option>

              <option value="EMA20">
                EMA 20
              </option>

              <option value="RSI14">
                RSI 14
              </option>

            </select>



            <select
              value={
                buyRule.condition
              }
              onChange={(e) =>
                setBuyRule({
                  ...buyRule,
                  condition:
                    e.target.value,
                })
              }
            >

              <option value=">">
                Greater Than
              </option>

              <option value="<">
                Less Than
              </option>

              <option value=">=">
                Greater Than or Equal
              </option>

              <option value="<=">
                Less Than or Equal
              </option>

            </select>



            <select
              value={
                buyRule.compareWith
              }
              onChange={(e) =>
                setBuyRule({
                  ...buyRule,
                  compareWith:
                    e.target.value,
                })
              }
            >

              <option value="SMA20">
                SMA 20
              </option>

              <option value="SMA50">
                SMA 50
              </option>

              <option value="EMA20">
                EMA 20
              </option>

              <option value="RSI14">
                RSI 14
              </option>

              <option value="VALUE">
                Custom Value
              </option>

            </select>



            {buyRule.compareWith ===
              "VALUE" && (

              <input
                type="number"
                placeholder="Value"
                value={
                  buyRule.value
                }
                onChange={(e) =>
                  setBuyRule({
                    ...buyRule,
                    value:
                      e.target.value,
                  })
                }
              />

            )}

          </div>

        </div>



        {/* SELL RULE */}

        <div className="rule-box">

          <h3>
            🔴 SELL Rule
          </h3>

          <p>
            Define when the
            simulator should sell.
          </p>


          <div className="rule-grid">


            <select
              value={
                sellRule.indicator
              }
              onChange={(e) =>
                setSellRule({
                  ...sellRule,
                  indicator:
                    e.target.value,
                })
              }
            >

              <option value="CLOSE">
                Close Price
              </option>

              <option value="SMA20">
                SMA 20
              </option>

              <option value="SMA50">
                SMA 50
              </option>

              <option value="EMA20">
                EMA 20
              </option>

              <option value="RSI14">
                RSI 14
              </option>

            </select>



            <select
              value={
                sellRule.condition
              }
              onChange={(e) =>
                setSellRule({
                  ...sellRule,
                  condition:
                    e.target.value,
                })
              }
            >

              <option value=">">
                Greater Than
              </option>

              <option value="<">
                Less Than
              </option>

              <option value=">=">
                Greater Than or Equal
              </option>

              <option value="<=">
                Less Than or Equal
              </option>

            </select>



            <select
              value={
                sellRule.compareWith
              }
              onChange={(e) =>
                setSellRule({
                  ...sellRule,
                  compareWith:
                    e.target.value,
                })
              }
            >

              <option value="SMA20">
                SMA 20
              </option>

              <option value="SMA50">
                SMA 50
              </option>

              <option value="EMA20">
                EMA 20
              </option>

              <option value="RSI14">
                RSI 14
              </option>

              <option value="VALUE">
                Custom Value
              </option>

            </select>



            {sellRule.compareWith ===
              "VALUE" && (

              <input
                type="number"
                placeholder="Value"
                value={
                  sellRule.value
                }
                onChange={(e) =>
                  setSellRule({
                    ...sellRule,
                    value:
                      e.target.value,
                  })
                }
              />

            )}

          </div>

        </div>



        {/* ERROR */}

        {error && (

          <p
            style={{
              color: "#dc2626",
              fontWeight: "bold",
            }}
          >

            {error}

          </p>

        )}



        {/* RUN BUTTON */}

        <button
          className="run-button"
          onClick={
            handleRunBacktest
          }
          disabled={loading}
        >

          {loading
            ? "Running Backtest..."
            : "▶️ Run Backtest"}

        </button>

      </section>



      {/* RESULTS */}

      {backtestResult && (

        <>

          <section className="section">

            <div className="section-heading">

              <div>

                <h2>
                  Backtest Results
                </h2>

                <p>
                  Performance of your
                  trading strategy.
                </p>

              </div>

            </div>


            <div className="result-grid">


              <div className="result-card">

                <span>
                  FINAL CAPITAL
                </span>

                <strong>

                  ₹
                  {Number(
                    backtestResult
                      .finalCapital
                  ).toFixed(2)}

                </strong>

              </div>



              <div className="result-card">

                <span>
                  PROFIT / LOSS
                </span>

                <strong
                  className={
                    backtestResult
                      .profitLoss >= 0
                      ? "profit"
                      : "loss"
                  }
                >

                  ₹
                  {Number(
                    backtestResult
                      .profitLoss
                  ).toFixed(2)}

                </strong>

              </div>



              <div className="result-card">

                <span>
                  RETURN
                </span>

                <strong
                  className={
                    backtestResult
                      .returnPercentage >=
                    0
                      ? "profit"
                      : "loss"
                  }
                >

                  {Number(
                    backtestResult
                      .returnPercentage
                  ).toFixed(2)}
                  %

                </strong>

              </div>



              <div className="result-card">

                <span>
                  WINNING TRADES
                </span>

                <strong>

                  {
                    backtestResult
                      .winningTrades
                  }

                </strong>

              </div>



              <div className="result-card">

                <span>
                  LOSING TRADES
                </span>

                <strong>

                  {
                    backtestResult
                      .losingTrades
                  }

                </strong>

              </div>

            </div>

          </section>



          {/* TRADE HISTORY */}

          <section className="section">

            <div className="section-heading">

              <div>

                <h2>
                  Trade History
                </h2>

                <p>
                  All BUY and SELL
                  transactions.
                </p>

              </div>

            </div>


            <div className="table-wrapper">

              <table>

                <thead>

                  <tr>

                    <th>Type</th>

                    <th>Date</th>

                    <th>Price</th>

                    <th>Quantity</th>

                    <th>
                      Profit / Loss
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {backtestResult.trades.map(
                    (
                      trade,
                      index
                    ) => (

                      <tr
                        key={index}
                      >

                        <td>

                          <span
                            className={
                              trade.type ===
                              "BUY"
                                ? "buy-tag"
                                : "sell-tag"
                            }
                          >

                            {trade.type}

                          </span>

                        </td>


                        <td>
                          {trade.date}
                        </td>


                        <td>

                          ₹
                          {Number(
                            trade.price
                          ).toFixed(2)}

                        </td>


                        <td>

                          {Number(
                            trade.quantity
                          ).toFixed(2)}

                        </td>


                        <td>

                          {trade.type ===
                          "SELL"
                            ? `₹${Number(
                                trade.profitLoss
                              ).toFixed(2)}`
                            : "-"}

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          </section>

        </>

      )}



      {/* FOOTER */}

      <footer>

        <h3>
          TradeLab
        </h3>

        <p>
          Trading Strategy Simulator
          • Educational Simulation
          Platform
        </p>

      </footer>

    </div>

  );
}


export default App;