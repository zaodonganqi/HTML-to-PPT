# HTP — HTML To PowerPoint

> Build with HTML. Ship as PowerPoint.

HTP converts web pages to native PowerPoint (.pptx) files, preserving editable text, tables, images, and animations.

## Packages

| Package | Description |
|---------|-------------|
| [@htp/core](./packages/core) | Shared types, manifest schema, utilities |
| [@htp/runtime](./packages/runtime) | Browser runtime — GSAP-like API for marking PPT-exportable elements |
| [@htp/exporter](./packages/exporter) | Node.js exporter — Playwright + DOM → PPTX |
| [@htp/pptx](./packages/pptx) | Low-level PPTX writer (Office Open XML) |
| [@htp/cli](./packages/cli) | CLI entry point |
| [@htp/vite-plugin](./packages/vite-plugin) | Vite build integration |

## Quick Start

```bash
# CLI
htp export ./dist/index.html ./deck.pptx

# Node API
import { exportPptx } from "@htp/exporter";
await exportPptx({ input: "./dist/index.html", output: "./deck.pptx" });

# Runtime (in browser)
import { htp } from "@htp/runtime";
htp.slide(".slide");
htp.text("#title");
htp.ready();
```

## Documentation

- [Design Specification](./docs/design-spec.md)

## License

MIT
