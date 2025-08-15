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
        // Build the extension
        console.log('🏗️  Building extension...');
        execSync('npm run build', { stdio: 'inherit' });

        // Create zips
        console.log('📦 Creating zip files...');
        await createZip('.output/chrome-mv3', 'chrome-extension.zip');
        await createZip('.output/firefox-mv2', 'firefox-extension.zip');

        console.log('✅ Zip files created');

        // Create release with GitHub CLI
        console.log('🎉 Creating GitHub release...');
        execSync(`gh release create ${tagName} chrome-extension.zip firefox-extension.zip --repo uldahlalex/fixmoodle --title "Release ${tagName}" --notes "Automated release of FixMoodle extension"`, { stdio: 'inherit' });

        // Cleanup
        fs.unlinkSync('chrome-extension.zip');
        fs.unlinkSync('firefox-extension.zip');

        console.log('✅ Release created successfully!');
        console.log(`🔗 View at: https://github.com/uldahlalex/fixmoodle/releases/tag/${tagName}`);

    } catch (error) {
        console.error('❌ Deploy failed:', error.message);
        process.exit(1);
    }
}

deploy();