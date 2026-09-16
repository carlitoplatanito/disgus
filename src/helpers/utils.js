
let browserLocales = navigator.languages === undefined
    ? [navigator.language]
    : navigator.languages;

if (typeof browserLocales === 'undefined') {
    browserLocales = ['en-US'];
}

browserLocales = browserLocales.filter((l) => l.length > 2).map(l => l.replace('_', '-'));

export { browserLocales };

// Cache for Intl.DateTimeFormat instances to eliminate heavy ICU/constructor overhead on every call.
const formatterCache = new Map();

function getFormatter(locales, options) {
    const key = (Array.isArray(locales) ? locales.join(',') : locales) + '|' + JSON.stringify(options);
    let fmt = formatterCache.get(key);
    if (!fmt) {
        fmt = new Intl.DateTimeFormat(locales, options);
        formatterCache.set(key, fmt);
    }
    return fmt;
}

export function formatDate(date, locales = browserLocales) {
    // Fast year/month/date comparison to avoid costly toLocaleDateString() calls
    const now = new Date();
    const today = now.getFullYear() === date.getFullYear() &&
                  now.getMonth() === date.getMonth() &&
                  now.getDate() === date.getDate();

    const options = today
        ? { timeStyle: 'medium' }
        : { dateStyle: 'short', timeStyle: 'short' };

    return getFormatter(locales, options).format(date);
}

export function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}