const { APIError } = require("../../utils/apierror");

const getPackage = require("../../services/package/getPackage");

async function get(ctx) {
  const name = ctx.params.name;
  let version = ctx.query.version;

  if (!name) {
    throw new APIError(400, "NoName");
  }

  let packageData = await getPackage(name, version);

  ctx.body = packageData;
}

module.exports = get;
