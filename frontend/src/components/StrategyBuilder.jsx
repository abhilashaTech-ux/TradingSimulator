import { useState } from "react";
import { runBacktest } from "../services/api";

function StrategyBuilder({ onRun, marketData }) {
  // Initial capital
  const [initialCapital, setInitialCapital] = useState(10000);

  // BUY rule
  const [buyRule, setBuyRule] = useState({
    indicator: "SMA",
    period: 50,
    condition: "cross_above",
    value: 70
  });

  // SELL rule
  const [sellRule, setSellRule] = useState({
    indicator: "RSI",
    period: 14,
    condition: "greater_than",
    value: 70
  });

  // Backtest state
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // UPDATE BUY RULE
  // --------------------------------------------------

  function updateBuyRule(field, value) {
    setBuyRule((previous) => ({
      ...previous,
      [field]: value
    }));
  }

  // --------------------------------------------------
  // UPDATE SELL RULE
  // --------------------------------------------------

  function updateSellRule(field, value) {
    setSellRule((previous) => ({
      ...previous,
      [field]: value
    }));
  }

  // --------------------------------------------------
  // RUN BACKTEST
  // --------------------------------------------------

  async function handleRun() {
    try {
      setRunning(true);
      setError("");
      setResult(null);

      if (
        !marketData || marketData.length === 0) {
            setError(
                "Market data is not available yet."
            );
            return;
        }
      

      const strategy = {
        buyRule: {
          ...buyRule,
          period: Number(buyRule.period),
          value: Number(buyRule.value)
        },

        sellRule: {
          ...sellRule,
          period: Number(sellRule.period),
          value: Number(sellRule.value)
        }
      };

      const data = await runBacktest(
        strategy,
        Number(initialCapital),
        marketData
      );

      setResult(data);

      // Send strategy to parent component
      if (onRun) {
        onRun(
          strategy,
          Number(initialCapital),
          data
        );
      }

    } catch (err) {
      console.error("Backtest failed:", err);

      setError(
        err.message ||
        "Unable to run backtest. Please make sure the backend is running."
      );

    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="strategy-card">

      {/* ------------------------------------------------
          INITIAL CAPITAL
      ------------------------------------------------ */}

      <div className="capital-box">

        <div>
          <span className="section-label">
            INITIAL CAPITAL
          </span>

          <p>
            Starting amount for your simulated portfolio.
          </p>
        </div>

        <div className="capital-input-wrapper">

          <span>₹</span>

          <input
            type="number"
            min="100"
            value={initialCapital}
            onChange={(e) =>
              setInitialCapital(e.target.value)
            }
          />

        </div>

      </div>


      {/* ------------------------------------------------
          BUY RULE
      ------------------------------------------------ */}

      <div className="rule-section">

        <div className="rule-title">

          <div className="rule-icon buy-icon">
            B
          </div>

          <div>
            <h3>BUY Rule</h3>

            <p>
              Define when the simulator should buy.
            </p>
          </div>

        </div>


        <div className="rule-grid">

          {/* Indicator */}

          <div className="form-field">

            <label>
              Indicator
            </label>

            <select
              value={buyRule.indicator}
              onChange={(e) =>
                updateBuyRule(
                  "indicator",
                  e.target.value
                )
              }
            >

              <option value="SMA">
                SMA
              </option>

              <option value="EMA">
                EMA
              </option>

              <option value="RSI">
                RSI
              </option>

              <option value="Bollinger Bands">
                Bollinger Bands
              </option>

            </select>

          </div>


          {/* Period */}

          <div className="form-field">

            <label>
              Period
            </label>

            <input
              type="number"
              min="2"
              max="200"
              value={buyRule.period}
              onChange={(e) =>
                updateBuyRule(
                  "period",
                  e.target.value
                )
              }
            />

          </div>


          {/* Condition */}

          <div className="form-field">

            <label>
              Condition
            </label>

            <select
              value={buyRule.condition}
              onChange={(e) =>
                updateBuyRule(
                  "condition",
                  e.target.value
                )
              }
            >

              <option value="cross_above">
                Cross Above
              </option>

              <option value="cross_below">
                Cross Below
              </option>

              <option value="greater_than">
                Greater Than
              </option>

              <option value="less_than">
                Less Than
              </option>

              <option value="equal_to">
                Equal To
              </option>

            </select>

          </div>


          {/* Value */}

          <div className="form-field">

            <label>
              Value
            </label>

            <input
              type="number"
              value={buyRule.value}
              onChange={(e) =>
                updateBuyRule(
                  "value",
                  e.target.value
                )
              }
            />

          </div>

        </div>

      </div>


      {/* ------------------------------------------------
          SELL RULE
      ------------------------------------------------ */}

      <div className="rule-section">

        <div className="rule-title">

          <div className="rule-icon sell-icon">
            S
          </div>

          <div>
            <h3>SELL Rule</h3>

            <p>
              Define when the simulator should sell.
            </p>
          </div>

        </div>


        <div className="rule-grid">

          {/* Indicator */}

          <div className="form-field">

            <label>
              Indicator
            </label>

            <select
              value={sellRule.indicator}
              onChange={(e) =>
                updateSellRule(
                  "indicator",
                  e.target.value
                )
              }
            >

              <option value="SMA">
                SMA
              </option>

              <option value="EMA">
                EMA
              </option>

              <option value="RSI">
                RSI
              </option>

              <option value="Bollinger Bands">
                Bollinger Bands
              </option>

            </select>

          </div>


          {/* Period */}

          <div className="form-field">

            <label>
              Period
            </label>

            <input
              type="number"
              min="2"
              max="200"
              value={sellRule.period}
              onChange={(e) =>
                updateSellRule(
                  "period",
                  e.target.value
                )
              }
            />

          </div>


          {/* Condition */}

          <div className="form-field">

            <label>
              Condition
            </label>

            <select
              value={sellRule.condition}
              onChange={(e) =>
                updateSellRule(
                  "condition",
                  e.target.value
                )
              }
            >

              <option value="greater_than">
                Greater Than
              </option>

              <option value="less_than">
                Less Than
              </option>

              <option value="cross_above">
                Cross Above
              </option>

              <option value="cross_below">
                Cross Below
              </option>

              <option value="equal_to">
                Equal To
              </option>

            </select>

          </div>


          {/* Value */}

          <div className="form-field">

            <label>
              Value
            </label>

            <input
              type="number"
              value={sellRule.value}
              onChange={(e) =>
                updateSellRule(
                  "value",
                  e.target.value
                )
              }
            />

          </div>

        </div>

      </div>


      {/* ------------------------------------------------
          RUN BUTTON
      ------------------------------------------------ */}

      <div className="run-section">

        <button
          className="run-button"
          onClick={handleRun}
          disabled={running}
        >

          {running
            ? "Running Backtest..."
            : "▶ Run Backtest"}

        </button>

        <p>
          The strategy will be tested against
          200 simulated market days.
        </p>

      </div>


      {/* ------------------------------------------------
          ERROR
      ------------------------------------------------ */}

      {error && (

        <div className="backtest-error">

          ⚠️ {error}

        </div>

      )}


      {/* ------------------------------------------------
          BACKTEST RESULT
      ------------------------------------------------ */}

      {result && (

        <div className="backtest-result">

          <h3>
            Backtest Completed ✅
          </h3>


          <div className="result-grid">

            {/* Initial Capital */}

            <div className="result-item">

              <span>
                Initial Capital
              </span>

              <strong>
                ₹{Number(
                  result.initialCapital
                ).toFixed(2)}
              </strong>

            </div>


            {/* Final Value */}

            <div className="result-item">

              <span>
                Final Value
              </span>

              <strong>
                ₹{Number(
                  result.finalValue
                ).toFixed(2)}
              </strong>

            </div>


            {/* Profit Loss */}

            <div className="result-item">

              <span>
                Profit / Loss
              </span>

              <strong>
                ₹{Number(
                  result.profitLoss
                ).toFixed(2)}
              </strong>

            </div>


            {/* Return */}

            <div className="result-item">

              <span>
                Return
              </span>

              <strong>
                {Number(
                  result.returnPercentage
                ).toFixed(2)}
                %
              </strong>

            </div>


            {/* Total Trades */}

            <div className="result-item">

              <span>
                Total Trades
              </span>

              <strong>
                {result.totalTrades}
              </strong>

            </div>

          </div>


          {/* ------------------------------------------------
              TRADE HISTORY PREVIEW
          ------------------------------------------------ */}

          {result.trades &&
            result.trades.length > 0 && (

            <div className="trade-preview">

              <h4>
                Executed Trades
              </h4>

              <div className="trade-list">

                {result.trades.map(
                  (trade, index) => (

                    <div
                      className="trade-row"
                      key={index}
                    >

                      <span
                        className={
                          trade.type === "BUY"
                            ? "trade-buy"
                            : "trade-sell"
                        }
                      >
                        {trade.type}
                      </span>

                      <span>
                        {trade.date}
                      </span>

                      <span>
                        ₹{Number(
                          trade.price
                        ).toFixed(2)}
                      </span>

                      <span>
                        Qty: {trade.quantity}
                      </span>

                    </div>

                  )
                )}

              </div>

            </div>

          )}

          {result.trades &&
            result.trades.length === 0 && (

            <div className="no-trades">

              No trades were executed with
              the selected rules.

            </div>

          )}

        </div>

      )}

    </div>
  );
}

export default StrategyBuilder;