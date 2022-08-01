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
const buffer = new Buffer.from(consumer_key + ":" + consumer_secret);
const correspodent_string = buffer.toString("base64");
const item = "bag";
const express_data = {
  BusinessShortCode: 174379,
  Password:
    "MTc0Mzc5YmZiMjc5ZjlhYTliZGJjZjE1OGU5N2RkNzFhNDY3Y2QyZTBjODkzMDU5YjEwZjc4ZTZiNzJhZGExZWQyYzkxOTIwMjIwODAyMDA1MjEy",
  Timestamp: "20220802005212",
  TransactionType: "CustomerPayBillOnline",
  Amount: 1,
  PartyA: 254112615416,
  PartyB: 174379,
  PhoneNumber: 254112615416,
  CallBackURL: "https://mydomain.com/path",
  AccountReference: "FredzTech Co.",
  TransactionDesc: `Payment of ${item}`,
};

// console.log(express_data);

// let obtained_token = "bwlslYYpaihVJxGd3mA4aUmorAHb";

// let obtained_token = "";  //The issue is this being blank. Figure it out.

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
      obtained_token = access_token;
      console.log(obtained_token);
      // res.status(200).json(response);
    })
    .catch((error) => {
      console.log(`Woops! This is the error that occured : ${error}`);
      // res.status(500).json({ message: error });
    });
};

const mpesa_express2 = () => {
  let token = "bwlslYYpaihVJxGd3mA4aUmorAHb";
  axios({
    url: express_url,
    method: "post",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: express_data,
  })
    .then((response) => {
      let { data } = response;
      console.log(data);
      // res.status(200).json(response);
    })
    .catch((error) => {
      console.log(`Woops! This is the error that occured : ${error}`);
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
