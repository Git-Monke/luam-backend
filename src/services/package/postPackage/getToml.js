const { APIError } = require("../../../utils/apierror");
const toml = require("toml");

async function getToml(package) {
  let tomls = Object.keys(package).filter((file) => file.endsWith("luam.toml"));

  if (tomls.length > 1) {
    throw new APIError(422, "MultipleTomls");
  }

  if (tomls.length < 1) {
    throw new APIError(422, "NoToml");
  }

  let tomlText = package[tomls[0]];
  let parsedToml;

  try {
    parsedToml = toml.parse(tomlText);
  } catch (e) {
    throw new APIError(
      422,
      "TomlParseError",
      `${e.line}:${e.column}: ${e.message}`
    );
  }

  return parsedToml;
}

module.exports = getToml;
