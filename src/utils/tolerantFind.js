const { APIError } = require("./apierror");
const { MongoClient } = require("mongodb");

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);
const db = client.db("luam_registry");

const users = db.collection("users");
const packageMetadata = db.collection("package_metadata");
const packageVersions = db.collection("package_versions");

async function tolerantFindOne(collection, query) {
  try {
    return await collection.findOne(query);
  } catch (error) {
    throw new APIError(500, "MongoDBError");
  }
}

module.exports = { tolerantFindOne, users, packageMetadata, packageVersions };
