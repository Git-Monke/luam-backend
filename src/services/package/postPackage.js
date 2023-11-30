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
const getPackageMeta = require("./postPackage/getPackageMeta");
const checkVersions = require("./postPackage/checkVersions");
const checkDependencies = require("./postPackage/checkDependencies");

const versionRegex = /(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/gm;

const logger = require("../../utils/logger");

async function postPackage(authKey, package) {
  const user = await tolerantFindOne(users, {
    authKeyHash: sha256(authKey),
  });

  if (!user) {
    throw new APIError(400, "InvalidAuthKey");
  }

  const packageJSON = await getPackageMeta(package);

  if (!packageJSON.package) {
    throw new APIError(422, "NoPackageInfo");
  }

  const name = packageJSON.package.name;
  const version = packageJSON.package.version;
  const dependencies = packageJSON.dependencies;

  if (!name || !version || !dependencies) {
    throw new APIError(
      422,
      "LackingNecessaryPackageInfo",
      !name
        ? "Lacking name"
        : !version
        ? "Lacking version"
        : "Lacking dependencies"
    );
  }

  await checkDependencies(dependencies);

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
          versionHistory: packageMeta.versionHistory.concat(version),
        },
      }
    );

    logger.log("info", `${name} updated to v${version}`);
  } else {
    if (!versionRegex.test(version)) {
      throw new APIError(400, "ImpureVersionNumber");
    }

    newPack = await packageMetadata.insertOne({
      name: name,
      version: version,
      versionHistory: [version],
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
    dependencies: dependencies,
    external: packageJSON.external || [],
    unsafe: packageJSON.external ? packageJSON.external.length > 0 : false,
  });

  logger.log("info", `${name} v${version} added to registry`);
}

module.exports = postPackage;
