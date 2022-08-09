const express = require("express");
const request = require("request");
const unirest = require("unirest");
const app = express();
const axios = require("axios");
const port = process.env.PORT || "3003";
const cors = require("cors");
const Customer = require("./Models/Customer");
const Simple = require("./Models/Simple");
const TableDetail = require("./Models/TableDetail");
const mongoose = require("mongoose");
// ITEMS THAT NEED TO BE STORED IN A .ENV FILE
//============================================
const consumer_key = "NYMLe9JJIx7NwW3hV2UJDTrU0QUJ3kXC";
const consumer_secret = "YvHXGoIdK1yzcRT7";
const connection_url =
  "mongodb+srv://FredzTech:Beijingbike5@cluster0.6y5u8do.mongodb.net/?retryWrites=true&w=majority";
const token_url =
  "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";
const express_url =
  "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";

//KEY FUNCTIONS.
//==============
const passwordEncrypt = (till, key, stamp) => {
  return new Buffer.from(till + key + stamp).toString("base64");
};

const correspodent_string = new Buffer.from(
  consumer_key + ":" + consumer_secret
).toString("base64");

function pad2(n) {
  return n < 10 ? "0" + n : n;
}

let concat_timestamp = (year, month, day, hour, minutes, seconds) => {
  return year + month + day + hour + minutes + seconds;
};
let generate_timestamp = () => {
  var date = new Date();
  let year = date.getFullYear().toString();
  let month = pad2(date.getMonth() + 1);
  let day = pad2(date.getDate());
  let hour = pad2(date.getHours());
  let minutes = pad2(date.getMinutes());
  let seconds = pad2(date.getSeconds());

  let timestamp = concat_timestamp(year, month, day, hour, minutes, seconds);

  return timestamp;
};

let customer_names = {};

// CONSTANT VARIABLES
//====================
let item = "random";
let tillNumber = 174379;
let passKey =
  "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
let timestamp = generate_timestamp();
let password = passwordEncrypt(tillNumber, passKey, timestamp);
// BRINGING THE DB ON BOARD
//==========================
mongoose.connect(connection_url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("The database has been connected to the express server.");
});
// ESSENTIAL MIDDLEWARES.
//========================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

//CUSTOM MIDDLEWARES
//==================
const obtainAccessToken = async (req, res, next) => {
  await axios({
    url: token_url,
    method: "get",
    headers: {
      Authorization: `Basic ${correspodent_string}`,
    },
  })
    .then(async (response) => {
      req.body.access_token = await response.data.access_token;
      next();
    })
    .catch((error) => {
      res.status(500).json({ message: error });
    });
};

const mpesaExpressInt = (req, res) => {
  let fName = req.body.fName;
  let lName = req.body.lName;
  customerNames = {
    fName,
    lName,
  };

  console.log(`The customer_names saved are ${fName} ${lName}`);

  axios({
    url: express_url,
    method: "post",
    headers: {
      Authorization: `Bearer ${req.body.access_token}`,
    },
    data: {
      BusinessShortCode: tillNumber,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: req.body.amount,
      PartyA: req.body.stkPushNo,
      PartyB: tillNumber,
      PhoneNumber: req.body.stkPushNo,
      CallBackURL: "https://daraja-integration.herokuapp.com/confirmation",
      AccountReference: "Daraja 2.0",
      TransactionDesc: `Payment of ${item}`,
    },
  })
    .then(async (response) => {
      try {
        console.log(response.data);
        res.status(200).json(response.data);
      } catch (error) {
        console.log(error);
        res.status(500).json(error);
      }
    })
    .catch((error) => {
      res.status(302).json(error);
    });
};

// ROUTES DEFINATION
//===================
app.get("/", (req, res) => {
  res.status(200).send("Hakuna Matata from the daraja API");
});

app.post("/express", obtainAccessToken, mpesaExpressInt);

app.post("/confirmation", async (req, res) => {
  try {
    // PRIMARY DETAILS
    //=================
    let mainBody = req.body.Body.stkCallback;

    console.log(strBody);

    let strBody = JSON.stringify(mainBody);

    let { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc } =
      mainBody;

    if (ResultCode == 0) {
      let { CallbackMetadata: clientDetails } = mainBody;

      let amountTransacted = clientDetails.Item[0].Value;
      let mpesaReceiptNumber = clientDetails.Item[1].Value;
      let tillBalance = clientDetails.Item[2].Value;
      let transactionDate = clientDetails.Item[3].Value;
      let phoneNumber = clientDetails.Item[4].Value;

      let firstName = customer_names.fName;
      let lastName = customer_names.lName;

      console.log(`Headed to the database ==>${firstName},${lastName}`);

      let tableDetails = {
        amountTransacted,
        mpesaReceiptNumber,
        transactionDate,
        tillBalance,
        phoneNumber,
        fName: firstName,
        lName: lastName,
      };
      const row = await TableDetail.create(tableDetails);
      await row.save();
      res.status(200).send(row);
    } else if (ResultCode == 1032) {
      let errorMessage = `The transaction failed due to the following error : ${ResultDesc}`;
      res.status(500).send(errorMessage);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

app.post("/validation", (req, res) => {
  let message = req.body;
  res.status(200).send(message);
});
app.listen(port, () => {
  console.log(`Listening successfully on port ${port}`);
});
