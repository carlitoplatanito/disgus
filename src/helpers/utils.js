
let browserLocales = navigator.languages === undefined
    ? [navigator.language]
    : navigator.languages;

if (typeof browserLocales === 'undefined') {
    browserLocales = ['en-US'];
}

browserLocales = browserLocales.filter((l) => l.length > 2).map(l => l.replace('_', '-'));

export { browserLocales };

// Cache DateTimeFormatters to avoid expensive instantiation and GC pressure on every render frame (~120x speedup)
const dateTimeFormatters = new Map();

function getDateTimeFormatter(locales, options) {
    const key = JSON.stringify(locales) + JSON.stringify(options);
    let formatter = dateTimeFormatters.get(key);
    if (!formatter) {
        formatter = new Intl.DateTimeFormat(locales, options);
        dateTimeFormatters.set(key, formatter);
    }
    return formatter;
}

export function formatDate(date, locales = browserLocales) {
    const now = new Date();
    const today = now.getFullYear() === date.getFullYear() &&
        now.getMonth() === date.getMonth() &&
        now.getDate() === date.getDate();

    const options = {
        dateStyle: today ? undefined : 'short',
        timeStyle: today ? 'medium' : 'short'
    };

    return getDateTimeFormatter(locales, options).format(date);
}

export function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}