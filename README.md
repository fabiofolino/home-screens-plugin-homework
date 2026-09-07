# Home Screens Homework Plugin

Home Screens plugin for displaying weekly homework from a JSON feed on a household dashboard.

## Features

- Subject-column layout optimized for wall displays
- Chronological and due-soon layouts
- Compact typography and adaptive density
- Due-date highlighting for overdue, today, and tomorrow
- Optional assignment details and weekly notes
- Local-network JSON feed support through Home Screens `pluginFetch`

## Default feed

This build is configured for the 5th-grade feed at:

`http://192.168.0.42:8787/homework-5th.json`

The feed URL is configurable per module instance in the Home Screens editor.

## Home Screens requirements

- Home Screens 1.12.0 or newer
- Permissions: `network`, `localNetwork`

## Development

Serve the repository root on port 5173 and load it from Home Screens → Plugins → Developer.

Because Home Screens' CSP allows developer plugin connections from `http://localhost:*`, remote development may require an SSH tunnel from the browser machine.

## Installation

For a permanent installation, publish `fab-homework-1.0.1.tar.gz` as a GitHub Release asset and use Home Screens → Plugins → Browse → Install from URL.

The release archive must contain exactly one top-level directory with at least:

- `manifest.json`
- `dist/bundle.js`

## License

MIT
