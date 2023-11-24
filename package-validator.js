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

  let external_paths = [];

  if (toml.dependencies.external) {
    let external_dependencies = toml.dependencies.external;

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

  for (let [_, file] of Object.entries(package)) {
    let apis = file.match(/(?<=os\.loadAPI\()[^\)]+(?=\))/gm);

    if (apis) {
      apis.forEach((api) => {
        api = strip(api);
        if (!(paths.includes(api) || external_paths.includes(api))) {
          throw new Error("InvalidApi");
        }
      });
    }

    let regex = new RegExp(
      `os\\.loadAPI\\(\\s*\"${package_dir.replace(/\//g, "\\/")}`,
      "gm"
    );

    file = file.replace(regex, `os.loadAPI("$path`);
    console.log(file);
  }
}

module.exports = validate;
