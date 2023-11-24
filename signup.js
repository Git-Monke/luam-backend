const axios = require("axios");
const sha256 = require("js-sha256").sha256;

const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function newAuthToken(length) {
  return new Array(length)
    .fill(0)
    .map(() => chars[~~(Math.random() * chars.length)])
    .join("");
}

async function signup(ctx, users) {
  const query_params = ctx.request.query;
  ctx.assert(query_params, 401, "Malformed request: no query parameters");
  const gat = query_params.github_auth_token;
  ctx.assert(gat, 401, "Expected field github_auth_token");

  let data;

  try {
    const response = await axios.get("https://api.github.com/user", {
      headers: {
        "User-Agent": "Node.js",
        Authorization: `token ${gat}`,
      },
    });

    console.log("Account is valid!");
    console.log(`Signing up ${response.data.login}`);

    data = response.data;
  } catch (error) {
    console.log("Error signing up user");
    if (error.response) {
      const response = error.response;
      ctx.status = response.status;
      ctx.body = response.data;
    } else if (error.request) {
      ctx.status = 503;
      ctx.body = "Service Unavaiable";
    } else {
      ctx.status = 500;
      ctx.body = "Internal Server Error";
    }

    return;
  }

  let user;

  try {
    user = await users
      .find({
        id: data.id,
      })
      .toArray();
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      message: "Error signing up user",
      error: error,
    };
    return;
  }

  if (user[0]) {
    user = user[0];
    console.log("User already exists. Assigning new auth token.");
    let newToken = newAuthToken(20);

    const update = {
      $set: {
        auth_token_hash: sha256(newToken),
      },
    };

    await users.updateOne({ _id: user._id }, update);

    ctx.body = {
      new_token: newToken,
      existed: true,
    };
  } else {
    console.log("User does not exist. Creating new account");
    let newToken = newAuthToken(20);

    users.insertOne({
      username: data.login,
      id: data.id,
      auth_token: sha256(newToken),
      created_on: Date.now(),
    });

    ctx.body = {
      new_token: newToken,
      existed: false,
    };
  }

  ctx.status = 200;
}

module.exports = signup;
