const {
  tolerantFindOne,
  packageVersions,
  packageMetadata,
} = require("../../utils/tolerantFind");

const logger = require("../../utils/logger");

const { APIError } = require("../../utils/apierror");
const adjustSemver = require("../../utils/semver");

async function get(name, version) {
  const packageMeta = await tolerantFindOne(packageMetadata, {
    name: name,
  });

  if (!packageMeta) {
    throw new APIError(404, "PackageNotFound");
  }

  if (!version) {
    version = packageMeta.version;
  } else {
    version = adjustSemver(packageMeta.versionHistory, version);
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

  return packageData;
}

module.exports = get;
