/**
 * Custom next/image loader that points straight at wsrv.nl.
 *
 * The meal photos were already being served through wsrv.nl and then sent
 * through Vercel's image optimizer on top — two resizers in a row, with only
 * the second one metered. Going direct takes Vercel's image transformations to
 * zero while keeping next/image's responsive srcset and lazy loading.
 */

const WSRV_ORIGIN = 'https://wsrv.nl/';

interface ImageLoaderArgs {
    src: string;
    width: number;
    quality?: number;
}

export default function wsrvImageLoader({ src, width, quality }: ImageLoaderArgs): string {
    // Sources arrive either already wrapped (ETH, via getImageUrl) or raw (UZH).
    // Unwrap first so one wsrv request never ends up nested inside another.
    let target = src;
    if (src.startsWith(WSRV_ORIGIN)) {
        try {
            const inner = new URL(src).searchParams.get('url');
            if (inner) target = inner;
        } catch {
            // Malformed URL — fall through and pass it along unchanged.
        }
    }

    const params = new URLSearchParams({
        url: target,
        w: String(width),
        q: String(quality ?? 80),
        // wsrv does not negotiate on Accept, so ask for WebP explicitly.
        // (It has no AVIF support — that request returns a JSON error.)
        output: 'webp',
    });

    // `we` = never enlarge. Some ETH sources are only ~350px wide, and scaling
    // those up to a 640px variant produced a file twice the size of the original.
    return `${WSRV_ORIGIN}?${params.toString()}&we`;
}
