const { APIError } = require("../../utils/apierror");

const postPackage = require("../../services/package/postPackage");

async function post(ctx) {
  const body = ctx.request.body;
  const data = body.data;
  const authKey = body.authKey;

  if (!data) {
    throw new APIError(400, "NoPackageData");
  }

  if (!authKey) {
    throw new APIError(400, "NoAuthKey");
  }

  await postPackage(authKey, data);

  ctx.status = 204;
}

module.exports = post;
