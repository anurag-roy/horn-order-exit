const KiteConnect = require("kiteconnect").KiteConnect;
const express = require("express");
const fs = require("fs");

const app = express();
app.use(express.json());

const apiKey = "2rtrb58mdwkhu7s7";
const apiSecret = "b5gxafr7w8tsu19h6vqa53jj5usk13fq";
let accessToken;

const kc = new KiteConnect({
  api_key: apiKey,
});

const server = app.listen(8000, () => {
  console.log(`Please click on this URL to get logged in: ${kc.getLoginURL()}`);
});

app.use("/login", async (req, res) => {
  const requestToken = req.query.request_token;

  console.log("Generating session. Please wait.");
  const result = await kc.generateSession(requestToken, apiSecret);
  accessToken = result.access_token;
  kc.setAccessToken(accessToken);
  console.log("Access Token set. ", accessToken);

  const contents = `API_KEY="${apiKey}"
      API_SECRET="${apiSecret}"
      ACCESS_TOKEN="${accessToken}"`;
  writeEnvFile(contents);

  const instruments = await kc.getInstruments(["NFO"]);
  writeInstruments(instruments);

  res.send("Login flow successful!");
  server.close();
});

const writeEnvFile = (contents) => {
  fs.writeFileSync(".env", contents, (err) => {
    if (err) console.log("Error while writing access token", error);
  });
};

const writeInstruments = (instruments) => {
  fs.writeFileSync("instruments.json", JSON.stringify(instruments), (err) => {
    if (err) console.log("Error while writing instruments", error);
  });
};
