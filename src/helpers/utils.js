
let browserLocales = navigator.languages === undefined
    ? [navigator.language]
    : navigator.languages;

if (typeof browserLocales === 'undefined') {
    browserLocales = ['en-US'];
}

browserLocales = browserLocales.filter((l) => l.length > 2).map(l => l.replace('_', '-'));

export { browserLocales };

// Pre-cached Intl.DateTimeFormat instances to avoid expensive instantiation per formatDate call
const formattersCache = new Map();

function getFormatters(locales) {
    const key = Array.isArray(locales) ? locales.join(',') : String(locales);
    let entry = formattersCache.get(key);
    if (!entry) {
        entry = {
            todayFormatter: new Intl.DateTimeFormat(locales, { timeStyle: 'medium' }),
            defaultFormatter: new Intl.DateTimeFormat(locales, { dateStyle: 'short', timeStyle: 'short' }),
        };
        formattersCache.set(key, entry);
    }
    return entry;
}

/**
 * Formats a given Date object.
 * Optimizations implemented:
 * 1. Reuses cached Intl.DateTimeFormat formatters per locale to prevent creating new formatters on every render.
 * 2. Compares year/month/date directly instead of calling expensive toLocaleDateString() on new Date().
 */
export function formatDate(date, locales = browserLocales) {
    const now = new Date();
    const isToday = date.getFullYear() === now.getFullYear() &&
                    date.getMonth() === now.getMonth() &&
                    date.getDate() === now.getDate();

    const { todayFormatter, defaultFormatter } = getFormatters(locales);

    return (isToday ? todayFormatter : defaultFormatter).format(date);
}

export function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}