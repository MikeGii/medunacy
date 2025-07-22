const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const messagesDir = path.join(__dirname, '../messages');

console.log('👀 Watching translation files for changes...\n');

fs.watch(messagesDir, (eventType, filename) => {
  if (filename && filename.endsWith('.json')) {
    console.log(`\n📝 ${filename} was ${eventType}d`);
    exec('npm run check-translations', (error, stdout, stderr) => {
      console.log(stdout);
      if (error) {
        console.error(stderr);
      }
    });
  }
});