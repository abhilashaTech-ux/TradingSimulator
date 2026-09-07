function calculateSMA(marketData, period) {
  const result = [];

  for (let i = 0; i < marketData.length; i++) {
    if (i < period - 1) {
      result.push(null);
      continue;
    }

    let sum = 0;

    for (
      let j = i - period + 1;
      j <= i;
      j++
    ) {
      sum += Number(marketData[j].close);
    }

    result.push(sum / period);
  }

  return result;
}


function calculateEMA(marketData, period) {
  const result = [];

  const multiplier =
    2 / (period + 1);

  let previousEMA = null;

  for (let i = 0; i < marketData.length; i++) {
    const price =
      Number(marketData[i].close);

    if (i < period - 1) {
      result.push(null);
      continue;
    }

    if (i === period - 1) {
      let sum = 0;

      for (let j = 0; j < period; j++) {
        sum += Number(
          marketData[j].close
        );
      }

      previousEMA = sum / period;

      result.push(previousEMA);

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


function calculateRSI(marketData, period) {
  const result = Array(
    marketData.length
  ).fill(null);

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
    const rs =
      averageGain / averageLoss;

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
      Number(marketData[i].close) -
      Number(marketData[i - 1].close);

    const gain =
      change > 0 ? change : 0;

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

    if (averageLoss === 0) {
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


function checkCondition(
  leftValue,
  condition,
  rightValue
) {
  if (
    leftValue === null ||
    rightValue === null ||
    leftValue === undefined ||
    rightValue === undefined
  ) {
    return false;
  }

  switch (condition) {
    case ">":
      return leftValue > rightValue;

    case "<":
      return leftValue < rightValue;

    case ">=":
      return leftValue >= rightValue;

    case "<=":
      return leftValue <= rightValue;

    default:
      return false;
  }
}


function runBacktest(
  strategy,
  initialCapital,
  marketData
) {
  const capital =
    Number(initialCapital);

  let cash = capital;
  let quantity = 0;
  let entryPrice = 0;
  let hasPosition = false;

  const trades = [];

  let winningTrades = 0;
  let losingTrades = 0;

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

      default:
        return null;
    }
  }


  function evaluateRule(
    rule,
    index
  ) {
    const leftValue =
      getValue(
        rule.indicator,
        index
      );

    let rightValue;

    if (
      rule.compareWith ===
      "VALUE"
    ) {
      rightValue =
        Number(rule.value);
    } else {
      rightValue =
        getValue(
          rule.compareWith,
          index
        );
    }

    return checkCondition(
      leftValue,
      rule.condition,
      rightValue
    );
  }


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


    // BUY

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


    // SELL

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


  let finalCapital = cash;

  if (
    hasPosition &&
    marketData.length > 0
  ) {
    const lastPrice =
      Number(
        marketData[
          marketData.length - 1
        ].close
      );

    finalCapital =
      quantity * lastPrice;
  }


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
    finalCapital,

    profitLoss,

    returnPercentage,

    winningTrades,

    losingTrades,

    trades,
  };
}


module.exports = runBacktest;