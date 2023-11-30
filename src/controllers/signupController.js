const signupUser = require("../services/user/signupUser");
const { APIError } = require("../utils/apierror");

async function userPOST(ctx) {
  const body = ctx.request.body;
  const token = body.token;

  console.log(body);

  if (!token) {
    throw new APIError(400, "NoGithubToken");
  }

  let [newToken, username] = await signupUser(token);

  ctx.body = {
    token: newToken,
    login: username,
  };

  ctx.status = 200;
}

module.exports = userPOST;
