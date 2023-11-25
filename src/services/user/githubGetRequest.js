const { APIError } = require("../../utils/apierror");
const axios = require("axios");

async function call(link, token) {
  let response;

  try {
    response = await axios.get(`https://api.github.com/${link}`, {
      headers: {
        Authorization: `token ${token}`,
      },
    });
  } catch (error) {
    if (error.response) {
      throw new APIError(
        error.response.status,
        "GithubFetchError",
        "Invalid token provided or required permissions not given."
      );
    } else {
      throw new APIError(500, "GithubNotAvailable");
    }
  }

  return response;
}

module.exports = call;
