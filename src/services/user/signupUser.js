const { APIError } = require("../../utils/apierror");

const sha256 = require("js-sha256").sha256;

const githubGet = require("./githubGetRequest");
const { tolerantFindOne, users } = require("../../utils/tolerantFind");

const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function randomID(length) {
  return new Array(length)
    .fill(0)
    .map((v) => chars[~~(Math.random() * chars.length)])
    .join("");
}

async function signupUser(githubToken) {
  if (!githubToken) {
    throw new APIError(400, "NoGithubToken", "Did not provide a github token");
  }

  let emails = (await githubGet("user/emails", githubToken)).data;

  let verified = false;

  for (let email of emails) {
    if (email.verified === true) {
      verified = true;
      break;
    }
  }

  if (!verified) {
    throw new APIError(
      403,
      "NoVerifiedEmail",
      "Did not have a verified email attatched to account"
    );
  }

  let user = (await githubGet("user", githubToken)).data;
  let db_user = await tolerantFindOne(users, {
    id: user.id,
  });

  let newAuthToken = randomID(20);

  if (db_user) {
    await users.updateOne(
      {
        _id: db_user._id,
      },
      {
        $set: {
          authKeyHash: sha256(newAuthToken),
        },
      }
    );
  } else {
    await users.insertOne({
      login: user.login,
      id: user.id,
      authKeyHash: sha256(newAuthToken),
      dateCreated: Date.now(),
    });
  }

  return newAuthToken;
}

module.exports = signupUser;
