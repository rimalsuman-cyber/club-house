const fs = require("fs");
const path = require("path");

const distDir = path.join(__dirname, "..", "dist");
const indexPath = path.join(distDir, "index.html");
const notFoundPath = path.join(distDir, "404.html");
const noJekyllPath = path.join(distDir, ".nojekyll");

if (!fs.existsSync(indexPath)) {
  throw new Error("dist/index.html was not found. Run Expo export before preparing GitHub Pages.");
}

fs.copyFileSync(indexPath, notFoundPath);
fs.writeFileSync(noJekyllPath, "");

console.log("Prepared dist for GitHub Pages: added 404.html and .nojekyll");
