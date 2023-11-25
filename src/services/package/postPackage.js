const {
  tolerantFindOne,
  users,
  packageMetadata,
  packageVersions,
} = require("../../utils/tolerantFind");

const { APIError } = require("../../utils/apierror");
const { sha256 } = require("js-sha256");

const parsePackage = require("./postPackage/parsePackage");
const normalizeAPIS = require("./postPackage/apiNormalizer");
const getToml = require("./postPackage/getToml");
const checkVersions = require("./postPackage/checkVersions");

const logger = require("../../utils/logger");

async function postPackage(authKey, data) {
  const user = await tolerantFindOne(users, {
    authKeyHash: sha256(authKey),
  });

  if (!user) {
    throw new APIError(400, "InvalidAuthKey");
  }

  let package = await parsePackage(data);
  normalizeAPIS(package);

  const toml = await getToml(package);

  if (!toml.package) {
    throw new APIError(422, "NoPackageInToml");
  }

  const name = toml.package.name;
  const version = toml.package.version;

  if (!name || !version) {
    throw new APIError(
      422,
      "LackingNecessaryTomlInfo",
      !name ? "Lacking name" : "Lacking Version"
    );
  }

  const packageMeta = await tolerantFindOne(packageMetadata, {
    name: name,
  });

  let newPack;

  if (packageMeta) {
    const author = await tolerantFindOne(users, {
      _id: packageMeta.author,
    });

    if (author.authKeyHash !== user.authKeyHash) {
      throw new APIError(403, "NameTaken");
    }

    if (
      typeof version !== "string" ||
      !checkVersions(packageMeta.version, version)
    ) {
      throw new APIError(400, "InvalidVersion");
    }

    await packageMetadata.updateOne(
      {
        _id: packageMeta._id,
      },
      {
        $set: {
          version: version,
        },
      }
    );

    logger.log("info", `${name} updated to v${version}`);
  } else {
    newPack = await packageMetadata.insertOne({
      name: name,
      version: version,
      dateCreated: Date.now(),
      author: user._id,
      downloads: 0,
    });

    logger.log("info", `${user.login} created a new package: ${name}!`);
  }

  await packageVersions.insertOne({
    name: name,
    version: version,
    package: package,
    dateCreated: Date.now(),
    yanked: false,
  });

  logger.log("info", `${name} v${version} added to registry`);
}

module.exports = postPackage;
