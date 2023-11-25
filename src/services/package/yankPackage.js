const {
  tolerantFindOne,
  users,
  packageVersions,
  packageMetadata,
} = require("../../utils/tolerantFind");

const { sha256 } = require("js-sha256");
const { APIError } = require("../../utils/apierror");

const logger = require("../../utils/logger");

async function yankPackage(authKey, packageName, version, newYankStatus) {
  const user = await tolerantFindOne(users, {
    authKeyHash: sha256(authKey),
  });

  if (!user) {
    throw new APIError(400, "InvalidAuthKey");
  }

  const packageMeta = await tolerantFindOne(packageMetadata, {
    name: packageName,
  });

  if (!packageMeta) {
    throw new APIError(404, "PackageNotFound");
  }

  const author = await tolerantFindOne(users, {
    _id: packageMeta.author,
  });

  if (user.authKeyHash !== author.authKeyHash) {
    throw new APIError(403, "NotPackageAuthor");
  }

  if (!version) {
    version = packageMeta.version;
  }

  let result = await packageVersions.updateOne(
    {
      name: packageName,
      version: version,
    },
    {
      $set: {
        yanked: newYankStatus,
      },
    }
  );

  // Not an error, but it's easier to just throw this case in with the others for easier handling later on.
  if (result.matchedCount === 0) {
    throw new APIError(200, "VersionDidntExist");
  }

  logger.log(
    "info",
    `${newYankStatus ? "Yanked" : "Unyanked"} ${packageName} v${version}`
  );
}

module.exports = yankPackage;
