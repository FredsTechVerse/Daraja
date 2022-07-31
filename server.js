const express = require("express");
const request = require("request");
const unirest = require("unirest");
const app = express();

const port = process.env.PORT || "3003";

const consumer_key = "NYMLe9JJIx7NwW3hV2UJDTrU0QUJ3kXC";
const consumer_secret = "YvHXGoIdK1yzcRT7";

let buffer = new Buffer.from(consumer_key+":"+consumer_secret);
let correspodent_string = buffer.toString('base64');


console.log(buffer);
console.log(`The correspondent string of the buffer : ${correspodent_string}`);

const mpesa_express =()=>{
  let unirest = require('unirest');
let req = unirest('POST', 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest')
.headers({
    'Content-Type': 'application/json',
    'Authorization': 'Bearer gSIYU6itYGVNhiKH0kBKLEMmsQG2'
})
.send(JSON.stringify({
    "BusinessShortCode": 174379,
    "Password": "MTc0Mzc5YmZiMjc5ZjlhYTliZGJjZjE1OGU5N2RkNzFhNDY3Y2QyZTBjODkzMDU5YjEwZjc4ZTZiNzJhZGExZWQyYzkxOTIwMjIwNzMxMjE1MjU0",
    "Timestamp": "20220731215254",
    "TransactionType": "CustomerPayBillOnline",
    "Amount": 1,
    "PartyA": 254112615416,
    "PartyB": 174379,
    "PhoneNumber": 254112615416,
    "CallBackURL": "https://mydomain.com/path",
    "AccountReference": "FredzTech",
    "TransactionDesc": "Sal Payment" 
  }))
.end(res => {
    if (res.error) throw new Error(res.error);
    console.log(res.raw_body);
});
}

mpesa_express();

app.get("/", (req, res) => {
  res.status(200).send("Hakuna Matata from the daraja API");
});

app.get("/access_tokenz", (request, response) => {
  let req = unirest(
    "GET",
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
  )
    .headers({
      'Authorization':
        `Basic ${correspodent_string}`,
    })
    .send()
    .end((res) => {
      // if (res.error) throw new Error(res.error);
       if (res.error) {response.send(res.error)};
      let access_token = res.body.access_token;
      let expiration_time = res.body.expires_in;
      let token = [access_token , expiration_time];
      response.status(200).send(access_token);
    });
});
 
app.listen(port, () => {
  console.log(`Listening successfully on port ${port}`);
});
