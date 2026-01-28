/** @type {import('semantic-release').GlobalConfig} */
module.exports = {
    branches: ['main'],
    plugins: [
        '@semantic-release/commit-analyzer',
        '@semantic-release/release-notes-generator',
        '@semantic-release/changelog',
        [
            '@semantic-release/exec',
            {
                prepareCmd: 'node scripts/sync-lib-version.cjs ${nextRelease.version}',
            },
        ],
        [
            '@semantic-release/npm',
            {
                npmPublish: true,
                pkgRoot: 'dist/blocks-renderer-angular',
                provenance: true,
            },
        ],
        [
            '@semantic-release/git',
            {
                assets: ['projects/blocks-renderer-angular/package.json', 'CHANGELOG.md'],
                message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
            },
        ],
        '@semantic-release/github',
    ],
};
