const toml_parser = require("toml");

function strip(str) {
  let trimmedStr = str.trim();

  if (
    (trimmedStr.startsWith("'") && trimmedStr.endsWith("'")) ||
    (trimmedStr.startsWith('"') && trimmedStr.endsWith('"')) ||
    (trimmedStr.startsWith("`") && trimmedStr.endsWith("`"))
  ) {
    trimmedStr = trimmedStr.slice(1, -1);
  }

  return trimmedStr;
}

/**
 *
 * Will return true if version2 > version1
 *
 * Accepts version strings in the format of X.X.X
 *
 * @param {Version} version1
 * @param {Version} version2
 */
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

function getToml(package) {
  const paths = Object.keys(package);
  const tomls = paths.filter((string) => string.endsWith("luam.toml"));

  if (tomls.length < 1) {
    throw new Error("NoToml");
  }

  if (tomls.length > 1) {
    throw new Error("MultipleTomls");
  }

  const toml_path = tomls[0];
  let toml;

  try {
    toml = toml_parser.parse(package[toml_path]);
  } catch (error) {
    throw new Error("TomlParseError");
  }

  return toml;
}

function validate(package) {
  const paths = Object.keys(package);
  let package_dir = paths.reduce(
    (p, c) => {
      let out = "";
      let i = 0;
      let min_len = Math.min(p.length, c.length);
      while (i < min_len) {
        if (p[i] !== c[i]) {
          break;
        }
        out += p[i];
        i++;
      }
      return out;
    },
    paths.reduce((p, c) => (p.length > c.length ? p : c), "")
  );

  if (package_dir.endsWith("/")) {
    package_dir = package_dir.slice(0, -1);
  }

  let toml = getToml(package);
  let external_paths = [];

  if (toml.external) {
    let external_dependencies = toml.external;

    if (
      typeof external_dependencies != "object" ||
      !Array.isArray(external_dependencies)
    ) {
      throw new Error("InvalidExternalDependencySyntax");
    }

    for (const pack of external_dependencies) {
      if (!pack.url || !pack.file) {
        throw new Error("InvalidExternalDependency");
      }

      external_paths.push(pack.file);
    }
  }

  for (let [path, file] of Object.entries(package)) {
    let apis = file.match(/(?<=os\.loadAPI\()[^\)]+(?=\))/gm);

    if (apis) {
      apis.forEach((api) => {
        api = strip(api);
        if (!(paths.includes(api) || external_paths.includes(api))) {
          throw new Error("InvalidAPI");
        }
      });
    }

    let regex = new RegExp(
      `os\\.loadAPI\\(\\s*\"${package_dir.replace(/\//g, "\\/")}`,
      "gm"
    );

    file = file.replace(regex, `os.loadAPI("$path`);
    console.log(`Validated ${path}`);
    package[path] = file;
  }
}

module.exports = { validate, getToml, checkVersions };
