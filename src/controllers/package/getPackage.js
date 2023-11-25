const { APIError } = require("../../utils/apierror");

const {
  tolerantFindOne,
  packageVersions,
  packageMetadata,
} = require("../../utils/tolerantFind");

const logger = require("../../utils/logger");

async function get(ctx) {
  const name = ctx.params.name;
  let version = ctx.query.version;

  if (!name) {
    throw new APIError(400, "NoName");
  }

  const packageMeta = await tolerantFindOne(packageMetadata, {
    name: name,
  });

  if (!packageMeta) {
    throw new APIError(404, "PackageNotFound");
  }

  if (!version) {
    version = packageMeta.version;
  }

  const packageData = await tolerantFindOne(packageVersions, {
    name: name,
    version: version,
  });

  if (!packageData) {
    throw new APIError(404, "VersionNotFound");
  }

  await packageMetadata.updateOne(
    {
      _id: packageMeta._id,
    },
    {
      $inc: {
        downloads: 1,
      },
    }
  );

  logger.log(
    "info",
    `Served ${name} v${version} | ${(
      packageMeta.downloads + 1
    ).toLocaleString()} downloads`
  );

  ctx.body = packageData;
}

module.exports = get;
