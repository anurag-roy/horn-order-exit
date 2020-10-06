require("dotenv").config();
const path = require("path");
const cors = require("cors");
const express = require("express");
const app = express();
const mapperRouter = require("./mapper");
const KiteConnect = require("kiteconnect").KiteConnect;
const KiteTicker = require("kiteconnect").KiteTicker;

const apiKey = process.env.API_KEY;
const accessToken = process.env.ACCESS_TOKEN;

const kc = new KiteConnect({
  api_key: apiKey,
});
kc.setAccessToken(accessToken);

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "build")));

app.use("/mapper", mapperRouter);

app.post("/orderHornExit", ({ body }, response) => {
  orderHornExit(body.stockA, body.stockB, body.stockC, body.stockD, Number(body.exitPrice));
  response.send("Check console.");
});

// Order function
const order = async (stock, price) => {
  const timestamp = new Date();
  console.log(
    `Order placed for ${stock.exchange}:${stock.tradingsymbol}, Transaction: ${stock.transactionType}, product: ${stock.product}, quantity: ${stock.quantity}, price: ${price}`,
  );
  console.log(`Time of order: ${timestamp.toUTCString()}`);

  return kc.placeOrder("regular", {
    exchange: stock.exchange,
    tradingsymbol: stock.tradingsymbol,
    transaction_type: stock.transactionType,
    quantity: stock.quantity,
    product: stock.product,
    price: price,
    order_type: "LIMIT",
  });

  // return `Order placed for ${stock.exchange}:${stock.tradingsymbol}, Transaction: ${stock.transactionType}, product: ${stock.product}, quantity: ${stock.quantity}`;
};

const placeOrder = async (stockArray, priceArray) => {
  const promiseArray = [];

  for (let i = 0; i < 4; i++) {
    promiseArray.push(order(stockArray[i], priceArray[i] + 0.1));
  }

  await Promise.all(promiseArray);

  const positions = await kc.getPositions();
  console.log(positions);
};

const orderHornExit = (stockA, stockB, stockC, stockD, exitPrice) => {
  // Extract instruments tokens for each stock
  const aToken = parseInt(stockA.instrument_token);
  const bToken = parseInt(stockB.instrument_token);
  const cToken = parseInt(stockC.instrument_token);
  const dToken = parseInt(stockD.instrument_token);

  // Extract quantity for each stock
  const aQty = stockA.quantity;
  const bQty = stockB.quantity;
  const cQty = stockC.quantity;
  const dQty = stockD.quantity;

  // Extract position values for each stock
  const aPv = stockA.positionValue;
  const bPv = stockB.positionValue;
  const cPv = stockC.positionValue;
  const dPv = stockD.positionValue;

  // Declare variables which will be updated on each tick
  let aSellersBid, bBuyersBid, cBuyersBid, dSellersBid;

  // Flag to determine if order is already placed or not
  let placedOrder = false;

  // Exit Condition for HORN strategy
  const lookForExit = () => {
    const a = (0 + aPv - aSellersBid) * aQty;
    const b = (0 - bPv + bBuyersBid) * bQty;
    const c = (0 - cPv + cBuyersBid) * cQty;
    const d = (0 + dPv - dSellersBid) * dQty;

    const net = (a + b + c + d) / 75;

    if (net > exitPrice) {
      console.log(`Net: ${net}, Exit Price: ${exitPrice}. Condition satisfied.`);
      return true;
    }

    console.log(`Net: ${net}, Exit Price: ${exitPrice}. Condition not satisfied.`);
    return false;
  };

  const ticker = new KiteTicker({
    api_key: apiKey,
    access_token: accessToken,
  });

  ticker.connect();

  ticker.on("connect", () => {
    console.log("Subscribing to stocks...");
    const items = [aToken, bToken, cToken, dToken];
    ticker.subscribe(items);
    ticker.setMode(ticker.modeFull, items);
  });

  ticker.on("ticks", (ticks) => {
    if (!placedOrder) {
      // Check tick and update corresponding stock bid price
      // 1st Seller's Bud for stock to BUY
      // 2nd Buyer's Bid for stock to SELL
      ticks.forEach((t) => {
        if (t.instrument_token == aToken) {
          if (t.depth) {
            if (t.depth.sell) {
              aSellersBid = t.depth.sell[0].price;
            }
          }
        } else if (t.instrument_token == bToken) {
          if (t.depth) {
            if (t.depth.buy) {
              bBuyersBid = t.depth.buy[1].price;
            }
          }
        } else if (t.instrument_token == cToken) {
          if (t.depth) {
            if (t.depth.buy) {
              cBuyersBid = t.depth.buy[1].price;
            }
          }
        } else if (t.instrument_token == dToken) {
          if (t.depth) {
            if (t.depth.sell) {
              dSellersBid = t.depth.sell[0].price;
            }
          }
        }
      });

      // Look for Exit
      if (lookForExit()) {
        placedOrder = true;
        placeOrder(
          [stockA, stockB, stockC, stockD],
          [aSellersBid, bBuyersBid, cBuyersBid, dSellersBid],
        );
      }
    } else if (placedOrder) {
      ticker.disconnect();
    }
  });
};

app.listen(4004, () => {
  console.log("Horn Exit Order started on http://localhost:4004");
});
