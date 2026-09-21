
let browserLocales = navigator.languages === undefined
    ? [navigator.language]
    : navigator.languages;

if (typeof browserLocales === 'undefined') {
    browserLocales = ['en-US'];
}

browserLocales = browserLocales.filter((l) => l.length > 2).map(l => l.replace('_', '-'));

export { browserLocales };

const formatterCache = new Map();

/**
 * Helper to get or create a cached Intl.DateTimeFormat instance.
 * Avoids expensive DateTimeFormat construction on every call.
 */
function getDateTimeFormatter(locales, options) {
    const key = `${Array.isArray(locales) ? locales.join(',') : locales}:${options.dateStyle}:${options.timeStyle}`;
    let formatter = formatterCache.get(key);
    if (!formatter) {
        formatter = new Intl.DateTimeFormat(locales, options);
        formatterCache.set(key, formatter);
    }
    return formatter;
}

export function formatDate(date, locales = browserLocales) {
    const now = new Date();
    // Fast numerical comparison for same calendar day instead of expensive toLocaleDateString() string allocations
    const today = (
        now.getFullYear() === date.getFullYear() &&
        now.getMonth() === date.getMonth() &&
        now.getDate() === date.getDate()
    );

    const options = {
        dateStyle: today ? undefined : 'short',
        timeStyle: today ? 'medium' : 'short'
    };

    return getDateTimeFormatter(locales, options).format(date);
}

export function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}