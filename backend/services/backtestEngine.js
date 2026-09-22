function calculateSMA(marketData, period) {
  const result = [];

  for (let i = 0; i < marketData.length; i++) {
    if (i < period - 1) {
      result.push(null);
      continue;
    }

    let sum = 0;

    for (let j = i - period + 1; j <= i; j++) {
      sum += Number(marketData[j].close);
    }

    result.push(Number((sum / period).toFixed(2)));
  }

  return result;
}


function calculateEMA(marketData, period) {
  const result = [];

  const multiplier = 2 / (period + 1);

  let previousEMA = null;

  for (let i = 0; i < marketData.length; i++) {
    const price = Number(marketData[i].close);

    if (i < period - 1) {
      result.push(null);
      continue;
    }

    if (i === period - 1) {
      let sum = 0;

      for (let j = 0; j < period; j++) {
        sum += Number(marketData[j].close);
      }

      previousEMA = sum / period;

      result.push(Number(previousEMA.toFixed(2)));

      continue;
    }

    const ema =
      (price - previousEMA) * multiplier +
      previousEMA;

    previousEMA = ema;

    result.push(Number(ema.toFixed(2)));
  }

  return result;
}


function calculateRSI(marketData, period = 14) {
  const result = Array(marketData.length).fill(null);

  if (marketData.length <= period) {
    return result;
  }

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const change =
      Number(marketData[i].close) -
      Number(marketData[i - 1].close);

    if (change >= 0) {
      gains += change;
    } else {
      losses += Math.abs(change);
    }
  }

  let averageGain = gains / period;
  let averageLoss = losses / period;

  if (averageLoss === 0) {
    result[period] = 100;
  } else {
    const rs = averageGain / averageLoss;

    result[period] = Number(
      (100 - 100 / (1 + rs)).toFixed(2)
    );
  }

  for (
    let i = period + 1;
    i < marketData.length;
    i++
  ) {
    const change =
      Number(marketData[i].close) -
      Number(marketData[i - 1].close);

    const gain = change > 0 ? change : 0;

    const loss =
      change < 0 ? Math.abs(change) : 0;

    averageGain =
      (
        averageGain * (period - 1) +
        gain
      ) / period;

    averageLoss =
      (
        averageLoss * (period - 1) +
        loss
      ) / period;

    if (averageLoss === 0) {
      result[i] = 100;
    } else {
      const rs =
        averageGain / averageLoss;

      result[i] = Number(
        (100 - 100 / (1 + rs)).toFixed(2)
      );
    }
  }

  return result;
}


/*
=========================================================
NORMAL CONDITIONS
=========================================================
*/

function checkNormalCondition(
  leftValue,
  condition,
  rightValue
) {
  if (
    leftValue === null ||
    leftValue === undefined ||
    rightValue === null ||
    rightValue === undefined
  ) {
    return false;
  }

  switch (condition) {
    case "greater_than":
    case ">":
      return leftValue > rightValue;

    case "less_than":
    case "<":
      return leftValue < rightValue;

    case "greater_than_or_equal":
    case ">=":
      return leftValue >= rightValue;

    case "less_than_or_equal":
    case "<=":
      return leftValue <= rightValue;

    case "equal_to":
    case "==":
      return leftValue === rightValue;

    default:
      return false;
  }
}


/*
=========================================================
TRUE CROSSOVER DETECTION
=========================================================

Cross Above:

Previous candle:
LEFT <= RIGHT

Current candle:
LEFT > RIGHT


Cross Below:

Previous candle:
LEFT >= RIGHT

Current candle:
LEFT < RIGHT
=========================================================
*/

function checkCrossover(
  previousLeft,
  currentLeft,
  previousRight,
  currentRight,
  condition
) {
  if (
    previousLeft === null ||
    previousLeft === undefined ||
    currentLeft === null ||
    currentLeft === undefined ||
    previousRight === null ||
    previousRight === undefined ||
    currentRight === null ||
    currentRight === undefined
  ) {
    return false;
  }

  if (condition === "cross_above") {
    return (
      previousLeft <= previousRight &&
      currentLeft > currentRight
    );
  }

  if (condition === "cross_below") {
    return (
      previousLeft >= previousRight &&
      currentLeft < currentRight
    );
  }

  return false;
}


function runBacktest(
  strategy,
  initialCapital,
  marketData
) {
  const capital = Number(initialCapital);

  let cash = capital;
  let quantity = 0;
  let entryPrice = 0;
  let hasPosition = false;

  const trades = [];

  let winningTrades = 0;
  let losingTrades = 0;

  /*
  ========================================================
  INDICATORS
  ========================================================
  */

  const sma20 = calculateSMA(
    marketData,
    20
  );

  const sma50 = calculateSMA(
    marketData,
    50
  );

  const ema20 = calculateEMA(
    marketData,
    20
  );

  const rsi14 = calculateRSI(
    marketData,
    14
  );


  /*
  ========================================================
  GET INDICATOR VALUE
  ========================================================
  */

  function getValue(
    name,
    index
  ) {
    switch (name) {
      case "CLOSE":
        return Number(
          marketData[index].close
        );

      case "SMA20":
        return sma20[index];

      case "SMA50":
        return sma50[index];

      case "EMA20":
        return ema20[index];

      case "RSI14":
        return rsi14[index];

      case "SMA":
        /*
        The StrategyBuilder can send SMA
        with a period. For the existing
        20/50 strategy options, use the
        requested period.
        */
        return null;

      case "EMA":
        return null;

      case "RSI":
        return null;

      default:
        return null;
    }
  }


  /*
  ========================================================
  GET RULE INDICATOR VALUE
  ========================================================
  */

  function getRuleValue(
    rule,
    index
  ) {
    /*
    StrategyBuilder can send:
    SMA
    EMA
    RSI

    Convert these into the corresponding
    calculated indicator.
    */

    if (rule.indicator === "SMA") {
      const period = Number(
        rule.period || 20
      );

      if (period === 50) {
        return sma50[index];
      }

      if (period === 20) {
        return sma20[index];
      }

      /*
      For unsupported custom periods,
      calculate the SMA dynamically.
      */

      const customSMA =
        calculateSMA(
          marketData,
          period
        );

      return customSMA[index];
    }


    if (rule.indicator === "EMA") {
      const period = Number(
        rule.period || 20
      );

      if (period === 20) {
        return ema20[index];
      }

      const customEMA =
        calculateEMA(
          marketData,
          period
        );

      return customEMA[index];
    }


    if (rule.indicator === "RSI") {
      const period = Number(
        rule.period || 14
      );

      if (period === 14) {
        return rsi14[index];
      }

      const customRSI =
        calculateRSI(
          marketData,
          period
        );

      return customRSI[index];
    }


    if (
      rule.indicator === "CLOSE"
    ) {
      return Number(
        marketData[index].close
      );
    }


    /*
    Fallback for already-normalized
    indicator names.
    */

    return getValue(
      rule.indicator,
      index
    );
  }


  /*
  ========================================================
  GET RIGHT SIDE OF RULE
  ========================================================
  */

  function getRightValue(
    rule,
    index
  ) {
    if (
      rule.compareWith ===
      "VALUE"
    ) {
      return Number(
        rule.value
      );
    }

    return getValue(
      rule.compareWith,
      index
    );
  }


  /*
  ========================================================
  EVALUATE RULE
  ========================================================
  */

  function evaluateRule(
    rule,
    index
  ) {
    const currentLeft =
      getRuleValue(
        rule,
        index
      );

    const currentRight =
      getRightValue(
        rule,
        index
      );


    /*
    A crossover requires
    a previous candle.
    */

    if (
      rule.condition ===
        "cross_above" ||
      rule.condition ===
        "cross_below"
    ) {
      if (index === 0) {
        return false;
      }

      const previousLeft =
        getRuleValue(
          rule,
          index - 1
        );

      const previousRight =
        getRightValue(
          rule,
          index - 1
        );

      return checkCrossover(
        previousLeft,
        currentLeft,
        previousRight,
        currentRight,
        rule.condition
      );
    }


    /*
    Normal condition.
    */

    return checkNormalCondition(
      currentLeft,
      rule.condition,
      currentRight
    );
  }


  /*
  ========================================================
  BACKTEST LOOP
  ========================================================
  */

  for (
    let i = 0;
    i < marketData.length;
    i++
  ) {
    const price =
      Number(
        marketData[i].close
      );


    const buySignal =
      evaluateRule(
        strategy.buyRule,
        i
      );


    const sellSignal =
      evaluateRule(
        strategy.sellRule,
        i
      );


    /*
    ======================================================
    BUY
    ======================================================
    */

    if (
      buySignal &&
      !hasPosition &&
      cash > 0
    ) {
      quantity =
        cash / price;

      entryPrice = price;

      hasPosition = true;

      trades.push({
        type: "BUY",

        date:
          marketData[i].date,

        price,

        quantity,

        profitLoss: 0,

        index: i,
      });

      cash = 0;
    }


    /*
    ======================================================
    SELL
    ======================================================
    */

    else if (
      sellSignal &&
      hasPosition
    ) {
      const saleValue =
        quantity * price;

      const profitLoss =
        (
          price -
          entryPrice
        ) *
        quantity;


      if (profitLoss >= 0) {
        winningTrades++;
      } else {
        losingTrades++;
      }


      trades.push({
        type: "SELL",

        date:
          marketData[i].date,

        price,

        quantity,

        profitLoss,

        index: i,
      });


      cash = saleValue;

      quantity = 0;

      entryPrice = 0;

      hasPosition = false;
    }
  }


  /*
  ========================================================
  CLOSE OPEN POSITION
  ========================================================
  */

  let finalCapital = cash;


  if (
    hasPosition &&
    marketData.length > 0
  ) {
    const lastIndex =
      marketData.length - 1;


    const lastPrice =
      Number(
        marketData[lastIndex].close
      );


    const saleValue =
      quantity * lastPrice;


    const profitLoss =
      (
        lastPrice -
        entryPrice
      ) *
      quantity;


    if (profitLoss >= 0) {
      winningTrades++;
    } else {
      losingTrades++;
    }


    trades.push({
      type: "SELL",

      date:
        marketData[lastIndex].date,

      price:
        lastPrice,

      quantity,

      profitLoss,

      index:
        lastIndex,
    });


    finalCapital =
      saleValue;

    cash =
      saleValue;

    quantity = 0;

    entryPrice = 0;

    hasPosition = false;
  }


  /*
  ========================================================
  FINAL RESULTS
  ========================================================
  */

  const profitLoss =
    finalCapital - capital;


  const returnPercentage =
    capital === 0
      ? 0
      : (
          profitLoss /
          capital
        ) * 100;


  return {
    initialCapital:
      capital,

    finalCapital:
      Number(
        finalCapital.toFixed(2)
      ),

    /*
    Keep finalValue because
    your Dashboard may use this name.
    */

    finalValue:
      Number(
        finalCapital.toFixed(2)
      ),

    profitLoss:
      Number(
        profitLoss.toFixed(2)
      ),

    returnPercentage:
      Number(
        returnPercentage.toFixed(2)
      ),

    winningTrades,

    losingTrades,

    totalTrades:
      trades.length,

    trades,
  };
}


module.exports = runBacktest;