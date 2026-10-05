const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const iconsDir = path.join(__dirname, "..", "public", "icons");
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Crisp SVG of the Wallet App Icon matching the app's branding
const svgIcon = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="112" fill="#080e1a"/>
  <rect x="24" y="24" width="464" height="464" rx="96" fill="#0c1424" stroke="#1b2844" stroke-width="8"/>
  <g transform="translate(106, 106) scale(0.5859)">
    <!-- Emerald glowing wallet badge -->
    <rect x="0" y="0" width="512" height="512" rx="110" fill="#00d68f"/>
    <!-- Wallet shape in dark navy / black -->
    <path d="M416 160H112C94.3269 160 80 174.327 80 192V368C80 385.673 94.3269 400 112 400H416C433.673 400 448 385.673 448 368V192C448 174.327 433.673 160 416 160Z" fill="#080e1a"/>
    <path d="M112 112H384V160H80V144C80 126.327 94.3269 112 112 112Z" fill="#080e1a" opacity="0.85"/>
    <path d="M352 256C352 238.327 366.327 224 384 224H448V336H384C366.327 336 352 321.673 352 304V256Z" fill="#0c1424" stroke="#00d68f" stroke-width="12"/>
    <circle cx="392" cy="280" r="20" fill="#00d68f"/>
  </g>
</svg>
`;

// Maskable version with safe zone padding
const svgMaskable = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#080e1a"/>
  <g transform="translate(136, 136) scale(0.46875)">
    <rect x="0" y="0" width="512" height="512" rx="110" fill="#00d68f"/>
    <path d="M416 160H112C94.3269 160 80 174.327 80 192V368C80 385.673 94.3269 400 112 400H416C433.673 400 448 385.673 448 368V192C448 174.327 433.673 160 416 160Z" fill="#080e1a"/>
    <path d="M112 112H384V160H80V144C80 126.327 94.3269 112 112 112Z" fill="#080e1a" opacity="0.85"/>
    <path d="M352 256C352 238.327 366.327 224 384 224H448V336H384C366.327 336 352 321.673 352 304V256Z" fill="#0c1424" stroke="#00d68f" stroke-width="12"/>
    <circle cx="392" cy="280" r="20" fill="#00d68f"/>
  </g>
</svg>
`;

async function generate() {
  fs.writeFileSync(path.join(iconsDir, "icon.svg"), svgIcon.trim());

  const svgBuffer = Buffer.from(svgIcon);
  const maskableBuffer = Buffer.from(svgMaskable);

  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(iconsDir, "icon-512x512.png"));

  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(iconsDir, "icon-192x192.png"));

  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(iconsDir, "apple-touch-icon.png"));

  await sharp(maskableBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(iconsDir, "maskable-icon-512x512.png"));

  console.log("PWA Icons generated successfully!");
}

generate().catch(console.error);
