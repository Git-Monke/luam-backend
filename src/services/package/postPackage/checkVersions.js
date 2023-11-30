const { APIError } = require("../../../utils/apierror");

const versionRegex = /(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/gm;

function checkVersions(version1, version2) {
  if (!versionRegex.test(version2)) {
    throw new APIError(400, "ImpureVersionNumber");
  }

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

module.exports = checkVersions;
