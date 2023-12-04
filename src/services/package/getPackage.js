const {
  tolerantFindOne,
  packageVersions,
  packageMetadata,
} = require("../../utils/tolerantFind");

const logger = require("../../utils/logger");

const { APIError } = require("../../utils/apierror");
const adjustSemver = require("../../utils/semver");

async function get(name, version, metaonly = false) {
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

  let packageData = await tolerantFindOne(packageVersions, {
    name: name,
    version: version,
  });

  if (!packageData) {
    throw new APIError(404, "VersionNotFound");
  }

  if (!metaonly) {
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
  }

  if (metaonly) {
    logger.log(
      "info",
      `Fetched ${name} v${version} metadata`
    );

    delete packageData.package
  }

  return packageData;
}

module.exports = get;
