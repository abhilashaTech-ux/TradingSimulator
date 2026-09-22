import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ComposedChart,
  Line,
  Bar,
  ErrorBar,
  Rectangle,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceDot,
} from "recharts";

import {
  detectCandlestickPatterns,
} from "../utils/candlestickPatterns";


// ===================================
// GENERATE RANDOM ASSET DATA
// ===================================

function generateAssetData(
  startPrice,
  days = 100,
  volatility = 0.03
) {
  const data = [];

  let price = startPrice;

  for (let i = 0; i < days; i++) {
    const open = price;

    const randomChange =
      (Math.random() - 0.5) *
      volatility *
      2;

    price = Math.max(
      1,
      price * (1 + randomChange)
    );

    const close = price;

    const high =
      Math.max(open, close) *
      (
        1 +
        Math.random() *
        volatility *
        0.4
      );

    const low =
      Math.min(open, close) *
      (
        1 -
        Math.random() *
        volatility *
        0.4
      );

    data.push({
      day: i + 1,

      open: Number(
        open.toFixed(2)
      ),

      high: Number(
        high.toFixed(2)
      ),

      low: Number(
        low.toFixed(2)
      ),

      close: Number(
        close.toFixed(2)
      ),
    });

    price = close;
  }

  return data;
}


// ===================================
// GET PERFORMANCE
// ===================================

function getPerformance(asset) {
  const firstPrice =
    asset.data[0]?.close || 0;

  const lastPrice =
    asset.data[
      asset.data.length - 1
    ]?.close || 0;

  if (firstPrice === 0) {
    return 0;
  }

  return (
    (
      (lastPrice - firstPrice) /
      firstPrice
    ) * 100
  );
}


// ===================================
// CALCULATE CORRELATION
// ===================================

function calculateCorrelation(
  firstValues,
  secondValues
) {
  const length =
    Math.min(
      firstValues.length,
      secondValues.length
    );

  if (length < 2) {
    return 0;
  }

  const first =
    firstValues.slice(
      0,
      length
    );

  const second =
    secondValues.slice(
      0,
      length
    );

  const firstMean =
    first.reduce(
      (total, value) =>
        total + value,
      0
    ) / length;

  const secondMean =
    second.reduce(
      (total, value) =>
        total + value,
      0
    ) / length;

  let numerator = 0;
  let firstSquare = 0;
  let secondSquare = 0;

  for (
    let i = 0;
    i < length;
    i++
  ) {
    const firstDifference =
      first[i] -
      firstMean;

    const secondDifference =
      second[i] -
      secondMean;

    numerator +=
      firstDifference *
      secondDifference;

    firstSquare +=
      firstDifference *
      firstDifference;

    secondSquare +=
      secondDifference *
      secondDifference;
  }

  const denominator =
    Math.sqrt(
      firstSquare *
      secondSquare
    );

  if (denominator === 0) {
    return 0;
  }

  return (
    numerator /
    denominator
  );
}


// ===================================
// PATTERN COLORS
// ===================================

const patternColors = {
  Hammer: "#f59e0b",
  Doji: "#6366f1",
  "Bullish Engulfing": "#16a34a",
  "Bearish Engulfing": "#dc2626",
};


// ===================================
// PATTERN EXPLANATIONS
// ===================================

const patternExplanations = {
  Hammer:
    "A hammer can indicate a possible bullish reversal after a decline.",

  Doji:
    "A doji shows market indecision because the opening and closing prices are very close.",

  "Bullish Engulfing":
    "A bullish engulfing pattern can indicate increasing buying pressure and a possible upward reversal.",

  "Bearish Engulfing":
    "A bearish engulfing pattern can indicate increasing selling pressure and a possible downward reversal.",
};


// ===================================
// CANDLESTICK BODY
// ===================================

function CandlestickShape(props) {
  const {
    x,
    y,
    width,
    height,
    payload,
    assetSymbol,
  } = props;

  if (!payload) {
    return null;
  }

  const open =
    Number(
      payload[
        `${assetSymbol}_open`
      ]
    );

  const close =
    Number(
      payload[
        `${assetSymbol}_close`
      ]
    );

  if (
    !Number.isFinite(open) ||
    !Number.isFinite(close)
  ) {
    return null;
  }

  const bullish =
    close >= open;

  const candleColor =
    bullish
      ? "#16a34a"
      : "#dc2626";

  const safeX =
    Number(x) || 0;

  const safeY =
    Number(y) || 0;

  const safeWidth =
    Math.max(
      3,
      Number(width) || 6
    );

  const safeHeight =
    Math.max(
      2,
      Number(height) || 2
    );

  return (
    <Rectangle
      x={safeX}
      y={safeY}
      width={safeWidth}
      height={safeHeight}
      fill={candleColor}
      stroke={candleColor}
      radius={1}
    />
  );
}


// ===================================
// MULTI ASSET CHART
// ===================================

function MultiAssetChart() {

  // ===================================
  // ASSET DATA
  // ===================================

  const [
    assets,
    setAssets,
  ] = useState(() => [
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      type: "Stock",
      data:
        generateAssetData(
          180,
          100,
          0.04
        ),
    },

    {
      symbol: "TSLA",
      name: "Tesla",
      type: "Stock",
      data:
        generateAssetData(
          250,
          100,
          0.05
        ),
    },

    {
      symbol: "BTC",
      name: "Bitcoin",
      type: "Cryptocurrency",
      data:
        generateAssetData(
          65000,
          100,
          0.06
        ),
    },

    {
      symbol: "ETH",
      name: "Ethereum",
      type: "Cryptocurrency",
      data:
        generateAssetData(
          3500,
          100,
          0.07
        ),
    },

    {
      symbol: "BOND",
      name: "Government Bond",
      type: "Bond",
      data:
        generateAssetData(
          100,
          100,
          0.01
        ),
    },
  ]);


  // ===================================
  // SELECTED ASSETS
  // ===================================

  const [
    selectedAssets,
    setSelectedAssets,
  ] = useState([
    "AAPL",
    "BTC",
  ]);


  // ===================================
  // CHART TYPES
  // ===================================

  const [
    assetChartTypes,
    setAssetChartTypes,
  ] = useState({
    AAPL: "line",
    TSLA: "line",
    BTC: "line",
    ETH: "line",
    BOND: "line",
  });


  // ===================================
  // NORMALIZED MODE
  // ===================================

  const [
    normalizedMode,
    setNormalizedMode,
  ] = useState(true);


  // ===================================
  // LIVE UPDATE
  // ===================================

  const [
    liveUpdate,
    setLiveUpdate,
  ] = useState(false);


  // ===================================
  // PATTERN FILTERS
  // ===================================

  const [
    selectedPatterns,
    setSelectedPatterns,
  ] = useState([
    "Hammer",
    "Doji",
    "Bullish Engulfing",
    "Bearish Engulfing",
  ]);


  // ===================================
  // PATTERN RECOGNITION
  // ===================================

  const [
    patternRecognition,
    setPatternRecognition,
  ] = useState(true);


  // ===================================
  // TOGGLE ASSET
  // ===================================

  function toggleAsset(symbol) {
    setSelectedAssets(
      previousSelectedAssets => {

        if (
          previousSelectedAssets.includes(
            symbol
          )
        ) {
          return previousSelectedAssets.filter(
            selectedSymbol =>
              selectedSymbol !==
              symbol
          );
        }

        return [
          ...previousSelectedAssets,
          symbol,
        ];
      }
    );
  }


  // ===================================
  // CHANGE CHART TYPE
  // ===================================

  function changeChartType(
    symbol,
    chartType
  ) {
    setAssetChartTypes(
      previousTypes => ({
        ...previousTypes,
        [symbol]:
          chartType,
      })
    );

    if (
      chartType ===
      "candlestick"
    ) {
      setNormalizedMode(false);
    }
  }


  // ===================================
  // TOGGLE PATTERN
  // ===================================

  function togglePattern(
    patternName
  ) {
    setSelectedPatterns(
      previousPatterns => {

        if (
          previousPatterns.includes(
            patternName
          )
        ) {
          return previousPatterns.filter(
            pattern =>
              pattern !==
              patternName
          );
        }

        return [
          ...previousPatterns,
          patternName,
        ];
      }
    );
  }


  // ===================================
  // SELECTED ASSET OBJECTS
  // ===================================

  const selectedAssetObjects =
    useMemo(
      () =>
        assets.filter(
          asset =>
            selectedAssets.includes(
              asset.symbol
            )
        ),
      [
        assets,
        selectedAssets,
      ]
    );


  // ===================================
  // CHECK CANDLESTICK
  // ===================================

  const hasCandlestickSelected =
    selectedAssetObjects.some(
      asset =>
        assetChartTypes[
          asset.symbol
        ] ===
        "candlestick"
    );


  // ===================================
  // DETECT PATTERNS
  // ===================================

  const assetsWithPatterns =
    useMemo(() => {

      return assets.map(
        asset => {

          if (
            !patternRecognition
          ) {
            return {
              ...asset,
              patterns: [],
            };
          }

          const detected =
            detectCandlestickPatterns(
              asset.data
            );

          return {
            ...asset,
            patterns:
              detected,
          };
        }
      );

    }, [
      assets,
      patternRecognition,
    ]);


  // ===================================
  // SELECTED ASSETS WITH PATTERNS
  // ===================================

  const selectedAssetsWithPatterns =
    useMemo(
      () =>
        assetsWithPatterns.filter(
          asset =>
            selectedAssets.includes(
              asset.symbol
            )
        ),
      [
        assetsWithPatterns,
        selectedAssets,
      ]
    );


  // ===================================
  // COMBINE DATA
  // ===================================

  const combinedChartData =
    useMemo(() => {

      if (
        selectedAssetObjects.length ===
        0
      ) {
        return [];
      }

      const totalDays =
        selectedAssetObjects[0]
          .data.length;

      const combinedData = [];

      for (
        let i = 0;
        i < totalDays;
        i++
      ) {

        const point = {
          day:
            i + 1,
          patterns: [],
        };

        selectedAssetObjects.forEach(
          asset => {

            const assetPoint =
              asset.data[i];

            if (!assetPoint) {
              return;
            }

            const currentPrice =
              assetPoint.close;

            const firstPrice =
              asset.data[0]
                ?.close;

            if (
              normalizedMode &&
              assetChartTypes[
                asset.symbol
              ] !==
              "candlestick"
            ) {

              point[
                asset.symbol
              ] =
                firstPrice
                  ? Number(
                      (
                        (
                          currentPrice /
                          firstPrice
                        ) * 100
                      ).toFixed(2)
                    )
                  : null;

            } else {

              point[
                asset.symbol
              ] =
                currentPrice ??
                null;
            }


            // OHLC

            point[
              `${asset.symbol}_open`
            ] =
              assetPoint.open;

            point[
              `${asset.symbol}_high`
            ] =
              assetPoint.high;

            point[
              `${asset.symbol}_low`
            ] =
              assetPoint.low;

            point[
              `${asset.symbol}_close`
            ] =
              assetPoint.close;

            // Kept for compatibility
            point[
              `${asset.symbol}_candle`
            ] =
              assetPoint.close;


            // PATTERNS

            const assetWithPattern =
              assetsWithPatterns.find(
                item =>
                  item.symbol ===
                  asset.symbol
              );

            const detectedPatterns =
              assetWithPattern
                ?.patterns || [];

            const dayPatterns =
              detectedPatterns.filter(
                pattern =>
                  pattern.index ===
                  i
              );

            point.patterns.push(
              ...dayPatterns.map(
                pattern => ({
                  ...pattern,
                  asset:
                    asset.symbol,
                })
              )
            );

          }
        );

        combinedData.push(
          point
        );
      }

      return combinedData;

    }, [
      selectedAssetObjects,
      normalizedMode,
      assetChartTypes,
      assetsWithPatterns,
    ]);


  // ===================================
  // GENERATE NEW DATASET
  // ===================================

  function generateNewDataset() {

    setAssets(
      previousAssets =>
        previousAssets.map(
          asset => {

            let startPrice = 100;
            let volatility = 0.03;

            if (
              asset.symbol ===
              "AAPL"
            ) {
              startPrice = 180;
              volatility = 0.04;
            }

            if (
              asset.symbol ===
              "TSLA"
            ) {
              startPrice = 250;
              volatility = 0.05;
            }

            if (
              asset.symbol ===
              "BTC"
            ) {
              startPrice = 65000;
              volatility = 0.06;
            }

            if (
              asset.symbol ===
              "ETH"
            ) {
              startPrice = 3500;
              volatility = 0.07;
            }

            if (
              asset.symbol ===
              "BOND"
            ) {
              startPrice = 100;
              volatility = 0.01;
            }

            return {
              ...asset,

              data:
                generateAssetData(
                  startPrice,
                  100,
                  volatility
                ),
            };
          }
        )
    );
  }


  // ===================================
  // UPDATE LIVE DATA
  // ===================================

  function updateLiveData() {

    setAssets(
      previousAssets =>
        previousAssets.map(
          asset => {

            const lastData =
              asset.data[
                asset.data.length - 1
              ];

            const lastPrice =
              lastData.close;

            let volatility = 0.02;

            if (
              asset.type ===
              "Cryptocurrency"
            ) {
              volatility = 0.05;
            }

            if (
              asset.type ===
              "Bond"
            ) {
              volatility = 0.005;
            }

            const change =
              (
                Math.random() -
                0.5
              ) *
              volatility *
              2;

            const newClose =
              Math.max(
                1,
                lastPrice *
                  (
                    1 +
                    change
                  )
              );

            const newDataPoint = {
              day:
                lastData.day +
                1,

              open:
                lastPrice,

              high:
                Math.max(
                  lastPrice,
                  newClose
                ) *
                (
                  1 +
                  Math.random() *
                  volatility *
                  0.2
                ),

              low:
                Math.min(
                  lastPrice,
                  newClose
                ) *
                (
                  1 -
                  Math.random() *
                  volatility *
                  0.2
                ),

              close:
                Number(
                  newClose.toFixed(2)
                ),
            };

            const updatedData = [
              ...asset.data.slice(1),
              {
                ...newDataPoint,

                high:
                  Number(
                    newDataPoint.high.toFixed(
                      2
                    )
                  ),

                low:
                  Number(
                    newDataPoint.low.toFixed(
                      2
                    )
                  ),
              },
            ];

            return {
              ...asset,
              data:
                updatedData,
            };
          }
        )
    );
  }


  // ===================================
  // LIVE UPDATE INTERVAL
  // ===================================

  useEffect(() => {

    if (!liveUpdate) {
      return;
    }

    const interval =
      setInterval(
        () => {
          updateLiveData();
        },
        2000
      );

    return () =>
      clearInterval(
        interval
      );

  }, [
    liveUpdate,
  ]);


  // ===================================
  // PERFORMANCE DATA
  // ===================================

  const performanceData =
    useMemo(
      () =>
        selectedAssetObjects.map(
          asset => ({
            symbol:
              asset.symbol,

            name:
              asset.name,

            performance:
              getPerformance(
                asset
              ),
          })
        ),
      [
        selectedAssetObjects,
      ]
    );


  // ===================================
  // BEST ASSET
  // ===================================

  const bestAsset =
    useMemo(() => {

      if (
        performanceData.length ===
        0
      ) {
        return null;
      }

      return performanceData.reduce(
        (
          best,
          asset
        ) =>
          asset.performance >
          best.performance
            ? asset
            : best
      );

    }, [
      performanceData,
    ]);


  // ===================================
  // WORST ASSET
  // ===================================

  const worstAsset =
    useMemo(() => {

      if (
        performanceData.length ===
        0
      ) {
        return null;
      }

      return performanceData.reduce(
        (
          worst,
          asset
        ) =>
          asset.performance <
          worst.performance
            ? asset
            : worst
      );

    }, [
      performanceData,
    ]);


  // ===================================
  // CORRELATION
  // ===================================

  const correlation =
    useMemo(() => {

      if (
        selectedAssetObjects.length <
        2
      ) {
        return null;
      }

      const firstAsset =
        selectedAssetObjects[0];

      const secondAsset =
        selectedAssetObjects[1];

      const firstPrices =
        firstAsset.data.map(
          point =>
            point.close
        );

      const secondPrices =
        secondAsset.data.map(
          point =>
            point.close
        );

      return {
        firstSymbol:
          firstAsset.symbol,

        secondSymbol:
          secondAsset.symbol,

        value:
          calculateCorrelation(
            firstPrices,
            secondPrices
          ),
      };

    }, [
      selectedAssetObjects,
    ]);


  // ===================================
  // PATTERN SUMMARY
  // ===================================

  const patternSummary =
    useMemo(() => {

      const summary = {
        Hammer: 0,
        Doji: 0,
        "Bullish Engulfing": 0,
        "Bearish Engulfing": 0,
      };

      selectedAssetsWithPatterns.forEach(
        asset => {

          asset.patterns.forEach(
            pattern => {

              if (
                summary[
                  pattern.name
                ] !== undefined
              ) {
                summary[
                  pattern.name
                ]++;
              }

            }
          );

        }
      );

      return summary;

    }, [
      selectedAssetsWithPatterns,
    ]);


  // ===================================
  // TOTAL DETECTED PATTERNS
  // ===================================

  const totalDetectedPatterns =
    Object.values(
      patternSummary
    ).reduce(
      (
        total,
        value
      ) =>
        total + value,
      0
    );


  // ===================================
  // RENDER
  // ===================================

  return (
    <section
      className="
        section
        multi-asset-section
      "
    >

      {/* HEADER */}

      <div
        className="
          section-heading
        "
      >

        <div>

          <h2>
            🌐 Multi-Asset Analysis
          </h2>

          <p>
            Compare stocks,
            cryptocurrencies and bonds
            using simulated market data.
          </p>

        </div>

        <button
          className="
            primary-button
          "
          onClick={
            generateNewDataset
          }
        >
          🔄 Generate New Data
        </button>

      </div>


      {/* SETTINGS */}

      <div
        className="
          multi-chart-controls
        "
      >

        <label>

          <input
            type="checkbox"
            checked={
              normalizedMode
            }
            disabled={
              hasCandlestickSelected
            }
            onChange={() =>
              setNormalizedMode(
                previous =>
                  !previous
              )
            }
          />

          Normalize Performance
          (Start = 100)

        </label>


        <label>

          <input
            type="checkbox"
            checked={
              liveUpdate
            }
            onChange={() =>
              setLiveUpdate(
                previous =>
                  !previous
              )
            }
          />

          🔴 Live Simulation

        </label>

      </div>


      {/* CANDLESTICK WARNING */}

      {
        hasCandlestickSelected && (
          <p
            className="
              chart-warning
            "
          >
            🕯 Candlestick mode uses
            actual Open, High, Low and
            Close prices. Normalized mode
            is disabled for accurate
            candlestick visualization.
          </p>
        )
      }


      {/* ===================================
          PATTERN RECOGNITION
      =================================== */}

      <div
        className="
          pattern-recognition-section
        "
      >

        <div
          className="
            section-heading
          "
        >

          <div>

            <h2>
              🕯 Candlestick Pattern Recognition
            </h2>

            <p>
              Automatically identify common
              candlestick patterns from the
              simulated OHLC market data.
            </p>

          </div>


          <label
            className="
              pattern-toggle
            "
          >

            <input
              type="checkbox"
              checked={
                patternRecognition
              }
              onChange={() =>
                setPatternRecognition(
                  previous =>
                    !previous
                )
              }
            />

            Enable Recognition

          </label>

        </div>


        {/* PATTERN FILTERS */}

        <div
          className="
            pattern-filters
          "
        >

          <strong>
            Filter Patterns:
          </strong>


          <label>

            <input
              type="checkbox"
              checked={
                selectedPatterns.includes(
                  "Hammer"
                )
              }
              disabled={
                !patternRecognition
              }
              onChange={() =>
                togglePattern(
                  "Hammer"
                )
              }
            />

            🔨 Hammer

          </label>


          <label>

            <input
              type="checkbox"
              checked={
                selectedPatterns.includes(
                  "Doji"
                )
              }
              disabled={
                !patternRecognition
              }
              onChange={() =>
                togglePattern(
                  "Doji"
                )
              }
            />

            ➖ Doji

          </label>


          <label>

            <input
              type="checkbox"
              checked={
                selectedPatterns.includes(
                  "Bullish Engulfing"
                )
              }
              disabled={
                !patternRecognition
              }
              onChange={() =>
                togglePattern(
                  "Bullish Engulfing"
                )
              }
            />

            🟢 Bullish Engulfing

          </label>


          <label>

            <input
              type="checkbox"
              checked={
                selectedPatterns.includes(
                  "Bearish Engulfing"
                )
              }
              disabled={
                !patternRecognition
              }
              onChange={() =>
                togglePattern(
                  "Bearish Engulfing"
                )
              }
            />

            🔴 Bearish Engulfing

          </label>

        </div>


        {/* PATTERN STATS */}

        <div
          className="
            pattern-summary-grid
          "
        >

          <div
            className="
              analytics-card
            "
          >

            <span>
              🔨 Hammer
            </span>

            <strong>
              {
                patternSummary.Hammer
              }
            </strong>

            <p>
              Possible bullish reversal
            </p>

          </div>


          <div
            className="
              analytics-card
            "
          >

            <span>
              ➖ Doji
            </span>

            <strong>
              {
                patternSummary.Doji
              }
            </strong>

            <p>
              Market indecision
            </p>

          </div>


          <div
            className="
              analytics-card
            "
          >

            <span>
              🟢 Bullish Engulfing
            </span>

            <strong>
              {
                patternSummary[
                  "Bullish Engulfing"
                ]
              }
            </strong>

            <p>
              Possible upward reversal
            </p>

          </div>


          <div
            className="
              analytics-card
            "
          >

            <span>
              🔴 Bearish Engulfing
            </span>

            <strong>
              {
                patternSummary[
                  "Bearish Engulfing"
                ]
              }
            </strong>

            <p>
              Possible downward reversal
            </p>

          </div>

        </div>


        {/* TOTAL */}

        <div
          className="
            multi-asset-summary
          "
        >

          <strong>
            Total Detected Patterns:
          </strong>

          {" "}

          {
            totalDetectedPatterns
          }

          {" • "}

          Patterns automatically update
          when new market data is generated.

        </div>


        {/* PATTERN TABLE */}

        {
          patternRecognition &&
          totalDetectedPatterns > 0 && (

            <div
              className="
                pattern-table-container
              "
            >

              <h3>
                📋 Detected Pattern Details
              </h3>


              <div
                className="
                  pattern-table-wrapper
                "
              >

                <table
                  className="
                    pattern-table
                  "
                >

                  <thead>

                    <tr>

                      <th>
                        Asset
                      </th>

                      <th>
                        Day
                      </th>

                      <th>
                        Pattern
                      </th>

                      <th>
                        Explanation
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {
                      selectedAssetsWithPatterns
                        .flatMap(
                          asset =>
                            asset.patterns
                              .filter(
                                pattern =>
                                  selectedPatterns.includes(
                                    pattern.name
                                  )
                              )
                              .map(
                                pattern => ({
                                  ...pattern,
                                  asset:
                                    asset.symbol,
                                })
                              )
                        )
                        .slice(
                          0,
                          20
                        )
                        .map(
                          (
                            pattern,
                            index
                          ) => (

                            <tr
                              key={
                                `${pattern.asset}-${pattern.index}-${pattern.name}-${index}`
                              }
                            >

                              <td>

                                <strong>
                                  {
                                    pattern.asset
                                  }
                                </strong>

                              </td>


                              <td>

                                {
                                  pattern.index +
                                  1
                                }

                              </td>


                              <td>

                                <span
                                  className="
                                    pattern-badge
                                  "
                                  style={{
                                    borderColor:
                                      patternColors[
                                        pattern.name
                                      ],
                                  }}
                                >

                                  {
                                    pattern.name
                                  }

                                </span>

                              </td>


                              <td>

                                {
                                  pattern.description ||
                                  patternExplanations[
                                    pattern.name
                                  ]
                                }

                              </td>

                            </tr>

                          )
                        )
                    }

                  </tbody>

                </table>

              </div>

            </div>

          )
        }

      </div>


      {/* ===================================
          ASSET SELECTION
      =================================== */}

      <div
        className="
          asset-selection
        "
      >

        <h3>
          Select and Customize Assets
        </h3>

        <p>
          Toggle asset visibility
          and choose a chart type
          for each asset.
        </p>


        <div
          className="
            asset-list
          "
        >

          {
            assets.map(
              asset => (

                <div
                  key={
                    asset.symbol
                  }
                  className="
                    asset-option
                  "
                >

                  <label
                    className="
                      asset-visibility
                    "
                  >

                    <input
                      type="checkbox"
                      checked={
                        selectedAssets.includes(
                          asset.symbol
                        )
                      }
                      onChange={() =>
                        toggleAsset(
                          asset.symbol
                        )
                      }
                    />


                    <div>

                      <strong>
                        {
                          asset.symbol
                        }
                      </strong>

                      <span>
                        {
                          asset.name
                        }

                        {" • "}

                        {
                          asset.type
                        }

                      </span>

                    </div>

                  </label>


                  <select
                    value={
                      assetChartTypes[
                        asset.symbol
                      ]
                    }
                    onChange={
                      e =>
                        changeChartType(
                          asset.symbol,
                          e.target.value
                        )
                    }
                  >

                    <option value="line">
                      📈 Line
                    </option>

                    <option value="bar">
                      📊 Bar
                    </option>

                    <option value="candlestick">
                      🕯 Candlestick
                    </option>

                  </select>

                </div>
              )
            )
          }

        </div>

      </div>


      {/* ===================================
          CHART
      =================================== */}

      <div
        className="
          multi-chart-box
        "
      >

        <div
          className="
            section-heading
          "
        >

          <div>

            <h2>
              Multi-Asset Comparison
            </h2>

            <p>

              {
                normalizedMode
                  ? "Performance comparison where every asset starts at 100."
                  : "Actual simulated asset prices."
              }

            </p>

          </div>

        </div>


        {
          selectedAssetObjects.length ===
          0

            ? (

              <div
                className="
                  asset-chart-empty
                "
              >

                Select at least one
                asset to display
                the chart.

              </div>

            )

            : (

              <div
                className="
                  chart-container
                "
              >

                <ResponsiveContainer
                  width="100%"
                  height={500}
                >

                  <ComposedChart
                    data={
                      combinedChartData
                    }
                    margin={{
                      top: 30,
                      right: 30,
                      left: 10,
                      bottom: 30,
                    }}
                  >

                    <CartesianGrid
                      strokeDasharray="
                        3 3
                      "
                    />


                    <XAxis
                      dataKey="day"
                      type="number"
                      domain={[
                        "dataMin",
                        "dataMax",
                      ]}
                      label={{
                        value:
                          "Trading Day",
                        position:
                          "insideBottom",
                        offset:
                          -5,
                      }}
                    />


                    <YAxis
                      label={{
                        value:
                          normalizedMode
                            ? "Performance Index"
                            : "Price",
                        angle:
                          -90,
                        position:
                          "insideLeft",
                      }}
                    />


                    {/* =================================
                        TOOLTIP
                    ================================= */}

                    <Tooltip
                      content={
                        ({
                          active,
                          payload,
                          label,
                        }) => {

                          if (
                            !active ||
                            !payload ||
                            payload.length ===
                            0
                          ) {
                            return null;
                          }

                          const numericDay =
                            Number(label);

                          const point =
                            combinedChartData.find(
                              item =>
                                Number(
                                  item.day
                                ) ===
                                numericDay
                            );

                          const detectedPatterns =
                            (
                              point?.patterns ||
                              []
                            ).filter(
                              pattern =>
                                selectedPatterns.includes(
                                  pattern.name
                                )
                            );

                          const visiblePatterns =
                            detectedPatterns.slice(
                              0,
                              3
                            );

                          const remainingPatterns =
                            Math.max(
                              0,
                              detectedPatterns.length -
                              3
                            );

                          return (
                            <div
                              style={{
                                background:
                                  "#ffffff",
                                border:
                                  "1px solid #d1d5db",
                                borderRadius:
                                  "10px",
                                padding:
                                  "10px 12px",
                                width:
                                  "270px",
                                maxWidth:
                                  "270px",
                                maxHeight:
                                  "260px",
                                overflowY:
                                  "auto",
                                boxShadow:
                                  "0 4px 14px rgba(0,0,0,0.15)",
                                fontSize:
                                  "12px",
                                lineHeight:
                                  "1.35",
                              }}
                            >

                              <div
                                style={{
                                  fontWeight:
                                    "700",
                                  fontSize:
                                    "14px",
                                  marginBottom:
                                    "6px",
                                  color:
                                    "#111827",
                                }}
                              >

                                Trading Day{" "}
                                {label}

                              </div>


                              <div
                                style={{
                                  marginBottom:
                                    detectedPatterns.length >
                                    0
                                      ? "7px"
                                      : "0",
                                }}
                              >

                                {
                                  payload
                                    .filter(
                                      item =>
                                        item.value !==
                                        undefined &&
                                        item.value !==
                                        null &&
                                        !Array.isArray(
                                          item.value
                                        )
                                    )
                                    .map(
                                      (
                                        item,
                                        index
                                      ) => (

                                        <div
                                          key={
                                            `${item.dataKey}-${index}`
                                          }
                                          style={{
                                            marginBottom:
                                              "2px",
                                          }}
                                        >

                                          <strong>
                                            {
                                              item.name
                                            }
                                          </strong>

                                          :{" "}

                                          {
                                            typeof item.value ===
                                            "number"
                                              ? item.value.toFixed(
                                                  2
                                                )
                                              : item.value
                                          }

                                        </div>

                                      )
                                    )
                                }

                              </div>


                              {
                                detectedPatterns.length >
                                0 && (

                                  <div>

                                    <div
                                      style={{
                                        fontWeight:
                                          "700",
                                        color:
                                          "#374151",
                                        marginBottom:
                                          "5px",
                                      }}
                                    >

                                      🕯 Detected Patterns

                                    </div>


                                    {
                                      visiblePatterns.map(
                                        (
                                          pattern,
                                          index
                                        ) => (

                                          <div
                                            key={
                                              `${pattern.asset}-${pattern.name}-${index}`
                                            }
                                            style={{
                                              borderLeft:
                                                `3px solid ${
                                                  patternColors[
                                                    pattern.name
                                                  ] ||
                                                  "#7c3aed"
                                                }`,
                                              paddingLeft:
                                                "7px",
                                              marginBottom:
                                                "6px",
                                            }}
                                          >

                                            <div
                                              style={{
                                                fontWeight:
                                                  "700",
                                                color:
                                                  "#111827",
                                              }}
                                            >

                                              🕯{" "}
                                              {
                                                pattern.name
                                              }

                                              {" — "}

                                              {
                                                pattern.asset
                                              }

                                            </div>

                                            <div
                                              style={{
                                                color:
                                                  "#4b5563",
                                                fontSize:
                                                  "11px",
                                                marginTop:
                                                  "2px",
                                              }}
                                            >

                                              {
                                                pattern.description ||
                                                patternExplanations[
                                                  pattern.name
                                                ]
                                              }

                                            </div>

                                          </div>

                                        )
                                      )
                                    }


                                    {
                                      remainingPatterns >
                                      0 && (

                                        <div
                                          style={{
                                            fontSize:
                                              "11px",
                                            fontWeight:
                                              "600",
                                            color:
                                              "#6b7280",
                                            marginTop:
                                              "3px",
                                          }}
                                        >

                                          +
                                          {
                                            remainingPatterns
                                          }{" "}
                                          more detected
                                          pattern
                                          {
                                            remainingPatterns ===
                                            1
                                              ? ""
                                              : "s"
                                          }

                                        </div>

                                      )
                                    }

                                  </div>

                                )
                              }

                            </div>
                          );
                        }
                      }
                    />


                    <Legend />


                    {/* =================================
                        ASSET CHARTS
                    ================================= */}

                    {
                      selectedAssetObjects.map(
                        asset => {

                          const chartType =
                            assetChartTypes[
                              asset.symbol
                            ];


                          // =================================
                          // BAR CHART
                          // =================================

                          if (
                            chartType ===
                            "bar"
                          ) {

                            return (
                              <Bar
                                key={
                                  asset.symbol
                                }
                                dataKey={
                                  asset.symbol
                                }
                                name={
                                  `${asset.symbol} Bar`
                                }
                                isAnimationActive={
                                  false
                                }
                              />
                            );

                          }


                          // =================================
                          // CANDLESTICK
                          // =================================

                          if (
                            chartType ===
                            "candlestick"
                          ) {

                            const candleDataKey =
                              point => {

                                const open =
                                  Number(
                                    point[
                                      `${asset.symbol}_open`
                                    ]
                                  );

                                const close =
                                  Number(
                                    point[
                                      `${asset.symbol}_close`
                                    ]
                                  );

                                if (
                                  !Number.isFinite(
                                    open
                                  ) ||
                                  !Number.isFinite(
                                    close
                                  )
                                ) {
                                  return null;
                                }

                                return [
                                  Math.min(
                                    open,
                                    close
                                  ),
                                  Math.max(
                                    open,
                                    close
                                  ),
                                ];
                              };


                            const candleErrorDataKey =
                              point => {

                                const open =
                                  Number(
                                    point[
                                      `${asset.symbol}_open`
                                    ]
                                  );

                                const close =
                                  Number(
                                    point[
                                      `${asset.symbol}_close`
                                    ]
                                  );

                                const high =
                                  Number(
                                    point[
                                      `${asset.symbol}_high`
                                    ]
                                  );

                                const low =
                                  Number(
                                    point[
                                      `${asset.symbol}_low`
                                    ]
                                  );

                                if (
                                  !Number.isFinite(
                                    open
                                  ) ||
                                  !Number.isFinite(
                                    close
                                  ) ||
                                  !Number.isFinite(
                                    high
                                  ) ||
                                  !Number.isFinite(
                                    low
                                  )
                                ) {
                                  return [
                                    0,
                                    0,
                                  ];
                                }

                                const bodyHigh =
                                  Math.max(
                                    open,
                                    close
                                  );

                                return [
                                  bodyHigh -
                                    low,
                                  high -
                                    bodyHigh,
                                ];
                              };


                            return (
                              <Bar
                                key={
                                  asset.symbol
                                }
                                dataKey={
                                  candleDataKey
                                }
                                name={
                                  `${asset.symbol} Candlestick`
                                }
                                barSize={7}
                                minPointSize={2}
                                isAnimationActive={
                                  false
                                }
                                shape={
                                  props => (
                                    <CandlestickShape
                                      {...props}
                                      assetSymbol={
                                        asset.symbol
                                      }
                                    />
                                  )
                                }
                                tooltipType="none"
                                legendType="none"
                                zIndex={500}
                              >

                                <ErrorBar
                                  dataKey={
                                    candleErrorDataKey
                                  }
                                  direction="y"
                                  width={0}
                                  stroke="#374151"
                                  strokeWidth={1.2}
                                  isAnimationActive={
                                    false
                                  }
                                  zIndex={499}
                                />

                              </Bar>
                            );

                          }


                          // =================================
                          // LINE
                          // =================================

                          return (
                            <Line
                              key={
                                asset.symbol
                              }
                              type="monotone"
                              dataKey={
                                asset.symbol
                              }
                              strokeWidth={2}
                              dot={false}
                              name={
                                asset.symbol
                              }
                              isAnimationActive={
                                false
                              }
                            />
                          );

                        }
                      )
                    }


                    {/* =================================
                        PATTERN MARKERS
                    ================================= */}

                    {
                      hasCandlestickSelected &&
                      patternRecognition &&
                      selectedAssetObjects.map(
                        asset => {

                          if (
                            assetChartTypes[
                              asset.symbol
                            ] !==
                            "candlestick"
                          ) {
                            return null;
                          }

                          const assetWithPatterns =
                            assetsWithPatterns.find(
                              item =>
                                item.symbol ===
                                asset.symbol
                            );

                          const patterns =
                            assetWithPatterns
                              ?.patterns ||
                            [];

                          return patterns
                            .filter(
                              pattern =>
                                selectedPatterns.includes(
                                  pattern.name
                                )
                            )
                            .map(
                              pattern => {

                                const point =
                                  asset.data[
                                    pattern.index
                                  ];

                                if (
                                  !point
                                ) {
                                  return null;
                                }

                                const markerLetter =
                                  pattern.name ===
                                  "Hammer"
                                    ? "H"
                                    : pattern.name ===
                                      "Doji"
                                    ? "D"
                                    : pattern.name ===
                                      "Bullish Engulfing"
                                    ? "B"
                                    : "S";

                                const markerColor =
                                  patternColors[
                                    pattern.name
                                  ] ||
                                  "#7c3aed";

                                /*
                                 * Small price-based
                                 * offset so the marker
                                 * sits above the candle.
                                 */
                                const markerOffset =
                                  Math.max(
                                    point.high *
                                      0.003,
                                    0.5
                                  );

                                const markerY =
                                  point.high +
                                  markerOffset;

                                return (
                                  <ReferenceDot
                                    key={
                                      `${asset.symbol}-${pattern.index}-${pattern.name}`
                                    }
                                    x={
                                      point.day
                                    }
                                    y={
                                      markerY
                                    }
                                    r={7}
                                    fill={
                                      markerColor
                                    }
                                    stroke="#ffffff"
                                    strokeWidth={2}
                                    ifOverflow="visible"
                                    zIndex={1000}
                                    label={{
                                      value:
                                        markerLetter,
                                      fill:
                                        "#ffffff",
                                      fontSize:
                                        8,
                                      fontWeight:
                                        700,
                                      textAnchor:
                                        "middle",
                                      dy:
                                        3,
                                    }}
                                  />
                                );
                              }
                            );

                        }
                      )
                    }

                  </ComposedChart>

                </ResponsiveContainer>

              </div>

            )
        }

      </div>

      {/* ===================================
          PERFORMANCE SUMMARY
      =================================== */}

      <div
        className="
          performance-section
        "
      >

        <h2>
          📊 Performance Summary
        </h2>


        <div
          className="
            performance-grid
          "
        >

          {
            performanceData.map(
              asset => (

                <div
                  key={
                    asset.symbol
                  }
                  className="
                    performance-card
                  "
                >

                  <strong>
                    {
                      asset.symbol
                    }
                  </strong>

                  <span>
                    {
                      asset.name
                    }
                  </span>

                  <h3
                    className={
                      asset.performance >=
                      0
                        ? "profit"
                        : "loss"
                    }
                  >

                    {
                      asset.performance >=
                      0
                        ? "+"
                        : ""
                    }

                    {
                      asset.performance.toFixed(
                        2
                      )
                    }

                    %

                  </h3>

                </div>

              )
            )
          }

        </div>

      </div>


      {/* ===================================
          ANALYTICS
      =================================== */}

      <div
        className="
          analytics-grid
        "
      >

        <div
          className="
            analytics-card
          "
        >

          <span>
            🏆 Best Performer
          </span>

          <strong>
            {
              bestAsset
                ? bestAsset.symbol
                : "-"
            }
          </strong>

          <p>
            {
              bestAsset
                ? `${bestAsset.performance.toFixed(
                    2
                  )}%`
                : "No data"
            }
          </p>

        </div>


        <div
          className="
            analytics-card
          "
        >

          <span>
            📉 Lowest Performer
          </span>

          <strong>
            {
              worstAsset
                ? worstAsset.symbol
                : "-"
            }
          </strong>

          <p>
            {
              worstAsset
                ? `${worstAsset.performance.toFixed(
                    2
                  )}%`
                : "No data"
            }
          </p>

        </div>


        <div
          className="
            analytics-card
          "
        >

          <span>
            🔗 Correlation
          </span>

          <strong>
            {
              correlation
                ? `${correlation.firstSymbol} / ${correlation.secondSymbol}`
                : "-"
            }
          </strong>

          <p>
            {
              correlation
                ? correlation.value.toFixed(
                    2
                  )
                : "Select 2 assets"
            }
          </p>

        </div>

      </div>


      {/* ===================================
          SUMMARY
      =================================== */}

      <div
        className="
          multi-asset-summary
        "
      >

        <strong>
          Selected Assets:
        </strong>

        {" "}

        {
          selectedAssetObjects.length
        }

        {" / "}

        {
          assets.length
        }


        {
          selectedAssetObjects.length >
          0 && (
            <span>

              {" • "}

              {
                selectedAssetObjects
                  .map(
                    asset =>
                      asset.symbol
                  )
                  .join(", ")
              }

            </span>
          )
        }

      </div>

    </section>
  );
}


export default MultiAssetChart;