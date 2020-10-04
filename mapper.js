const fs = require("fs");
const mapperRouter = require("express").Router();

const instruments = JSON.parse(fs.readFileSync("./instruments.json"));

mapperRouter.get("/names", (_, response) => {
  const nameSet = new Set();
  instruments.forEach((i) => {
    if (i.name && i.instrument_type !== "FUT") {
      nameSet.add(i.name);
    }
  });
  response.send([...nameSet]);
});

mapperRouter.get("/byName", (request, response) => {
  const name = request.query.name;
  if (!name) {
    response.json([]);
  } else {
    response.json(instruments.filter((i) => i.instrument_type !== "FUT" && i.name === name));
  }
});

module.exports = mapperRouter;
