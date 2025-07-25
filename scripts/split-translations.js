// scripts/split-translations.js
const fs = require("fs");
const path = require("path");

// Create directories if they don't exist
const etDir = path.join(__dirname, "../messages/et");
const ukrDir = path.join(__dirname, "../messages/ukr");

if (!fs.existsSync(etDir)) {
  fs.mkdirSync(etDir, { recursive: true });
}
if (!fs.existsSync(ukrDir)) {
  fs.mkdirSync(ukrDir, { recursive: true });
}

// Load existing translations
const etPath = path.join(__dirname, "../messages/et.json");
const ukrPath = path.join(__dirname, "../messages/ukr.json");

// Check if source files exist
if (!fs.existsSync(etPath) || !fs.existsSync(ukrPath)) {
  console.error("❌ Source translation files not found!");
  console.error("Make sure et.json and ukr.json exist in the messages folder.");
  process.exit(1);
}

const etTranslations = JSON.parse(fs.readFileSync(etPath, "utf-8"));
const ukrTranslations = JSON.parse(fs.readFileSync(ukrPath, "utf-8"));

// Define which top-level keys go into which files
const categoryMapping = {
  "common.json": [
    "common",
    "navigation",
    "errors",
    "datetime",
    "languages",
    "language_levels",
    "actions",
    "validation",
    "success",
    "status", // Add if exists
    "time", // Add if exists
    "general", // Add if exists
  ],
  "auth.json": [
    "auth",
    "header", // Header might have auth-related content
  ],
  "landing.json": ["hero", "services", "team", "faq"],
  "profile.json": ["profile"],
  "forum.json": ["forum"],
  "exam.json": [
    "exam_tests",
    "test_creation",
    "test_management", // Add if exists
    "test_categories", // Add if exists
    "questions", // Add if exists
    "exam_session_results",
  ],
  "courses.json": [
    "courses",
    "courses_panel",
    "course_management", // Add if exists
  ],
  "admin.json": [
    "roles",
    "users",
    "dashboard",
    "admin", // Add if exists
    "user_management", // Add if exists
  ],
};

// Function to extract specific keys from translations
function extractKeys(translations, keys) {
  const extracted = {};
  keys.forEach((key) => {
    if (translations[key] !== undefined) {
      extracted[key] = translations[key];
    }
  });
  return extracted;
}

// Ensure all required files exist
const requiredFiles = Object.keys(categoryMapping);

// Process files
Object.entries(categoryMapping).forEach(([filename, keys]) => {
  console.log(`\n📝 Processing ${filename}...`);

  // Extract Estonian
  const etData = extractKeys(etTranslations, keys);

  // Always create the file, even if empty
  fs.writeFileSync(path.join(etDir, filename), JSON.stringify(etData, null, 2));

  if (Object.keys(etData).length > 0) {
    console.log(
      `   ✅ Created Estonian ${filename} with ${
        Object.keys(etData).length
      } sections`
    );
  } else {
    console.log(
      `   ⚠️  Created empty Estonian ${filename} (no matching keys found)`
    );
  }

  // Extract Ukrainian
  const ukrData = extractKeys(ukrTranslations, keys);

  // Always create the file, even if empty
  fs.writeFileSync(
    path.join(ukrDir, filename),
    JSON.stringify(ukrData, null, 2)
  );

  if (Object.keys(ukrData).length > 0) {
    console.log(
      `   ✅ Created Ukrainian ${filename} with ${
        Object.keys(ukrData).length
      } sections`
    );
  } else {
    console.log(
      `   ⚠️  Created empty Ukrainian ${filename} (no matching keys found)`
    );
  }
});

// Check for any unmapped keys
console.log("\n🔍 Checking for unmapped keys...");
const allMappedKeys = Object.values(categoryMapping).flat();
const etKeys = Object.keys(etTranslations);
const ukrKeys = Object.keys(ukrTranslations);

const unmappedEtKeys = etKeys.filter((key) => !allMappedKeys.includes(key));
const unmappedUkrKeys = ukrKeys.filter((key) => !allMappedKeys.includes(key));

if (unmappedEtKeys.length > 0) {
  console.log("⚠️  Unmapped Estonian keys:", unmappedEtKeys);
  console.log(
    "   Consider adding these to one of the category mappings above."
  );
}
if (unmappedUkrKeys.length > 0) {
  console.log("⚠️  Unmapped Ukrainian keys:", unmappedUkrKeys);
  console.log(
    "   Consider adding these to one of the category mappings above."
  );
}

// Summary
console.log("\n📊 Summary:");
console.log(`✅ Created ${requiredFiles.length} files for each language`);
console.log(`📁 Files created in:`);
console.log(`   - ${etDir}`);
console.log(`   - ${ukrDir}`);

// List all created files
console.log("\n📄 Created files:");
requiredFiles.forEach((file) => {
  const etFilePath = path.join(etDir, file);
  const ukrFilePath = path.join(ukrDir, file);
  const etSize = fs.statSync(etFilePath).size;
  const ukrSize = fs.statSync(ukrFilePath).size;
  console.log(`   - ${file}: ET (${etSize} bytes), UKR (${ukrSize} bytes)`);
});

console.log("\n✅ Translation split complete!");
console.log("💡 Next step: Update your i18n.ts to include all these modules:");
console.log(
  `   const modules = ${JSON.stringify(
    requiredFiles.map((f) => f.replace(".json", "")),
    null,
    2
  )};`
);
