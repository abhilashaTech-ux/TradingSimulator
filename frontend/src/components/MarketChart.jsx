import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceDot
} from "recharts";

function MarketChart({ data, tradeMarkers = [] 

}) {
  return (
    <div className="market-chart-card">

      <div className="chart-header">
        <div>
          <h2>Market & Technical Indicators</h2>
          <p>
            Simulated price with SMA, EMA and Bollinger Bands
          </p>
        </div>

        <div className="chart-badge">
          {data.length} Days
        </div>
      </div>

      <div className="chart-container">

        <ResponsiveContainer
  width="100%"
  height={400}
>
  <LineChart data={data}>

    <CartesianGrid />

    <XAxis dataKey="date" />

    <YAxis />

    <Tooltip />

    <Legend />


    {/* PRICE LINE */}

    <Line
      type="monotone"
      dataKey="close"
      strokeWidth={2}
      dot={false}
      name="Close Price"
    />


    {/* SMA LINE */}

    <Line
      type="monotone"
      dataKey="sma50"
      strokeWidth={2}
      dot={false}
      name="SMA 50"
    />


    {/* EMA LINE */}

    <Line
      type="monotone"
      dataKey="ema20"
      strokeWidth={2}
      dot={false}
      name="EMA 20"
    />


    {/* BUY / SELL TRADE MARKERS */}

    {tradeMarkers.map((trade, index) => (
      <ReferenceDot
        key={index}
        x={trade.date}
        y={trade.price}
        r={8}
        ifOverflow="visible"
        fill={
          trade.type === "BUY"
            ? "green"
            : "red"
        }
        stroke="white"
        strokeWidth={2}
        label={{
          value:
            trade.type === "BUY"
              ? "BUY"
              : "SELL",
          position:
            trade.type === "BUY"
              ? "bottom"
              : "top"
        }}
      />
    ))}

  </LineChart>
</ResponsiveContainer>

      </div>
    </div>
  );
}

export default MarketChart;