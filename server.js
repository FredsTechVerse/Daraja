const express = require("express");
const request = require("request");
const unirest = require("unirest");
const app = express();

const port = process.env.PORT || "3002";

app.get("/", (req, res) => {
  res.status(200).send("Hakuna Matata from the daraja API");
});

// app.get("/access_token", (req, res) => {
//   let url =
//     "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";
//   //   let auth = new Buffer.from(
//   //     "e99MXkXLg0fIeKAnWeJmSfGmwULfPnKT:qLsiB3aRqOHHgQ4t"
//   //   ).toString("base64");

//   let new_auth =
//     "Bearer cFJZcjZ6anEwaThMMXp6d1FETUxwWkIzeVBDa2hNc2M6UmYyMkJmWm9nMHFRR2xWOQ==";

//   request(
//     {
//       url: url,
//       headers: {
//         Authorization:
//           "Bearer cFJZcjZ6anEwaThMMXp6d1FETUxwWkIzeVBDa2hNc2M6UmYyMkJmWm9nMHFRR2xWOQ==",
//       },
//     },
//     (error, response, body) => {
//       if (error) {
//         res.send(error);
//       } else {
//         res.status(200).json(body);
//       }
//     }
//   );
// });

// app.get("/access_tokenz", (request, response) => {
//   let req = unirest(
//     "GET",
//     "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
//   )
//     .headers({
//       'Authorization':
//         'Bearer cFJZcjZ6anEwaThMMXp6d1FETUxwWkIzeVBDa2hNc2M6UmYyMkJmWm9nMHFRR2xWOQ==',
//     })
//     .send()
//     .end((res) => {
//       // if (res.error) throw new Error(res.error);
//        if (res.error) {response.send(res.error)};

//       response.send(res.raw_body);
//     });
// });
app.listen(port, () => {
  console.log(`Listening successfully on port ${port}`);
});
