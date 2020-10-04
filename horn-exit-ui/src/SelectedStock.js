import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles({
  root: {
    minWidth: 300,
  },
  title: {
    fontSize: 16,
  },
  pos: {
    marginBottom: 14,
  },
});

const SelectedStock = ({ input, data }) => {
  const classes = useStyles();
  let body = <div></div>;

  if (!data) {
    body = (
      <Typography variant="body2" component="p">
        Not a Valid Stock
      </Typography>
    );
  } else {
    body = (
      <div>
        <Typography variant="h5" component="h2">
          {data.tradingsymbol} <br />
        </Typography>
        <Typography variant="body2" component="p">
          Name: {data.name} <br />
          Expiry Date: {data.expiry.replace("T00:00:00.000Z", "")} <br />
          Strike Price: {data.strike} <br />
          Lot Size: {data.lot_size} <br />
          Instrument Type: {data.instrument_type} <br />
          Exchange: {data.exchange} <br />
          Transaction: {data.transactionType} <br />
          Quantity: {data.quantity}
        </Typography>
      </div>
    );
  }

  return (
    <Card className={classes.root}>
      <CardContent>
        <Typography className={classes.title} color="textSecondary" gutterBottom>
          Selected Stock {input}:
        </Typography>
        {body}
      </CardContent>
    </Card>
  );
};

export default SelectedStock;
