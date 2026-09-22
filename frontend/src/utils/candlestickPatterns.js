// ===================================
// CANDLESTICK PATTERN RECOGNITION
// ===================================
//
// Detects:
// 1. Hammer
// 2. Doji
// 3. Bullish Engulfing
// 4. Bearish Engulfing
//
// Input format:
// [
//   {
//     day: 1,
//     open: 100,
//     high: 105,
//     low: 98,
//     close: 103
//   },
//   ...
// ]
//
// Output format:
// [
//   {
//     index: 10,
//     day: 11,
//     name: "Hammer",
//     description: "..."
//   }
// ]


// ===================================
// HELPER FUNCTIONS
// ===================================

// Get candle body size

function getBodySize(candle) {
  return Math.abs(
    candle.close - candle.open
  );
}


// Get complete candle range

function getCandleRange(candle) {
  return (
    candle.high -
    candle.low
  );
}


// Get upper wick size

function getUpperWick(candle) {
  return (
    candle.high -
    Math.max(
      candle.open,
      candle.close
    )
  );
}


// Get lower wick size

function getLowerWick(candle) {
  return (
    Math.min(
      candle.open,
      candle.close
    ) -
    candle.low
  );
}


// Check whether candle is bullish

function isBullish(candle) {
  return candle.close > candle.open;
}


// Check whether candle is bearish

function isBearish(candle) {
  return candle.close < candle.open;
}


// ===================================
// HAMMER DETECTION
// ===================================
//
// A hammer generally has:
// - Small body
// - Long lower wick
// - Small upper wick
// - Lower wick significantly larger
//   than the body
//
// This is a simplified educational
// pattern detector, suitable for the
// simulated market data.


function isHammer(candle) {

  const body =
    getBodySize(candle);

  const range =
    getCandleRange(candle);

  const upperWick =
    getUpperWick(candle);

  const lowerWick =
    getLowerWick(candle);


  // Invalid candle

  if (
    range <= 0 ||
    body < 0
  ) {
    return false;
  }


  // Avoid division problems

  const safeBody =
    Math.max(
      body,
      range * 0.01
    );


  // Hammer conditions

  const smallBody =
    body <=
    range * 0.4;


  const longLowerWick =
    lowerWick >=
    safeBody * 2;


  const smallUpperWick =
    upperWick <=
    safeBody;


  return (
    smallBody &&
    longLowerWick &&
    smallUpperWick
  );
}


// ===================================
// DOJI DETECTION
// ===================================
//
// A doji occurs when the opening and
// closing prices are very close.
//
// We use candle range rather than a
// fixed price difference so the rule
// works for AAPL, BTC, ETH, etc.


function isDoji(candle) {

  const body =
    getBodySize(candle);

  const range =
    getCandleRange(candle);


  if (
    range <= 0
  ) {
    return false;
  }


  return (
    body <=
    range * 0.1
  );
}


// ===================================
// BULLISH ENGULFING
// ===================================
//
// Two-candle pattern:
//
// Previous candle = bearish
// Current candle  = bullish
//
// Current candle's body completely
// covers the previous candle's body.


function isBullishEngulfing(
  previousCandle,
  currentCandle
) {

  if (
    !previousCandle ||
    !currentCandle
  ) {
    return false;
  }


  // Previous candle must be bearish

  if (
    !isBearish(
      previousCandle
    )
  ) {
    return false;
  }


  // Current candle must be bullish

  if (
    !isBullish(
      currentCandle
    )
  ) {
    return false;
  }


  const previousOpen =
    previousCandle.open;

  const previousClose =
    previousCandle.close;

  const currentOpen =
    currentCandle.open;

  const currentClose =
    currentCandle.close;


  // Current bullish body must cover
  // previous bearish body

  return (
    currentOpen <=
    previousClose &&

    currentClose >=
    previousOpen
  );
}


// ===================================
// BEARISH ENGULFING
// ===================================
//
// Two-candle pattern:
//
// Previous candle = bullish
// Current candle  = bearish
//
// Current candle's body completely
// covers the previous candle's body.


function isBearishEngulfing(
  previousCandle,
  currentCandle
) {

  if (
    !previousCandle ||
    !currentCandle
  ) {
    return false;
  }


  // Previous candle must be bullish

  if (
    !isBullish(
      previousCandle
    )
  ) {
    return false;
  }


  // Current candle must be bearish

  if (
    !isBearish(
      currentCandle
    )
  ) {
    return false;
  }


  const previousOpen =
    previousCandle.open;

  const previousClose =
    previousCandle.close;

  const currentOpen =
    currentCandle.open;

  const currentClose =
    currentCandle.close;


  // Current bearish body must cover
  // previous bullish body

  return (
    currentOpen >=
    previousClose &&

    currentClose <=
    previousOpen
  );
}


// ===================================
// MAIN DETECTION FUNCTION
// ===================================
//
// This is the function imported by
// MultiAssetChart.jsx:
//
// detectCandlestickPatterns(data)


function detectCandlestickPatterns(
  data
) {

  // Make sure input is valid

  if (
    !Array.isArray(data) ||
    data.length === 0
  ) {
    return [];
  }


  const detectedPatterns = [];


  // ---------------------------------
  // LOOP THROUGH ALL CANDLES
  // ---------------------------------

  for (
    let i = 0;
    i < data.length;
    i++
  ) {

    const candle =
      data[i];


    // Skip invalid candles

    if (
      !candle ||
      typeof candle.open !==
        "number" ||
      typeof candle.high !==
        "number" ||
      typeof candle.low !==
        "number" ||
      typeof candle.close !==
        "number"
    ) {
      continue;
    }


    // =================================
    // HAMMER
    // =================================

    if (
      isHammer(candle)
    ) {

      detectedPatterns.push({

        index: i,

        day:
          candle.day ??
          i + 1,

        name:
          "Hammer",

        description:
          "A hammer has a small body and a long lower wick. It can indicate a possible bullish reversal after a decline.",

      });

    }


    // =================================
    // DOJI
    // =================================

    if (
      isDoji(candle)
    ) {

      detectedPatterns.push({

        index: i,

        day:
          candle.day ??
          i + 1,

        name:
          "Doji",

        description:
          "A doji forms when the opening and closing prices are very close. It represents market indecision and a possible change in momentum.",

      });

    }


    // =================================
    // ENGULFING PATTERNS
    // =================================

    if (i > 0) {

      const previousCandle =
        data[i - 1];


      // -------------------------------
      // BULLISH ENGULFING
      // -------------------------------

      if (
        isBullishEngulfing(
          previousCandle,
          candle
        )
      ) {

        detectedPatterns.push({

          index: i,

          day:
            candle.day ??
            i + 1,

          name:
            "Bullish Engulfing",

          description:
            "A bullish engulfing pattern occurs when a bullish candle completely covers the previous bearish candle's body. It can signal increasing buying pressure and a possible upward reversal.",

        });

      }


      // -------------------------------
      // BEARISH ENGULFING
      // -------------------------------

      if (
        isBearishEngulfing(
          previousCandle,
          candle
        )
      ) {

        detectedPatterns.push({

          index: i,

          day:
            candle.day ??
            i + 1,

          name:
            "Bearish Engulfing",

          description:
            "A bearish engulfing pattern occurs when a bearish candle completely covers the previous bullish candle's body. It can signal increasing selling pressure and a possible downward reversal.",

        });

      }

    }

  }


  return detectedPatterns;
}


// ===================================
// EXPORT
// ===================================

export {
  detectCandlestickPatterns,
};