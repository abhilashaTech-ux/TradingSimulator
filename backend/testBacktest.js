async function testBacktest() {

  const response = await fetch(
    "http://localhost:5000/api/backtest/run",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({

        initialCapital: 10000,

        strategy: {

          buyRule: {
            indicator: "SMA",
            period: 50,
            condition: "cross_above"
          },

          sellRule: {
            indicator: "RSI",
            period: 14,
            condition: "greater_than",
            value: 70
          }

        }

      })
    }
  );


  const result =
    await response.json();


  console.log(
    JSON.stringify(
      result,
      null,
      2
    )
  );
}


testBacktest();