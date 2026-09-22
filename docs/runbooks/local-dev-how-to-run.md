## Local Equipment Explorer

Use the coordinated launcher from the repository root:

```bash
pnpm run run:local
```

It validates the local environment, starts the catalog API and browser server, waits for both health checks, and prints the local and LAN URLs. Stop both processes with `Ctrl+C`.

You’ll see the Detroit Diesel 8V92TA fixture in the interactive Three.js viewer. Select components from the list or canvas, use **Isolate** to show only the selection, **Show all** to restore geometry, and **Reset** to clear selection.

The browser uses same-origin `/api` calls. Do not set `VITE_MODEL_API_BASE_URL` to `localhost` for NUC usage; the viewer proxy reaches the API locally on the NUC.
