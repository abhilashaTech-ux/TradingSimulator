const express = require("express");

const generateMarketData = require("../services/marketGenerator");

const router = express.Router();

router.get("/generate", (req, res) => {
  const days = Number(req.query.days) || 200;

  const data = generateMarketData(days);

  res.json(data);
});

module.exports = router;