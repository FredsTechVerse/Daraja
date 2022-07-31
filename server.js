const express = require("express");
const request = require("request");
const unirest = require("unirest");
const app = express();

const port = process.env.PORT || "3003";

app.get("/", (req, res) => {
  res.status(200).send("Hakuna Matata from the daraja API");
});

app.get("/access_token", (req, res) => {
  let url =
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";

  request(
    {
      url: url,
      headers: {
        'Authorization':
          'Basic TllNTGU5SkpJeDdOd1czaFYyVUpEVHJVMFFVSjNrWEM6WXZIWEdvSWRLMXl6Y1JUNw==',
              },
    },
    (error, response, body) => {
      if (error) {
        res.send(error);
      } else {
        res.status(200).json(body);
      }
    }
  );
});

app.get("/access_tokenz", (request, response) => {
  let req = unirest(
    "GET",
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
  )
    .headers({
      'Authorization':
        'Basic TllNTGU5SkpJeDdOd1czaFYyVUpEVHJVMFFVSjNrWEM6WXZIWEdvSWRLMXl6Y1JUNw==',
    })
    .send()
    .end((res) => {
      // if (res.error) throw new Error(res.error);
       if (res.error) {response.send(res.error)};

      response.send(res.raw_body);
    });
});
app.listen(port, () => {
  console.log(`Listening successfully on port ${port}`);
});
