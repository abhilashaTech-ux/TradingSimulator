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
  ReferenceLine,
} from "recharts";

// =========================================================
// ADVANCED ANALYTICS DASHBOARD
// =========================================================

function AdvancedAnalytics({
  marketData = [],
  indicators = [],
}) {

  // =======================================================
  // CONTROLS
  // =======================================================

  const [timeRange, setTimeRange] = useState("ALL");

  const [selectedIndicators, setSelectedIndicators] =
    useState({
      SMA20: true,
      SMA50: true,
      EMA20: true,
      RSI14: true,
      VOLATILITY: true,
    });

  // =======================================================
  // TIME RANGE
  // =======================================================

  const rangeOptions = {
    "1D": 1,
    "1W": 7,
    "1M": 30,
    "3M": 90,
    "6M": 180,
    "ALL": marketData.length,
  };

  // =======================================================
  // CALCULATE VOLATILITY USING COMPLETE DATASET
  // =======================================================

  const completeAnalyticsData = useMemo(() => {

    if (!indicators.length) {
      return [];
    }

    const period = 20;

    return indicators.map((item, index) => {

      let volatility = null;

      // ---------------------------------------------------
      // We need 20 periods of historical data.
      // Calculate this BEFORE applying the selected range.
      // ---------------------------------------------------

      if (index >= period) {

        const returns = [];

        for (
          let i = index - period + 1;
          i <= index;
          i++
        ) {

          const current =
            Number(indicators[i]?.close);

          const previous =
            Number(indicators[i - 1]?.close);

          if (
            Number.isFinite(current) &&
            Number.isFinite(previous) &&
            previous !== 0
          ) {

            const dailyReturn =
              ((current - previous) /
                previous) *
              100;

            returns.push(dailyReturn);
          }
        }

        // -------------------------------------------------
        // Calculate standard deviation of returns
        // -------------------------------------------------

        if (returns.length >= 2) {

          const mean =
            returns.reduce(
              (sum, value) =>
                sum + value,
              0
            ) / returns.length;

          const variance =
            returns.reduce(
              (sum, value) =>
                sum +
                Math.pow(
                  value - mean,
                  2
                ),
              0
            ) / returns.length;

          volatility =
            Number(
              Math.sqrt(variance).toFixed(2)
            );
        }
      }

      return {
        ...item,
        volatility,
      };
    });

  }, [indicators]);

  // =======================================================
  // FILTER DATA BY SELECTED TIME RANGE
  // =======================================================

  const analyticsData = useMemo(() => {

    if (!completeAnalyticsData.length) {
      return [];
    }

    const amount =
      rangeOptions[timeRange] ||
      completeAnalyticsData.length;

    return completeAnalyticsData.slice(
      -amount
    );

  }, [
    completeAnalyticsData,
    timeRange,
    marketData.length,
  ]);

  // =======================================================
  // LATEST ANALYTICS
  // =======================================================

  const latestAnalytics = useMemo(() => {

    if (!analyticsData.length) {

      return {
        currentPrice: 0,
        sma20: 0,
        sma50: 0,
        ema20: 0,
        rsi14: 0,
        volatility: 0,
        priceChange: 0,
      };
    }

    const latest =
      analyticsData[
        analyticsData.length - 1
      ];

    const first =
      analyticsData[0];

    // -----------------------------------------------------
    // Current price
    // -----------------------------------------------------

    const currentPrice =
      Number(latest.close || 0);

    // -----------------------------------------------------
    // Starting price for selected range
    // -----------------------------------------------------

    const startingPrice =
      Number(first.close || 0);

    // -----------------------------------------------------
    // Percentage change over selected range
    // -----------------------------------------------------

    const priceChange =
      startingPrice !== 0
        ? (
            ((currentPrice -
              startingPrice) /
              startingPrice) *
            100
          )
        : 0;

    return {

      currentPrice,

      sma20:
        Number(latest.SMA20 ?? 0),

      sma50:
        Number(latest.SMA50 ?? 0),

      ema20:
        Number(latest.EMA20 ?? 0),

      rsi14:
        Number(latest.RSI14 ?? 0),

      volatility:
        Number(latest.volatility ?? 0),

      priceChange:
        Number(
          priceChange.toFixed(2)
        ),
    };

  }, [analyticsData]);

  // =======================================================
  // TOGGLE INDICATOR
  // =======================================================

  function toggleIndicator(indicator) {

    setSelectedIndicators(
      previous => ({
        ...previous,

        [indicator]:
          !previous[indicator],
      })
    );
  }

  // =======================================================
  // FORMAT VALUE
  // =======================================================

  function formatValue(value) {

    if (
      value === null ||
      value === undefined ||
      !Number.isFinite(Number(value))
    ) {
      return "—";
    }

    return Number(value).toFixed(2);
  }

  // =======================================================
  // EMPTY STATE
  // =======================================================

  if (!marketData.length) {

    return (
      <section className="section advanced-analytics">

        <div className="section-heading">

          <div>

            <h2>
              📊 Advanced Data Analytics
            </h2>

            <p>
              No market data is available
              for analysis.
            </p>

          </div>

        </div>

      </section>
    );
  }

  // =======================================================
  // UI
  // =======================================================

  return (

    <section className="section advanced-analytics">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="section-heading">

        <div>

          <h2>
            📊 Advanced Data Analytics
          </h2>

          <p>
            Analyze market trends,
            momentum and risk using
            professional technical metrics.
          </p>

        </div>

        <span className="badge">

          {analyticsData.length}
          {" "}
          Data Points

        </span>

      </div>

      {/* =================================================
          CONTROLS
      ================================================= */}

      <div className="analytics-control-panel">

        {/* =================================================
            TIME RANGE
        ================================================= */}

        <div className="analytics-control-group">

          <span className="analytics-control-title">
            Time Range
          </span>

          <div className="time-range-buttons">

            {Object.keys(rangeOptions).map(
              range => (

                <button
                  key={range}
                  type="button"
                  className={
                    timeRange === range
                      ? "time-range-button active"
                      : "time-range-button"
                  }
                  onClick={() =>
                    setTimeRange(range)
                  }
                >
                  {range}
                </button>

              )
            )}

          </div>

        </div>

        {/* =================================================
            INDICATOR TOGGLES
        ================================================= */}

        <div className="analytics-control-group">

          <span className="analytics-control-title">
            Indicators
          </span>

          <div className="analytics-indicator-toggles">

            {/* SMA 20 */}

            <label>

              <input
                type="checkbox"
                checked={
                  selectedIndicators.SMA20
                }
                onChange={() =>
                  toggleIndicator("SMA20")
                }
              />

              SMA 20

            </label>

            {/* SMA 50 */}

            <label>

              <input
                type="checkbox"
                checked={
                  selectedIndicators.SMA50
                }
                onChange={() =>
                  toggleIndicator("SMA50")
                }
              />

              SMA 50

            </label>

            {/* EMA 20 */}

            <label>

              <input
                type="checkbox"
                checked={
                  selectedIndicators.EMA20
                }
                onChange={() =>
                  toggleIndicator("EMA20")
                }
              />

              EMA 20

            </label>

            {/* RSI 14 */}

            <label>

              <input
                type="checkbox"
                checked={
                  selectedIndicators.RSI14
                }
                onChange={() =>
                  toggleIndicator("RSI14")
                }
              />

              RSI 14

            </label>

            {/* VOLATILITY */}

            <label>

              <input
                type="checkbox"
                checked={
                  selectedIndicators.VOLATILITY
                }
                onChange={() =>
                  toggleIndicator("VOLATILITY")
                }
              />

              Volatility

            </label>

          </div>

        </div>

      </div>

      {/* =================================================
          METRIC CARDS
      ================================================= */}

      <div className="analytics-metrics-grid">

        {/* CURRENT PRICE */}

        <div className="analytics-metric-card">

          <span>
            CURRENT PRICE
          </span>

          <strong>
            ₹
            {formatValue(
              latestAnalytics.currentPrice
            )}
          </strong>

          <small>
            Latest simulated price
          </small>

        </div>

        {/* SMA 20 */}

        {selectedIndicators.SMA20 && (

          <div className="analytics-metric-card">

            <span>
              SMA 20
            </span>

            <strong>
              ₹
              {formatValue(
                latestAnalytics.sma20
              )}
            </strong>

            <small>
              20-period moving average
            </small>

          </div>

        )}

        {/* SMA 50 */}

        {selectedIndicators.SMA50 && (

          <div className="analytics-metric-card">

            <span>
              SMA 50
            </span>

            <strong>
              ₹
              {formatValue(
                latestAnalytics.sma50
              )}
            </strong>

            <small>
              50-period moving average
            </small>

          </div>

        )}

        {/* EMA 20 */}

        {selectedIndicators.EMA20 && (

          <div className="analytics-metric-card">

            <span>
              EMA 20
            </span>

            <strong>
              ₹
              {formatValue(
                latestAnalytics.ema20
              )}
            </strong>

            <small>
              Exponential moving average
            </small>

          </div>

        )}

        {/* RSI 14 */}

        {selectedIndicators.RSI14 && (

          <div className="analytics-metric-card">

            <span>
              RSI 14
            </span>

            <strong>
              {formatValue(
                latestAnalytics.rsi14
              )}
            </strong>

            <small>
              Momentum indicator · 0–100
            </small>

          </div>

        )}

        {/* VOLATILITY */}

        {selectedIndicators.VOLATILITY && (

          <div className="analytics-metric-card">

            <span>
              PRICE VOLATILITY
            </span>

            <strong>
              {formatValue(
                latestAnalytics.volatility
              )}
              %
            </strong>

            <small>
              20-period return volatility
            </small>

          </div>

        )}

        {/* PERIOD CHANGE */}

        <div className="analytics-metric-card">

          <span>
            PERIOD CHANGE
          </span>

          <strong
            className={
              latestAnalytics.priceChange >= 0
                ? "analytics-positive"
                : "analytics-negative"
            }
          >

            {latestAnalytics.priceChange >= 0
              ? "+"
              : ""}

            {formatValue(
              latestAnalytics.priceChange
            )}
            %

          </strong>

          <small>
            Change over selected range
          </small>

        </div>

      </div>

      {/* =================================================
          PRICE & MOVING AVERAGES
      ================================================= */}

      <div className="analytics-chart-card">

        <div className="analytics-chart-header">

          <div>

            <h3>
              Price & Moving Averages
            </h3>

            <p>
              Trend analysis using
              selected moving averages.
            </p>

          </div>

        </div>

        <div className="analytics-chart">

          <ResponsiveContainer
            width="100%"
            height={380}
          >

            <LineChart
              data={analyticsData}
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

              {/* CLOSE PRICE */}

              <Line
                type="monotone"
                dataKey="close"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
                name="Close Price"
                connectNulls
              />

              {/* SMA 20 */}

              {selectedIndicators.SMA20 && (

                <Line
                  type="monotone"
                  dataKey="SMA20"
                  stroke="#16a34a"
                  strokeWidth={2}
                  dot={false}
                  name="SMA 20"
                  connectNulls
                />

              )}

              {/* SMA 50 */}

              {selectedIndicators.SMA50 && (

                <Line
                  type="monotone"
                  dataKey="SMA50"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={false}
                  name="SMA 50"
                  connectNulls
                />

              )}

              {/* EMA 20 */}

              {selectedIndicators.EMA20 && (

                <Line
                  type="monotone"
                  dataKey="EMA20"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                  name="EMA 20"
                  connectNulls
                />

              )}

            </LineChart>

          </ResponsiveContainer>

        </div>

      </div>

      {/* =================================================
          RSI CHART
      ================================================= */}

      {selectedIndicators.RSI14 && (

        <div className="analytics-chart-card">

          <div className="analytics-chart-header">

            <div>

              <h3>
                RSI Momentum Analysis
              </h3>

              <p>
                Relative Strength Index
                with 30/70 reference levels.
              </p>

            </div>

          </div>

          <div className="analytics-chart">

            <ResponsiveContainer
              width="100%"
              height={300}
            >

              <LineChart
                data={analyticsData}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="date"
                  minTickGap={35}
                />

                <YAxis
                  domain={[0, 100]}
                />

                <Tooltip />

                <Legend />

                <ReferenceLine
                  y={70}
                  stroke="#dc2626"
                  strokeDasharray="5 5"
                  label="70"
                />

                <ReferenceLine
                  y={30}
                  stroke="#16a34a"
                  strokeDasharray="5 5"
                  label="30"
                />

                <Line
                  type="monotone"
                  dataKey="RSI14"
                  stroke="#7c3aed"
                  strokeWidth={2}
                  dot={false}
                  name="RSI 14"
                  connectNulls
                />

              </LineChart>

            </ResponsiveContainer>

          </div>

        </div>

      )}

      {/* =================================================
          VOLATILITY CHART
      ================================================= */}

      {selectedIndicators.VOLATILITY && (

        <div className="analytics-chart-card">

          <div className="analytics-chart-header">

            <div>

              <h3>
                Price Volatility
              </h3>

              <p>
                Rolling 20-period standard
                deviation of daily returns.
              </p>

            </div>

          </div>

          <div className="analytics-chart">

            <ResponsiveContainer
              width="100%"
              height={300}
            >

              <LineChart
                data={analyticsData}
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
                  dataKey="volatility"
                  stroke="#ea580c"
                  strokeWidth={2}
                  dot={false}
                  name="Volatility %"
                  connectNulls
                />

              </LineChart>

            </ResponsiveContainer>

          </div>

        </div>

      )}

      {/* =================================================
          ANALYTICAL SUMMARY
      ================================================= */}

      <div className="analytics-summary">

        <h3>
          📌 Analytical Summary
        </h3>

        <div className="analytics-summary-grid">

          {/* TREND */}

          <div>

            <strong>
              Trend
            </strong>

            <p>

              {latestAnalytics.sma20 > 0 &&
              latestAnalytics.currentPrice >
              latestAnalytics.sma20

                ? "Current price is above SMA 20, indicating stronger short-term price positioning."

                : latestAnalytics.sma20 > 0

                ? "Current price is below SMA 20, indicating weaker short-term price positioning."

                : "SMA 20 data is not yet available for the selected range."

              }

            </p>

          </div>

          {/* MOMENTUM */}

          <div>

            <strong>
              Momentum
            </strong>

            <p>

              {latestAnalytics.rsi14 >= 70

                ? "RSI is above 70, placing momentum in the traditionally overbought zone."

                : latestAnalytics.rsi14 <= 30

                ? "RSI is below 30, placing momentum in the traditionally oversold zone."

                : "RSI is between 30 and 70, indicating neutral momentum conditions."

              }

            </p>

          </div>

          {/* RISK */}

          <div>

            <strong>
              Risk
            </strong>

            <p>

              {latestAnalytics.volatility > 0

                ? (
                    <>
                      Current rolling volatility is{" "}
                      {formatValue(
                        latestAnalytics.volatility
                      )}
                      %. Higher volatility represents
                      larger variation in recent
                      daily returns.
                    </>
                  )

                : "Volatility data is not yet available for the selected range."

              }

            </p>

          </div>

        </div>

      </div>

    </section>

  );
}

export default AdvancedAnalytics;