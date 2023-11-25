const { APIError } = require("../../utils/apierror");

const yankPackage = require("../../services/package/yankPackage");

async function yank(ctx, newYankStatus) {
  const body = ctx.request.body;
  const authKey = body.authKey;
  let version = ctx.query.version;
  const packageName = ctx.params.name;

  if (!authKey || !packageName) {
    throw new APIError(400, !authKey ? "NoAuthKey" : "NoPackageName");
  }

  await yankPackage(authKey, packageName, version, newYankStatus);

  ctx.status = 204;
}

module.exports = yank;
