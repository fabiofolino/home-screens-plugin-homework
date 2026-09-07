# FAB Homework for Home Screens

## v1.0.1 display-density update

- Compact density is now the default for wall displays.
- Content auto-scales down as assignment/subject counts increase.
- Default subject columns increased from 4 to 6 (supports up to 8).
- Assignment details are line-clamped (default 2 lines) so one long item cannot push the rest off-screen.
- Default Home Screens text size/padding reduced for better fit.

Existing module instances may retain their Home Screens Style values. If an existing instance still looks large, set **Style > Text size** to about **12–14** and **Padding** to about **8–10**, or remove/re-add the module after reloading v1.0.1.

A Home Screens plugin that renders the weekly homework JSON feed used by the family dashboard. This release defaults to the 5th-grade feed, but the feed URL is configurable per module instance.

## Existing feed contract

The plugin expects the same JSON produced by the existing CT106/Hermes homework workflow:

```json
{
  "title": "Weekly Homework",
  "weekLabel": "September 7–11",
  "weekStart": "2026-09-07",
  "weekEnd": "2026-09-11",
  "generatedAt": "2026-09-07T16:30:00-04:00",
  "items": [
    {
      "class": "Math",
      "assignment": "Lesson 2 practice",
      "details": "Complete problems 1–18.",
      "due": "Tuesday",
      "dueDate": "2026-09-08",
      "source": "WAAG"
    }
  ],
  "notes": []
}
```

Default feed URL:

`http://192.168.0.42:8787/homework-5th.json`

The feed request goes through Home Screens' `pluginFetch` proxy. The manifest declares both `network` and `localNetwork`, and allows the CT106 address `192.168.0.42`.

## Views

- **Subject columns** — the MagicMirror-style horizontal subject layout.
- **Chronological list** — all assignments sorted by due date.
- **Due soon** — overdue/today/tomorrow only; if none are urgent, shows the next five assignments.

## Configurable options

- Feed URL
- Refresh interval
- Layout
- Maximum assignments
- Maximum subject columns
- Show/hide details
- Show/hide due date
- Show/hide generated timestamp
- Show/hide weekly notes
- Hide past-due work
- Highlight overdue/today/tomorrow

The normal Home Screens Style panel controls font, text color, background, opacity, blur, padding, border, radius, and shadow.

## Quick local test on the Home Screens LXC

The source package already contains a built `dist/bundle.js`, so you can test without npm:

```bash
cd fab-homework-plugin
python3 dev-server.py
```

In Home Screens, enable Advanced Mode if needed, then open **Plugins > Developer** and load:

`http://localhost:5173`

When the dev server runs on CT107, tunnel it to the Windows browser if needed:

```powershell
ssh -N -L 5173:127.0.0.1:5173 homescreens@192.168.0.44
```

## Development / rebuilding

```bash
cd fab-homework-plugin
npm install
npm run build
```

For a production build:

```bash
npm install
npm run build
```

The build output is `dist/bundle.js`.

## Installing a packaged release

Home Screens external installs expect an HTTPS tarball URL. The included `fab-homework-1.0.1.tar.gz` package has the required single top-level folder containing `manifest.json` and `dist/bundle.js`. Upload that tarball to a GitHub Release (or another HTTPS location), then use **Plugins > Install from URL**.

## Changing the homework server address

`pluginFetch` checks the manifest's `allowedDomains`. If CT106 moves from `192.168.0.42`, update both:

1. `defaultConfig.feedUrl`
2. `allowedDomains`

Then rebuild/repackage the plugin.
