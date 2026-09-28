/**
 * Parser for the React Server Components "flight" payload that Food2050 embeds
 * in its pages.
 *
 * Food2050 used to be a Pages Router app and shipped its data as a single JSON
 * blob in `<script id="__NEXT_DATA__">`. It has since moved to the App Router,
 * which streams the same GraphQL result as a sequence of
 * `self.__next_f.push([1, "<chunk>"])` calls instead. The data is unchanged —
 * only the envelope is — so this module's job is to get from that envelope back
 * to a plain JSON object.
 *
 * Three details of the format matter here:
 *
 *  1. A single logical payload is split across several `push` calls at
 *     arbitrary byte offsets, so a row can straddle a chunk boundary. All
 *     chunks have to be concatenated before anything is parsed.
 *  2. The concatenated stream is newline-separated rows of `<hex id>:<json>`.
 *     The same id can appear more than once (React re-emits rows as the stream
 *     resolves), and the *first* occurrence is not necessarily the complete one
 *     — so every candidate is kept and the caller picks whichever one actually
 *     contains the data.
 *  3. Repeated subtrees are deduplicated into `$`-prefixed path references such
 *     as `"$7:props:outlet:...:allergen"`. Left unresolved these surface as raw
 *     strings where objects are expected, which is how allergens would end up
 *     rendering as literal `$7:props:...` text.
 */

/** Rows keyed by id; a single id may have several candidate payloads. */
type RowIndex = Map<string, unknown[]>;

export interface FlightDocument {
    /** Every successfully parsed row, in document order. */
    rows: unknown[];
    /**
     * Return a copy of `value` with all `$` path references replaced by the
     * subtree they point at.
     */
    hydrate<T>(value: T): T;
}

/**
 * React element rows are `["$", type, key, props]`. A reference path addresses
 * the props object by name rather than by index, so `props` has to map onto
 * slot 3 when walking one.
 */
const ELEMENT_PROPS_SLOT = 3;

/** Guards against a malformed payload producing unbounded recursion. */
const MAX_HYDRATE_DEPTH = 64;

function extractChunks(html: string): string[] {
    // The argument is a JS string literal, so JSON.parse handles the unescaping
    // (\" and \uXXXX) that a naive regex capture would leave behind.
    const chunks: string[] = [];
    const pattern = /self\.__next_f\.push\(\[1,\s*("(?:[^"\\]|\\.)*")\s*\]\)/g;

    let match: RegExpExecArray | null;
    while ((match = pattern.exec(html)) !== null) {
        try {
            chunks.push(JSON.parse(match[1]) as string);
        } catch {
            // A chunk we cannot unescape is not recoverable; skip it rather
            // than discarding the rest of the payload.
        }
    }

    return chunks;
}

function indexRows(flight: string): { rows: unknown[]; byId: RowIndex } {
    const rows: unknown[] = [];
    const byId: RowIndex = new Map();

    for (const line of flight.split('\n')) {
        const separator = line.indexOf(':');
        if (separator < 1) continue;

        const id = line.slice(0, separator);
        if (!/^[0-9a-f]+$/i.test(id)) continue;

        const body = line.slice(separator + 1);
        // Everything we care about is an object or array. Scalar rows are
        // module/chunk bookkeeping (`I[...]`, `"$Sreact.fragment"`).
        if (body[0] !== '[' && body[0] !== '{') continue;

        let parsed: unknown;
        try {
            parsed = JSON.parse(body);
        } catch {
            continue;
        }

        rows.push(parsed);
        const existing = byId.get(id);
        if (existing) existing.push(parsed);
        else byId.set(id, [parsed]);
    }

    return { rows, byId };
}

/** Walk one segment of a reference path. */
function step(current: unknown, segment: string): unknown {
    if (current === null || typeof current !== 'object') return undefined;

    if (Array.isArray(current)) {
        if (current[0] === '$' && segment === 'props') {
            return current[ELEMENT_PROPS_SLOT];
        }
        const index = Number(segment);
        return Number.isInteger(index) ? current[index] : undefined;
    }

    return (current as Record<string, unknown>)[segment];
}

function resolveReference(ref: string, byId: RowIndex): unknown {
    const [id, ...path] = ref.slice(1).split(':');

    // Try every candidate row for this id — an early, partial emission of the
    // row may not contain the full path yet.
    for (const candidate of byId.get(id) ?? []) {
        let current: unknown = candidate;
        let ok = true;

        for (const segment of path) {
            current = step(current, segment);
            if (current === undefined) {
                ok = false;
                break;
            }
        }

        if (ok && current !== undefined) return current;
    }

    return undefined;
}

function hydrateValue(value: unknown, byId: RowIndex, depth: number, seen: Set<object>): unknown {
    if (depth > MAX_HYDRATE_DEPTH) return value;

    if (typeof value === 'string') {
        // `$$foo` is how the format escapes a literal string starting with `$`.
        if (value.startsWith('$$')) return value.slice(1);

        // A reference is `$<hex row id>:<path>`. Other `$` forms (`$L25`,
        // `$Sreact.fragment`, `$undefined`) are React internals with no data
        // meaning, so they are passed through untouched.
        if (/^\$[0-9a-f]+:/i.test(value)) {
            const resolved = resolveReference(value, byId);
            if (resolved === undefined) return undefined;
            return hydrateValue(resolved, byId, depth + 1, seen);
        }

        return value;
    }

    if (value === null || typeof value !== 'object') return value;

    // A reference can point at an ancestor; without this a cycle would recurse
    // until the depth cap and return a half-built object.
    if (seen.has(value)) return undefined;
    seen.add(value);

    try {
        if (Array.isArray(value)) {
            return value.map(item => hydrateValue(item, byId, depth + 1, seen));
        }

        const out: Record<string, unknown> = {};
        for (const [key, item] of Object.entries(value)) {
            out[key] = hydrateValue(item, byId, depth + 1, seen);
        }
        return out;
    } finally {
        seen.delete(value);
    }
}

/**
 * Parse the flight payload out of a Food2050 HTML page.
 *
 * Returns `null` when the page carries no parseable payload at all — which is
 * the signal that the upstream format has changed again, and is deliberately
 * distinct from "parsed fine, but this outlet has no menu".
 */
export function parseFlightDocument(html: string): FlightDocument | null {
    const chunks = extractChunks(html);
    if (chunks.length === 0) return null;

    const { rows, byId } = indexRows(chunks.join(''));
    if (rows.length === 0) return null;

    return {
        rows,
        hydrate<T>(value: T): T {
            return hydrateValue(value, byId, 0, new Set()) as T;
        },
    };
}

/**
 * Depth-first search for the first node in `root` satisfying `predicate`.
 * Used to locate the outlet payload by shape instead of by row id, since row
 * ids are assigned by the streaming order and are not stable between pages.
 */
export function findNode(
    root: unknown,
    predicate: (node: Record<string, unknown>) => boolean,
    depth = 0
): Record<string, unknown> | undefined {
    if (depth > MAX_HYDRATE_DEPTH || root === null || typeof root !== 'object') {
        return undefined;
    }

    if (!Array.isArray(root) && predicate(root as Record<string, unknown>)) {
        return root as Record<string, unknown>;
    }

    for (const child of Object.values(root)) {
        const found = findNode(child, predicate, depth + 1);
        if (found) return found;
    }

    return undefined;
}
