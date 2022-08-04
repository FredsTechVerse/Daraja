const express = require("express");
const request = require("request");
const unirest = require("unirest");
const app = express();
const axios = require("axios");
const port = process.env.PORT || "3003";
const cors = require("cors");
const Customer = require("./Models/Customer");

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

// ESSENTIAL MIDDLEWARES.
//========================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

//CUSTOM MIDDLEWARES
//==================
const obtainAccessToken = async (req, res) => {
  await axios({
    url: token_url,
    method: "get",
    headers: {
      Authorization: `Basic ${correspodent_string}`,
    },
  })
    .then((response) => {
      let { access_token } = response.data;
      console.log(access_token);
      res.status(200).json({ token: access_token });
    })
    .catch((error) => {
      console.log(`Woops! Access Token error that occured : ${error}`);
      res.status(500).json({ message: error });
    });
};

const mpesaExpressInt = (req, res) => {
  console.log(req.body);
  axios({
    url: express_url,
    method: "post",
    headers: {
      Authorization: `Bearer ${req.body.token}`,
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
      CallBackURL: "https://mydomain.com/path",
      AccountReference: "Daraja 2.0",
      TransactionDesc: `Payment of ${item}`,
    },
  })
    .then((response) => {
      let { data } = response;
      console.log(data);
      res.status(200).json(data);
    })
    .catch((error) => {
      console.log(`Mpesa Express error : ${error}`);
      res.status(302).json(error);
    });
};

// ROUTES DEFINATION
//===================
app.get("/", (req, res) => {
  res.status(200).send("Hakuna Matata from the daraja API");
});

app.get("/token", obtainAccessToken);

app.post("/express", mpesaExpressInt);

app.post("/confirmation", (req, res) => {
  let message = req.body;

  // THIS IS WHERE WE SHALL TAKE THE MESSAGE FURTHER TO OUR DB.
  res.status(200).send(message);
});

app.post("/validation", (req, res) => {
  let message = req.body;
  res.status(200).send(message);
});
app.listen(port, () => {
  console.log(`Listening successfully on port ${port}`);
});
