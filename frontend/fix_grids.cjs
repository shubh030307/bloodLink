const fs = require('fs');
const path = require('path');

const directory = path.join(__dirname, 'src');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

let modifiedCount = 0;

walkDir(directory, function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Replace specific grid layouts
    content = content.replace(/className="([^"]*)grid-cols-2([^"]*)"/g, (match, p1, p2) => {
      // If it already has md: or sm: or lg:, skip
      if (p1.includes('md:grid-cols-2') || p1.includes('sm:grid-cols-2') || p1.includes('lg:grid-cols-2')) return match;
      return `className="${p1}grid-cols-1 sm:grid-cols-2${p2}"`;
    });

    content = content.replace(/className="([^"]*)grid-cols-3([^"]*)"/g, (match, p1, p2) => {
      if (p1.includes('md:grid-cols-3') || p1.includes('sm:grid-cols-3') || p1.includes('lg:grid-cols-3')) return match;
      return `className="${p1}grid-cols-1 sm:grid-cols-2 md:grid-cols-3${p2}"`;
    });

    content = content.replace(/className="([^"]*)grid-cols-4([^"]*)"/g, (match, p1, p2) => {
      if (p1.includes('md:grid-cols-4') || p1.includes('sm:grid-cols-4') || p1.includes('lg:grid-cols-4')) return match;
      return `className="${p1}grid-cols-2 md:grid-cols-4${p2}"`;
    });

    content = content.replace(/className="([^"]*)grid-cols-5([^"]*)"/g, (match, p1, p2) => {
      if (p1.includes('md:grid-cols-5') || p1.includes('sm:grid-cols-5') || p1.includes('lg:grid-cols-5')) return match;
      return `className="${p1}grid-cols-2 md:grid-cols-3 lg:grid-cols-5${p2}"`;
    });

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated grids in:', filePath);
      modifiedCount++;
    }
  }
});

console.log(`Finished fixing grids in ${modifiedCount} files.`);
