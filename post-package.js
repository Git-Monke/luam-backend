const { MongoClient } = require("mongodb");
const { validate, getToml, checkVersions } = require("./package-validator.js");
const sha256 = require("js-sha256").sha256;

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

const db = client.db("luam_registry");
const users = db.collection("users");
const package_metadata = db.collection("package_metadata");
const package_versions = db.collection("package_versions");

async function post_package(ctx) {
  console.log("Posting package...");
  let package = JSON.parse(ctx.request.body.raw_package);
  let auth_token = ctx.request.query.auth_token;

  if (!package) {
    console.log("No body included");
    ctx.status = 400;
    ctx.body = "Expected raw_package field in body";
    return;
  }

  if (!auth_token) {
    console.log("No auth token provided");
    ctx.status = 400;
    ctx.body = "Expected auth token";
    return;
  }

  console.log("Validating auth token...");
  let user;

  try {
    user = await users.findOne({
      auth_token_hash: sha256(auth_token),
    });
  } catch (error) {
    ctx.throw(500, error);
  }

  if (!user) {
    console.log("Auth token is not valid.");
    ctx.throw(400, "Invalid auth token");
  }

  console.log("Auth token is valid!");

  // will error if no toml file is found
  const toml = getToml(package);
  const package_meta = toml.package;

  if (!package_meta) {
    ctx.throw(400, "No package included in toml");
  }

  const name = package_meta.name;
  const version = package_meta.version;

  if (!name || !version) {
    ctx.throw(400, "No name or version included in toml");
  }

  console.log("Checking if package exists");

  let db_package;

  try {
    db_package = await package_metadata.findOne({
      name: name,
    });
  } catch (error) {
    ctx.throw(500, error);
  }

  if (db_package) {
    console.log("Package exists. Verifying if authors are the same.");

    let author;

    try {
      author = await users.findOne({
        _id: user._id,
      });
    } catch (error) {
      ctx.throw(500, error);
    }

    if (author.auth_token_hash !== user.auth_token_hash) {
      console.log("Authors are not the same.");
      ctx.throw(406, "Name is taken.");
    }

    console.log("Authors are the same. Proceeding with package validation.");

    if (!checkVersions(db_package.version, version)) {
      console.log(
        `Package version has not increased from ${db_package.version}. Throwing error`
      );
      ctx.throw(
        409,
        "Package version must increase when uploading new version"
      );
    }

    console.log("Version has increased to " + version);

    validate(package);
    console.log(
      "All file paths and dependencies are valid! Checking versions."
    );

    await package_metadata.updateOne(
      {
        _id: db_package._id,
      },
      {
        $set: {
          version: version,
        },
      }
    );
  } else {
    console.log("Package does not exist. Validating requested files.");
    validate(package);
    console.log(
      "All file paths and dependencies are valid! Creating new entry."
    );

    db_package = await package_metadata.insertOne({
      name: name,
      version: version,
      date_created: Date.now(),
      author: user._id,
      downloads: 0,
    });
  }

  package_versions.insertOne({
    name: name,
    version: version,
    raw_package: JSON.stringify(package),
    date_created: Date.now(),
    yanked: false,
    author: user._id,
  });
  // console.log(package_meta);
}

module.exports = post_package;
