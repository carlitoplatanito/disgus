
let browserLocales = navigator.languages === undefined
    ? [navigator.language]
    : navigator.languages;

if (typeof browserLocales === 'undefined') {
    browserLocales = ['en-US'];
}

browserLocales = browserLocales.filter((l) => l.length > 2).map(l => l.replace('_', '-'));

export { browserLocales };

export function formatDate(date, locales = browserLocales) {
    const today = (new Date().toLocaleDateString() === date.toLocaleDateString());

    return new Intl.DateTimeFormat(locales, {dateStyle: today ? undefined : 'short', timeStyle: today ? 'medium' : 'short'}).format(date)
}