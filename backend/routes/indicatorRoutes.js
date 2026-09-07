const express = require("express");

const generateMarketData = require("../services/marketGenerator");

const {
  calculateSMA,
  calculateEMA,
  calculateRSI,
  calculateBollingerBands
} = require("../services/indicators");

const router = express.Router();


router.get("/calculate", (req, res) => {

  try {

    const days = Number(req.query.days) || 200;

    const data = generateMarketData(days);

    const closingPrices = data.map(
      item => item.close
    );


    const sma50 =
      calculateSMA(closingPrices, 50);

    const ema20 =
      calculateEMA(closingPrices, 20);

    const rsi14 =
      calculateRSI(closingPrices, 14);

    const bollinger =
      calculateBollingerBands(
        closingPrices,
        20,
        2
      );


    const result = data.map((item, index) => ({

      ...item,

      sma50: sma50[index],

      ema20: ema20[index],

      rsi14: rsi14[index],

      bollingerMiddle:
        bollinger.middle[index],

      bollingerUpper:
        bollinger.upper[index],

      bollingerLower:
        bollinger.lower[index]

    }));


    res.json(result);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Failed to calculate indicators"
    });
  }
});


module.exports = router;