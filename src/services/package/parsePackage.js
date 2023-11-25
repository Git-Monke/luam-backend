async function parsePackage(data) {
  try {
    return JSON.parse(data);
  } catch (error) {
    throw new APIError(409, "PackageParseError");
  }
}

module.exports = parsePackage;
