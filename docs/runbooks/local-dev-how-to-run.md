## Local Spatial Model Explorer

Use the coordinated launcher from the repository root:

```bash
pnpm run run:local
```

It validates the local environment, stops any listeners using the explicitly configured local API/viewer ports, starts the catalog API and browser server, waits for both health checks, and prints the local and LAN URLs. It prints each reclaimed process description before stopping it. This port reclamation is deliberately limited to the local-development launcher and must not be used for production/service startup. Stop both launched processes with `Ctrl+C`.

The interactive Three.js viewer opens on the Hatteras 63 vessel fixture. Use the **Hull** selector in the header to switch among the cataloged models, including the Offshore Center Console. Select a capability and vessel area, then use **Add capability** to place the runtime representation at that area's deterministic default anchor. Use **Isolate** to show only the semantic selection, **Show all** to restore geometry, and **Reset** to clear selection.

The browser uses same-origin `/api` calls. Do not set `VITE_MODEL_API_BASE_URL` to `localhost` for NUC usage; the viewer proxy reaches the API locally on the NUC.
