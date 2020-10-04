import React, { useState } from "react";
import axios from "axios";

import StockInputForm from "./StockInputForm";
import SelectedStock from "./SelectedStock";

import { Button, TextField } from "@material-ui/core";
import green from "@material-ui/core/colors/green";

import "./InputForm.css";
import "./StockInputForm.css";

const InputForm = () => {
  const [state, setState] = useState("initial");

  const [stockA, setStockA] = useState();
  const [stockB, setStockB] = useState();
  const [stockC, setStockC] = useState();
  const [stockD, setStockD] = useState();

  const [exitPrice, setExitPrice] = useState();

  const proceedButton = () => {
    console.log("stockA: ", stockA);
    console.log("stockB: ", stockB);
    console.log("stockC: ", stockC);
    console.log("stockD: ", stockD);

    if (!stockA || !stockB || !stockC || !stockD) {
      alert("One or more invalid stocks selected. Please select valid stocks and try again.");
    } else if (
      !stockA.positionValue ||
      !stockB.positionValue ||
      !stockC.positionValue ||
      !stockD.positionValue
    ) {
      alert(
        "Missing position values for one or more stocks. Please input position values and try again.",
      );
    } else if (!exitPrice) {
      alert("Missing exit price. Please input exit price and try again.");
    } else {
      axios
        .post("http://localhost:4004/orderHornExit", { stockA, stockB, stockC, stockD, exitPrice })
        .then((data) => console.log(data))
        .catch((error) => console.error(error));
      setState("done");
    }
  };

  if (state === "initial") {
    return (
      <div>
        <div className="form_container">
          <StockInputForm label="A" tType="BUY" handleChange={setStockA} />
          <StockInputForm label="B" tType="SELL" handleChange={setStockB} />
          <StockInputForm label="C" tType="SELL" handleChange={setStockC} />
          <StockInputForm label="D" tType="BUY" handleChange={setStockD} />
          <div className="input_container">
            <div className="input_element">
              <h3>Exit Price:</h3>
            </div>
            <div className="input_element">
              <TextField
                id="exitPrice"
                error={!Number(exitPrice)}
                label="Exit Price"
                variant="outlined"
                value={exitPrice}
                onChange={(event) => {
                  setExitPrice(event.target.value);
                }}
              />
            </div>
          </div>
        </div>
        <div className="input_container">
          <div className="input_element">
            <SelectedStock input={"A"} data={stockA} />
          </div>
          <div className="input_element">
            <SelectedStock input={"B"} data={stockB} />
          </div>
          <div className="input_element">
            <SelectedStock input={"C"} data={stockC} />
          </div>
          <div className="input_element">
            <SelectedStock input={"D"} data={stockD} />
          </div>
        </div>
        <div className="input_container">
          <Button
            variant="contained"
            size="large"
            style={{ background: green[600], color: "white" }}
            onClick={proceedButton}
          >
            Exit Market
          </Button>
        </div>
      </div>
    );
  } else {
    return <div>Done!</div>;
  }
};

export default InputForm;
