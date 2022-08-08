const express = require("express");
const request = require("request");
const unirest = require("unirest");
const app = express();
const axios = require("axios");
const port = process.env.PORT || "3003";
const cors = require("cors");
const Customer = require("./Models/Customer");
const Simple = require("./Models/Simple");
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
      console.log(req.body);
      next();
    })
    .catch((error) => {
      console.log(
        `Woops! Error that occured while obtaining the Access Token : ${error}`
      );
      res.status(500).json({ message: error });
    });
};

const mpesaExpressInt = (req, res) => {
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
      // let { data } = response;
      // console.log(data);
      // res.status(200).json(data);

      let dbBody = {
        count: 2,
      };
      try {
        console.log(response.data);
        const simple = await Simple.create(dbBody);
        await simple.save();
        console.log("Done creating the model.");
      } catch (error) {
        let err = error;
      }
    })
    .catch((error) => {
      console.log(`Mpesa Express error : ${error}`);
      // res.status(302).json(error);
    });
};

// ROUTES DEFINATION
//===================
app.get("/", (req, res) => {
  res.status(200).send("Hakuna Matata from the daraja API");
});

app.post("/express", obtainAccessToken, mpesaExpressInt);

app.post("/confirmation", async (req, res) => {
  // let data = JSON.stringify(req.body.Body);
  // PRIMARY DETAILS
  //=================

  let mainBody = req.body.Body.stkCallback;
  let stringBody = JSON.stringify(mainBody);

  let {
    MerchantRequestID,
    CheckoutRequestID,
    ResultCode,
    ResultDesc,
    CallbackMetadata: clientDetails,
  } = mainBody;

  let amountTransacted = clientDetails.Item[0].Value;
  let mpesaReceiptNumber = clientDetails.Item[1].Value;
  let transactionDate = clientDetails.Item[2].Value;
  let phoneNumber = clientDetails.Item[3].Value;

  let tableDetails = [
    amountTransacted,
    mpesaReceiptNumber,
    transactionDate,
    phoneNumber,
  ];

  let dataTypes = [
    typeof amountTransacted,
    typeof mpesaReceiptNumber,
    typeof transactionDate,
    typeof phoneNumber,
  ];

  // let dbBody = {
  //   count: 3,
  // };
  try {
    console.log(`=>${ResultCode} 
             ==> ${ResultDesc}
             ===> ${MerchantRequestID}
             ====> ${CheckoutRequestID}`);
    console.log(stringBody);
    console.log(dataTypes);
    console.log(tableDetails);

    // const simple = await Simple.create(dbBody);
    // await simple.save();
    // res.status(200).send(simple);
    res.status(200).send("Message Well received.");
  } catch (error) {
    let err = error;
    res.status(500).send(err);
  }
});

app.post("/validation", (req, res) => {
  let message = req.body;
  res.status(200).send(message);
});
app.listen(port, () => {
  console.log(`Listening successfully on port ${port}`);
});
