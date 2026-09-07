const express = require("express");

const cors = require("cors");

const backtestRoutes =
  require("./routes/backtest");


const app = express();

const PORT = 5000;


// MIDDLEWARE

app.use(cors());

app.use(express.json());


// HOME ROUTE

app.get("/", (req, res) => {
  res.json({
    message:
      "TradeLab Backend Running"
  });
});


// BACKTEST API

app.use(
  "/api/backtest",
  backtestRoutes
);


// START SERVER

app.listen(PORT, () => {
  console.log(
    `TradeLab backend running at http://localhost:${PORT}`
  );
});