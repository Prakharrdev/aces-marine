const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');
const SRC = path.join(ROOT, 'src');

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src)) {
    const s = path.join(src, entry);
    const d = path.join(dest, entry);
    if (fs.statSync(s).isDirectory()) {
      copyDir(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

// 1. Build HTML from partials
const partials = [
  '_head.html', '_nav.html', '_hero.html', '_about.html',
  '_expertise.html', '_reviews.html', '_projects.html',
  '_serving.html', '_map.html',
  '_footer.html', '_scripts.html',
];

const html = partials
  .map(file => fs.readFileSync(path.join(SRC, file), 'utf-8'))
  .join('\n');

// Write compiled site to root index.html (dev + committed artifact)
fs.writeFileSync(path.join(ROOT, 'index.html'), html);

// 2. Assemble dist/
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });

fs.copyFileSync(path.join(ROOT, 'index.html'), path.join(DIST, 'index.html'));

for (const dir of ['images', 'css', 'js', 'assets']) {
  const srcPath = path.join(ROOT, dir);
  if (fs.existsSync(srcPath)) {
    copyDir(srcPath, path.join(DIST, dir));
  }
}

if (fs.existsSync(path.join(ROOT, 'hero-section-video.mp4'))) {
  fs.copyFileSync(
    path.join(ROOT, 'hero-section-video.mp4'),
    path.join(DIST, 'hero-section-video.mp4')
  );
}

console.log('Built dist/');