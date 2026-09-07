const express = require("express");

const runBacktest =
  require("../services/backtestEngine");

const router = express.Router();


router.post("/run", (req, res) => {
  try {
    const {
      strategy,
      initialCapital,
      marketData
    } = req.body;


    if (!strategy) {
      return res.status(400).json({
        message: "Strategy is required"
      });
    }


    if (!strategy.buyRule) {
      return res.status(400).json({
        message: "BUY rule is required"
      });
    }


    if (!strategy.sellRule) {
      return res.status(400).json({
        message: "SELL rule is required"
      });
    }


    if (
      !marketData ||
      !Array.isArray(marketData) ||
      marketData.length === 0
    ) {
      return res.status(400).json({
        message: "Market data is required"
      });
    }


    const result = runBacktest(
      strategy,
      initialCapital,
      marketData
    );


    res.json(result);

  } catch (error) {
    console.error(
      "Backtest error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to run backtest",

      error:
        error.message
    });
  }
});


module.exports = router;