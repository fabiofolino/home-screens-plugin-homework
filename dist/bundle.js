/* FAB Homework for Home Screens v1.0.1 */
(function (React) {
'use strict';
const FONT_STACKS = {
    inter: 'var(--font-inter), system-ui, sans-serif',
    roboto: 'var(--font-roboto), system-ui, sans-serif',
    poppins: 'var(--font-poppins), system-ui, sans-serif',
    'system-ui': 'system-ui, -apple-system, "Segoe UI", sans-serif',
    playfair: 'var(--font-playfair), Georgia, serif',
    lora: 'var(--font-lora), Georgia, serif',
    'dm-serif': 'var(--font-dm-serif), Georgia, serif',
    georgia: 'Georgia, "Times New Roman", serif',
    jetbrains: 'var(--font-jetbrains), ui-monospace, monospace',
    mono: 'ui-monospace, "SF Mono", Menlo, monospace',
    bebas: 'var(--font-bebas), Impact, sans-serif',
    caveat: 'var(--font-caveat), cursive',
    pacifico: 'var(--font-pacifico), cursive',
};
function withAlpha(color, opacity) {
    if (!Number.isFinite(opacity) || opacity >= 1)
        return color;
    const hex = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(color || '');
    if (hex) {
        const r = parseInt(hex[1], 16), g = parseInt(hex[2], 16), b = parseInt(hex[3], 16);
        return `rgba(${r}, ${g}, ${b}, ${Math.max(0, opacity)})`;
    }
    const rgba = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?\s*\)$/i.exec(color || '');
    if (rgba) {
        const base = rgba[4] == null ? 1 : Number(rgba[4]);
        return `rgba(${rgba[1]}, ${rgba[2]}, ${rgba[3]}, ${Math.max(0, Math.min(1, base * opacity))})`;
    }
    return color;
}
function hostFrameStyle(style) {
    const fontSize = Number.isFinite(style?.fontSize) ? style.fontSize : 16;
    const padding = Number.isFinite(style?.padding) ? style.padding : 0;
    const borderRadius = Number.isFinite(style?.borderRadius) ? style.borderRadius : 0;
    const blur = Number.isFinite(style?.backdropBlur) ? style.backdropBlur : 0;
    const opacity = Number.isFinite(style?.opacity) ? style.opacity : 1;
    const borderWidth = Number.isFinite(style?.borderWidth) ? style.borderWidth : 0;
    const shadow = Number.isFinite(style?.shadowSize) && style.shadowSize > 0
        ? `0 ${Math.max(1, Math.round(style.shadowSize / 2))}px ${style.shadowSize}px rgba(0,0,0,.55)`
        : undefined;
    const background = style?.backgroundColor || 'transparent';
    return {
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden',
        fontSize,
        fontFamily: FONT_STACKS[style?.fontFamily] || style?.fontFamily || 'system-ui, sans-serif',
        color: style?.textColor || '#fff',
        background: blur > 0 ? withAlpha(background, opacity) : background,
        opacity: blur > 0 ? 1 : opacity,
        borderRadius,
        padding,
        border: borderWidth > 0 ? `${borderWidth}px solid ${style?.borderColor || 'rgba(255,255,255,.15)'}` : undefined,
        boxShadow: shadow,
        backdropFilter: blur > 0 ? `blur(${blur}px)` : undefined,
        WebkitBackdropFilter: blur > 0 ? `blur(${blur}px)` : undefined,
        ['--u']: String(fontSize / 16),
    };
}

const PLUGIN_ID = 'fab-homework';
const CACHE_KEY = 'fab-homework:last-feed';
function parseLocalDate(value) {
    if (!value)
        return null;
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
    if (!m) {
        const d = new Date(value);
        return Number.isNaN(d.getTime()) ? null : d;
    }
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12, 0, 0, 0);
}
function dayKey(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}
function dueState(item) {
    const due = parseLocalDate(item.dueDate);
    if (!due)
        return 'unknown';
    const today = new Date();
    const delta = Math.round((dayKey(due) - dayKey(today)) / 86400000);
    if (delta < 0)
        return 'overdue';
    if (delta === 0)
        return 'today';
    if (delta === 1)
        return 'tomorrow';
    return 'future';
}
function dueSortValue(item) {
    const due = parseLocalDate(item.dueDate);
    return due ? due.getTime() : Number.MAX_SAFE_INTEGER;
}
function formatDue(item, timezone) {
    const state = dueState(item);
    if (state === 'overdue')
        return item.due ? `OVERDUE · ${item.due}` : 'OVERDUE';
    if (state === 'today')
        return 'TODAY';
    if (state === 'tomorrow')
        return 'TOMORROW';
    if (item.due)
        return item.due;
    const date = parseLocalDate(item.dueDate);
    if (!date)
        return '';
    return new Intl.DateTimeFormat(undefined, {
        weekday: 'short', month: 'short', day: 'numeric', timeZone: timezone,
    }).format(date);
}
function formatUpdated(value, timezone) {
    if (!value)
        return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime()))
        return '';
    return new Intl.DateTimeFormat(undefined, {
        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: timezone,
    }).format(date);
}
function normalizedFeed(raw) {
    if (!raw || typeof raw !== 'object')
        throw new Error('Homework feed is not a JSON object.');
    const feed = raw;
    return {
        title: typeof feed.title === 'string' ? feed.title : 'Weekly Homework',
        weekLabel: typeof feed.weekLabel === 'string' ? feed.weekLabel : '',
        weekStart: typeof feed.weekStart === 'string' ? feed.weekStart : '',
        weekEnd: typeof feed.weekEnd === 'string' ? feed.weekEnd : '',
        generatedAt: typeof feed.generatedAt === 'string' ? feed.generatedAt : '',
        items: Array.isArray(feed.items) ? feed.items.filter((x) => x && typeof x === 'object') : [],
        notes: Array.isArray(feed.notes) ? feed.notes.filter((x) => typeof x === 'string') : [],
    };
}
function useHomeworkFeed(feedUrl, refreshMs) {
    const [feed, setFeed] = React.useState(() => {
        try {
            const cached = window.__HS_SDK__?.displayCache?.get?.(CACHE_KEY);
            return cached ? normalizedFeed(cached) : null;
        }
        catch {
            return null;
        }
    });
    const [error, setError] = React.useState(null);
    const [loading, setLoading] = React.useState(!feed);
    const [lastSuccess, setLastSuccess] = React.useState(null);
    React.useEffect(() => {
        let cancelled = false;
        async function load() {
            if (!feedUrl) {
                if (!cancelled) {
                    setError('Set the homework feed URL in module settings.');
                    setLoading(false);
                }
                return;
            }
            try {
                const pluginFetch = window.__HS_SDK__?.pluginFetch;
                const response = pluginFetch
                    ? await pluginFetch(PLUGIN_ID, {
                        url: feedUrl,
                        method: 'GET',
                        cacheTtlMs: Math.min(Math.max(15000, refreshMs - 5000), 300000),
                    })
                    : await fetch(feedUrl, { cache: 'no-store' });
                if (!response.ok)
                    throw new Error(`Feed returned HTTP ${response.status}`);
                const next = normalizedFeed(await response.json());
                if (!cancelled) {
                    setFeed(next);
                    setError(null);
                    setLastSuccess(new Date());
                    setLoading(false);
                    window.__HS_SDK__?.displayCache?.set?.(CACHE_KEY, next);
                }
            }
            catch (e) {
                if (!cancelled) {
                    setError(e instanceof Error ? e.message : 'Unable to load homework feed.');
                    setLoading(false);
                }
            }
        }
        load();
        const id = window.setInterval(load, Math.max(60000, refreshMs));
        return () => {
            cancelled = true;
            window.clearInterval(id);
        };
    }, [feedUrl, refreshMs]);
    return { feed, error, loading, lastSuccess };
}
function badgeStyle(state, highlight) {
    const base = {
        display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap',
        fontSize: '.50em', fontWeight: 800, letterSpacing: '.05em',
        padding: '.22em .5em', borderRadius: '999px',
        border: '1px solid rgba(255,255,255,.16)',
        background: 'rgba(255,255,255,.08)', color: 'inherit', opacity: .85,
    };
    if (!highlight)
        return base;
    if (state === 'overdue')
        return { ...base, background: 'rgba(239,68,68,.20)', borderColor: 'rgba(248,113,113,.42)', color: '#fecaca', opacity: 1 };
    if (state === 'today')
        return { ...base, background: 'rgba(245,158,11,.20)', borderColor: 'rgba(251,191,36,.42)', color: '#fde68a', opacity: 1 };
    if (state === 'tomorrow')
        return { ...base, background: 'rgba(59,130,246,.18)', borderColor: 'rgba(96,165,250,.40)', color: '#bfdbfe', opacity: 1 };
    return base;
}
function AssignmentCard({ item, showDetails, showDueDate, highlightDueSoon, detailLines, timezone }) {
    const state = dueState(item);
    const due = showDueDate ? formatDue(item, timezone) : '';
    return (React.createElement("div", { style: {
            padding: '.48em .52em', borderRadius: '.52em',
            background: 'rgba(255,255,255,.055)',
            border: '1px solid rgba(255,255,255,.075)',
            minWidth: 0,
        } },
        React.createElement("div", { style: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '.55em' } },
            React.createElement("div", { style: { fontSize: '.78em', lineHeight: 1.16, fontWeight: 700, minWidth: 0, overflowWrap: 'anywhere' } }, item.assignment || 'Assignment'),
            due && React.createElement("span", { style: badgeStyle(state, highlightDueSoon) }, due)),
        showDetails && item.details && (React.createElement("div", { style: { fontSize: '.61em', lineHeight: 1.28, opacity: .68, marginTop: '.28em', overflowWrap: 'anywhere', display: '-webkit-box', WebkitLineClamp: detailLines, WebkitBoxOrient: 'vertical', overflow: 'hidden' } }, item.details))));
}
function ColumnsView({ items, maxColumns, ...cardProps }) {
    const groups = new Map();
    for (const item of items) {
        const subject = (item.class || 'Other').trim() || 'Other';
        if (!groups.has(subject))
            groups.set(subject, []);
        groups.get(subject).push(item);
    }
    const subjects = Array.from(groups.entries());
    const columns = Math.max(1, Math.min(maxColumns, subjects.length || 1));
    return (React.createElement("div", { style: {
            display: 'grid', gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            alignItems: 'start', gap: '.32em', minHeight: 0, overflow: 'auto', paddingRight: '.1em',
        } }, subjects.map(([subject, subjectItems]) => (React.createElement("section", { key: subject, style: { minWidth: 0 } },
        React.createElement("div", { style: {
                fontSize: '.66em', fontWeight: 850, letterSpacing: '.055em', textTransform: 'uppercase',
                opacity: .82, padding: '0 .12em .28em', borderBottom: '1px solid rgba(255,255,255,.14)', marginBottom: '.32em',
            } }, subject),
        React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '.32em' } }, subjectItems.map((item, idx) => React.createElement(AssignmentCard, { key: `${subject}-${idx}-${item.assignment || ''}`, item: item, ...cardProps }))))))));
}
function ListView({ items, ...cardProps }) {
    return (React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '.32em', minHeight: 0, overflow: 'auto', paddingRight: '.1em' } }, items.map((item, idx) => (React.createElement("div", { key: `${idx}-${item.class || ''}-${item.assignment || ''}`, style: { display: 'grid', gridTemplateColumns: 'minmax(7em, .24fr) 1fr', gap: '.6em', alignItems: 'stretch' } },
        React.createElement("div", { style: {
                display: 'flex', alignItems: 'center', padding: '.65em .7em', borderRadius: '.6em',
                background: 'rgba(255,255,255,.035)', fontSize: '.72em', fontWeight: 800, opacity: .78,
            } }, item.class || 'Other'),
        React.createElement(AssignmentCard, { item: item, ...cardProps }))))));
}
function DueSoonView({ items, ...cardProps }) {
    const urgent = items.filter((item) => ['overdue', 'today', 'tomorrow'].includes(dueState(item)));
    const display = urgent.length ? urgent : items.slice(0, 5);
    return (React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '.58em', minHeight: 0, overflow: 'auto' } },
        !urgent.length && (React.createElement("div", { style: { fontSize: '.72em', opacity: .6, marginBottom: '.1em' } }, "Nothing is due today or tomorrow. Next assignments:")),
        display.map((item, idx) => (React.createElement("div", { key: `${idx}-${item.assignment || ''}` },
            React.createElement("div", { style: { fontSize: '.62em', fontWeight: 800, opacity: .58, margin: '0 0 .22em .15em', textTransform: 'uppercase', letterSpacing: '.05em' } }, item.class || 'Other'),
            React.createElement(AssignmentCard, { item: item, ...cardProps }))))));
}
function HomeworkPlugin({ config, style, timezone }) {
    const feedUrl = String(config.feedUrl || 'http://192.168.0.42:8787/homework-5th.json');
    const refreshIntervalMs = Math.max(60000, Number(config.refreshIntervalMs) || 300000);
    const layout = String(config.layout || 'columns');
    const maxItems = Math.max(1, Math.min(100, Number(config.maxItems) || 20));
    const maxColumns = Math.max(1, Math.min(8, Number(config.maxColumns) || 6));
    const showDetails = config.showDetails !== false;
    const density = String(config.density || 'compact');
    const detailLines = Math.max(1, Math.min(4, Number(config.detailLines) || 2));
    const showDueDate = config.showDueDate !== false;
    const showUpdated = config.showUpdated !== false;
    const showNotes = config.showNotes === true;
    const hidePastDue = config.hidePastDue === true;
    const highlightDueSoon = config.highlightDueSoon !== false;
    const { feed, error, loading, lastSuccess } = useHomeworkFeed(feedUrl, refreshIntervalMs);
    const items = React.useMemo(() => {
        const list = [...(feed?.items || [])]
            .filter((item) => !hidePastDue || dueState(item) !== 'overdue')
            .sort((a, b) => dueSortValue(a) - dueSortValue(b));
        return list.slice(0, maxItems);
    }, [feed, hidePastDue, maxItems]);
    const cardProps = { showDetails, showDueDate, highlightDueSoon, detailLines, timezone };
    const subjectCount = React.useMemo(() => new Set(items.map((item) => (item.class || 'Other').trim() || 'Other')).size, [items]);
    const densityBase = density === 'comfortable' ? 0.90 : 0.76;
    const loadScale = items.length > 18 ? 0.78 : items.length > 14 ? 0.84 : items.length > 10 ? 0.90 : 1;
    const columnScale = layout === 'columns' && subjectCount > 4 ? 0.90 : 1;
    const contentScale = densityBase * loadScale * columnScale;
    const updated = formatUpdated(feed?.generatedAt, timezone);
    return (React.createElement("div", { style: {
            ...hostFrameStyle(style),
            position: 'relative', display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden',
        } },
        React.createElement("div", { style: { fontSize: `${contentScale}em`, display: 'flex', flexDirection: 'column', gap: '.42em', minHeight: 0, flex: '1 1 auto' } },
            React.createElement("header", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '.7em', flex: '0 0 auto' } },
                React.createElement("div", { style: { minWidth: 0 } },
                    React.createElement("div", { style: { fontSize: '.96em', lineHeight: 1.05, fontWeight: 850, letterSpacing: '-.02em' } }, feed?.title || 'Weekly Homework'),
                    (feed?.weekLabel || feed?.weekStart) && (React.createElement("div", { style: { fontSize: '.61em', opacity: .62, marginTop: '.18em' } }, feed?.weekLabel || `${feed?.weekStart || ''}${feed?.weekEnd ? ` – ${feed.weekEnd}` : ''}`))),
                React.createElement("div", { style: { flex: '0 0 auto', textAlign: 'right', fontSize: '.50em', lineHeight: 1.25, opacity: .55 } },
                    showUpdated && updated && React.createElement("div", null,
                        "Updated ",
                        updated),
                    error && feed && React.createElement("div", { style: { color: '#fca5a5', opacity: 1 } }, "Using cached data"))),
            React.createElement("main", { style: { minHeight: 0, flex: '1 1 auto', display: 'flex', flexDirection: 'column' } },
                loading && !feed && (React.createElement("div", { style: { margin: 'auto', fontSize: '.8em', opacity: .6 } }, "Loading homework…")),
                !loading && !feed && (React.createElement("div", { style: { margin: 'auto', maxWidth: '30em', textAlign: 'center' } },
                    React.createElement("div", { style: { fontSize: '.9em', fontWeight: 750 } }, "Homework feed unavailable"),
                    React.createElement("div", { style: { fontSize: '.7em', opacity: .62, marginTop: '.45em' } }, error || 'No homework data was returned.'))),
                feed && items.length === 0 && (React.createElement("div", { style: { margin: 'auto', textAlign: 'center' } },
                    React.createElement("div", { style: { fontSize: '1.05em', fontWeight: 800 } }, "No homework listed"),
                    React.createElement("div", { style: { fontSize: '.7em', opacity: .58, marginTop: '.35em' } }, "Enjoy the clear board."))),
                feed && items.length > 0 && layout === 'columns' && React.createElement(ColumnsView, { items: items, maxColumns: maxColumns, ...cardProps }),
                feed && items.length > 0 && layout === 'list' && React.createElement(ListView, { items: items, ...cardProps }),
                feed && items.length > 0 && layout === 'due-soon' && React.createElement(DueSoonView, { items: items, ...cardProps })),
            feed && showNotes && (feed.notes?.length || 0) > 0 && (React.createElement("footer", { style: { flex: '0 0 auto', borderTop: '1px solid rgba(255,255,255,.11)', paddingTop: '.48em', fontSize: '.62em', lineHeight: 1.35, opacity: .7 } }, feed.notes.map((note, i) => React.createElement("div", { key: i },
                "• ",
                note)))),
            feed && error && !showUpdated && (React.createElement("div", { style: { position: 'absolute', right: '.6em', bottom: '.45em', fontSize: '.5em', color: '#fca5a5', opacity: .9 } },
                "Feed refresh failed",
                lastSuccess ? ` · last success ${lastSuccess.toLocaleTimeString()}` : '')))));
}

window.__HS_PLUGIN__ = { default: HomeworkPlugin };
})(window.React);
