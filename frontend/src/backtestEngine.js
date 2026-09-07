// frontend/src/backtestEngine.js

export function calculateSMA(data, period) {
  return data.map((item, index) => {
    if (index < period - 1) {
      return null;
    }

    let sum = 0;

    for (let i = index - period + 1; i <= index; i++) {
      sum += Number(data[i].close);
    }

    return Number((sum / period).toFixed(2));
  });
}

export function calculateEMA(data, period) {
  const multiplier = 2 / (period + 1);
  const ema = [];

  data.forEach((item, index) => {
    if (index === 0) {
      ema.push(Number(item.close));
    } else {
      const value =
        Number(item.close) * multiplier +
        ema[index - 1] * (1 - multiplier);

      ema.push(Number(value.toFixed(2)));
    }
  });

  return ema;
}

export function calculateRSI(data, period = 14) {
  const rsi = new Array(data.length).fill(null);

  if (data.length <= period) {
    return rsi;
  }

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const change = Number(data[i].close) - Number(data[i - 1].close);

    if (change >= 0) {
      gains += change;
    } else {
      losses += Math.abs(change);
    }
  }

  let averageGain = gains / period;
  let averageLoss = losses / period;

  let rs =
    averageLoss === 0 ? 100 : averageGain / averageLoss;

  rsi[period] = Number(
    (100 - 100 / (1 + rs)).toFixed(2)
  );

  for (let i = period + 1; i < data.length; i++) {
    const change =
      Number(data[i].close) - Number(data[i - 1].close);

    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;

    averageGain =
      (averageGain * (period - 1) + gain) / period;

    averageLoss =
      (averageLoss * (period - 1) + loss) / period;

    rs =
      averageLoss === 0 ? 100 : averageGain / averageLoss;

    rsi[i] = Number(
      (100 - 100 / (1 + rs)).toFixed(2)
    );
  }

  return rsi;
}

function checkCondition(left, condition, right) {
  if (
    left === null ||
    left === undefined ||
    right === null ||
    right === undefined
  ) {
    return false;
  }

  if (condition === ">") {
    return left > right;
  }

  if (condition === "<") {
    return left < right;
  }

  if (condition === ">=") {
    return left >= right;
  }

  if (condition === "<=") {
    return left <= right;
  }

  return false;
}

export function runBacktest(
  marketData,
  buyRule,
  sellRule,
  initialCapital
) {
  if (!marketData || marketData.length === 0) {
    return {
      trades: [],
      finalCapital: Number(initialCapital),
      profitLoss: 0,
      returnPercentage: 0,
      winningTrades: 0,
      losingTrades: 0,
    };
  }

  const sma20 = calculateSMA(marketData, 20);
  const sma50 = calculateSMA(marketData, 50);
  const ema20 = calculateEMA(marketData, 20);
  const rsi14 = calculateRSI(marketData, 14);

  let capital = Number(initialCapital);
  let position = null;

  const trades = [];

  for (let index = 50; index < marketData.length; index++) {
    const price = Number(marketData[index].close);

    const values = {
      CLOSE: price,
      SMA20: sma20[index],
      SMA50: sma50[index],
      EMA20: ema20[index],
      RSI14: rsi14[index],
    };

    const buyLeft = values[buyRule.indicator];
    const buyRight =
      buyRule.compareWith === "VALUE"
        ? Number(buyRule.value)
        : values[buyRule.compareWith];

    const sellLeft = values[sellRule.indicator];
    const sellRight =
      sellRule.compareWith === "VALUE"
        ? Number(sellRule.value)
        : values[sellRule.compareWith];

    const shouldBuy = checkCondition(
      buyLeft,
      buyRule.condition,
      buyRight
    );

    const shouldSell = checkCondition(
      sellLeft,
      sellRule.condition,
      sellRight
    );

    // BUY
    if (!position && shouldBuy && capital > 0) {
      const quantity = capital / price;

      position = {
        buyPrice: price,
        quantity,
        buyIndex: index,
        buyDate: marketData[index].date,
      };

      trades.push({
        type: "BUY",
        index,
        date: marketData[index].date,
        price,
        quantity,
      });

      capital = 0;
    }

    // SELL
    else if (position && shouldSell) {
      const saleValue =
        position.quantity * price;

      const profitLoss =
        saleValue -
        position.quantity * position.buyPrice;

      trades.push({
        type: "SELL",
        index,
        date: marketData[index].date,
        price,
        quantity: position.quantity,
        profitLoss,
      });

      capital = saleValue;
      position = null;
    }
  }

  // Close any open position at last market price
  if (position) {
    const lastIndex = marketData.length - 1;
    const lastPrice = Number(
      marketData[lastIndex].close
    );

    const saleValue =
      position.quantity * lastPrice;

    const profitLoss =
      saleValue -
      position.quantity * position.buyPrice;

    trades.push({
      type: "SELL",
      index: lastIndex,
      date: marketData[lastIndex].date,
      price: lastPrice,
      quantity: position.quantity,
      profitLoss,
    });

    capital = saleValue;
    position = null;
  }

  const completedTrades = trades.filter(
    (trade) => trade.type === "SELL"
  );

  const winningTrades =
    completedTrades.filter(
      (trade) => trade.profitLoss > 0
    ).length;

  const losingTrades =
    completedTrades.filter(
      (trade) => trade.profitLoss < 0
    ).length;

  const profitLoss =
    capital - Number(initialCapital);

  const returnPercentage =
    (profitLoss / Number(initialCapital)) * 100;

  return {
    trades,
    finalCapital: Number(capital.toFixed(2)),
    profitLoss: Number(profitLoss.toFixed(2)),
    returnPercentage: Number(
      returnPercentage.toFixed(2)
    ),
    winningTrades,
    losingTrades,
  };
}