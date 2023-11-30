const { APIError } = require("./apierror");

const semverPattern =
  /^(?:(\^|\~)(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)|(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*))(?:\+[0-9A-Za-z-]+)?$/;

const sortSemver = (versions) =>
  versions.sort((a, b) => {
    const [aMajor, aMinor, aPatch] = a.split(".").map(Number);
    const [bMajor, bMinor, bPatch] = b.split(".").map(Number);

    if (aMajor !== bMajor) return bMajor - aMajor;
    if (aMinor !== bMinor) return bMinor - aMinor;

    return bPatch - aPatch;
  });

function adjustSemver(versions, version) {
  let pureVersion = version.replace(/[\^~]/, "");

  if (!versions.includes(pureVersion, "")) {
    throw new APIError(400, "VersionNotFound");
  }

  if (!semverPattern.test(version)) {
    throw new APIError(400, "VersionNotSemver");
  }

  const nums = version.replace(/[\^~]/g, "").split(".").map(Number);

  const minor = version.startsWith("^");
  const patch = minor || version.startsWith("~");

  sortSemver(versions);

  if (minor) {
    return versions.filter((v) => v.startsWith(`${nums[0]}`))[0];
  } else if (patch) {
    return versions.filter((v) => v.startsWith(`${nums[0]}.${nums[1]}`))[0];
  } else {
    return version;
  }
}

module.exports = adjustSemver;
