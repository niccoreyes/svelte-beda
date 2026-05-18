#!/usr/bin/env node
/**
 * Browser Test & Debug Harness for svelte-beda
 * 
 * Usage:
 *   node scripts/browser-test.js                    # Run all smoke tests
 *   node scripts/browser-test.js --screenshot       # Take screenshots of all key pages
 *   node scripts/browser-test.js --page /patients     # Test a specific page
 *   node scripts/browser-test.js --dark             # Test in dark mode
 *   node scripts/browser-test.js --debug            # Keep browser open for manual inspection
 */

import { spawn, execSync } from 'child_process';
import { mkdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SCREENSHOT_DIR = join(ROOT, 'test-screenshots');
const BASE_URL = 'http://localhost:5173';

const args = process.argv.slice(2);
const flag = (f) => args.includes(f);
const PAGES = [
  { path: '/', name: 'home' },
  { path: '/patients', name: 'patients-list' },
  { path: '/patients/1', name: 'patient-detail' },
  { path: '/encounters', name: 'encounters' },
  { path: '/practitioners', name: 'practitioners' },
  { path: '/scheduling', name: 'scheduling' },
  { path: '/medications', name: 'medications' },
  { path: '/questionnaires', name: 'questionnaires' },
  { path: '/forms', name: 'forms' },
];

function sh(cmd, opts = {}) {
  return execSync(cmd, { cwd: ROOT, encoding: 'utf-8', stdio: opts.silent ? 'pipe' : 'inherit', ...opts });
}

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

async function waitForServer(url, timeout = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      sh(`curl -sf ${url} > /dev/null`, { silent: true });
      return true;
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  throw new Error(`Server ${url} did not start within ${timeout}ms`);
}

async function runAgentBrowserCommand(cmd) {
  return sh(`agent-browser ${cmd}`, { silent: true });
}

async function testPage(path, name) {
  const url = `${BASE_URL}${path}`;
  console.log(`\n📄 Testing: ${url}`);
  
  try {
    await runAgentBrowserCommand(`open ${url}`);
    await runAgentBrowserCommand('wait --load networkidle');
    
    // Check for errors
    const snapshot = await runAgentBrowserCommand('snapshot -i');
    const hasError = snapshot.includes('Error') || snapshot.includes('error');
    
    if (flag('--screenshot')) {
      const screenshotPath = join(SCREENSHOT_DIR, `${name}.png`);
      await runAgentBrowserCommand(`screenshot ${screenshotPath}`);
      console.log(`  📸 Screenshot: ${screenshotPath}`);
    }
    
    if (hasError) {
      console.log(`  ⚠️  Potential error indicators found`);
    } else {
      console.log(`  ✅ Page loaded successfully`);
    }
    
    return { name, url, ok: !hasError, error: hasError ? 'Error text found in page' : null };
  } catch (err) {
    console.log(`  ❌ Failed: ${err.message}`);
    return { name, url, ok: false, error: err.message };
  }
}

async function main() {
  console.log('🌐 svelte-beda Browser Test Harness\n');
  
  // Ensure screenshots dir
  ensureDir(SCREENSHOT_DIR);
  
  // Check if dev server is running
  try {
    sh(`curl -sf ${BASE_URL} > /dev/null`, { silent: true });
    console.log('✅ Dev server already running');
  } catch {
    console.log('⚡ Starting dev server...');
    const dev = spawn('npm', ['run', 'dev'], { cwd: ROOT, stdio: 'pipe' });
    dev.stdout.on('data', (d) => process.stdout.write(d));
    dev.stderr.on('data', (d) => process.stderr.write(d));
    
    await waitForServer(BASE_URL);
    console.log('✅ Dev server ready\n');
  }
  
  // Initialize agent-browser session
  console.log('🔌 Initializing browser session...');
  try {
    await runAgentBrowserCommand(`open ${BASE_URL}`);
  } catch (err) {
    console.error('❌ Failed to start browser:', err.message);
    process.exit(1);
  }
  
  // Test specific page or all pages
  const specificPage = args.find((a) => !a.startsWith('--'));
  const pagesToTest = specificPage
    ? PAGES.filter((p) => p.path === specificPage || p.name === specificPage)
    : PAGES;
  
  if (pagesToTest.length === 0) {
    console.error(`❌ Unknown page: ${specificPage}`);
    console.log('Available pages:', PAGES.map((p) => p.path).join(', '));
    process.exit(1);
  }
  
  // Toggle dark mode if requested
  if (flag('--dark')) {
    console.log('🌙 Testing in dark mode');
    await runAgentBrowserCommand('eval "document.documentElement.classList.add(\'dark\')"');
  }
  
  // Run tests
  const results = [];
  for (const page of pagesToTest) {
    results.push(await testPage(page.path, page.name));
  }
  
  // Summary
  console.log('\n📊 Test Summary');
  console.log('─'.repeat(50));
  const passed = results.filter((r) => r.ok);
  const failed = results.filter((r) => !r.ok);
  
  for (const r of results) {
    const icon = r.ok ? '✅' : '❌';
    console.log(`${icon} ${r.name.padEnd(25)} ${r.url}`);
  }
  
  console.log(`\n${passed.length}/${results.length} passed`);
  
  if (failed.length > 0) {
    console.log('\nFailed details:');
    for (const f of failed) {
      console.log(`  ${f.name}: ${f.error}`);
    }
  }
  
  // Debug mode: keep browser open
  if (!flag('--debug')) {
    console.log('\n🔒 Closing browser session');
    await runAgentBrowserCommand('close --all');
  } else {
    console.log('\n🔍 Debug mode: browser session kept open');
    console.log('   Run: agent-browser close --all   # when done');
  }
  
  if (failed.length > 0 && !flag('--screenshot')) {
    console.log('\n💡 Tip: Run with --screenshot to capture page state on failure');
  }
  
  process.exit(failed.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});
