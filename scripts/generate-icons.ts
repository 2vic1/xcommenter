/**
 * Generate PWA PNG icons (192x192, 512x512) from SVG sources using sharp.
 * Run with: bun run scripts/generate-icons.ts
 */
import sharp from 'sharp';
import { readFile } from 'fs/promises';
import path from 'path';

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const SCRIPTS_DIR = path.join(process.cwd(), 'scripts');

async function main() {
  const iconSvg = await readFile(path.join(SCRIPTS_DIR, 'icon.svg'));
  const maskableSvg = await readFile(path.join(SCRIPTS_DIR, 'icon-maskable.svg'));

  const tasks = [
    sharp(iconSvg).resize(192, 192).png().toFile(path.join(PUBLIC_DIR, 'icon-192.png')),
    sharp(iconSvg).resize(512, 512).png().toFile(path.join(PUBLIC_DIR, 'icon-512.png')),
    sharp(maskableSvg).resize(192, 192).png().toFile(path.join(PUBLIC_DIR, 'icon-192-maskable.png')),
    sharp(maskableSvg).resize(512, 512).png().toFile(path.join(PUBLIC_DIR, 'icon-512-maskable.png')),
    // Apple touch icon (180x180, no transparency)
    sharp(iconSvg).resize(180, 180).flatten({ background: '#000000' }).png().toFile(path.join(PUBLIC_DIR, 'apple-touch-icon.png')),
    // Favicon
    sharp(iconSvg).resize(32, 32).png().toFile(path.join(PUBLIC_DIR, 'favicon-32.png')),
  ];

  await Promise.all(tasks);
  console.log('✓ PWA icons generated in /public');
}

main().catch((err) => {
  console.error('Failed to generate icons:', err);
  process.exit(1);
});
