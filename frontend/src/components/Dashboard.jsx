import {
  useEffect,
  useMemo,
  useState,
} from "react";

import MultiAssetChart
  from "../components/MultiAssetChart";

import PortfolioSimulator
  from "../components/PortfolioSimulator";

import AdvancedAnalytics
  from "../components/AdvancedAnalytics";

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

import {
  getUserWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  getUserPreferences,
  saveUserPreferences,
  getUserPortfolio,
  saveUserPortfolio,
} from "../services/userDataService";

import {
  auth,
} from "../services/firebase";

import {
  logoutUser,
} from "../services/authService";

import {
  saveBacktest,
  getUserBacktests,
} from "../services/firestoreService";

import "../App.css";


// ===================================
// MARKET DATA GENERATOR
// ===================================

function generateMarketData(
  days = 200
) {

  const data = [];

  let price = 100;

  const endDate = new Date();

const startDate = new Date(endDate);

startDate.setDate(
  startDate.getDate() - (days - 1)
);


  for (
    let i = 0;
    i < days;
    i++
  ) {

    const date =
      new Date(startDate);

    date.setDate(
      startDate.getDate() + i
    );


    const trend =
      i * 0.15;


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


// ===================================
// SMA
// ===================================

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

    if (
      i < period - 1
    ) {

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


// ===================================
// EMA
// ===================================

function calculateEMA(
  marketData,
  period
) {

  const result = [];

  const multiplier =
    2 / (period + 1);

  let previousEMA =
    null;


  for (
    let i = 0;
    i < marketData.length;
    i++
  ) {

    const price =
      Number(
        marketData[i].close
      );


    if (
      i < period - 1
    ) {

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

      (
        price -
        previousEMA
      ) *

        multiplier +

      previousEMA;


    previousEMA =
      ema;


    result.push(
      ema
    );

  }


  return result;

}


// ===================================
// RSI
// ===================================

function calculateRSI(
  marketData,
  period
) {

  const result =

    Array(
      marketData.length
    ).fill(null);


  if (
    marketData.length <=
    period
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


    if (
      change >= 0
    ) {

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


  if (
    averageLoss === 0
  ) {

    result[period] =
      100;

  } else {

    const rs =
      averageGain /
      averageLoss;


    result[period] =

      100 -

      100 /
        (1 + rs);

  }


  for (
    let i =
      period + 1;

    i <
      marketData.length;

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

      ) /
      period;


    averageLoss =

      (

        averageLoss *
          (period - 1) +

        loss

      ) /
      period;


    if (
      averageLoss === 0
    ) {

      result[i] =
        100;

    } else {

      const rs =

        averageGain /
        averageLoss;


      result[i] =

        100 -

        100 /
          (1 + rs);

    }

  }


  return result;

}


// ===================================
// STANDARD DEVIATION
// ===================================

function calculateStandardDeviation(
  values
) {

  if (
    !values ||
    values.length === 0
  ) {

    return 0;

  }


  const mean =

    values.reduce(

      (
        sum,
        value
      ) =>

        sum + value,

      0

    ) /
    values.length;


  const variance =

    values.reduce(

      (
        sum,
        value
      ) =>

        sum +

        Math.pow(

          value -
            mean,

          2

        ),

      0

    ) /
    values.length;


  return Math.sqrt(
    variance
  );

}


// ===================================
// BOLLINGER BANDS
// ===================================

function calculateBollingerBands(

  marketData,

  period = 20,

  multiplier = 2

) {

  const middleBand =

    calculateSMA(
      marketData,
      period
    );


  const upperBand = [];

  const lowerBand = [];


  for (
    let i = 0;
    i < marketData.length;
    i++
  ) {

    if (

      i < period - 1 ||

      middleBand[i] === null

    ) {

      upperBand.push(
        null
      );

      lowerBand.push(
        null
      );

      continue;

    }


    const prices = [];


    for (

      let j =
        i - period + 1;

      j <= i;

      j++

    ) {

      prices.push(

        Number(
          marketData[j].close
        )

      );

    }


    const standardDeviation =

      calculateStandardDeviation(
        prices
      );


    upperBand.push(

      middleBand[i] +

      standardDeviation *
        multiplier

    );


    lowerBand.push(

      middleBand[i] -

      standardDeviation *
        multiplier

    );

  }


  return {

    middleBand,

    upperBand,

    lowerBand,

  };

}


// ===================================
// DASHBOARD
// ===================================

function Dashboard() {


  // ===================================
  // MARKET DATA
  // ===================================

  const [
    marketData,
    setMarketData,
  ] = useState(() =>
    generateMarketData(200)
  );

  // ===================================
// LIVE MARKET UPDATES
// ===================================

const [
  isLiveUpdating,
  setIsLiveUpdating,
] = useState(true);

// ===================================
// CONTINUOUS LIVE MARKET UPDATE
// ===================================

useEffect(() => {

  if (!isLiveUpdating) {
    return;
  }

  const interval = setInterval(() => {

    setMarketData((previousData) => {

      if (
        !previousData ||
        previousData.length === 0
      ) {
        return previousData;
      }

      const updatedData = [
        ...previousData
      ];

      const lastIndex =
        updatedData.length - 1;

      const previousCandle =
        updatedData[lastIndex];

      const previousClose =
        Number(previousCandle.close);

      // Small random price movement
      const changePercent =
        (Math.random() - 0.5) * 0.01;

      const newClose =
        previousClose *
        (1 + changePercent);

      updatedData[lastIndex] = {

        ...previousCandle,

        close:
          Number(
            Math.max(
              40,
              newClose
            ).toFixed(2)
          ),

      };

      return updatedData;

    });

  }, 2000);

  return () => {
    clearInterval(interval);
  };

}, [
  isLiveUpdating
]);


  // ===================================
  // CAPITAL
  // ===================================

  const [
    initialCapital,
    setInitialCapital,
  ] = useState(10000);


  // ===================================
  // BUY RULE
  // ===================================

  const [
    buyRule,
    setBuyRule,
  ] = useState({

    indicator:
      "SMA20",

    condition:
      "cross_above",

    compareWith:
      "SMA50",

    value:
      0,

  });


  // ===================================
  // SELL RULE
  // ===================================

  const [
    sellRule,
    setSellRule,
  ] = useState({

    indicator:
      "SMA20",

    condition:
      "cross_below",

    compareWith:
      "SMA50",

    value:
      0,

  });


  // ===================================
  // INDICATORS
  // ===================================

  const [
    activeIndicators,
    setActiveIndicators,
  ] = useState({

    SMA20: true,

    SMA50: true,

    EMA20: true,

    RSI14: false,

    BOLLINGER: true,

  });


  // ===================================
  // BACKTEST
  // ===================================

  const [
    backtestResult,
    setBacktestResult,
  ] = useState(null);


  // ===================================
  // WATCHLIST
  // ===================================

  const [
    watchlist,
    setWatchlist,
  ] = useState([]);


  const [
    watchlistSymbol,
    setWatchlistSymbol,
  ] = useState("");


  const [
    watchlistLoading,
    setWatchlistLoading,
  ] = useState(false);


  // ===================================
  // SAVED BACKTESTS
  // ===================================

  const [
    savedBacktests,
    setSavedBacktests,
  ] = useState([]);


  const [
    historyLoading,
    setHistoryLoading,
  ] = useState(true);


  // ===================================
  // PORTFOLIO
  // ===================================

  const [
    portfolio,
    setPortfolio,
  ] = useState({

    currentCapital:
      10000,

    holdings:
      [],

    lastUpdated:
      null,

  });


  // ===================================
  // LOADING
  // ===================================

  const [
    loading,
    setLoading,
  ] = useState(false);


  const [
    saving,
    setSaving,
  ] = useState(false);


  // ===================================
  // ERROR
  // ===================================

  const [
    error,
    setError,
  ] = useState("");


  // ===================================
  // USER DATA LOADED
  // ===================================

  const [
    userDataLoaded,
    setUserDataLoaded,
  ] = useState(false);


  // ===================================
  // FINAL TESTING
  // ===================================

  const [
    testResults,
    setTestResults,
  ] = useState([]);


  const [
    testing,
    setTesting,
  ] = useState(false);


  // ===================================
  // LOAD USER DATA
  // ===================================

  useEffect(() => {

    async function loadUserData() {

      const currentUser =
        auth.currentUser;


      if (!currentUser) {

        setHistoryLoading(false);

        setUserDataLoaded(true);

        return;

      }


      try {

        setUserDataLoaded(false);


        // WATCHLIST

        const userWatchlist =

          await getUserWatchlist(
            currentUser.uid
          );


        setWatchlist(

          Array.isArray(
            userWatchlist
          )

            ? userWatchlist

            : []

        );


        // PREFERENCES

        const preferences =

          await getUserPreferences(
            currentUser.uid
          );


        if (
          preferences
        ) {

          if (

            preferences.initialCapital !==
            undefined

          ) {

            setInitialCapital(

              preferences.initialCapital

            );

          }


          if (
            preferences.buyRule
          ) {

            setBuyRule(
              preferences.buyRule
            );

          }


          if (
            preferences.sellRule
          ) {

            setSellRule(
              preferences.sellRule
            );

          }


          if (
            preferences.activeIndicators
          ) {

            setActiveIndicators(

              previous => ({

                ...previous,

                ...preferences.activeIndicators,

              })

            );

          }

        }


        // PORTFOLIO

        const savedPortfolio =

          await getUserPortfolio(
            currentUser.uid
          );


        if (
          savedPortfolio
        ) {

          setPortfolio({

            currentCapital:

              Number(

                savedPortfolio.currentCapital ||
                0

              ),

            holdings:

              Array.isArray(

                savedPortfolio.holdings

              )

                ? savedPortfolio.holdings

                : [],

            lastUpdated:

              savedPortfolio.lastUpdated ||
              null,

          });

        }


        // BACKTEST HISTORY

        setHistoryLoading(
          true
        );


        const results =

          await getUserBacktests(
            currentUser.uid
          );


        setSavedBacktests(

          Array.isArray(
            results
          )

            ? results

            : []

        );


      } catch (error) {

        console.error(

          "Error loading user data:",

          error

        );


        setError(

          "Some saved data could not be loaded."

        );


      } finally {

        setHistoryLoading(
          false
        );

        setUserDataLoaded(
          true
        );

      }

    }


    loadUserData();

  }, []);


  // ===================================
  // SAVE PREFERENCES
  // ===================================

  async function
  handleSavePreferences() {

    const currentUser =
      auth.currentUser;


    if (

      !currentUser ||

      !userDataLoaded

    ) {

      return;

    }


    try {

      await saveUserPreferences(

        currentUser.uid,

        {

          initialCapital:

            Number(
              initialCapital
            ),

          buyRule,

          sellRule,

          activeIndicators,

          updatedAt:

            new Date()
              .toISOString(),

        }

      );


    } catch (error) {

      console.error(

        "Preference save error:",

        error

      );

    }

  }


  // ===================================
  // AUTO SAVE PREFERENCES
  // ===================================

  useEffect(() => {

    if (
      !userDataLoaded
    ) {

      return;

    }


    const currentUser =
      auth.currentUser;


    if (
      !currentUser
    ) {

      return;

    }


    const timer =

      setTimeout(() => {

        handleSavePreferences();

      }, 1200);


    return () =>
      clearTimeout(timer);


  }, [

    initialCapital,

    buyRule,

    sellRule,

    activeIndicators,

    userDataLoaded,

  ]);


  // ===================================
  // WATCHLIST ADD
  // ===================================

  async function
  handleAddToWatchlist() {

    const currentUser =
      auth.currentUser;


    if (
      !currentUser
    ) {

      setError(
        "Please log in first."
      );

      return;

    }


    const symbol =

      watchlistSymbol
        .trim()
        .toUpperCase();


    if (
      !symbol
    ) {

      setError(
        "Please enter a trading symbol."
      );

      return;

    }


    try {

      setWatchlistLoading(
        true
      );

      setError(
        ""
      );


      await addToWatchlist(

        currentUser.uid,

        symbol

      );


      setWatchlist(

        previousWatchlist => {

          if (

            previousWatchlist.includes(
              symbol
            )

          ) {

            return previousWatchlist;

          }


          return [

            ...previousWatchlist,

            symbol,

          ];

        }

      );


      setWatchlistSymbol(
        ""
      );


    } catch (error) {

      console.error(
        "Watchlist error:",
        error
      );


      setError(

        "Unable to add symbol to watchlist."

      );


    } finally {

      setWatchlistLoading(
        false
      );

    }

  }


  // ===================================
  // WATCHLIST REMOVE
  // ===================================

  async function
  handleRemoveFromWatchlist(
    symbol
  ) {

    const currentUser =
      auth.currentUser;


    if (
      !currentUser
    ) {

      return;

    }


    try {

      setWatchlistLoading(
        true
      );


      await removeFromWatchlist(

        currentUser.uid,

        symbol

      );


      setWatchlist(

        previousWatchlist =>

          previousWatchlist.filter(

            item =>
              item !== symbol

          )

      );


    } catch (error) {

      console.error(
        "Remove error:",
        error
      );


      setError(
        "Unable to remove symbol."
      );


    } finally {

      setWatchlistLoading(
        false
      );

    }

  }


  // ===================================
  // CALCULATE INDICATORS
  // ===================================

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


      const bollinger =

        calculateBollingerBands(
          marketData,
          20,
          2
        );


      return marketData.map(

        (
          item,
          index
        ) => ({

          ...item,

          SMA20:
            sma20[index],

          SMA50:
            sma50[index],

          EMA20:
            ema20[index],

          RSI14:
            rsi14[index],

          BollingerMiddle:

            bollinger.middleBand[
              index
            ],

          BollingerUpper:

            bollinger.upperBand[
              index
            ],

          BollingerLower:

            bollinger.lowerBand[
              index
            ],

        })

      );


    }, [
      marketData
    ]);


  // ===================================
  // TRADE MARKERS
  // ===================================

  const tradesByIndex =

    useMemo(() => {


      if (

        !backtestResult ||

        !Array.isArray(
          backtestResult.trades
        )

      ) {

        return {};

      }


      const tradeMap = {};


      backtestResult.trades.forEach(

        trade => {

          let tradeIndex =

            Number.isInteger(
              trade.index
            )

              ? trade.index

              : -1;


          if (

            tradeIndex === -1 &&

            trade.date

          ) {

            tradeIndex =

              marketData.findIndex(

                item =>

                  item.date ===
                  trade.date

              );

          }


          if (
            tradeIndex >= 0
          ) {

            tradeMap[
              tradeIndex
            ] =
              trade;

          }

        }

      );


      return tradeMap;


    }, [

      backtestResult,

      marketData,

    ]);


  // ===================================
  // CHART DATA
  // ===================================

  const chartData =

    useMemo(() =>

      indicators.map(

        (
          item,
          index
        ) => ({

          ...item,


          buy:

  ["BUY"].includes(
    String(
      tradesByIndex[index]?.type || ""
    ).toUpperCase()
  )

    ? item.close

    : null,


sell:

  ["SELL"].includes(
    String(
      tradesByIndex[index]?.type || ""
    ).toUpperCase()
  )

    ? item.close

    : null,

        })

      ),

    [

      indicators,

      tradesByIndex,

    ]);


  // ===================================
  // RUN BACKTEST
  // ===================================

  async function
  handleRunBacktest() {

    try {

      setLoading(
        true
      );

      setError(
        ""
      );


      const response =

        await fetch(

          "http://localhost:5000/api/backtest/run",

          {

            method:
              "POST",

            headers: {

              "Content-Type":
                "application/json",

            },


            body:

              JSON.stringify({

                strategy: {

                  buyRule: {

                    ...buyRule,

                    value:

                      Number(
                        buyRule.value
                      ),

                  },


                  sellRule: {

                    ...sellRule,

                    value:

                      Number(
                        sellRule.value
                      ),

                  },

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


      if (
        !response.ok
      ) {

        throw new Error(

          data.message ||
          "Backtest failed"

        );

      }


      setBacktestResult(
        data
      );


      const currentUser =
        auth.currentUser;


      if (
        currentUser
      ) {

        setSaving(
          true
        );


        try {

          // SAVE BACKTEST

          await saveBacktest(

            currentUser.uid,

            data,

            {

              buyRule,

              sellRule,

            },

            Number(
              initialCapital
            )

          );


          // UPDATE PORTFOLIO

          const updatedPortfolio = {

            currentCapital:

              Number(
                data.finalCapital || 0
              ),

            holdings:

              Array.isArray(
                data.trades
              )

                ? data.trades

                : [],

            lastUpdated:

              new Date()
                .toISOString(),

          };


          await saveUserPortfolio(

            currentUser.uid,

            updatedPortfolio

          );


          setPortfolio(
            updatedPortfolio
          );


          // REFRESH HISTORY

          const updatedHistory =

            await getUserBacktests(

              currentUser.uid

            );


          setSavedBacktests(

            Array.isArray(
              updatedHistory
            )

              ? updatedHistory

              : []

          );


        } catch (
          firestoreError
        ) {

          console.error(
            firestoreError
          );


          setError(

            "Backtest completed but could not be fully saved."

          );


        } finally {

          setSaving(
            false
          );

        }

      }


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

      setLoading(
        false
      );

    }

  }


  // ===================================
  // FINAL SYSTEM TEST
  // ===================================

  async function
  handleFinalTest() {

    const results = [];

    setTesting(true);

    setError("");


    // BACKEND

    try {

      const response =

        await fetch(

          "http://localhost:5000/api/backtest/run",

          {

            method:
              "POST",

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

                marketData:

                  marketData.slice(
                    0,
                    60
                  ),

              }),

          }

        );


      results.push({

        name:
          "Backend Connection",

        status:

          response.ok

            ? "PASS"

            : "FAIL",

        message:

          response.ok

            ? "Backend API is responding correctly."

            : "Backend responded with an error.",

      });


    } catch (error) {

      results.push({

        name:
          "Backend Connection",

        status:
          "FAIL",

        message:
          "Cannot connect to backend on port 5000.",

      });

    }


    // MARKET DATA

    const validMarketData =

      marketData.length > 0 &&

      marketData.every(

        item =>

          item.date &&

          Number.isFinite(
            Number(
              item.close
            )
          )

      );


    results.push({

      name:
        "Market Data",

      status:

        validMarketData

          ? "PASS"

          : "FAIL",

      message:

        validMarketData

          ? `${marketData.length} valid market data points detected.`

          : "Market data contains invalid values.",

    });


    // BOLLINGER

    const validBollinger =

      indicators.some(

        item =>

          item.BollingerUpper !== null &&

          item.BollingerMiddle !== null &&

          item.BollingerLower !== null

      );


    results.push({

      name:
        "Bollinger Bands",

      status:

        validBollinger

          ? "PASS"

          : "FAIL",

      message:

        validBollinger

          ? "Bollinger Bands are calculated correctly."

          : "Bollinger Bands are unavailable.",

    });


    // STRATEGY

    const validRules =

      buyRule.indicator &&

      buyRule.condition &&

      buyRule.compareWith &&

      sellRule.indicator &&

      sellRule.condition &&

      sellRule.compareWith;


    results.push({

      name:
        "Strategy Builder",

      status:

        validRules

          ? "PASS"

          : "FAIL",

      message:

        validRules

          ? "Buy and sell rules are configured."

          : "Strategy rules are incomplete.",

    });


    // FIREBASE AUTH

    const currentUser =
      auth.currentUser;


    results.push({

      name:
        "Firebase Authentication",

      status:

        currentUser

          ? "PASS"

          : "FAIL",

      message:

        currentUser

          ? `Logged in as ${currentUser.email}`

          : "No authenticated Firebase user.",

    });


    // PORTFOLIO

    if (
      currentUser
    ) {

      try {

        const savedPortfolio =

          await getUserPortfolio(
            currentUser.uid
          );


        results.push({

          name:
            "Firebase Portfolio",

          status:
            "PASS",

          message:

            savedPortfolio

              ? "Portfolio data loaded from Firebase."

              : "Portfolio is ready for first save.",

        });


      } catch (error) {

        results.push({

          name:
            "Firebase Portfolio",

          status:
            "FAIL",

          message:
            "Unable to load portfolio from Firebase.",

        });

      }

    }


    // PREFERENCES

    if (
      currentUser
    ) {

      try {

        const preferences =

          await getUserPreferences(
            currentUser.uid
          );


        results.push({

          name:
            "Saved Preferences",

          status:
            "PASS",

          message:

            preferences

              ? "Preferences loaded successfully."

              : "Preferences ready for first save.",

        });


      } catch (error) {

        results.push({

          name:
            "Saved Preferences",

          status:
            "FAIL",

          message:
            "Unable to load preferences.",

        });

      }

    }


    // WATCHLIST

    if (
      currentUser
    ) {

      try {

        const savedWatchlist =

          await getUserWatchlist(
            currentUser.uid
          );


        results.push({

          name:
            "Watchlist",

          status:
            "PASS",

          message:

            Array.isArray(
              savedWatchlist
            )

              ? `${savedWatchlist.length} item(s) loaded successfully.`

              : "Watchlist is ready.",

        });


      } catch (error) {

        results.push({

          name:
            "Watchlist",

          status:
            "FAIL",

          message:
            "Unable to load watchlist.",

        });

      }

    }


    setTestResults(
      results
    );

    setTesting(
      false
    );

  }


  // ===================================
  // NEW DATASET
  // ===================================

  function
  handleNewDataset() {

    setMarketData(

      generateMarketData(
        200
      )

    );


    setBacktestResult(
      null
    );


    setTestResults(
      []
    );


    setError(
      ""
    );

  }


  // ===================================
  // LOGOUT
  // ===================================

  async function
  handleLogout() {

    try {

      await logoutUser();

    } catch (error) {

      console.error(
        "Logout error:",
        error
      );

    }

  }


  // ===================================
  // CURRENT USER
  // ===================================

  const currentUser =
    auth.currentUser;


  // ===================================
  // MARKET STATS
  // ===================================

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


  // ===================================
  // UI
  // ===================================

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


        <div className="navbar-right">

          <div className="online-status">

            <span className="status-dot" />

            Simulator Online

          </div>


          <button

            className="logout-button"

            onClick={
              handleLogout
            }

          >

            Logout

          </button>

        </div>

      </header>


      {/* USER */}

      {currentUser && (

        <div className="welcome-user">

          Welcome{" "}

          <strong>
            {currentUser.email}
          </strong>

        </div>

      )}


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
          Bollinger Bands,
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

        <button
  className="primary-button"
  onClick={() =>
    setIsLiveUpdating(
      previous => !previous
    )
  }
>
  {isLiveUpdating
    ? "⏸ Stop Live Updates"
    : "▶ Start Live Updates"}
</button>

<div
  style={{
    marginTop: "12px",
    fontWeight: "600",
    color: isLiveUpdating
      ? "#16a34a"
      : "#6b7280",
  }}
>
  {isLiveUpdating
    ? "🟢 Live market simulation running"
    : "⏸ Live market simulation paused"}
</div>

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
              with technical indicators.
            </p>

          </div>


          <span className="badge">

            {marketData.length}
            {" "}
            Days

          </span>

        </div>


        {/* INDICATOR CONTROLS */}

        <div className="indicator-controls">

          {Object.keys(
            activeIndicators
          ).map(

            indicator => (

              <label

                key={indicator}

                className="indicator-option"

              >

                <input

                  type="checkbox"

                  checked={
                    activeIndicators[
                      indicator
                    ]
                  }

                  onChange={() =>

                    setActiveIndicators(

                      previous => ({

                        ...previous,

                        [indicator]:

                          !previous[
                            indicator
                          ],

                      })

                    )

                  }

                />


                {indicator}

              </label>

            )

          )}

        </div>


        <div className="chart-container">

          <ResponsiveContainer

            width="100%"

            height={450}

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


           <Legend
  content={({ payload }) => (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "14px",
        marginTop: "10px",
      }}
    >
      {payload?.map((entry, index) => {
        const value = entry.value;

        return (
          <span
            key={`legend-${index}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              color: "#111827",
              fontWeight: "600",
            }}
          >
            <span
              style={{
                width: "9px",
                height: "9px",
                borderRadius: "50%",
                display: "inline-block",
                backgroundColor:
                  value === "BUY"
                    ? "#16a34a"
                    : value === "SELL"
                    ? "#dc2626"
                    : entry.color,
              }}
            />

            {value}
          </span>
        );
      })}
    </div>
  )}
/>

              {/* CLOSE */}

              <Line

                type="monotone"

                dataKey="close"

                stroke="#2563eb"

                strokeWidth={2}

                dot={false}

                name="Close Price"

              />


              {/* SMA 20 */}

              {activeIndicators.SMA20 && (

                <Line

                  type="monotone"

                  dataKey="SMA20"

                  stroke="#16a34a"

                  strokeWidth={2}

                  dot={false}

                  name="SMA 20"

                />

              )}


              {/* SMA 50 */}

              {activeIndicators.SMA50 && (

                <Line

                  type="monotone"

                  dataKey="SMA50"

                  stroke="#8b5cf6"

                  strokeWidth={2}

                  dot={false}

                  name="SMA 50"

                />

              )}


              {/* EMA */}

              {activeIndicators.EMA20 && (

                <Line

                  type="monotone"

                  dataKey="EMA20"

                  stroke="#f59e0b"

                  strokeWidth={2}

                  dot={false}

                  name="EMA 20"

                />

              )}


              {/* BOLLINGER */}

              {activeIndicators.BOLLINGER && (

                <>

                  <Line

                    type="monotone"

                    dataKey="BollingerUpper"

                    stroke="#ec4899"

                    strokeWidth={1.5}

                    dot={false}

                    name="Bollinger Upper"

                  />


                  <Line

                    type="monotone"

                    dataKey="BollingerMiddle"

                    stroke="#a855f7"

                    strokeWidth={1.5}

                    dot={false}

                    name="Bollinger Middle"

                  />


                  <Line

                    type="monotone"

                    dataKey="BollingerLower"

                    stroke="#ec4899"

                    strokeWidth={1.5}

                    dot={false}

                    name="Bollinger Lower"

                  />

                </>

              )}


              {/* BUY */}

              <Line

                type="monotone"

                dataKey="buy"

                stroke="transparent"

                strokeWidth={0}

                connectNulls={false}

                dot={{

                  r: 7,

                  fill:
                    "#16a34a",

                  stroke:
                    "#16a34a",

                  strokeWidth:
                    2,

                }}

                activeDot={false}

                name="BUY"

              />


              {/* SELL */}

              <Line

                type="monotone"

                dataKey="sell"

                stroke="transparent"

                strokeWidth={0}

                connectNulls={false}

                dot={{

                  r: 7,

                  fill:
                    "#dc2626",

                  stroke:
                    "#dc2626",

                  strokeWidth:
                    2,

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


      {/* WATCHLIST */}

      <section className="section">

        <div className="section-heading">

          <div>

            <h2>
              My Watchlist
            </h2>

            <p>
              Save and manage your
              favorite trading symbols.
            </p>

          </div>

        </div>


        <div className="watchlist-input-row">

          <input

            type="text"

            placeholder="Enter symbol (Example: AAPL)"

            value={
              watchlistSymbol
            }

            onChange={
              e =>

                setWatchlistSymbol(
                  e.target.value
                )
            }

          />


          <button

            className="primary-button"

            onClick={
              handleAddToWatchlist
            }

            disabled={
              watchlistLoading
            }

          >

            {watchlistLoading

              ? "Please wait..."

              : "+ Add to Watchlist"

            }

          </button>

        </div>


        {watchlist.length === 0 ? (

          <p>
            No symbols in your
            watchlist yet.
          </p>

        ) : (

          <div className="watchlist-items">

            {watchlist.map(

              symbol => (

                <div

                  key={symbol}

                  className="watchlist-item"

                >

                  📈
                  {" "}
                  {symbol}


                  <button

                    onClick={() =>

                      handleRemoveFromWatchlist(
                        symbol
                      )

                    }

                    disabled={
                      watchlistLoading
                    }

                  >

                    ✕

                  </button>

                </div>

              )

            )}

          </div>

        )}

      </section>


      {/* STRATEGY BUILDER */}

      <section className="section strategy-section">

        <div className="section-heading">

          <div>

            <h2>
              Strategy Builder
            </h2>

            <p>
              Define when the simulator
              should buy and sell.
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

            onChange={
              e =>

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
            Define when the simulator
            should buy.
          </p>


          <div className="rule-grid">

            <select

              value={
                buyRule.indicator
              }

              onChange={
                e =>

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
  value={buyRule.condition}
  onChange={(e) =>
    setBuyRule({
      ...buyRule,
      condition: e.target.value,
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

  <option value="cross_above">
    Cross Above
  </option>

  <option value="cross_below">
    Cross Below
  </option>
</select>


            <select

              value={
                buyRule.compareWith
              }

              onChange={
                e =>

                  setBuyRule({

                    ...buyRule,

                    compareWith:
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

                onChange={
                  e =>

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
            Define when the simulator
            should sell.
          </p>


          <div className="rule-grid">

            <select

              value={
                sellRule.indicator
              }

              onChange={
                e =>

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
  value={sellRule.condition}
  onChange={(e) =>
    setSellRule({
      ...sellRule,
      condition: e.target.value,
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

  <option value="cross_above">
    Cross Above
  </option>

  <option value="cross_below">
    Cross Below
  </option>
</select>

            <select

              value={
                sellRule.compareWith
              }

              onChange={
                e =>

                  setSellRule({

                    ...sellRule,

                    compareWith:
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

                onChange={
                  e =>

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


        {error && (

          <p className="error-message">

            {error}

          </p>

        )}


        <button

          className="run-button"

          onClick={
            handleRunBacktest
          }

          disabled={
            loading ||
            saving
          }

        >

          {loading

            ? "Running Backtest..."

            : saving

              ? "Saving Backtest..."

              : "▶️ Run Backtest"

          }

        </button>

      </section>


      {/* BACKTEST RESULTS */}

      {backtestResult && (

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

                  backtestResult.finalCapital

                ).toFixed(2)}

              </strong>

            </div>


            <div className="result-card">

              <span>
                PROFIT / LOSS
              </span>

              <strong

                className={

                  backtestResult.profitLoss >= 0

                    ? "profit"

                    : "loss"

                }

              >

                ₹

                {Number(

                  backtestResult.profitLoss

                ).toFixed(2)}

              </strong>

            </div>


            <div className="result-card">

              <span>
                RETURN
              </span>

              <strong>

                {Number(

                  backtestResult.returnPercentage

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
                  backtestResult.winningTrades
                }

              </strong>

            </div>


            <div className="result-card">

              <span>
                LOSING TRADES
              </span>

              <strong>

                {
                  backtestResult.losingTrades
                }

              </strong>

            </div>

          </div>

        </section>

      )}


     {/* ADVANCED DATA ANALYTICS */}

<AdvancedAnalytics
  marketData={marketData}
  indicators={indicators}
/>


{/* ADVANCED PORTFOLIO SIMULATOR */}

<PortfolioSimulator />

      {/* SAVED BACKTESTS */}

      <section className="section">

        <div className="section-heading">

          <div>

            <h2>
              Saved Backtests
            </h2>

            <p>
              Your previously saved
              trading simulations.
            </p>

          </div>

        </div>


        {historyLoading ? (

          <p>
            Loading saved backtests...
          </p>

        ) : savedBacktests.length === 0 ? (

          <p>
            No saved backtests yet.
          </p>

        ) : (

          <div className="table-wrapper">

            <table>

              <thead>

                <tr>

                  <th>
                    Initial Capital
                  </th>

                  <th>
                    Final Capital
                  </th>

                  <th>
                    Profit / Loss
                  </th>

                  <th>
                    Return
                  </th>

                  <th>
                    Date
                  </th>

                </tr>

              </thead>


              <tbody>

                {savedBacktests.map(

                  backtest => (

                    <tr
                      key={backtest.id}
                    >

                      <td>

                        ₹

                        {Number(

                          backtest.initialCapital ||
                          0

                        ).toFixed(2)}

                      </td>


                      <td>

                        ₹

                        {Number(

                          backtest.finalCapital ||
                          0

                        ).toFixed(2)}

                      </td>


                      <td>

                        ₹

                        {Number(

                          backtest.profitLoss ||
                          0

                        ).toFixed(2)}

                      </td>


                      <td>

                        {Number(

                          backtest.returnPercentage ||
                          0

                        ).toFixed(2)}

                        %

                      </td>


                      <td>

                        {backtest.createdAt
                          ?.toDate

                          ? backtest.createdAt
                              .toDate()
                              .toLocaleString()

                          : "Just now"}

                      </td>

                    </tr>

                  )

                )}

              </tbody>

            </table>

          </div>

        )}

      </section>


      {/* FINAL SYSTEM TESTING */}

      <section className="section">

        <div className="section-heading">

          <div>

            <h2>
              Final System Testing
            </h2>

            <p>
              Verify backend,
              indicators, Firebase
              and simulator features.
            </p>

          </div>

        </div>


        <button

          className="run-button"

          onClick={
            handleFinalTest
          }

          disabled={
            testing
          }

        >

          {testing

            ? "Testing System..."

            : "🧪 Run Final Test"

          }

        </button>


        {testResults.length > 0 && (

          <div className="test-results">

            {testResults.map(

              (
                test,
                index
              ) => (

                <div

                  key={index}

                  className={

                    test.status ===
                    "PASS"

                      ? "test-card test-pass"

                      : "test-card test-fail"

                  }

                >

                  <div>

                    <strong>

                      {test.status ===
                      "PASS"

                        ? "✅"

                        : "❌"}

                      {" "}

                      {test.name}

                    </strong>


                    <p>

                      {test.message}

                    </p>

                  </div>


                  <span>

                    {test.status}

                  </span>

                </div>

              )

            )}

          </div>

        )}

      </section>


      {/* MULTI ASSET */}

      <MultiAssetChart />


      {/* FOOTER */}

      <footer>

        <h3>
          TradeLab
        </h3>

        <p>

          Trading Strategy Simulator

          {" • "}

          Educational Simulation Platform

        </p>

      </footer>

    </div>

  );

}


export default Dashboard;