#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';

// Get version from package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const version = packageJson.version || `v${Date.now()}`;
const tagName = version.startsWith('v') ? version : `v${version}`;

console.log('🚀 Creating release:', tagName);

// Helper function to create zip
function createZip(sourceDir, outputPath) {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(outputPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', () => resolve());
        archive.on('error', (err) => reject(err));

        archive.pipe(output);
        archive.directory(sourceDir, false);
        archive.finalize();
    });
}

async function deploy() {
    try {
        // Check if tag already exists
        try {
            execSync(`git rev-parse ${tagName}`, { stdio: 'pipe' });
            console.log(`⚠️  Tag ${tagName} already exists locally. Use a different version or delete the tag first.`);
            return;
        } catch {
            // Tag doesn't exist, continue
        }

        // Build the extension
        console.log('🏗️  Building extension...');
        execSync('npm run build', { stdio: 'inherit' });

        // Build Firefox version too
        console.log('🦊 Building Firefox version...');
        execSync('npm run build:firefox', { stdio: 'inherit' });

        // Create zips
        console.log('📦 Creating zip files...');
        const chromeZipName = `moodle-tinymce-auto-resizer-${version}-chrome.zip`;
        const firefoxZipName = `moodle-tinymce-auto-resizer-${version}-firefox.zip`;
        
        await createZip('.output/chrome-mv3', chromeZipName);
        await createZip('.output/firefox-mv2', firefoxZipName);

        console.log('✅ Zip files created');

        // Create release notes
        const releaseNotes = `# Moodle TinyMCE Auto-Resizer ${tagName}

**What's included:**
- \`${chromeZipName}\` - Chrome/Edge extension (Manifest V3)
- \`${firefoxZipName}\` - Firefox extension (Manifest V2)

**Features:**
- Only activates on Moodle editing pages (won't affect dashboard or other pages)
- Hide drawer/sidebar for more screen space
- Maximize TinyMCE editor height
- Customizable settings via popup

**Installation:**
1. Download the appropriate zip file for your browser
2. Extract the zip file
3. Load the extracted folder as an unpacked extension in your browser`;

        // Create release with GitHub CLI
        console.log('🎉 Creating GitHub release...');
        execSync(`gh release create ${tagName} "${chromeZipName}" "${firefoxZipName}" --repo uldahlalex/fixmoodle --title "Release ${tagName}" --notes "${releaseNotes}"`, { stdio: 'inherit' });

        // Cleanup
        fs.unlinkSync(chromeZipName);
        fs.unlinkSync(firefoxZipName);

        console.log('✅ Release created successfully!');
        console.log(`🔗 View at: https://github.com/uldahlalex/fixmoodle/releases/tag/${tagName}`);

    } catch (error) {
        console.error('❌ Deploy failed:', error.message);
        // Cleanup on failure
        try {
            fs.unlinkSync(`moodle-tinymce-auto-resizer-${version}-chrome.zip`);
            fs.unlinkSync(`moodle-tinymce-auto-resizer-${version}-firefox.zip`);
        } catch {}
        process.exit(1);
    }
}

deploy().catch(console.error);