function matchingStartingSubstring(str1, str2) {
  let i = 0;
  let max = Math.min(str1.length, str2.length);
  while (str1[i] === str2[i] && i < max) {
    i++;
  }
  return str1.slice(0, i);
}

function normalizeAPIS(files) {
  const paths = Object.keys(files);
  const root = ((p) => matchingStartingSubstring(p[0], p[1]))(paths.sort());
  const escapedRoot = root.replace(/\//, "\\/");
  paths.forEach((path) => {
    const bodyRegex = new RegExp(`os\.loadAPI\\(\\s*\\"${escapedRoot}`, "gm");
    const pathRegex = new RegExp(escapedRoot, "gm");

    const newPath = path.replace(pathRegex, "");
    const newBody = files[path].replace(bodyRegex, 'os.loadAPI("');

    files[newPath] = newBody;
    delete files[path];
  });
}

module.exports = normalizeAPIS;
