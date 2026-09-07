const API_URL = "https://trading-simulator-backend.onrender.com";


// ==========================================
// GET MARKET + INDICATOR DATA
// ==========================================

export async function getIndicatorData(days = 200) {
  const response = await fetch(
    `${API_URL}/api/indicators/calculate?days=${days}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch market data");
  }

  return await response.json();
}


// ==========================================
// RUN BACKTEST ON EXISTING DATA
// ==========================================

export async function runBacktest(
  strategy,
  initialCapital,
  marketData
) {

  const response = await fetch(
    `${API_URL}/api/backtest/run`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        strategy,
        initialCapital,
        marketData
      })
    }
  );


  if (!response.ok) {

    const errorData =
      await response.json();

    throw new Error(
      errorData.message ||
      "Failed to run backtest"
    );
  }


  return await response.json();
}