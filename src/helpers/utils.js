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
    return classes.filter(Boolean).join(' ');
}
