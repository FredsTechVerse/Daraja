const express = require("express");
const request = require("request");
const unirest = require("unirest");
const cors = require("cors");
const axios = require("axios");
const mongoose = require("mongoose");
const app = express();
const port = process.env.PORT || "3003";
require("dotenv").config();

//MODELS
//======
const TableDetail = require("./Models/TableDetail");
// ITEMS THAT NEED TO BE STORED IN A .ENV FILE
//============================================
const accessTokenUrl = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";
const mpesaExpressUrl = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";
const consumerSecret = process.env.CONSUMER_SECRET;
const consumerKey = process.env.CONSUMER_KEY;
const passKey = process.env.PASS_KEY;
const tillNumber = 174379;

//KEY FUNCTIONS.
//==============
const passwordEncrypt = (till, key, stamp) => {
  return new Buffer.from(till + key + stamp).toString("base64");
};

const correspodent_string = new Buffer.from(
  consumerKey + ":" + consumerSecret
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

let customerNames = {};

// CONSTANT VARIABLES
//====================
let item = "random";
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
  // - Used to access accessToken from safaricom , which is injected into the request body and utilized with subsequent actions eg STK push services
  await axios({
    url: accessTokenUrl,
    method: "get",
    headers: {
      Authorization: `Basic ${correspodent_string}`,
    },
  })
    .then(async (response) => {
      //INJECTING THE ACCESS TOKEN INTO THE REQUEST BODY.
      req.body.access_token = await response.data.access_token;
      next();
    })
    .catch((error) => {
      res.status(500).json({ message: error });
    });
};

const sendSTKPush = (req, res) => {
  customerNames = {
    fName: req.body.fName,
    lName: req.body.lName,
  };

  axios({
    url: mpesa_express_url,
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
      AccountReference: "Daraja Simulation",
      TransactionDesc: `Payment of ${item}`,
    },
  })
    .then((response) => {
      console.log(response);
      //THIS IS ONLY CALLED WHEN THE DAMN PROMISE IS FULFILLED.
      // Ni either a status of 0 ama unalengwa. Of which ukilengwa inahandliwa kama error.Since the promise fails to fulfill.
      if (response.data.ResponseCode == 0) {
        let response_sent = response.data.ResponseCode;
        res.status(200).json(response_sent);
      }
    })
    .catch((error) => {
      //THIS IS CALLED WHEN THE PROMISE THAT AXIOS MADE IS REJECTED.PART & PARCEL OF ASYNCHRONOUS PROGRAMMING
      // AXIOS ERROR DESTRUCTURING - Happens as a result of non_2xx status being returned.
      // ==========================
      let msg = JSON.stringify(error);
      let client_message =
        "Error! Ensure you have filled the contact details correctly.";
      res.status(400).json(client_message); //I send a message to the front-end which falls under the other category.
    });
};

// ROUTES DEFINATION
//===================
app.get("/", (req, res) => {
  res.status(200).send("Daraja app is working correctly.");
});

app.post("/express", obtainAccessToken, sendSTKPush);

app.post("/confirmation", async (req, res) => {
  try {
    // PRIMARY DETAILS
    //=================
    // - Extracting the juicy stuff.
    let mainBody = req.body.Body.stkCallback;
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
      let fName = customerNames.fName;
      let lName = customerNames.lName;

      let tableDetails = {
        fName,
        lName,
        amountTransacted,
        mpesaReceiptNumber,
        transactionDate,
        tillBalance,
        phoneNumber,
      };

      // Saving the juicy details in my database.
      const row = await TableDetail.create(tableDetails);
      await row.save();
      console.log(`Data save successfully to the DB as follows => ${row}`);
    } else {
      let errorMessage = `Transaction failed due to => ${ResultDesc}`;
      console.log(errorMessage);
    }
  } catch (error) {
    console.log(
      `Woops!The following error occured while communicating with the daraja server =>${error}`
    );
  }
});

// SOME CREATIVE THINGS YOU CAN DO WITH THE DATA STORED IN THE DATABASE.

app.get("/user", async (req, res) => {
  const user = await TableDetail.findOne({ amountTransacted: { $eq: 10 } });
  console.log(`User found ==> ${user}`);
  user.fName = "Mary";
  user.amountTransacted = 10;
  console.log(`User updated ==> ${user}`);
  await user.save();

  const user_2 = await TableDetail.where("amountTransacted")
    .lt("5")
    .select("amountTransacted")
    .skip(7);

  res.status(200).json(user_2);
});
app.get("/history", async (req, res) => {
  try {
    const data = await TableDetail.find();
    console.log(`History fetched ==>${data}`);
    res.status(200).json(data);
  } catch (e) {
    console.log(
      `Error that occured while fetching history data ===> ${e.message}`
    );
  }
});

app.listen(port, () => {
  console.log(`Listening successfully on port ${port}`);
});
