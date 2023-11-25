const { APIError } = require("../../utils/apierror");
const getToml = require("../../services/package/getToml");
const parsePackage = require("../../services/package/parsePackage");
const {
  tolerantFindOne,
  users,
  packageMetadata,
  packageVersions,
} = require("../../utils/tolerantFind");
const { sha256 } = require("js-sha256");

function checkVersions(version1, version2) {
  let v1 = version1.split(".").map((v) => parseInt(v));
  let v2 = version2.split(".").map((v) => parseInt(v));

  let min_len = Math.min(v1.length, v2.length);
  let i = 0;

  while (i < min_len) {
    if (v1 < v2) {
      return true;
    }

    if (v2 > v1) {
      return false;
    }

    i++;
  }

  if (v2.length > v1.length) {
    return true;
  }

  return false;
}

async function post(ctx) {
  const body = ctx.request.body;
  const data = body.data;
  const authKey = ctx.query.authKey;

  if (!data) {
    throw new APIError(400, "NoPackageData");
  }

  if (!authKey) {
    throw new APIError(400, "NoAuthKey");
  }

  const user = await tolerantFindOne(users, {
    authKeyHash: sha256(authKey),
  });

  if (!user) {
    throw new APIError(400, "InvalidAuthKey");
  }

  const package = await parsePackage(data);
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
  } else {
    newPack = await packageMetadata.insertOne({
      name: name,
      version: version,
      dateCreated: Date.now(),
      author: user._id,
      downloads: 0,
    });
  }

  await packageVersions.insertOne({
    name: name,
    version: version,
    package: package,
    dateCreated: Date.now(),
    meta: packageMeta ? packageMeta._id : newPack._id,
  });

  ctx.status = 200;
}

module.exports = post;
