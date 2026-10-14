let browserLocales = typeof navigator !== 'undefined'
    ? (navigator.languages === undefined ? [navigator.language] : navigator.languages)
    : ['en-US'];

if (typeof browserLocales === 'undefined') {
    browserLocales = ['en-US'];
}

browserLocales = browserLocales.filter((l) => l.length > 2).map(l => l.replace('_', '-'));

export { browserLocales };

const formatterCache = new Map();

/**
 * Cache and reuse Intl.DateTimeFormat instances.
 * Instantiating Intl.DateTimeFormat on every formatDate call creates
 * substantial CPU overhead and garbage collection pressure during list rendering.
 */
function getDateTimeFormatter(locales, options) {
    const localeKey = Array.isArray(locales) ? locales.join(',') : String(locales);
    const cacheKey = `${localeKey}_${options.dateStyle}_${options.timeStyle}`;
    let formatter = formatterCache.get(cacheKey);
    if (!formatter) {
        formatter = new Intl.DateTimeFormat(locales, options);
        formatterCache.set(cacheKey, formatter);
    }
    return formatter;
}

export function formatDate(date, locales = browserLocales) {
    // Compare numeric local date components to avoid expensive toLocaleDateString() allocations
    const now = new Date();
    const today = now.getFullYear() === date.getFullYear() &&
                  now.getMonth() === date.getMonth() &&
                  now.getDate() === date.getDate();
    const options = { dateStyle: today ? undefined : 'short', timeStyle: today ? 'medium' : 'short' };

    return getDateTimeFormatter(locales, options).format(date);
}

export function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

/**
 * Single-pass NIP-10 tag parser to extract parent event ID without array allocations.
 * Replaces O(k) filter/find array allocations with direct single-loop tracking.
 */
export function getParentEventId(tags) {
    if (!Array.isArray(tags)) return null;

    let replyTagVal = null;
    let rootTagVal = null;
    let lastNonMentionVal = null;
    let lastETagVal = null;
    let nonMentionCount = 0;
    let eTagCount = 0;

    for (let i = 0; i < tags.length; i++) {
        const t = tags[i];
        if (Array.isArray(t) && t[0] === 'e' && t[1]) {
            eTagCount++;
            lastETagVal = t[1];
            const marker = t[3];
            if (marker === 'reply') {
                if (!replyTagVal) replyTagVal = t[1];
            } else if (marker === 'root') {
                if (!rootTagVal) rootTagVal = t[1];
            }
            if (marker !== 'mention') {
                nonMentionCount++;
                lastNonMentionVal = t[1];
            }
        }
    }

    if (eTagCount === 0) return null;
    if (replyTagVal) return replyTagVal;
    if (rootTagVal) return rootTagVal;
    if (nonMentionCount > 0) return lastNonMentionVal;
    return lastETagVal;
}
