// ==========================================
// TECHNICAL INDICATOR ENGINE
// ==========================================


// ==========================================
// HELPER FUNCTION
// Convert values into valid numbers
// ==========================================

function normalizePrices(prices) {

  return prices.map(
    (price) => Number(price)
  );

}


// ==========================================
// 1. SIMPLE MOVING AVERAGE (SMA)
// ==========================================

function calculateSMA(
  prices,
  period
) {

  const result = [];


  const numericPrices =
    normalizePrices(prices);


  for (
    let i = 0;
    i < numericPrices.length;
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
      let j = i - period + 1;
      j <= i;
      j++
    ) {

      sum +=
        numericPrices[j];

    }


    const average =
      sum / period;


    result.push(
      Number(
        average.toFixed(2)
      )
    );

  }


  return result;

}



// ==========================================
// 2. EXPONENTIAL MOVING AVERAGE (EMA)
// ==========================================

function calculateEMA(
  prices,
  period
) {

  const result = [];


  const numericPrices =
    normalizePrices(prices);


  if (
    numericPrices.length === 0
  ) {

    return result;

  }


  const multiplier =
    2 / (period + 1);


  let previousEMA =
    null;


  for (
    let i = 0;
    i < numericPrices.length;
    i++
  ) {

    // Not enough data

    if (
      i < period - 1
    ) {

      result.push(null);

      continue;

    }


    // First EMA = SMA

    if (
      i === period - 1
    ) {

      let sum = 0;


      for (
        let j = 0;
        j < period;
        j++
      ) {

        sum +=
          numericPrices[j];

      }


      previousEMA =
        sum / period;


      result.push(
        Number(
          previousEMA.toFixed(2)
        )
      );


      continue;

    }


    // Remaining EMA values

    const currentPrice =
      numericPrices[i];


    previousEMA =
      (
        currentPrice -
        previousEMA
      ) *
        multiplier +
      previousEMA;


    result.push(
      Number(
        previousEMA.toFixed(2)
      )
    );

  }


  return result;

}



// ==========================================
// 3. RELATIVE STRENGTH INDEX (RSI)
// ==========================================

function calculateRSI(
  prices,
  period = 14
) {

  const numericPrices =
    normalizePrices(prices);


  const result =
    new Array(
      numericPrices.length
    ).fill(null);


  if (
    numericPrices.length <=
    period
  ) {

    return result;

  }


  let gains = 0;

  let losses = 0;


  // Initial gains and losses

  for (
    let i = 1;
    i <= period;
    i++
  ) {

    const change =
      numericPrices[i] -
      numericPrices[i - 1];


    if (
      change >= 0
    ) {

      gains +=
        change;

    } else {

      losses +=
        Math.abs(change);

    }

  }


  let averageGain =
    gains / period;


  let averageLoss =
    losses / period;


  // First RSI

  if (
    averageLoss === 0
  ) {

    result[period] =
      100;

  } else {

    const relativeStrength =
      averageGain /
      averageLoss;


    const rsi =
      100 -
      100 /
        (
          1 +
          relativeStrength
        );


    result[period] =
      Number(
        rsi.toFixed(2)
      );

  }


  // Remaining RSI values

  for (
    let i = period + 1;
    i < numericPrices.length;
    i++
  ) {

    const change =
      numericPrices[i] -
      numericPrices[i - 1];


    const gain =
      change > 0
        ? change
        : 0;


    const loss =
      change < 0
        ? Math.abs(change)
        : 0;


    // Wilder smoothing

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

      const relativeStrength =
        averageGain /
        averageLoss;


      const rsi =
        100 -
        100 /
          (
            1 +
            relativeStrength
          );


      result[i] =
        Number(
          rsi.toFixed(2)
        );

    }

  }


  return result;

}



// ==========================================
// 4. BOLLINGER BANDS
// ==========================================

function calculateBollingerBands(
  prices,
  period = 20,
  standardDeviations = 2
) {

  const numericPrices =
    normalizePrices(prices);


  const middle = [];

  const upper = [];

  const lower = [];


  for (
    let i = 0;
    i < numericPrices.length;
    i++
  ) {

    if (
      i < period - 1
    ) {

      middle.push(null);

      upper.push(null);

      lower.push(null);

      continue;

    }


    let sum = 0;


    // Calculate mean

    for (
      let j = i - period + 1;
      j <= i;
      j++
    ) {

      sum +=
        numericPrices[j];

    }


    const mean =
      sum / period;


    // Calculate variance

    let squaredDifference =
      0;


    for (
      let j = i - period + 1;
      j <= i;
      j++
    ) {

      squaredDifference +=
        Math.pow(
          numericPrices[j] -
            mean,
          2
        );

    }


    const variance =
      squaredDifference /
      period;


    const standardDeviation =
      Math.sqrt(
        variance
      );


    const upperBand =
      mean +
      standardDeviations *
        standardDeviation;


    const lowerBand =
      mean -
      standardDeviations *
        standardDeviation;


    middle.push(
      Number(
        mean.toFixed(2)
      )
    );


    upper.push(
      Number(
        upperBand.toFixed(2)
      )
    );


    lower.push(
      Number(
        lowerBand.toFixed(2)
      )
    );

  }


  return {

    middle,

    upper,

    lower,

  };

}



// ==========================================
// EXPORT EVERYTHING
// ==========================================

module.exports = {

  calculateSMA,

  calculateEMA,

  calculateRSI,

  calculateBollingerBands,

};