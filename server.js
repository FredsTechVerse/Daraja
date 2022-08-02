const express = require("express");
const request = require("request");
const unirest = require("unirest");
const app = express();
const axios = require("axios");
const port = process.env.PORT || "3003";
//JUST MESSING AROUND WITH THE DATE OBJECT.
//===========================================

// const d = new Date(2018, 11, 24, 10, 33, 30, 0);
// console.log(d);

const time_stamp = new Date("October 13, 2014 11:13:00").toString();
console.log(time_stamp);

// ITEMS THAT NEED TO BE STORED IN A .ENV FILE
//============================================
const consumer_key = "NYMLe9JJIx7NwW3hV2UJDTrU0QUJ3kXC";
const consumer_secret = "YvHXGoIdK1yzcRT7";
const token_url =
  "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";
const express_url =
  "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";

// LIST OF KEY FUNCTIONS
//=======================
// (Shortcode+Passkey+Timestamp)
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

// LIST OF VARIABLES
//===================
let item = "bag";
let obtained_token = "7IE0nGaTMi9SiqPeG3G2sw9CnrFK"; //The issue is this being blank. Figure it out.

let tillNumber = 174379;
let passKey =
  "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
let timestamp = generate_timestamp();
let password = passwordEncrypt(tillNumber, passKey, timestamp);
let stkPushNo = 254112615416;
let amount = 10;

const expressBody = {
  BusinessShortCode: tillNumber,
  Password: password,
  Timestamp: timestamp,
  TransactionType: "CustomerPayBillOnline",
  Amount: amount,
  PartyA: stkPushNo,
  PartyB: tillNumber,
  PhoneNumber: stkPushNo,
  CallBackURL: "https://mydomain.com/path",
  AccountReference: "FredzTech Co.",
  TransactionDesc: `Payment of ${item}`,
};

const auth_token2 = async () => {
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
      // res.status(200).json(response);
    })
    .catch((error) => {
      console.log(`Woops! Access Token error that occured : ${error}`);
      // res.status(500).json({ message: error });
    });
};

// const data = async () => {
//   let data = await auth_token2();
//   return data;
// };

// console.log(`Here : ${data()}`);
// let data = auth_token2();
// console.log(data);

const mpesa_express2 = async () => {
  axios({
    url: express_url,
    method: "post",
    headers: {
      Authorization: `Bearer ${obtained_token}`,
    },
    data: expressBody,
  })
    .then((response) => {
      let { data } = response;
      console.log(data);
      // res.status(200).json(response);
    })
    .catch((error) => {
      console.log(`Woops! Mpesa Express error that occured : ${error}`);
      // res.status(500).json({ message: error });
    });
};

// auth_token2();

mpesa_express2();

app.get("/", (req, res) => {
  res.status(200).send("Hakuna Matata from the daraja API");
});

app.get("/access_tokenz", (request, response) => {
  let req = unirest(
    "GET",
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
  )
    .headers({
      Authorization: `Basic ${correspodent_string}`,
    })
    .send()
    .end((res) => {
      // if (res.error) throw new Error(res.error);
      if (res.error) {
        response.send(res.error);
      }
      let access_token = res.body.access_token;
      let expiration_time = res.body.expires_in;
      let token = [access_token, expiration_time];
      response.status(200).send(access_token);
    });
});

app.get("/token", (request, response) => {
  let token = auth_token();

  response.status(200).send(token);
});

app.listen(port, () => {
  console.log(`Listening successfully on port ${port}`);
});
