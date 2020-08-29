require('dotenv').config();

const fs = require('fs');

fs.readdir('results', (err, files) => {
  files.forEach(async (file) => {
    if (file.startsWith('EE')) {
      await fs.promises.unlink(`results/${file}`);
    }
  });
});
