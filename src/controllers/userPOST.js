const signupUser = require("../services/user/signupUser");

async function userPOST(ctx) {
  const query = ctx.request.query;
  const github_token = query.github_token;

  let newToken = await signupUser(github_token);

  ctx.body = {
    token: newToken,
  };
  ctx.status = 200;
}

module.exports = userPOST;
