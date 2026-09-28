/**
 * Generates every app icon, favicon and PWA splash screen from one source SVG.
 *
 *   npm run generate-icons
 *
 * Source: assets/mensa-mate-icon.svg
 *
 * Re-run this after editing the icon — the splash screens embed it too, so
 * updating only the icons leaves the iOS launch screen showing the old logo.
 */

import sharp from 'sharp';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = join(ROOT, 'assets', 'mensa-mate-icon.svg');

/** The literal colours in the source, by the role each one plays. */
const SOURCE_GROUND = '#f3f2f2';
const SOURCE_BOWL = '#201e1d';
const SOURCE_ACCENT = '#ec3013';

/**
 * Splash palettes. These mirror --background-color / --text-color in
 * globals.css, so the launch screen matches the app's own chrome.
 *
 * Dark mode inverts the neutrals: the source bowl (#201e1d) on #121212 is
 * effectively invisible, leaving only a floating rim highlight and the
 * chopsticks. The accent is deliberately identical in both themes.
 */
const SPLASH_THEMES = [
    { name: 'light', ground: '#f7f9fc', bowl: SOURCE_BOWL },
    { name: 'dark', ground: '#121212', bowl: '#e0e0e0' },
];

/**
 * The glyph's width as a fraction of the splash canvas width, carried over from
 * the splash screens this replaces so the launch screen's proportions hold.
 */
const SPLASH_GLYPH_WIDTH_FRACTION = 0.1615;

/**
 * Android crops maskable icons to a circle and guarantees only the middle 80%,
 * i.e. a radius of 204.8px on a 512px canvas. The glyph is scaled so its
 * furthest ink sits inside that with a margin, measured rather than assumed —
 * see fitMaskableWidthFraction.
 */
const MASKABLE_SAFE_RADIUS = 512 * 0.4;
const MASKABLE_MARGIN = 0.93;

/** device CSS width x height @ dpr — the set referenced by layout.tsx. */
const SPLASH_TARGETS = [
    [360, 780, 3], [375, 667, 2], [375, 812, 3], [390, 844, 3],
    [393, 852, 3], [402, 874, 3], [414, 736, 3], [414, 896, 2],
    [414, 896, 3], [428, 926, 3], [430, 932, 3], [440, 956, 3],
];

const source = await readFile(SOURCE, 'utf8');

for (const [role, colour] of [['ground', SOURCE_GROUND], ['bowl', SOURCE_BOWL], ['accent', SOURCE_ACCENT]]) {
    if (!source.includes(colour)) {
        throw new Error(`${SOURCE} no longer contains the ${role} colour ${colour} — update the palette in this script`);
    }
}

/** The icon exactly as designed, backdrop included. */
function iconSvg() {
    return Buffer.from(source);
}

/**
 * The artwork with its full-canvas backdrop removed, recoloured for a theme.
 *
 * Stripping the <rect> first is what lets one colour serve two roles: the only
 * remaining SOURCE_GROUND fill is the ellipse that cuts the bowl's inner rim,
 * so setting it to the splash background makes the rim read correctly against
 * whatever the glyph is placed on.
 */
function glyphSvg({ ground, bowl }) {
    const withoutBackdrop = source.replace(
        /\n\s*<rect x="0" y="0" width="512" height="512"[^>]*><\/rect>/,
        ''
    );
    if (withoutBackdrop === source) {
        throw new Error(`${SOURCE}: could not strip the full-canvas backdrop <rect> — check its markup`);
    }
    return Buffer.from(
        withoutBackdrop
            .replaceAll(SOURCE_GROUND, ground)
            .replaceAll(SOURCE_BOWL, bowl)
    );
}

/**
 * The glyph rasterised and trimmed to its ink.
 *
 * Trimming matters because the artwork is not centred in its artboard — the ink
 * sits ~11px high, and the chopsticks make it asymmetric. Centring the artboard
 * would carry that offset onto every splash screen; centring the trimmed ink
 * puts the logo where the eye expects it.
 */
async function trimmedGlyph(theme, renderWidth) {
    // Rasterise well above the target so the trim lands on clean edges, then
    // scale the trimmed result down to the requested width.
    const large = await sharp(glyphSvg(theme), { density: 600 })
        .resize(1024, 1024, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer();

    const ink = await sharp(large).trim({ threshold: 1 }).png().toBuffer();

    return sharp(ink)
        .resize({ width: renderWidth, fit: 'inside' })
        .png()
        .toBuffer();
}

/** Furthest distance from the centre of `png` at which any pixel is opaque. */
async function maxInkRadius(png) {
    const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const cx = (info.width - 1) / 2;
    const cy = (info.height - 1) / 2;
    let max = 0;

    for (let y = 0; y < info.height; y++) {
        for (let x = 0; x < info.width; x++) {
            if (data[(y * info.width + x) * info.channels + 3] > 10) {
                const r = Math.hypot(x - cx, y - cy);
                if (r > max) max = r;
            }
        }
    }

    return max;
}

/**
 * Glyph ink width, as a fraction of canvas width, that keeps every pixel inside
 * Android's safe circle. Measured from the rendered artwork so a redesign
 * cannot quietly break it.
 *
 * The glyph's furthest ink scales linearly with its width, so probing once at a
 * known width gives the ratio directly: at ink width W the radius is
 * `radius * (W / PROBE_WIDTH)`, and solving that against the allowed radius
 * yields the width fraction below. Note this is a fraction of the *canvas*, not
 * of the artwork's own inset within its artboard — trimmedGlyph is driven by
 * ink width, so applying the artboard inset again would shrink it twice.
 */
const MASKABLE_PROBE_WIDTH = 512;

async function fitMaskableWidthFraction() {
    const probe = await trimmedGlyph(SPLASH_THEMES[0], MASKABLE_PROBE_WIDTH);
    const radius = await maxInkRadius(probe);
    const allowed = MASKABLE_SAFE_RADIUS * MASKABLE_MARGIN;
    return Math.min(1, (allowed / radius) * (MASKABLE_PROBE_WIDTH / 512));
}

/**
 * A square icon: the artwork on an opaque background.
 *
 * Opaque matters on iOS, which does not support transparency in home-screen
 * icons and composites a transparent PNG onto black. Corners stay square
 * because iOS and Android apply their own masks; pre-rounding them shows as a
 * dark fringe inside the system's rounding.
 *
 * `flatten` drops the alpha channel, leaving a 3-channel RGB PNG. That is fine
 * on its own but Turbopack's ICO decoder rejects non-RGBA payloads at build
 * time, so the channel is added back — fully opaque, so the flatten still does
 * its job.
 */
function renderIcon(size) {
    return sharp(iconSvg(), { density: 600 })
        .resize(size, size)
        .flatten({ background: SOURCE_GROUND })
        .ensureAlpha()
        .png()
        .toBuffer();
}

/** The maskable variant: the glyph inset on the icon's ground colour. */
async function renderMaskable(size, widthFraction) {
    const glyph = await trimmedGlyph(
        { ground: SOURCE_GROUND, bowl: SOURCE_BOWL },
        Math.round(size * widthFraction)
    );
    return sharp({ create: { width: size, height: size, channels: 4, background: SOURCE_GROUND } })
        .composite([{ input: glyph, gravity: 'center' }])
        .png()
        .toBuffer();
}

/**
 * Minimal ICO container around PNG payloads.
 *
 * sharp cannot write ICO, and the format is simple enough not to warrant a
 * dependency: a 6-byte header, one 16-byte directory entry per image, then the
 * PNG bytes. PNG-compressed ICO entries are understood by every browser in use.
 */
function buildIco(images) {
    const header = Buffer.alloc(6);
    header.writeUInt16LE(0, 0); // reserved
    header.writeUInt16LE(1, 2); // 1 = icon
    header.writeUInt16LE(images.length, 4);

    let offset = 6 + images.length * 16;
    const entries = [];

    for (const { size, data } of images) {
        const entry = Buffer.alloc(16);
        entry.writeUInt8(size >= 256 ? 0 : size, 0); // 0 encodes 256
        entry.writeUInt8(size >= 256 ? 0 : size, 1);
        entry.writeUInt8(0, 2);  // palette size, 0 for true colour
        entry.writeUInt8(0, 3);  // reserved
        entry.writeUInt16LE(1, 4);  // colour planes
        entry.writeUInt16LE(32, 6); // bits per pixel
        entry.writeUInt32LE(data.length, 8);
        entry.writeUInt32LE(offset, 12);
        entries.push(entry);
        offset += data.length;
    }

    return Buffer.concat([header, ...entries, ...images.map(i => i.data)]);
}

async function write(relativePath, data) {
    const target = join(ROOT, relativePath);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, data);
    console.log(`  ${relativePath} (${(data.length / 1024).toFixed(1)} KB)`);
}

console.log('icons');

// Modern browsers prefer the vector; it stays crisp at any size and in the tab
// strip on high-DPI displays.
await write('src/app/icon.svg', iconSvg());

await write('src/app/favicon.ico', buildIco(
    await Promise.all([16, 32, 48].map(async size => ({ size, data: await renderIcon(size) })))
));

// iOS home screen. 180px is the largest size iOS asks for; it downsamples for
// smaller slots itself.
const appleIcon = await renderIcon(180);
await write('src/app/apple-icon.png', appleIcon);
// iOS also probes this root path directly when no <link> is honoured.
await write('public/apple-touch-icon.png', appleIcon);

for (const size of [192, 512]) {
    await write(`public/android-chrome-${size}x${size}.png`, await renderIcon(size));
}

const maskableWidth = await fitMaskableWidthFraction();
console.log(`  (maskable glyph set to ${(maskableWidth * 100).toFixed(0)}% of canvas width to clear Android's safe circle)`);
await write('public/icon-maskable-512.png', await renderMaskable(512, maskableWidth));

console.log('splash screens');

for (const [cssWidth, cssHeight, dpr] of SPLASH_TARGETS) {
    const width = cssWidth * dpr;
    const height = cssHeight * dpr;
    const glyphWidth = Math.round(width * SPLASH_GLYPH_WIDTH_FRACTION);

    for (const theme of SPLASH_THEMES) {
        const glyph = await trimmedGlyph(theme, glyphWidth);
        const data = await sharp({
            create: { width, height, channels: 4, background: theme.ground },
        })
            .composite([{ input: glyph, gravity: 'center' }])
            .png()
            .toBuffer();
        await write(`public/splash/splash-${cssWidth}x${cssHeight}@${dpr}x-${theme.name}.png`, data);
    }
}

console.log('done');
