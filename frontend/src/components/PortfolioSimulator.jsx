import { useEffect, useMemo, useState } from "react";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  getUserPortfolio,
  saveUserPortfolio,
} from "../services/userDataService";

import { auth } from "../services/firebase";

import "../App.css";


// ===================================
// PORTFOLIO SETTINGS
// ===================================

const STARTING_CASH = 10000;

const TRANSACTION_FEE_RATE = 0.001; // 0.1%


const INITIAL_ASSETS = {
  AAPL: {
    name: "Apple",
    price: 190,
  },

  MSFT: {
    name: "Microsoft",
    price: 420,
  },

  TSLA: {
    name: "Tesla",
    price: 250,
  },

  NVDA: {
    name: "NVIDIA",
    price: 135,
  },

  AMZN: {
    name: "Amazon",
    price: 210,
  },
};


// ===================================
// PORTFOLIO SIMULATOR
// ===================================

function PortfolioSimulator() {

  // ===================================
  // ASSET PRICES
  // ===================================

  const [assets, setAssets] =
    useState(INITIAL_ASSETS);


  // ===================================
  // CASH
  // ===================================

  const [cash, setCash] =
    useState(STARTING_CASH);


  // ===================================
  // HOLDINGS
  // ===================================

  const [holdings, setHoldings] =
    useState([]);


  // ===================================
  // TRADE HISTORY
  // ===================================

  const [tradeHistory, setTradeHistory] =
    useState([]);


  // ===================================
  // REALIZED P/L
  // ===================================

  const [realizedPnL, setRealizedPnL] =
    useState(0);


  // ===================================
  // SELECTED ASSET
  // ===================================

  const [selectedAsset, setSelectedAsset] =
    useState("AAPL");


  // ===================================
  // QUANTITY
  // ===================================

  const [quantity, setQuantity] =
    useState(1);


  // ===================================
  // LOADING
  // ===================================

  const [loading, setLoading] =
    useState(true);


  // ===================================
  // TRANSACTION STATUS
  // ===================================

  const [message, setMessage] =
    useState("");


  // ===================================
  // LOAD PORTFOLIO
  // ===================================

  useEffect(() => {

    async function loadPortfolio() {

      const currentUser =
        auth.currentUser;


      if (!currentUser) {

        setLoading(false);

        return;

      }


      try {

        const savedPortfolio =
          await getUserPortfolio(
            currentUser.uid
          );


        if (
          savedPortfolio &&
          Array.isArray(savedPortfolio.holdings)
        ) {

          const validHoldings =
            savedPortfolio.holdings.filter(
              item =>
                item &&
                item.symbol &&
                Number(item.quantity) > 0
            );


          setCash(
            Number(
              savedPortfolio.cash ??
              savedPortfolio.currentCapital ??
              STARTING_CASH
            )
          );


          setHoldings(
            validHoldings
          );


          setTradeHistory(
            Array.isArray(
              savedPortfolio.tradeHistory
            )
              ? savedPortfolio.tradeHistory
              : []
          );


          setRealizedPnL(
            Number(
              savedPortfolio.realizedPnL || 0
            )
          );

        }

      } catch (error) {

        console.error(
          "Portfolio loading error:",
          error
        );

        setMessage(
          "Portfolio could not be loaded."
        );

      } finally {

        setLoading(false);

      }

    }


    loadPortfolio();

  }, []);


  // ===================================
  // LIVE PRICE SIMULATION
  // ===================================

  useEffect(() => {

    const interval =
      setInterval(() => {

        setAssets(previous => {

          const updated = {};


          Object.entries(previous).forEach(
            ([symbol, asset]) => {

              const randomChange =
                (Math.random() - 0.5) *
                0.02;


              const newPrice =
                asset.price *
                (1 + randomChange);


              updated[symbol] = {

                ...asset,

                price:
                  Number(
                    Math.max(
                      1,
                      newPrice
                    ).toFixed(2)
                  ),

              };

            }
          );


          return updated;

        });

      }, 2000);


    return () =>
      clearInterval(interval);

  }, []);


  // ===================================
  // SAVE PORTFOLIO
  // ===================================

  async function persistPortfolio(
    nextCash,
    nextHoldings,
    nextTradeHistory,
    nextRealizedPnL
  ) {

    const currentUser =
      auth.currentUser;


    if (!currentUser) {

      return;

    }


    try {

      await saveUserPortfolio(

        currentUser.uid,

        {

          cash:
            Number(
              nextCash.toFixed(2)
            ),

          currentCapital:
            Number(
              nextCash.toFixed(2)
            ),

          holdings:
            nextHoldings,

          tradeHistory:
            nextTradeHistory,

          realizedPnL:
            Number(
              nextRealizedPnL.toFixed(2)
            ),

          lastUpdated:
            new Date()
              .toISOString(),

        }

      );

    } catch (error) {

      console.error(
        "Portfolio save error:",
        error
      );

      setMessage(
        "Transaction completed, but portfolio could not be saved."
      );

    }

  }


  // ===================================
  // BUY
  // ===================================

  async function handleBuy() {

    const amount =
      Number(quantity);


    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {

      setMessage(
        "Please enter a valid quantity."
      );

      return;

    }


    const price =
      Number(
        assets[selectedAsset].price
      );


    const grossValue =
      price * amount;


    const transactionFee =
      grossValue *
      TRANSACTION_FEE_RATE;


    const totalCost =
      grossValue +
      transactionFee;


    if (
      totalCost > cash
    ) {

      setMessage(
        "Insufficient virtual cash."
      );

      return;

    }


    const existing =
      holdings.find(
        item =>
          item.symbol ===
          selectedAsset
      );


    let nextHoldings;


    if (existing) {

      const oldQuantity =
        Number(
          existing.quantity
        );


      const oldCost =
        Number(
          existing.averageCost
        );


      const newQuantity =
        oldQuantity +
        amount;


      const newAverageCost =

        (
          oldQuantity *
          oldCost +
          totalCost
        ) /
        newQuantity;


      nextHoldings =
        holdings.map(
          item =>

            item.symbol ===
            selectedAsset

              ? {

                  ...item,

                  quantity:
                    Number(
                      newQuantity.toFixed(4)
                    ),

                  averageCost:
                    Number(
                      newAverageCost.toFixed(2)
                    ),

                }

              : item

        );

    } else {

      nextHoldings = [

        ...holdings,

        {

          symbol:
            selectedAsset,

          name:
            assets[selectedAsset].name,

          quantity:
            Number(
              amount.toFixed(4)
            ),

          averageCost:
            Number(
              (
                totalCost /
                amount
              ).toFixed(2)
            ),

        },

      ];

    }


    const newCash =
      cash -
      totalCost;


    const trade = {

      id:
        Date.now(),

      type:
        "BUY",

      symbol:
        selectedAsset,

      quantity:
        amount,

      price,

      transactionFee,

      total:
        totalCost,

      date:
        new Date().toISOString(),

    };


    const nextTradeHistory = [

      trade,

      ...tradeHistory,

    ];


    setCash(
      newCash
    );


    setHoldings(
      nextHoldings
    );


    setTradeHistory(
      nextTradeHistory
    );


    setMessage(

      `Bought ${amount} ${selectedAsset} successfully.`

    );


    await persistPortfolio(

      newCash,

      nextHoldings,

      nextTradeHistory,

      realizedPnL

    );

  }


  // ===================================
  // SELL
  // ===================================

  async function handleSell() {

    const amount =
      Number(quantity);


    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {

      setMessage(
        "Please enter a valid quantity."
      );

      return;

    }


    const existing =
      holdings.find(
        item =>
          item.symbol ===
          selectedAsset
      );


    if (!existing) {

      setMessage(
        `You do not own any ${selectedAsset}.`
      );

      return;

    }


    const ownedQuantity =
      Number(
        existing.quantity
      );


    if (
      amount > ownedQuantity
    ) {

      setMessage(
        "You cannot sell more than your holdings."
      );

      return;

    }


    const price =
      Number(
        assets[selectedAsset].price
      );


    const grossValue =
      price *
      amount;


    const transactionFee =
      grossValue *
      TRANSACTION_FEE_RATE;


    const saleValue =
      grossValue -
      transactionFee;


    const costBasis =
      Number(
        existing.averageCost
      ) *
      amount;


    const tradeProfit =
      saleValue -
      costBasis;


    const newQuantity =
      ownedQuantity -
      amount;


    let nextHoldings;


    if (
      newQuantity <= 0.00001
    ) {

      nextHoldings =
        holdings.filter(
          item =>
            item.symbol !==
            selectedAsset
        );

    } else {

      nextHoldings =
        holdings.map(
          item =>

            item.symbol ===
            selectedAsset

              ? {

                  ...item,

                  quantity:
                    Number(
                      newQuantity.toFixed(4)
                    ),

                }

              : item

        );

    }


    const newCash =
      cash +
      saleValue;


    const newRealizedPnL =
      realizedPnL +
      tradeProfit;


    const trade = {

      id:
        Date.now(),

      type:
        "SELL",

      symbol:
        selectedAsset,

      quantity:
        amount,

      price,

      transactionFee,

      total:
        saleValue,

      costBasis,

      profitLoss:
        Number(
          tradeProfit.toFixed(2)
        ),

      date:
        new Date().toISOString(),

    };


    const nextTradeHistory = [

      trade,

      ...tradeHistory,

    ];


    setCash(
      newCash
    );


    setHoldings(
      nextHoldings
    );


    setTradeHistory(
      nextTradeHistory
    );


    setRealizedPnL(
      newRealizedPnL
    );


    setMessage(

      `Sold ${amount} ${selectedAsset} successfully.`

    );


    await persistPortfolio(

      newCash,

      nextHoldings,

      nextTradeHistory,

      newRealizedPnL

    );

  }


  // ===================================
  // HOLDING CALCULATIONS
  // ===================================

  const holdingData =
    useMemo(() => {

      return holdings.map(
        holding => {

          const currentPrice =
            assets[
              holding.symbol
            ]?.price || 0;


          const marketValue =
            currentPrice *
            Number(
              holding.quantity
            );


          const costBasis =
            Number(
              holding.averageCost
            ) *
            Number(
              holding.quantity
            );


          const unrealizedPnL =
            marketValue -
            costBasis;


          const returnPercentage =
            costBasis === 0

              ? 0

              : (
                  unrealizedPnL /
                  costBasis
                ) *
                100;


          return {

            ...holding,

            currentPrice,

            marketValue,

            costBasis,

            unrealizedPnL,

            returnPercentage,

          };

        }
      );

    }, [
      holdings,
      assets,
    ]);


  // ===================================
  // PORTFOLIO TOTALS
  // ===================================

  const totalInvested =
    holdingData.reduce(

      (sum, item) =>
        sum +
        item.costBasis,

      0

    );


  const totalMarketValue =
    holdingData.reduce(

      (sum, item) =>
        sum +
        item.marketValue,

      0

    );


  const totalUnrealizedPnL =
    holdingData.reduce(

      (sum, item) =>
        sum +
        item.unrealizedPnL,

      0

    );


  const portfolioValue =
    cash +
    totalMarketValue;


  const totalPnL =
    realizedPnL +
    totalUnrealizedPnL;


  const totalReturn =
    STARTING_CASH === 0

      ? 0

      : (
          totalPnL /
          STARTING_CASH
        ) *
        100;


  // ===================================
  // ASSET ALLOCATION
  // ===================================

  const allocationData =
    holdingData
      .filter(
        item =>
          item.marketValue > 0
      )
      .map(
        item => ({

          name:
            item.symbol,

          value:
            Number(
              item.marketValue.toFixed(2)
            ),

        })
      );


  // ===================================
  // RESET
  // ===================================

  async function handleResetPortfolio() {

    const resetCash =
      STARTING_CASH;


    const resetHoldings =
      [];


    const resetHistory =
      [];


    const resetRealized =
      0;


    setCash(
      resetCash
    );


    setHoldings(
      resetHoldings
    );


    setTradeHistory(
      resetHistory
    );


    setRealizedPnL(
      resetRealized
    );


    setMessage(
      "Portfolio reset successfully."
    );


    await persistPortfolio(

      resetCash,

      resetHoldings,

      resetHistory,

      resetRealized

    );

  }


  // ===================================
  // LOADING
  // ===================================

  if (loading) {

    return (

      <section className="section">

        <h2>
          My Portfolio
        </h2>

        <p>
          Loading portfolio...
        </p>

      </section>

    );

  }


  // ===================================
  // UI
  // ===================================

  return (

    <section className="section portfolio-section">

      {/* HEADER */}

      <div className="section-heading">

        <div>

          <h2>
            Advanced Portfolio Simulator
          </h2>

          <p>
            Buy and sell simulated assets
            using virtual money.
          </p>

        </div>

        <span className="badge">
          Virtual Trading
        </span>

      </div>


      {/* SUMMARY */}

      <div className="result-grid">

        <div className="result-card">

          <span>
            PORTFOLIO VALUE
          </span>

          <strong>
            ₹{portfolioValue.toFixed(2)}
          </strong>

        </div>


        <div className="result-card">

          <span>
            AVAILABLE CASH
          </span>

          <strong>
            ₹{cash.toFixed(2)}
          </strong>

        </div>


        <div className="result-card">

          <span>
            REALIZED P/L
          </span>

          <strong
            className={
              realizedPnL >= 0
                ? "profit"
                : "loss"
            }
          >
            ₹{realizedPnL.toFixed(2)}
          </strong>

        </div>


        <div className="result-card">

          <span>
            UNREALIZED P/L
          </span>

          <strong
            className={
              totalUnrealizedPnL >= 0
                ? "profit"
                : "loss"
            }
          >
            ₹{totalUnrealizedPnL.toFixed(2)}
          </strong>

        </div>


        <div className="result-card">

          <span>
            TOTAL RETURN
          </span>

          <strong
            className={
              totalReturn >= 0
                ? "profit"
                : "loss"
            }
          >
            {totalReturn.toFixed(2)}%
          </strong>

        </div>

      </div>


      {/* TRADING PANEL */}

      <div className="portfolio-trading-panel">

        <h3>
          Execute Simulated Trade
        </h3>


        <div className="portfolio-trade-controls">

          <div>

            <label>
              Asset
            </label>

            <select
              value={selectedAsset}
              onChange={
                e =>
                  setSelectedAsset(
                    e.target.value
                  )
              }
            >

              {Object.entries(
                assets
              ).map(
                ([symbol, asset]) => (

                  <option
                    key={symbol}
                    value={symbol}
                  >

                    {symbol} — {asset.name}

                  </option>

                )
              )}

            </select>

          </div>


          <div>

            <label>
              Quantity
            </label>

            <input
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={
                e =>
                  setQuantity(
                    e.target.value
                  )
              }
            />

          </div>


          <div>

            <label>
              Current Price
            </label>

            <div className="portfolio-price">

              ₹
              {Number(
                assets[
                  selectedAsset
                ].price
              ).toFixed(2)}

            </div>

          </div>


          <button
            className="portfolio-buy-button"
            onClick={handleBuy}
          >
            Buy
          </button>


          <button
            className="portfolio-sell-button"
            onClick={handleSell}
          >
            Sell
          </button>

        </div>


        <p className="portfolio-fee-info">

          Transaction cost:
          {" "}
          {(TRANSACTION_FEE_RATE * 100).toFixed(2)}%
          {" "}
          per trade

        </p>


        {message && (

          <p className="portfolio-message">

            {message}

          </p>

        )}

      </div>


      {/* HOLDINGS */}

      <div className="portfolio-table-container">

        <h3>
          Current Holdings
        </h3>


        {holdingData.length === 0 ? (

          <p>
            No assets currently held.
            Buy an asset to start your
            portfolio.
          </p>

        ) : (

          <div className="table-wrapper">

            <table>

              <thead>

                <tr>

                  <th>
                    Asset
                  </th>

                  <th>
                    Quantity
                  </th>

                  <th>
                    Avg. Cost
                  </th>

                  <th>
                    Current Price
                  </th>

                  <th>
                    Market Value
                  </th>

                  <th>
                    Unrealized P/L
                  </th>

                  <th>
                    Return
                  </th>

                </tr>

              </thead>


              <tbody>

                {holdingData.map(
                  item => (

                    <tr
                      key={
                        item.symbol
                      }
                    >

                      <td>
                        <strong>
                          {item.symbol}
                        </strong>
                      </td>

                      <td>
                        {item.quantity}
                      </td>

                      <td>
                        ₹
                        {item.averageCost.toFixed(2)}
                      </td>

                      <td>
                        ₹
                        {item.currentPrice.toFixed(2)}
                      </td>

                      <td>
                        ₹
                        {item.marketValue.toFixed(2)}
                      </td>

                      <td
                        className={
                          item.unrealizedPnL >= 0
                            ? "profit"
                            : "loss"
                        }
                      >
                        ₹
                        {item.unrealizedPnL.toFixed(2)}
                      </td>

                      <td
                        className={
                          item.returnPercentage >= 0
                            ? "profit"
                            : "loss"
                        }
                      >
                        {item.returnPercentage.toFixed(2)}%
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* ALLOCATION */}

      <div className="portfolio-allocation">

        <h3>
          Asset Allocation
        </h3>

        {allocationData.length === 0 ? (

          <p>
            Asset allocation will appear
            after you purchase assets.
          </p>

        ) : (

          <div className="allocation-chart">

            <ResponsiveContainer
              width="100%"
              height={300}
            >

              <PieChart>

                <Pie
                  data={allocationData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >

                  {allocationData.map(
                    (entry, index) => (

                      <Cell
                        key={`cell-${index}`}
                      />

                    )
                  )}

                </Pie>

                <Tooltip />

              </PieChart>

            </ResponsiveContainer>

          </div>

        )}

      </div>


      {/* TRADE HISTORY */}

      <div className="portfolio-history">

        <div className="section-heading">

          <div>

            <h3>
              Trade History
            </h3>

            <p>
              All simulated portfolio
              transactions.
            </p>

          </div>

        </div>


        {tradeHistory.length === 0 ? (

          <p>
            No transactions yet.
          </p>

        ) : (

          <div className="table-wrapper">

            <table>

              <thead>

                <tr>

                  <th>
                    Type
                  </th>

                  <th>
                    Asset
                  </th>

                  <th>
                    Quantity
                  </th>

                  <th>
                    Price
                  </th>

                  <th>
                    Transaction Fee
                  </th>

                  <th>
                    Total
                  </th>

                  <th>
                    P/L
                  </th>

                  <th>
                    Date
                  </th>

                </tr>

              </thead>


              <tbody>

                {tradeHistory.map(
                  trade => (

                    <tr
                      key={
                        trade.id
                      }
                    >

                      <td>

                        <strong
                          className={
                            trade.type ===
                            "BUY"
                              ? "trade-buy"
                              : "trade-sell"
                          }
                        >

                          {trade.type}

                        </strong>

                      </td>


                      <td>
                        {trade.symbol}
                      </td>


                      <td>
                        {trade.quantity}
                      </td>


                      <td>
                        ₹
                        {Number(
                          trade.price
                        ).toFixed(2)}
                      </td>


                      <td>
                        ₹
                        {Number(
                          trade.transactionFee
                        ).toFixed(2)}
                      </td>


                      <td>
                        ₹
                        {Number(
                          trade.total
                        ).toFixed(2)}
                      </td>


                      <td
                        className={
                          Number(
                            trade.profitLoss || 0
                          ) >= 0
                            ? "profit"
                            : "loss"
                        }
                      >

                        {trade.type ===
                        "SELL"

                          ? `₹${Number(
                              trade.profitLoss || 0
                            ).toFixed(2)}`

                          : "—"}

                      </td>


                      <td>

                        {new Date(
                          trade.date
                        ).toLocaleString()}

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* RESET */}

      <button
        className="portfolio-reset-button"
        onClick={handleResetPortfolio}
      >

        Reset Virtual Portfolio

      </button>

    </section>

  );

}


export default PortfolioSimulator;