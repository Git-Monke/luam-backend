const { MongoClient } = require("mongodb");

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

const db = client.db("luam_registry");
const package_metadata = db.collection("package_metadata");
const package_versions = db.collection("package_versions");

async function pull_package(ctx) {
  let query_params = ctx.request.query;
  let package_name = query_params.name;
  let package_version = query_params.version;

  if (!package_name) {
    ctx.throw("Package name expected");
  }

  let package;

  if (!package_version) {
    let metadata;

    try {
      metadata = await package_metadata.findOne({
        name: package_name,
      });

      if (!metadata._id) {
        ctx.throw(400, "Package does not exist");
      }

      package = await package_versions.findOne({
        name: package_name,
        version: metadata.version,
      });
    } catch (error) {
      ctx.throw(500, "MongoDB Error");
    }
  } else {
    package = await package_versions.findOne({
      name: package_name,
      version: package_version,
    });
  }

  if (!package) {
    ctx.throw(400, "Package does not exist");
  }

  ctx.body = package;
}

module.exports = pull_package;
