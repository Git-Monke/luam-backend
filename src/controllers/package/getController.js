const { APIError } = require("../../utils/apierror");

const getPackage = require("../../services/package/getPackage");

async function get(ctx) {
  const name = ctx.params.name;
  const version = ctx.query.version;
  const metaonly = ctx.query.meta == "true"
  
  if (!name) {
    throw new APIError(400, "NoName");
  }

  let packageData = await getPackage(name, version, metaonly);

  ctx.body = packageData;
}

module.exports = get;
