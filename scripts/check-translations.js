// scripts/check-translations.js
const fs = require("fs");
const path = require("path");

// Add colors for better visibility
const colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  gray: "\x1b[90m",
  reset: "\x1b[0m",
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Get all translation files for a locale
function getTranslationFiles(locale) {
  const dir = path.join(__dirname, `../messages/${locale}`);

  // Check if directory exists
  if (!fs.existsSync(dir)) {
    log("red", `❌ Translation directory not found: ${dir}`);
    return null;
  }

  // Get all JSON files
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));

  if (files.length === 0) {
    log("yellow", `⚠️  No translation files found in ${dir}`);
    return {};
  }

  // Load and merge all translations
  const translations = {};
  const fileContents = {};

  files.forEach((file) => {
    try {
      const filePath = path.join(dir, file);
      const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      fileContents[file] = content;
      Object.assign(translations, content);
    } catch (error) {
      log("red", `❌ Error reading ${file}: ${error.message}`);
    }
  });

  return { merged: translations, files: fileContents };
}

// Find missing keys between objects
function findMissingKeys(obj1, obj2, path = "") {
  const missing = [];

  for (const key in obj1) {
    const currentPath = path ? `${path}.${key}` : key;

    if (!(key in obj2)) {
      missing.push(currentPath);
    } else if (
      typeof obj1[key] === "object" &&
      obj1[key] !== null &&
      !Array.isArray(obj1[key])
    ) {
      missing.push(...findMissingKeys(obj1[key], obj2[key], currentPath));
    }
  }

  return missing;
}

// Count total translation keys
function countKeys(obj) {
  let count = 0;
  for (const key in obj) {
    if (typeof obj[key] === "string") {
      count++;
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      count += countKeys(obj[key]);
    }
  }
  return count;
}

// Find which file a key belongs to
function findKeyInFiles(key, files) {
  const topLevelKey = key.split(".")[0];

  for (const [filename, content] of Object.entries(files)) {
    if (topLevelKey in content) {
      return filename;
    }
  }
  return "unknown";
}

// Main check function
function checkTranslations() {
  log("blue", "🔍 Checking translations...\n");

  // Load translations for both locales
  const etData = getTranslationFiles("et");
  const ukrData = getTranslationFiles("ukr");

  // Check if both directories exist
  if (!etData || !ukrData) {
    log("red", "❌ Missing translation directories!");
    log(
      "yellow",
      "Make sure both messages/et/ and messages/ukr/ directories exist."
    );
    process.exit(1);
  }

  const et = etData.merged;
  const ukr = ukrData.merged;

  // Check for missing files
  const etFiles = Object.keys(etData.files);
  const ukrFiles = Object.keys(ukrData.files);

  const missingFilesInUkr = etFiles.filter((f) => !ukrFiles.includes(f));
  const missingFilesInEt = ukrFiles.filter((f) => !etFiles.includes(f));

  let hasErrors = false;

  if (missingFilesInUkr.length > 0) {
    hasErrors = true;
    log("red", "❌ Missing files in Ukrainian (ukr/):");
    missingFilesInUkr.forEach((file) => log("yellow", `   - ${file}`));
    console.log("");
  }

  if (missingFilesInEt.length > 0) {
    hasErrors = true;
    log("red", "❌ Missing files in Estonian (et/):");
    missingFilesInEt.forEach((file) => log("yellow", `   - ${file}`));
    console.log("");
  }

  // Check for missing keys
  const missingInUkr = findMissingKeys(et, ukr);
  const missingInEt = findMissingKeys(ukr, et);

  if (missingInUkr.length > 0) {
    hasErrors = true;
    log("red", "❌ Missing translations in Ukrainian:");

    // Group by file
    const byFile = {};
    missingInUkr.forEach((key) => {
      const file = findKeyInFiles(key, etData.files);
      if (!byFile[file]) byFile[file] = [];
      byFile[file].push(key);
    });

    Object.entries(byFile).forEach(([file, keys]) => {
      log("yellow", `   In ${file}:`);
      keys.forEach((key) => log("yellow", `      - ${key}`));
    });
    console.log("");
  }

  if (missingInEt.length > 0) {
    hasErrors = true;
    log("red", "❌ Missing translations in Estonian:");

    // Group by file
    const byFile = {};
    missingInEt.forEach((key) => {
      const file = findKeyInFiles(key, ukrData.files);
      if (!byFile[file]) byFile[file] = [];
      byFile[file].push(key);
    });

    Object.entries(byFile).forEach(([file, keys]) => {
      log("yellow", `   In ${file}:`);
      keys.forEach((key) => log("yellow", `      - ${key}`));
    });
    console.log("");
  }

  // File-by-file statistics
  log("blue", "📁 File Statistics:\n");

  const allFiles = [...new Set([...etFiles, ...ukrFiles])];
  allFiles.sort().forEach((file) => {
    const etFileContent = etData.files[file] || {};
    const ukrFileContent = ukrData.files[file] || {};

    const etCount = countKeys(etFileContent);
    const ukrCount = countKeys(ukrFileContent);

    if (etCount === ukrCount) {
      log("green", `   ✓ ${file}: ${etCount} keys (synced)`);
    } else {
      log("yellow", `   ⚠ ${file}: ET=${etCount}, UKR=${ukrCount} keys`);
    }
  });

  // Overall statistics
  const etCount = countKeys(et);
  const ukrCount = countKeys(ukr);

  log("gray", `\n📈 Overall Statistics:`);
  log("gray", `   Estonian: ${etCount} keys across ${etFiles.length} files`);
  log("gray", `   Ukrainian: ${ukrCount} keys across ${ukrFiles.length} files`);

  if (!hasErrors) {
    log("green", "\n✅ All translations are in sync!");
  } else {
    log(
      "red",
      `\n📊 Total issues: ${
        missingInUkr.length +
        missingInEt.length +
        missingFilesInUkr.length +
        missingFilesInEt.length
      }`
    );
  }

  if (hasErrors) {
    console.log("");
    log("red", "❌ Build failed due to missing translations!");
    log(
      "yellow",
      "💡 Tip: Make sure to add translations for all languages when adding new keys."
    );
    log(
      "yellow",
      '💡 Run "node scripts/split-translations.js" if you need to migrate from old structure.'
    );
    process.exit(1);
  }
}

// Check if running in CI environment
const isCI = process.env.CI === "true";
if (isCI) {
  console.log("Running in CI environment...\n");
}

// Run the check
try {
  checkTranslations();
} catch (error) {
  log("red", `❌ Unexpected error: ${error.message}`);
  process.exit(1);
}
