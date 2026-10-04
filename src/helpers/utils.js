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
    const today = (new Date().toLocaleDateString() === date.toLocaleDateString());
    const options = { dateStyle: today ? undefined : 'short', timeStyle: today ? 'medium' : 'short' };

    return getDateTimeFormatter(locales, options).format(date);
}

export function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export function getParentEventId(tags) {
    if (!Array.isArray(tags)) return null;

    const eTags = tags.filter((t) => Array.isArray(t) && t[0] === 'e' && t[1]);
    if (eTags.length === 0) return null;

    // 1. NIP-10 marked 'reply' tag
    const replyTag = eTags.find((t) => t[3] === 'reply');
    if (replyTag) return replyTag[1];

    // 2. NIP-10 marked 'root' tag
    const rootTag = eTags.find((t) => t[3] === 'root');
    if (rootTag) return rootTag[1];

    // 3. Positional / unmarked tags (filter out 'mention' tags)
    const nonMentionTags = eTags.filter((t) => t[3] !== 'mention');
    if (nonMentionTags.length === 1) {
        return nonMentionTags[0][1];
    } else if (nonMentionTags.length >= 2) {
        return nonMentionTags[nonMentionTags.length - 1][1];
    }

    return eTags[eTags.length - 1][1];
}
