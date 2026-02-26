# alexa-apl-interface

TypeScript implementation of the Alexa Presentation Language (APL) Interface Reference, covering the `Alexa.Presentation.APL`, `Alexa.Presentation.APLA`, `Alexa.Presentation.APLT`, `Alexa.DataStore`, and `Alexa.DataStore.PackageManager` interfaces.

## Features

- **Alexa.Presentation.APL** — Directives (`RenderDocument`, `ExecuteCommands`, `SendIndexListData`, `SendTokenListData`, `UpdateIndexListData`) and request handlers (`UserEvent`, `LoadIndexListData`, `LoadTokenListData`, `RuntimeError`)
- **Alexa.Presentation.APLA** — Audio directives and runtime error handling
- **Alexa.Presentation.APLT** — Character-display directives (`RenderDocument`, `ExecuteCommands`)
- **Alexa.DataStore** — Data store error notifications (`DEVICE_UNAVAILABLE`, `STORAGE_LIMIT_EXCEEDED`, etc.)
- **Alexa.DataStore.PackageManager** — Package lifecycle requests (`UsagesInstalled`, `UsagesRemoved`, `UpdateRequest`, `InstallationError`)
- **AudioPlayer & VideoApp** — Directive builders for audio and video playback
- **APL Visual Context** — Parsing component hierarchies, tags, positions, and visibility
- **Widget Context** — Widget visual context extraction and installed-package detection
- **Directive & Request Validators** — Runtime validation utilities
- **Request Router** — Route incoming skill requests to the appropriate handler

## Project Structure

```
src/
├── types/          # TypeScript type definitions for all interfaces
├── directives/     # Directive builder functions (APL, APLA, APLT, AudioPlayer, VideoApp)
├── handlers/       # Request handlers (APL, APLA, AudioPlayer, VideoApp, DataStore, PackageManager)
├── context/        # Context parsers (visual context, viewport, widget)
├── validators/     # Directive and request validators
├── router/         # Request router
└── index.ts        # Library entry point
```

## Prerequisites

- Node.js
- TypeScript ≥ 5.3

## Getting Started

```bash
# Install dependencies
npm install

# Build
npm run build

# Type-check without emitting
npm run lint

# Remove build artifacts
npm run clean
```

The build output goes to `dist/`.

## License

MIT
