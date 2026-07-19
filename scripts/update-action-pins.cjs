/**
 * Update GitHub Action pins in .github workflow files.
 *
 * Handles two formats:
 *
 * 1. Ref-based: uses: owner/repo@v4 or @main → pinned to SHA
 * 2. SHA-pinned: uses: owner/repo@<sha> # v4 → updated to latest release
 *    SHA, or uses: owner/repo@<sha> # main → updated to latest main SHA
 *
 * Requires the `gh` CLI to be authenticated.
 *
 * Usage: node scripts/update-action-pins.cjs
 *        node scripts/update-action-pins.cjs --dry-run
 */

const { execFileSync } = require("node:child_process");
const { readFileSync, readdirSync, writeFileSync } = require("node:fs");
const { join } = require("node:path");

const ROOT = join(__dirname, "..");

function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
const DRY_RUN = process.argv.includes("--dry-run");
const SHA_RE = /^[0-9a-f]{40}$/;
const VERSION_REF_RE = /^v?\d/;

// uses: owner/repo@<40-char sha> # ref
const PINNED_RE =
    /(?<=uses:\s{1,10})([a-zA-Z0-9_.\-]+\/[a-zA-Z0-9_.\-]+)@([0-9a-f]{40})\s*#\s*(\S+)/g;

// uses: owner/repo@ref (tag, branch, or other Git ref; not already pinned)
const UNPINNED_REF_RE =
    /(?<=uses:\s{1,10})([a-zA-Z0-9_.\-]+\/[a-zA-Z0-9_.\-]+)@([^\s#]+)/g;

function ghApi(path) {
    return JSON.parse(
        execFileSync("gh", ["api", path], {
            encoding: "utf8",
            stdio: ["pipe", "pipe", "pipe"],
        }),
    );
}

function getLatestTag(repo) {
    try {
        return ghApi(`repos/${repo}/releases/latest`).tag_name;
    } catch {
        return ghApi(`repos/${repo}/tags`)[0]?.name;
    }
}

function getCommitSha(repo, ref) {
    return ghApi(`repos/${repo}/commits/${encodeURIComponent(ref)}`).sha;
}

function getPinnedTarget(repo, ref) {
    if (VERSION_REF_RE.test(ref)) {
        const latestTag = getLatestTag(repo);
        return {
            ref: latestTag,
            sha: getCommitSha(repo, latestTag),
        };
    }

    return {
        ref,
        sha: getCommitSha(repo, ref),
    };
}

function findWorkflowFiles() {
    const workflowDir = join(ROOT, ".github", "workflows");
    const actionsDir = join(ROOT, ".github", "actions");
    const files = [];

    const collect = (dir, pattern) => {
        try {
            for (const f of readdirSync(dir, {
                recursive: true,
                encoding: "utf8",
            })) {
                if (pattern.test(f)) files.push(join(dir, f));
            }
        } catch {
            // directory may not exist
        }
    };

    collect(workflowDir, /\.ya?ml$/);
    collect(actionsDir, /\.ya?ml$/);
    return files;
}

const files = findWorkflowFiles();
console.log(`Found ${files.length} workflow file(s).\n`);

// Collect unique actions (keyed by repo@currentRef)
const pinnedActions = new Map();
const refActions = new Map();

for (const file of files) {
    const content = readFileSync(file, "utf-8");

    for (const [, repo, sha, tag] of content.matchAll(PINNED_RE)) {
        if (!repo.startsWith(".")) {
            pinnedActions.set(`${repo}@${sha}`, {
                repo,
                currentRef: sha,
                currentTag: tag,
            });
        }
    }

    for (const [, repo, ref] of content.matchAll(UNPINNED_REF_RE)) {
        if (!repo.startsWith(".") && !SHA_RE.test(ref)) {
            const key = `${repo}@${ref}`;
            refActions.set(key, { repo, currentRef: ref, currentTag: ref });
        }
    }
}

console.log(
    `  ${pinnedActions.size} SHA-pinned action(s), ${refActions.size} ref-based action(s)\n`,
);

const updates = new Map();

// Process SHA-pinned — check if a newer version exists
for (const [key, { repo, currentRef: sha, currentTag: tag }] of pinnedActions) {
    process.stdout.write(`  [pinned] ${repo} (${tag}) → `);
    let target;
    try {
        target = getPinnedTarget(repo, tag);
    } catch (e) {
        console.log(`ERROR: ${e.message}`);
        continue;
    }

    if (target.sha === sha) {
        console.log("up to date");
    } else {
        console.log(`${target.ref} (${target.sha.slice(0, 7)})`);
        updates.set(key, {
            repo,
            oldRef: sha,
            oldTag: tag,
            newSha: target.sha,
            newTag: target.ref,
        });
    }
}

// Process ref-based — pin to SHA
for (const [key, { repo, currentRef: ref }] of refActions) {
    process.stdout.write(`  [ref]    ${repo}@${ref} → `);
    let sha;
    try {
        sha = getCommitSha(repo, ref);
    } catch (e) {
        console.log(`ERROR: ${e.message}`);
        continue;
    }

    console.log(`${sha.slice(0, 7)} (pin)`);
    updates.set(key, {
        repo,
        oldRef: ref,
        oldTag: ref,
        newSha: sha,
        newTag: ref,
    });
}

if (updates.size === 0) {
    console.log("\nAll actions up to date.");
    process.exit(0);
}

if (DRY_RUN) {
    console.log(
        `\n[dry-run] Would update ${updates.size} action(s). No files written.`,
    );
    process.exit(0);
}

let filesChanged = 0;

for (const file of files) {
    let content = readFileSync(file, "utf-8");
    let changed = false;

    for (const { repo, oldRef, oldTag, newSha, newTag } of updates.values()) {
        // Replace SHA-pinned format
        const beforePinned = `${repo}@${oldRef} # ${oldTag}`;
        const afterPinned = `${repo}@${newSha} # ${newTag}`;
        if (content.includes(beforePinned)) {
            content = content.replaceAll(beforePinned, afterPinned);
            changed = true;
        }

        // Replace ref-based format (pin it)
        const beforeRef = `${repo}@${oldRef}`;
        const afterRef = `${repo}@${newSha} # ${newTag}`;
        // Only replace exact refs. Any existing trailing comment is replaced
        // with the canonical tracking ref comment used by this script.
        if (oldRef === oldTag && content.includes(beforeRef)) {
            const refLineRe = new RegExp(
                `(uses:\\s{1,10})${escapeRegex(repo)}@${escapeRegex(oldRef)}(?:\\s*#\\s*[^\\n]*)?`,
                "g",
            );
            const newContent = content.replace(refLineRe, `$1${afterRef}`);
            if (newContent !== content) {
                content = newContent;
                changed = true;
            }
        }
    }

    if (changed) {
        writeFileSync(file, content, "utf-8");
        filesChanged++;
        console.log(`  updated: ${file.replace(ROOT, "")}`);
    }
}

console.log(
    `\nUpdated ${updates.size} action(s) across ${filesChanged} file(s).`,
);
