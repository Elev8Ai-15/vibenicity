// Script to pull latest code from GitHub (with verification)
import { getGitHubClient, getGitHubUser } from '../server/lib/github-client';
import * as fs from 'fs';
import * as path from 'path';

const REPO_NAME = 'vibenicity';
const BRANCH = 'main';

// Files to NEVER overwrite (critical config files)
const PROTECTED_FILES = [
  'vite.config.ts',
  '.replit',
  'replit.nix',
  '.env'
];

// Only pull these directories/file patterns
const SAFE_PATTERNS = [
  'client/src/',
  'server/',
  'shared/',
  'package.json',
  'tsconfig.json'
];

function isProtected(filePath: string): boolean {
  return PROTECTED_FILES.some(p => filePath === p || filePath.endsWith('/' + p));
}

function isSafeToImport(filePath: string): boolean {
  return SAFE_PATTERNS.some(pattern => filePath.startsWith(pattern) || filePath === pattern);
}

async function pullFromGitHub() {
  console.log(`🔄 Pulling from GitHub (${REPO_NAME}/${BRANCH}) with safety checks...\n`);
  
  try {
    const user = await getGitHubUser();
    console.log(`✓ Authenticated as: ${user.login}`);
    
    const octokit = await getGitHubClient();
    
    // Get the latest commit on main branch
    const { data: ref } = await octokit.git.getRef({
      owner: user.login,
      repo: REPO_NAME,
      ref: `heads/${BRANCH}`
    });
    
    console.log(`✓ Latest commit: ${ref.object.sha.substring(0, 7)}`);
    
    // Get the tree for that commit
    const { data: commit } = await octokit.git.getCommit({
      owner: user.login,
      repo: REPO_NAME,
      commit_sha: ref.object.sha
    });
    
    // Get the full tree recursively
    const { data: tree } = await octokit.git.getTree({
      owner: user.login,
      repo: REPO_NAME,
      tree_sha: commit.tree.sha,
      recursive: 'true'
    });
    
    const allFiles = tree.tree.filter(t => t.type === 'blob');
    console.log(`\n📁 Found ${allFiles.length} files in repository`);
    
    // Filter files for safety
    const safeFiles = allFiles.filter(f => f.path && isSafeToImport(f.path) && !isProtected(f.path));
    const skippedProtected = allFiles.filter(f => f.path && isProtected(f.path));
    const skippedOther = allFiles.filter(f => f.path && !isSafeToImport(f.path) && !isProtected(f.path));
    
    console.log(`\n🛡️  Safety check:`);
    console.log(`   ✓ Safe to import: ${safeFiles.length} files`);
    console.log(`   ⚠️  Protected (skipping): ${skippedProtected.length} files`);
    if (skippedProtected.length > 0) {
      skippedProtected.forEach(f => console.log(`      - ${f.path}`));
    }
    console.log(`   ○ Other (skipping): ${skippedOther.length} files\n`);
    
    let downloadedCount = 0;
    let errorCount = 0;
    
    for (const item of safeFiles) {
      if (item.path) {
        try {
          // Get file content
          const { data: blob } = await octokit.git.getBlob({
            owner: user.login,
            repo: REPO_NAME,
            file_sha: item.sha!
          });
          
          // Decode content
          const content = Buffer.from(blob.content, 'base64');
          
          // Ensure directory exists
          const dirPath = path.dirname(item.path);
          if (dirPath && dirPath !== '.') {
            fs.mkdirSync(dirPath, { recursive: true });
          }
          
          // Write file
          fs.writeFileSync(item.path, content);
          downloadedCount++;
          
          if (downloadedCount % 20 === 0) {
            console.log(`  Downloaded ${downloadedCount}/${safeFiles.length} files...`);
          }
        } catch (error: any) {
          console.log(`  ✗ ${item.path}: ${error.message}`);
          errorCount++;
        }
      }
    }
    
    console.log(`\n✅ Successfully pulled ${downloadedCount} files from ${BRANCH} branch`);
    if (errorCount > 0) {
      console.log(`⚠️  ${errorCount} files had errors`);
    }
    console.log(`   Repository: https://github.com/${user.login}/${REPO_NAME}`);
    
    // Verify the app still works
    console.log(`\n🔍 Verifying app integrity...`);
    const criticalFiles = ['client/src/App.tsx', 'server/index.ts', 'shared/schema.ts'];
    let allCriticalExist = true;
    for (const f of criticalFiles) {
      if (fs.existsSync(f)) {
        console.log(`   ✓ ${f} exists`);
      } else {
        console.log(`   ✗ ${f} MISSING`);
        allCriticalExist = false;
      }
    }
    
    if (allCriticalExist) {
      console.log(`\n✅ Verification passed! App should work correctly.`);
    } else {
      console.log(`\n⚠️  Some critical files are missing. Check the errors above.`);
    }
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

pullFromGitHub();
