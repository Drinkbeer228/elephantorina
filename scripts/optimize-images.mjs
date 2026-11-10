#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

// Configuration
const DEFAULT_DIRECTORIES = ['src/assets', 'public/assets'];
const TARGET_EXTENSIONS = ['.png', '.jpg', '.jpeg'];
const DEFAULT_QUALITY = 80;

// Parse CLI flags
const args = process.argv.slice(2);
const qualityArg = args.find((a) => a.startsWith('--quality='));
const quality = qualityArg ? parseInt(qualityArg.split('=')[1], 10) : DEFAULT_QUALITY;
const shouldReplace = args.includes('--replace') || args.includes('-r');
const isDryRun = args.includes('--dry-run');

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function findImages(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findImages(fullPath));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (TARGET_EXTENSIONS.includes(ext)) {
        files.push(fullPath);
      }
    }
  }
  return files;
}

async function optimizeImage(filePath) {
  const ext = path.extname(filePath);
  const webpPath = filePath.slice(0, -ext.length) + '.webp';
  const originalSize = fs.statSync(filePath).size;

  if (isDryRun) {
    return {
      file: filePath,
      originalSize,
      newSize: 0,
      saved: 0,
      ratio: '0%',
      skipped: true,
    };
  }

  // Convert to WebP using sharp
  await sharp(filePath)
    .webp({ quality, effort: 6 })
    .toFile(webpPath);

  const newSize = fs.statSync(webpPath).size;
  const saved = originalSize - newSize;
  const ratio = originalSize > 0 ? ((saved / originalSize) * 100).toFixed(1) + '%' : '0%';

  if (shouldReplace && filePath !== webpPath) {
    fs.unlinkSync(filePath);
  }

  return {
    file: path.relative(process.cwd(), filePath),
    webp: path.relative(process.cwd(), webpPath),
    originalSize,
    newSize,
    saved,
    ratio,
    skipped: false,
  };
}

async function main() {
  console.log('='.repeat(70));
  console.log(`🖼️  Asset Image Optimizer (WebP @ quality ${quality}%)`);
  if (isDryRun) console.log('   Mode: DRY RUN (no files modified)');
  if (shouldReplace) console.log('   Mode: REPLACE (original files will be removed)');
  console.log('='.repeat(70));

  const targetDirs = args.filter((a) => !a.startsWith('-')).length > 0
    ? args.filter((a) => !a.startsWith('-'))
    : DEFAULT_DIRECTORIES;

  const images = targetDirs.flatMap(findImages);

  if (images.length === 0) {
    console.log('✨ No unoptimized JPG/PNG images found. Everything is already optimized!\n');
    return;
  }

  console.log(`Found ${images.length} candidate file(s) for optimization...\n`);

  let totalOriginal = 0;
  let totalNew = 0;

  for (const img of images) {
    try {
      const result = await optimizeImage(img);
      totalOriginal += result.originalSize;
      totalNew += result.newSize;

      console.log(
        `✓ ${result.file} -> ${path.basename(result.webp)}: ` +
        `${formatBytes(result.originalSize)} -> ${formatBytes(result.newSize)} ` +
        `(-${result.ratio})`
      );
    } catch (err) {
      console.error(`✗ Error optimizing ${img}:`, err.message);
    }
  }

  const totalSaved = totalOriginal - totalNew;
  const totalPercent = totalOriginal > 0 ? ((totalSaved / totalOriginal) * 100).toFixed(1) : 0;

  console.log('\n' + '-'.repeat(70));
  console.log(`Total original size:   ${formatBytes(totalOriginal)}`);
  console.log(`Total optimized size:  ${formatBytes(totalNew)}`);
  console.log(`Total storage saved:   ${formatBytes(totalSaved)} (-${totalPercent}%)`);
  console.log('-'.repeat(70) + '\n');
}

main().catch((err) => {
  console.error('Fatal optimization failure:', err);
  process.exit(1);
});
