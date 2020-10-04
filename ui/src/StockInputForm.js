/* eslint-disable no-use-before-define */
import React, { useEffect, useState } from "react";
import axios from "axios";

import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";

import "./StockInputForm.css";

const StockInputForm = ({ label, tType, handleChange }) => {
  const name = "NIFTY";
  const [data, setData] = useState([]);
  const [strikePrice, setStrikePrice] = useState("");
  const [expiry, setExpiry] = useState("");
  const [iType, setIType] = useState("CE");
  const [quantity, setQuantity] = useState(75);
  const [positionValue, setPositionValue] = useState(0);

  useEffect(() => {
    axios
      .get("http://localhost:4004/mapper/byName", { params: { name: "NIFTY" } })
      .then((result) => {
        setData(result.data);
      });
  }, []);

  useEffect(() => {
    const x = data.find((d) => d.tradingsymbol === `${name}${expiry}${strikePrice}${iType}`);
    if (x && quantity && quantity !== 0) {
      handleChange({
        ...x,
        transactionType: tType,
        product: "NRML",
        quantity: parseInt(quantity),
        positionValue: Number(positionValue),
      });
    }
  }, [data, name, expiry, strikePrice, iType, tType, quantity, positionValue, handleChange]);

  const mapToStrikePrice = (stockArray) => {
    if (stockArray === []) return [];

    let spSet = new Set();
    stockArray.forEach((s) => {
      spSet.add(s.strike.toString());
    });
    return [...spSet];
  };

  const mapToExpiry = (stockArray, name, strikePrice) => {
    if (stockArray === []) return [];

    let expirySet = new Set();
    stockArray
      .filter((s) => s.strike == strikePrice)
      .forEach((s) => {
        const ts = s.tradingsymbol;
        const tsTrimmed = ts.substr(0, ts.lastIndexOf(strikePrice));
        const expiry = tsTrimmed.slice(name.length);
        if (expiry) expirySet.add(expiry);
      });
    return [...expirySet];
  };

  return (
    <div className="input_container">
      <div className="input_element">
        <h3>STOCK {label}:</h3>
      </div>
      <div className="input_element">
        <TextField
          id={`${label}-name-input`}
          label="Name"
          defaultValue="NIFTY"
          InputProps={{
            readOnly: true,
          }}
          variant="outlined"
          style={{ width: 100 }}
        />
      </div>
      <div className="input_element">
        <Autocomplete
          id={`${label}-sp-input`}
          value={strikePrice}
          onChange={(event, newValue) => {
            setStrikePrice(newValue);
          }}
          options={mapToStrikePrice(data)}
          style={{ width: 150 }}
          disableClearable
          renderInput={(params) => <TextField {...params} variant="outlined" label="S-Price" />}
        />
      </div>
      <div className="input_element">
        <Autocomplete
          id={`${label}-expiry-input`}
          value={expiry}
          onChange={(event, newValue) => {
            setExpiry(newValue);
          }}
          options={mapToExpiry(data, name, strikePrice)}
          style={{ width: 150 }}
          disableClearable
          renderInput={(params) => <TextField {...params} variant="outlined" label="Expiry" />}
        />
      </div>
      <div className="input_element">
        <Autocomplete
          id={`${label}-instrument-type-input`}
          value={iType}
          onChange={(event, newValue) => {
            setIType(newValue);
          }}
          style={{ width: 100 }}
          options={["CE", "PE"]}
          disableClearable
          renderInput={(params) => <TextField {...params} variant="outlined" label="I-Type" />}
        />
      </div>
      <div className="input_element">
        <TextField
          id={`quantity-${label}`}
          error={!Number(quantity)}
          label="Quantity"
          variant="outlined"
          value={quantity}
          style={{ width: 100 }}
          onChange={(event) => {
            setQuantity(event.target.value);
          }}
        />
      </div>
      <div className="input_element">
        <TextField
          id={`${label}-transaction-type-input`}
          label="T-Type"
          defaultValue={tType}
          InputProps={{
            readOnly: true,
          }}
          variant="outlined"
          style={{ width: 100 }}
        />
      </div>
      <div className="input_element">
        <TextField
          error={!Number(positionValue)}
          id={`pv-${label}`}
          label="P-Value"
          variant="outlined"
          value={positionValue}
          style={{ width: 100 }}
          onChange={(event) => {
            setPositionValue(event.target.value);
          }}
        />
      </div>
    </div>
  );
};

export default StockInputForm;
