// ==========================================
// MARKET DATA GENERATOR
// Generates simulated OHLCV market data
// ==========================================


function generateMarketData(
  days = 200
) {

  // Ensure valid number of days

  const totalDays =
    Math.max(
      1,
      Number(days) || 200
    );


  const data = [];


  // Starting market price

  let price = 100;


  // Starting date

  const startDate =
    new Date(
      "2025-01-01"
    );


  for (
    let i = 0;
    i < totalDays;
    i++
  ) {

    // Create date

    const date =
      new Date(
        startDate
      );


    date.setDate(
      startDate.getDate() +
      i
    );


    // Opening price

    const open =
      price;


    // ==========================================
    // RANDOM MARKET MOVEMENT
    // ==========================================

    // Small upward market trend

    const trend =
      0.03;


    // Random volatility

    const volatility =
      (
        Math.random() -
        0.5
      ) *
      6;


    // Final price movement

    const change =
      trend +
      volatility;


    // Closing price
    // Price cannot go below ₹10

    const close =
      Math.max(
        10,
        open +
        change
      );


    // ==========================================
    // HIGH PRICE
    // ==========================================

    const high =
      Math.max(
        open,
        close
      ) +
      Math.random() *
        3;


    // ==========================================
    // LOW PRICE
    // ==========================================

    const low =
      Math.max(
        1,
        Math.min(
          open,
          close
        ) -
        Math.random() *
          3
      );


    // ==========================================
    // RANDOM TRADING VOLUME
    // ==========================================

    const volume =
      Math.floor(
        10000 +
        Math.random() *
          90000
      );


    // ==========================================
    // ADD MARKET DAY
    // ==========================================

    data.push({

      day:
        i + 1,


      date:
        date
          .toISOString()
          .split("T")[0],


      open:
        Number(
          open.toFixed(2)
        ),


      high:
        Number(
          high.toFixed(2)
        ),


      low:
        Number(
          low.toFixed(2)
        ),


      close:
        Number(
          close.toFixed(2)
        ),


      volume,

    });


    // Next day's opening price
    // starts from today's closing price

    price =
      close;

  }


  return data;

}



// ==========================================
// EXPORT MARKET GENERATOR
// ==========================================

module.exports =
  generateMarketData;