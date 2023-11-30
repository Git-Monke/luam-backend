const {
  tolerantFindOne,
  packageVersions,
  packageMetadata,
} = require("../../../utils/tolerantFind");

const { APIError } = require("../../../utils/apierror");

const adjustSemver = require("../../../utils/semver");

async function checkDependencies(dependencies) {
  for (let [name, version] of Object.entries(dependencies)) {
    const packageMeta = await tolerantFindOne(packageMetadata, {
      name: name,
    });

    if (!packageMeta) {
      throw new APIError(
        404,
        "DependencyNotFound",
        `The package ${name} cannot be found in the registry.`
      );
    }

    const packageData = await tolerantFindOne(packageVersions, {
      name: name,
      version: adjustSemver(packageMeta.versionHistory, version),
    });

    if (!packageData) {
      throw new APIError(
        404,
        "InvalidDependencyVersion",
        `${name} v${version} cannot be found or resolved.`
      );
    }

    if (packageData.yanked) {
      throw new APIError(
        403,
        "YankedDependency",
        `Package depends on ${name} v${version} which is yanked.`
      );
    }
  }
}

module.exports = checkDependencies;
