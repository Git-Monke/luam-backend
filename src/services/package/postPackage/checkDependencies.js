const {
  tolerantFindOne,
  packageVersions,
} = require("../../../utils/tolerantFind");

const { APIError } = require("../../../utils/apierror");

async function checkDependencies(dependencies) {
  for (let [name, version] of Object.entries(dependencies)) {
    const packageData = await tolerantFindOne(packageVersions, {
      name: name,
      version: version,
    });

    if (!packageData) {
      throw new APIError(
        404,
        "DependencyNotFound",
        `Package depends on ${name} v${version} which cannot be found in the registry.`
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
