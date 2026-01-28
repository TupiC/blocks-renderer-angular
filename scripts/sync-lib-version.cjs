/**
 * Updates projects/blocks-renderer-angular/package.json version.
 * Used by semantic-release so the source package.json stays in sync with the release.
 */
const fs = require('fs');
const path = require('path');

const version = process.argv[2];
if (!version) {
    console.error('Usage: node sync-lib-version.cjs <version>');
    process.exit(1);
}

const pkgPath = path.join(__dirname, '..', 'projects', 'blocks-renderer-angular', 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.version = version;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 4) + '\n');
