const { APIError } = require("../../../utils/apierror");
const toml = require("toml");

async function getPackageMeta(package) {
  let jsons = Object.keys(package).filter((file) =>
    file.endsWith("package.json")
  );

  if (jsons.length > 1) {
    throw new APIError(422, "MultipleJSON");
  }

  if (jsons.length < 1) {
    throw new APIError(422, "NoPackageJSON");
  }

  let json = package[jsons[0]];

  try {
    return JSON.parse(json);
  } catch (e) {
    throw new APIError(422, "JSONParseError");
  }
}

module.exports = getPackageMeta;
