const fs = require('fs');
const path = require('path');

const etPath = path.join(__dirname, '../messages/et.json');
const ukrPath = path.join(__dirname, '../messages/ukr.json');

// Add colors for better visibility
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

const et = JSON.parse(fs.readFileSync(etPath, 'utf-8'));
const ukr = JSON.parse(fs.readFileSync(ukrPath, 'utf-8'));

function findMissingKeys(obj1, obj2, path = '') {
  const missing = [];
  
  for (const key in obj1) {
    const currentPath = path ? `${path}.${key}` : key;
    
    if (!(key in obj2)) {
      missing.push(currentPath);
    } else if (typeof obj1[key] === 'object' && obj1[key] !== null && !Array.isArray(obj1[key])) {
      missing.push(...findMissingKeys(obj1[key], obj2[key], currentPath));
    }
  }
  
  return missing;
}

function countKeys(obj) {
  let count = 0;
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      count++;
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      count += countKeys(obj[key]);
    }
  }
  return count;
}

function checkTranslations() {
  log('blue', '🔍 Checking translations...\n');
  
  const missingInUkr = findMissingKeys(et, ukr);
  const missingInEt = findMissingKeys(ukr, et);
  
  let hasErrors = false;
  
  if (missingInUkr.length > 0) {
    hasErrors = true;
    log('red', '❌ Missing in Ukrainian (ukr.json):');
    missingInUkr.forEach(key => log('yellow', `   - ${key}`));
    console.log('');
  }
  
  if (missingInEt.length > 0) {
    hasErrors = true;
    log('red', '❌ Missing in Estonian (et.json):');
    missingInEt.forEach(key => log('yellow', `   - ${key}`));
    console.log('');
  }
  
  // Statistics
  const etCount = countKeys(et);
  const ukrCount = countKeys(ukr);
  
  if (!hasErrors) {
    log('green', '✅ All translations are in sync!');
  } else {
    log('red', `📊 Total issues: ${missingInUkr.length + missingInEt.length}`);
  }
  
  log('gray', `\n📈 Statistics:`);
  log('gray', `   Estonian: ${etCount} keys`);
  log('gray', `   Ukrainian: ${ukrCount} keys`);
  
  if (hasErrors) {
    console.log('');
    log('red', '❌ Build failed due to missing translations!');
    log('yellow', '💡 Tip: Make sure to add translations for all languages when adding new keys.');
    process.exit(1);
  }
}

// Check if running in CI environment
const isCI = process.env.CI === 'true';
if (isCI) {
  console.log('Running in CI environment...\n');
}

checkTranslations();