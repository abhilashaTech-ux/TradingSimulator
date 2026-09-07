function TradeHistory({ trades }) {
  if (!trades || trades.length === 0) {
    return (
      <div className="trade-history-card">
        <div className="trade-history-header">
          <div>
            <span className="section-label">
              TRADE HISTORY
            </span>

            <h2>Executed Trades</h2>
          </div>
        </div>

        <div className="no-trades-message">
          <div className="no-trades-icon">
            📊
          </div>

          <h3>No trades executed</h3>

          <p>
            Try changing your BUY and SELL rules
            and run the backtest again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="trade-history-card">

      <div className="trade-history-header">

        <div>
          <span className="section-label">
            TRADE HISTORY
          </span>

          <h2>Executed Trades</h2>

          <p>
            {trades.length} trade
            {trades.length !== 1 ? "s" : ""} executed
            during the backtest.
          </p>
        </div>

      </div>


      <div className="trade-table-wrapper">

        <table className="trade-table">

          <thead>

            <tr>
              <th>#</th>
              <th>Type</th>
              <th>Date</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Total</th>
              <th>Profit / Loss</th>
            </tr>

          </thead>


          <tbody>

            {trades.map((trade, index) => (

              <tr key={index}>

                <td>
                  {index + 1}
                </td>

                <td>

                  <span
                    className={
                      trade.type === "BUY"
                        ? "trade-type buy"
                        : "trade-type sell"
                    }
                  >
                    {trade.type}
                  </span>

                </td>

                <td>
                  {trade.date}
                </td>

                <td>
                  ₹{Number(
                    trade.price
                  ).toFixed(2)}
                </td>

                <td>
                  {trade.quantity}
                </td>

                <td>
                  ₹{Number(
                    trade.total
                  ).toFixed(2)}
                </td>

                <td>

                  {trade.profitLoss !== undefined
                    ? (
                      <span
                        className={
                          trade.profitLoss >= 0
                            ? "profit-positive"
                            : "profit-negative"
                        }
                      >
                        ₹{Number(
                          trade.profitLoss
                        ).toFixed(2)}
                      </span>
                    )
                    : (
                      <span className="not-applicable">
                        —
                      </span>
                    )}

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default TradeHistory;