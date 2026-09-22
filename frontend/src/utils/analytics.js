// =========================================================
// ADVANCED ANALYTICS CALCULATIONS
// =========================================================

// -------------------------
// Simple Moving Average
// -------------------------
export function calculateSMA(data, period = 20) {
  return data.map((item, index) => {
    if (index < period - 1) {
      return null;
    }

    const slice = data.slice(index - period + 1, index + 1);

    const average =
      slice.reduce((sum, candle) => sum + Number(candle.close), 0) /
      period;

    return Number(average.toFixed(2));
  });
}

// -------------------------
// Exponential Moving Average
// -------------------------
export function calculateEMA(data, period = 20) {
  if (!data.length) return [];

  const multiplier = 2 / (period + 1);
  const result = [];

  let previousEMA = Number(data[0].close);

  result.push(Number(previousEMA.toFixed(2)));

  for (let i = 1; i < data.length; i++) {
    const price = Number(data[i].close);

    const currentEMA =
      (price - previousEMA) * multiplier + previousEMA;

    result.push(Number(currentEMA.toFixed(2)));

    previousEMA = currentEMA;
  }

  return result;
}

// -------------------------
// RSI
// -------------------------
export function calculateRSI(data, period = 14) {
  const result = new Array(data.length).fill(null);

  if (data.length <= period) {
    return result;
  }

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const change =
      Number(data[i].close) - Number(data[i - 1].close);

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
    result[period] = Number((100 - 100 / (1 + rs)).toFixed(2));
  }

  for (let i = period + 1; i < data.length; i++) {
    const change =
      Number(data[i].close) - Number(data[i - 1].close);

    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;

    averageGain =
      (averageGain * (period - 1) + gain) / period;

    averageLoss =
      (averageLoss * (period - 1) + loss) / period;

    if (averageLoss === 0) {
      result[i] = 100;
    } else {
      const rs = averageGain / averageLoss;

      result[i] = Number(
        (100 - 100 / (1 + rs)).toFixed(2)
      );
    }
  }

  return result;
}

// -------------------------
// Daily Returns
// -------------------------
export function calculateReturns(data) {
  return data.map((item, index) => {
    if (index === 0) {
      return 0;
    }

    const previous = Number(data[index - 1].close);
    const current = Number(item.close);

    if (previous === 0) {
      return 0;
    }

    return ((current - previous) / previous) * 100;
  });
}

// -------------------------
// Volatility
// -------------------------
// Standard deviation of daily percentage returns
export function calculateVolatility(data, period = 20) {
  const returns = calculateReturns(data);

  return data.map((item, index) => {
    if (index < period) {
      return null;
    }

    const slice = returns.slice(
      index - period + 1,
      index + 1
    );

    const mean =
      slice.reduce((sum, value) => sum + value, 0) /
      slice.length;

    const squaredDifferences = slice.map(
      (value) => Math.pow(value - mean, 2)
    );

    const variance =
      squaredDifferences.reduce(
        (sum, value) => sum + value,
        0
      ) / slice.length;

    const standardDeviation = Math.sqrt(variance);

    return Number(standardDeviation.toFixed(2));
  });
}