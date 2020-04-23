const express = require("express");
const querystring = require("querystring");
const axios = require("axios");
const app = express();
const port = 3001;
const stravaAuthUrl = "https://www.strava.com/oauth/authorize";
const clientId = 29349;
const redirectUri = "http://localhost:3001/strava/redirect";
const stravaPostUrl = "https://www.strava.com/oauth/token";
const yaml = require("js-yaml");
const fs = require("fs");

let scope = "";
let clientSecret = "";
let accessToken = "";
let refreshToken = "";

let tokenExpiration = 0; //Time since epoch in seconds. Time when access token expires

app.get("/test", (req, res) => res.send("Hello World!"));

app.get("/auth", (req, res) => {
  console.log("Received auth request");

  //If refresh token present and access token expired, get a new access token. Else, redirect to strava oauth page to get a token
  if (refreshToken !== "" && tokenExpiration < new Date().getTime()) {
    console.log("Access token expired, getting new one");
    res.redirect(redirectUri);
  } else {
    console.log("No access token, redirecting to strava oauth page");
    const stravaAuthUrlWithParams =
      stravaAuthUrl +
      "?" +
      querystring.encode({
        client_id: clientId,
        response_type: "code",
        redirect_uri: redirectUri,
        scope: "read",
      });
    res.redirect(stravaAuthUrlWithParams);
  }
});

app.get("/strava/redirect", (req, res) => {
  console.log(req.query);
  scope = req.query.scope; //Update current scope

  try {
    const doc = yaml.safeLoad(fs.readFileSync("./secret.yml", "utf8"));
    clientSecret = doc["secret"];
  } catch (e) {
    console.log(e);
  }

  let tokenParams = { client_id: clientId, client_secret: clientSecret };

  if (req.query) {
    tokenParams.code = req.query.code;
    tokenParams.grant_type = "authorization_code";
  } else if (refreshToken) {
    tokenParams.refresh_token = refreshToken;
    tokenParams.grant_type = "refresh_token";
  } else {
    res.redirect("http://localhost:3000");
  }

  //Send HTTP Post request to URL specified in Strava docs to get token
  axios
    .post(stravaPostUrl, tokenParams)
    .then((res2) => {
      console.log(res2);
      //Get and store access token, expiration time, refresh token from response
      accessToken = res2.data.access_token;
      tokenExpiration = res2.data.expires_at;
      refreshToken = res2.data.refresh_token;
    })
    .catch(function (error) {
      console.log(error);
    })
    .finally(() => {
      //Redirect back to homepage? TODO
      res.redirect("http://localhost:3000");
    });
});

app.listen(port, () => console.log(`RunRunRun backend app listening at http://localhost:${port}`));
