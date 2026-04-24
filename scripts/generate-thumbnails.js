import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths relative to this script
const photosDir = path.join(__dirname, '../../photos');
const thumbnailsDir = path.join(photosDir, 'thumbnails');

console.log(`Starting thumbnail generation...\nLooking for photos in: ${photosDir}`);

// Make sure the main photos directory exists
if (!fs.existsSync(photosDir)) {
  console.log(`❌ Error: Photos directory does not exist at ${photosDir}`);
  console.log('Please create it and add some photos first.');
  process.exit(1);
}

// Create the thumbnails directory if it doesn't exist
if (!fs.existsSync(thumbnailsDir)) {
  console.log(`Creating thumbnails directory at ${thumbnailsDir}...`);
  fs.mkdirSync(thumbnailsDir, { recursive: true });
}

async function processPhotos() {
  const files = fs.readdirSync(photosDir);
  const supportedExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.heic'];

  let processedCount = 0;
  let skippedCount = 0;

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    
    // Skip if it's not a supported format or if it's a directory
    if (!supportedExts.includes(ext) || fs.statSync(path.join(photosDir, file)).isDirectory()) {
      continue;
    }

    const baseName = path.basename(file, path.extname(file));
    const inputFile = path.join(photosDir, file);
    const outputFile = path.join(thumbnailsDir, `${baseName}.webp`);

    // Skip if thumbnail already exists to save time on subsequent runs
    if (fs.existsSync(outputFile)) {
      skippedCount++;
      continue;
    }

    try {
      console.log(`⏳ Converting ${file}...`);
      await sharp(inputFile)
        .resize({ width: 600, height: 600, fit: 'inside' }) // proportional resize
        .webp({ quality: 80 }) // modern, lightweight format
        .withMetadata() // tries to preserve image rotation/orientation
        .toFile(outputFile);
      processedCount++;
    } catch (err) {
      console.error(`❌ Error processing ${file}:`, err.message);
    }
  }

  console.log(`\n✅ Finished! \nProcessed newly: ${processedCount} \nSkipped (already exist): ${skippedCount}`);
}

processPhotos().catch(console.error);
